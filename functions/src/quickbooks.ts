/* eslint-disable @typescript-eslint/quotes */
/* eslint-disable @typescript-eslint/naming-convention */
// firebase/functions/src/quickbooks.ts
import * as functions from 'firebase-functions';
import * as admin from 'firebase-admin';
import axios from 'axios';
import * as logger from 'firebase-functions/logger';
import { Timestamp, FieldValue } from 'firebase-admin/firestore';

interface QuickBooksTokens {
  access_token: string;
  refresh_token: string;
  expires_in: number;
  token_type: string;
  realmId?: string;
}
interface QuickBooksCustomer {
  DisplayName: string;
  PrimaryEmailAddr?: { Address: string };
  PrimaryPhone?: { FreeFormNumber: string };
  BillAddr?: {
    Line1?: string;
    City?: string;
    PostalCode?: string;
    Country?: string;
  };
  CompanyName?: string;
  Notes?: string;
  Taxable?: boolean;
}
interface QuickBooksSubCustomer {
  DisplayName: string;
  BillAddr?: {
    Line1?: string;
    City?: string;
    PostalCode?: string;
    Country?: string;
  };
  ParentRef: {
    value: string;
  };
  Notes?: string;
  Job: boolean;
  Active?: boolean;
}
interface Customer {
  id?: string;
  name?: string;
  email?: string;
  rep?: string;
  phone?: string;
  address?: string;
  suburb?: string;
  city?: string;
  zip?: string;
  country?: string;
  company?: string;
  abnNumber?: string;
  vatNum?: string;
  selected?: boolean;
  xeroID?: string;
  excludeVAT?: boolean;
  quickbooksId?: string;
}
interface Site {
  id?: string;
  name?: string;
  address?: string;
  city?: string;
  suburb?: string;
  zip?: string;
  country?: string;
  customer?: Customer;
  code?: string;
  status?: string;
  billable?: boolean;
  quickbooksId?: string;
}

interface Delivery {
  id?: string;
  code?: string;
  site?: Site;
  items?: InventoryItem[];
  date?: any;
  notes?: string;
  driverName?: string;
  vehicleReg?: string;
  signedBy?: string;
}

interface InventoryItem {
  id: string;
  code: string;
  shipmentQty: number;
}

interface QuickBooksInvoice {
  Line: Array<{
    DetailType: string;
    SalesItemLineDetail: {
      ItemRef: {
        value: string;
        name?: string;
      };
      Qty: number;
    };
    Amount: number;
    Description?: string;
  }>;
  CustomerRef: {
    value: string;
  };
  TxnDate: string;
  DocNumber?: string;
  PrivateNote?: string;
}

// Function to initiate OAuth
export const initiateQuickBooksAuth = functions.https.onCall(
  async (data, context) => {
    const { companyId } = data;

    // Verify user has permission to connect QB for this company
    const companyDoc = await admin
      .firestore()
      .collection('company')
      .doc(companyId)
      .get();

    if (!companyDoc.exists) {
      throw new functions.https.HttpsError(
        'permission-denied',
        'Not authorized'
      );
    }

    const state = Buffer.from(
      JSON.stringify({ companyId, timestamp: Date.now() })
    ).toString('base64');

    return {
      authUrl:
        `https://appcenter.intuit.com/connect/oauth2?client_id=${
          functions.config().quickbooks.client_id
        }` +
        `&redirect_uri=${functions.config().quickbooks.redirect_uri}` +
        `&response_type=code&scope=com.intuit.quickbooks.accounting&state=${state}`,
    };
  }
);

// Function to handle OAuth callback
export const handleQuickBooksCallback = functions.https.onCall(
  async (data, context) => {
    const { code, realmId, state } = data;

    try {
      // Decode and validate state
      const decodedState = JSON.parse(
        Buffer.from(state as string, 'base64').toString()
      );
      const { companyId, timestamp } = decodedState;

      // Validate timestamp to prevent replay attacks (optional)
      const MAX_AGE = 1000 * 60 * 10; // 10 minutes
      if (Date.now() - timestamp > MAX_AGE) {
        throw new functions.https.HttpsError(
          'invalid-argument',
          'Authorization request expired'
        );
      }

      // Exchange code for tokens
      const tokens = await exchangeCodeForTokens(code as string);

      // Store tokens in Firestore
      await admin
        .firestore()
        .collection('company')
        .doc(companyId)
        .set(
          {
            quickbooks: {
              enabled: true,
              realmId,
              accessToken: tokens.access_token,
              refreshToken: tokens.refresh_token,
              tokenExpiry: Timestamp.fromMillis(
                Date.now() + tokens.expires_in * 1000
              ),
            },
          },
          { merge: true }
        );

      return { success: true };
    } catch (error) {
      logger.error('QB OAuth Error:', error);
      throw new functions.https.HttpsError(
        'internal',
        'Failed to complete QuickBooks connection'
      );
    }
  }
);

// Function to disconnect Quickbooks
export const disconnectQuickBooks = functions.https.onCall(
  async (data, context) => {
    const { companyId } = data;

    // Verify user has admin permission
    const companyDoc = await admin
      .firestore()
      .collection('company')
      .doc(companyId)
      .get();

    if (!companyDoc.exists) {
      throw new functions.https.HttpsError(
        'permission-denied',
        'Not authorized to disconnect QuickBooks'
      );
    }

    const qbData = companyDoc.data()?.quickbooks;
    if (!qbData?.enabled) {
      throw new functions.https.HttpsError(
        'failed-precondition',
        'QuickBooks is not connected'
      );
    }

    try {
      // Revoke QuickBooks OAuth tokens
      await axios.post(
        'https://developer.api.intuit.com/v2/oauth2/tokens/revoke',
        `token=${qbData.accessToken}`,
        {
          headers: {
            'Content-Type': 'application/x-www-form-urlencoded',
            Authorization: `Basic ${Buffer.from(
              `${functions.config().quickbooks.client_id}:${
                functions.config().quickbooks.client_secret
              }`
            ).toString('base64')}`,
          },
        }
      );

      // Remove QuickBooks data from Firestore
      await companyDoc.ref.update({
        quickbooks: FieldValue.delete(),
      });

      return { success: true };
    } catch (error) {
      logger.error('QB Disconnect Error:', error);

      // Even if token revocation fails, remove local connection
      await companyDoc.ref.update({
        quickbooks: FieldValue.delete(),
      });

      // Don't throw error since we want to disconnect even if QB API call fails
      return {
        success: true,
        warning: 'Disconnected locally but token revocation may have failed',
      };
    }
  }
);

// Function to sync customer with Quickbooks
export const syncCustomerToQuickBooks = functions.https.onCall(
  async (data, context) => {
    const { companyId, customerId } = data;

    // Get company's QB credentials
    const companyDoc = await admin
      .firestore()
      .collection('company')
      .doc(companyId)
      .get();

    if (!companyDoc.exists || !companyDoc.data()?.quickbooks?.enabled) {
      throw new functions.https.HttpsError(
        'failed-precondition',
        'QuickBooks not connected'
      );
    }

    const qbData = companyDoc.data()?.quickbooks;
    // Check if token needs refresh
    if (qbData.tokenExpiry.toMillis() <= Date.now()) {
      const newTokens = await refreshTokens(qbData.refreshToken);

      // Update tokens in Firestore
      await companyDoc.ref.set(
        {
          quickbooks: {
            ...qbData,
            accessToken: newTokens.access_token,
            refreshToken: newTokens.refresh_token,
            tokenExpiry: Timestamp.fromMillis(
              Date.now() + newTokens.expires_in * 1000
            ),
          },
        },
        { merge: true }
      );

      qbData.accessToken = newTokens.access_token;
    }

    // Get customer data
    const customerDoc = await admin
      .firestore()
      .collection('company')
      .doc(companyId)
      .collection('customers')
      .doc(customerId)
      .get();

    if (!customerDoc.exists) {
      throw new functions.https.HttpsError('not-found', 'Customer not found');
    }

    const customer = customerDoc.data() as Customer;

    // Transform to QuickBooks format
    const quickbooksCustomer = transformToQuickBooksCustomer(customer);

    try {
      // Check if customer already exists in QuickBooks by searching for DisplayName
      const searchResponse = await axios.get(
        `https://quickbooks.api.intuit.com/v3/company/${qbData.realmId}/query`,
        {
          params: {
            query: `SELECT * FROM Customer WHERE DisplayName = '${customer.name}'`,
          },
          headers: {
            Authorization: `Bearer ${qbData.accessToken}`,
            Accept: 'application/json',
          },
        }
      );

      let response;
      if (searchResponse.data.QueryResponse.Customer?.length > 0) {
        // Update existing customer
        const existingCustomerId =
          searchResponse.data.QueryResponse.Customer[0].Id;
        response = await axios.post(
          `https://quickbooks.api.intuit.com/v3/company/${qbData.realmId}/customer`,
          {
            ...quickbooksCustomer,
            Id: existingCustomerId,
            sparse: true,
            SyncToken: searchResponse.data.QueryResponse.Customer[0].SyncToken,
          },
          {
            headers: {
              Authorization: `Bearer ${qbData.accessToken}`,
              'Content-Type': 'application/json',
            },
          }
        );
      } else {
        // Create new customer
        response = await axios.post(
          `https://quickbooks.api.intuit.com/v3/company/${qbData.realmId}/customer`,
          quickbooksCustomer,
          {
            headers: {
              Authorization: `Bearer ${qbData.accessToken}`,
              'Content-Type': 'application/json',
            },
          }
        );
      }

      // Store QuickBooks ID in Firestore
      await customerDoc.ref.update({
        quickbooksId: response.data.Customer.Id,
        lastSyncedToQuickBooks: FieldValue.serverTimestamp(),
      });

      return {
        success: true,
        quickbooksId: response.data.Customer.Id,
      };
    } catch (error: any) {
      logger.error('QB Customer Sync Error:', error.response?.data || error);
      throw new functions.https.HttpsError(
        'internal',
        'Failed to sync customer with QuickBooks'
      );
    }
  }
);

export const syncSiteToQuickBooks = functions.https.onCall(
  async (data, context) => {
    const { companyId, siteId } = data;

    // Get company's QB credentials
    const companyDoc = await admin
      .firestore()
      .collection('company')
      .doc(companyId)
      .get();

    if (!companyDoc.exists || !companyDoc.data()?.quickbooks?.enabled) {
      throw new functions.https.HttpsError(
        'failed-precondition',
        'QuickBooks not connected'
      );
    }

    const qbData = companyDoc.data()?.quickbooks;
    // Check if token needs refresh
    if (qbData.tokenExpiry.toMillis() <= Date.now()) {
      const newTokens = await refreshTokens(qbData.refreshToken);

      // Update tokens in Firestore
      await companyDoc.ref.set(
        {
          quickbooks: {
            ...qbData,
            accessToken: newTokens.access_token,
            refreshToken: newTokens.refresh_token,
            tokenExpiry: Timestamp.fromMillis(
              Date.now() + newTokens.expires_in * 1000
            ),
          },
        },
        { merge: true }
      );

      qbData.accessToken = newTokens.access_token;
    }
    // Get site data
    const siteDoc = await admin
      .firestore()
      .collection('company')
      .doc(companyId)
      .collection('sites')
      .doc(siteId)
      .get();

    if (!siteDoc.exists) {
      throw new functions.https.HttpsError('not-found', 'Site not found');
    }

    const site = siteDoc.data() as Site;

    // Ensure parent customer exists in QuickBooks
    if (!site.customer?.quickbooksId) {
      throw new functions.https.HttpsError(
        'failed-precondition',
        'Parent customer must be synced to QuickBooks first'
      );
    }

    // Transform to QuickBooks sub-customer format
    const quickbooksSubCustomer = transformToQuickBooksSubCustomer(site);

    try {
      // Check if site already exists in QuickBooks by searching for DisplayName
      const searchResponse = await axios.get(
        `https://quickbooks.api.intuit.com/v3/company/${qbData.realmId}/query`,
        {
          params: {
            query: `SELECT * FROM Customer WHERE DisplayName = '${site.name} (${site.code})'`,
          },
          headers: {
            Authorization: `Bearer ${qbData.accessToken}`,
            Accept: 'application/json',
          },
        }
      );

      let response;
      if (searchResponse.data.QueryResponse.Customer?.length > 0) {
        // Update existing sub-customer
        const existingSubCustomerId =
          searchResponse.data.QueryResponse.Customer[0].Id;
        response = await axios.post(
          `https://quickbooks.api.intuit.com/v3/company/${qbData.realmId}/customer`,
          {
            ...quickbooksSubCustomer,
            Id: existingSubCustomerId,
            sparse: true,
            SyncToken: searchResponse.data.QueryResponse.Customer[0].SyncToken,
          },
          {
            headers: {
              Authorization: `Bearer ${qbData.accessToken}`,
              'Content-Type': 'application/json',
            },
          }
        );
      } else {
        // Create new sub-customer
        response = await axios.post(
          `https://quickbooks.api.intuit.com/v3/company/${qbData.realmId}/customer`,
          quickbooksSubCustomer,
          {
            headers: {
              Authorization: `Bearer ${qbData.accessToken}`,
              'Content-Type': 'application/json',
            },
          }
        );
      }

      // Store QuickBooks ID in Firestore
      await siteDoc.ref.update({
        quickbooksId: response.data.Customer.Id,
        lastSyncedToQuickBooks: FieldValue.serverTimestamp(),
      });

      return {
        success: true,
        quickbooksId: response.data.Customer.Id,
      };
    } catch (error: any) {
      logger.error('QB Site Sync Error:', error.response?.data || error);
      throw new functions.https.HttpsError(
        'internal',
        'Failed to sync site with QuickBooks'
      );
    }
  }
);

// Function to generate invoice
export const syncDeliveryToQuickBooks = functions.https.onCall(
  async (data, context) => {
    const { companyId, deliveryId } = data;

    // Get company's QB credentials
    const companyDoc = await admin
      .firestore()
      .collection('company')
      .doc(companyId)
      .get();

    if (!companyDoc.exists || !companyDoc.data()?.quickbooks?.enabled) {
      throw new functions.https.HttpsError(
        'failed-precondition',
        'QuickBooks not connected'
      );
    }

    const qbData = companyDoc.data()?.quickbooks;
    // Check if token needs refresh
    if (qbData.tokenExpiry.toMillis() <= Date.now()) {
      const newTokens = await refreshTokens(qbData.refreshToken);

      // Update tokens in Firestore
      await companyDoc.ref.set(
        {
          quickbooks: {
            ...qbData,
            accessToken: newTokens.access_token,
            refreshToken: newTokens.refresh_token,
            tokenExpiry: Timestamp.fromMillis(
              Date.now() + newTokens.expires_in * 1000
            ),
          },
        },
        { merge: true }
      );

      qbData.accessToken = newTokens.access_token;
    }

    // Get delivery data
    const deliveryDoc = await admin
      .firestore()
      .collection('company')
      .doc(companyId)
      .collection('shipments')
      .doc(deliveryId)
      .get();

    if (!deliveryDoc.exists) {
      throw new functions.https.HttpsError('not-found', 'Delivery not found');
    }

    const delivery = deliveryDoc.data() as Delivery;

    // Ensure site exists in QuickBooks
    if (!delivery.site?.quickbooksId) {
      throw new functions.https.HttpsError(
        'failed-precondition',
        'Site must be synced to QuickBooks first'
      );
    }

    // Get QuickBooks item details for all inventory items
    const itemSkus =
      delivery.items?.map((item) => `'${item.code}'`).join(',') || '';

    const itemsQuery = await axios.get(
      `https://quickbooks.api.intuit.com/v3/company/${qbData.realmId}/query`,
      {
        params: {
          query: `SELECT Id, Name, UnitPrice, Description FROM Item WHERE Sku IN (${itemSkus})`,
        },
        headers: {
          Authorization: `Bearer ${qbData.accessToken}`,
          Accept: 'application/json',
        },
      }
    );

    const qbItems = itemsQuery.data.QueryResponse.Item || [];
    const itemMap = new Map(
      qbItems.map((item: any) => [item.Description, item])
    );

    // Transform to QuickBooks invoice format
    const quickbooksInvoice = transformToQuickBooksInvoice(delivery, itemMap);

    try {
      // Check if invoice already exists for this delivery
      const searchResponse = await axios.get(
        `https://quickbooks.api.intuit.com/v3/company/${qbData.realmId}/query`,
        {
          params: {
            query: `SELECT * FROM Invoice WHERE DocNumber = '${delivery.code}'`,
          },
          headers: {
            Authorization: `Bearer ${qbData.accessToken}`,
            Accept: 'application/json',
          },
        }
      );

      let response;
      if (searchResponse.data.QueryResponse.Invoice?.length > 0) {
        // Update existing invoice
        const existingInvoiceId =
          searchResponse.data.QueryResponse.Invoice[0].Id;
        response = await axios.post(
          `https://quickbooks.api.intuit.com/v3/company/${qbData.realmId}/invoice`,
          {
            ...quickbooksInvoice,
            Id: existingInvoiceId,
            sparse: true,
            SyncToken: searchResponse.data.QueryResponse.Invoice[0].SyncToken,
          },
          {
            headers: {
              Authorization: `Bearer ${qbData.accessToken}`,
              'Content-Type': 'application/json',
            },
          }
        );
      } else {
        // Create new invoice
        response = await axios.post(
          `https://quickbooks.api.intuit.com/v3/company/${qbData.realmId}/invoice`,
          quickbooksInvoice,
          {
            headers: {
              Authorization: `Bearer ${qbData.accessToken}`,
              'Content-Type': 'application/json',
            },
          }
        );
      }

      // Store QuickBooks ID in Firestore
      await deliveryDoc.ref.update({
        quickbooksId: response.data.Invoice.Id,
        lastSyncedToQuickBooks: FieldValue.serverTimestamp(),
      });

      return {
        success: true,
        quickbooksId: response.data.Invoice.Id,
      };
    } catch (error: any) {
      logger.error('QB Invoice Sync Error:', error.response?.data || error);
      throw new functions.https.HttpsError(
        'internal',
        'Failed to sync delivery to QuickBooks invoice'
      );
    }
  }
);

// helper functions
const exchangeCodeForTokens = async (
  code: string
): Promise<QuickBooksTokens> => {
  const params = new URLSearchParams();
  params.append('grant_type', 'authorization_code');
  params.append('code', code);
  params.append('redirect_uri', functions.config().quickbooks.redirect_uri);

  try {
    const response = await axios.post(
      'https://oauth.platform.intuit.com/oauth2/v1/tokens/bearer',
      params,
      {
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
          Authorization: `Basic ${Buffer.from(
            `${functions.config().quickbooks.client_id}:${
              functions.config().quickbooks.client_secret
            }`
          ).toString('base64')}`,
        },
      }
    );

    return response.data;
  } catch (error: any) {
    logger.error(
      'Token exchange error:',
      error.response?.data || error.message
    );
    throw new functions.https.HttpsError(
      'internal',
      'Failed to exchange authorization code'
    );
  }
};

const refreshTokens = async (
  refreshToken: string
): Promise<QuickBooksTokens> => {
  const params = new URLSearchParams();
  params.append('grant_type', 'refresh_token');
  params.append('refresh_token', refreshToken);

  try {
    const response = await axios.post(
      'https://oauth.platform.intuit.com/oauth2/v1/tokens/bearer',
      params,
      {
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
          Authorization: `Basic ${Buffer.from(
            `${functions.config().quickbooks.client_id}:${
              functions.config().quickbooks.client_secret
            }`
          ).toString('base64')}`,
        },
      }
    );

    return response.data;
  } catch (error: any) {
    logger.error('Token refresh error:', error.response?.data || error.message);
    throw new functions.https.HttpsError(
      'internal',
      'Failed to refresh token',
      error
    );
  }
};

const transformToQuickBooksCustomer = (
  customer: Customer
): QuickBooksCustomer => {
  const qbCustomer: QuickBooksCustomer = {
    DisplayName: customer.name || '', // Required field in QuickBooks
  };

  // Add optional fields if they exist
  if (customer.email) {
    qbCustomer.PrimaryEmailAddr = { Address: customer.email };
  }

  if (customer.phone) {
    qbCustomer.PrimaryPhone = { FreeFormNumber: customer.phone };
  }

  // Combine address fields
  if (customer.address || customer.city || customer.zip || customer.country) {
    qbCustomer.BillAddr = {
      Line1: [customer.address, customer.suburb].filter(Boolean).join(', '),
      City: customer.city,
      PostalCode: customer.zip,
      Country: customer.country,
    };
  }

  qbCustomer.CompanyName = customer.name;

  // Add registration and VAT numbers to Notes
  const notes: string[] = [];
  if (customer.abnNumber) {
    notes.push(`Registration Number: ${customer.abnNumber}`);
  }
  if (customer.vatNum) {
    notes.push(`VAT Number: ${customer.vatNum}`);
  }
  if (notes.length > 0) {
    qbCustomer.Notes = notes.join('\n');
  }

  // Handle VAT settings
  qbCustomer.Taxable = !customer.excludeVAT;

  return qbCustomer;
};

const transformToQuickBooksSubCustomer = (
  site: Site
): QuickBooksSubCustomer => {
  const qbSubCustomer: QuickBooksSubCustomer = {
    DisplayName: `${site.name} (${site.code})`, // Include site code for unique identification
    ParentRef: {
      value: site.customer?.quickbooksId as string,
    },
    Job: true, // Marks this as a sub-customer/job in QuickBooks
    Active: site.status !== 'completed', // Set active status based on site status
  };

  // Combine address fields
  if (site.address || site.city || site.zip || site.country) {
    qbSubCustomer.BillAddr = {
      Line1: [site.address, site.suburb].filter(Boolean).join(', '),
      City: site.city,
      PostalCode: site.zip,
      Country: site.country,
    };
  }

  // Add site details to Notes
  const notes: string[] = [];
  if (site.status) {
    notes.push(`Status: ${site.status}`);
  }
  if (site.billable !== undefined) {
    notes.push(`Billable: ${site.billable}`);
  }
  if (notes.length > 0) {
    qbSubCustomer.Notes = notes.join('\n');
  }

  return qbSubCustomer;
};

const transformToQuickBooksInvoice = (
  delivery: Delivery,
  itemMap: any
): QuickBooksInvoice => {
  // Filter out items with shipmentQty <= 0 and group the remaining items by code and count quantities
  const itemCounts = delivery.items
    ?.filter((item) => item.shipmentQty > 0) // Only include items with shipmentQty > 0
    .reduce((acc, item) => {
      const code = String(item.code) || '';
      acc.set(code, (acc.get(code) || 0) + item.shipmentQty); // Use shipmentQty for quantity
      return acc;
    }, new Map<string, number>());

  // Create line items
  const lines = Array.from(
    (itemCounts || new Map<string, number>()).entries()
  ).map(([code, quantity]) => {
    const qbItem = itemMap.get(code);

    if (!qbItem) {
      throw new functions.https.HttpsError(
        'failed-precondition',
        `Item with SKU ${code} not found in QuickBooks`
      );
    }

    return {
      DetailType: 'SalesItemLineDetail',
      SalesItemLineDetail: {
        ItemRef: {
          value: qbItem.Id,
          name: qbItem.Name,
        },
        Qty: quantity,
        UnitPrice: qbItem.UnitPrice,
      },
      Amount: qbItem.UnitPrice * quantity,
      Description: `Delivery: ${delivery.code}`,
    };
  });

  // Compile delivery details for private note
  const noteDetails = [
    `Driver: ${delivery.driverName || 'N/A'}`,
    `Vehicle: ${delivery.vehicleReg || 'N/A'}`,
    `Signed By: ${delivery.signedBy || 'N/A'}`,
    delivery.notes,
  ].filter(Boolean);

  return {
    Line: lines,
    CustomerRef: {
      value: delivery.site?.quickbooksId as string,
    },
    TxnDate:
      delivery.date?.toDate().toISOString().split('T')[0] ||
      new Date().toISOString().split('T')[0],
    DocNumber: delivery.code,
    PrivateNote: noteDetails.join('\n'),
  };
};
