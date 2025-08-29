/* eslint-disable @typescript-eslint/naming-convention */
import * as functions from 'firebase-functions';
import * as admin from 'firebase-admin';
import * as logger from 'firebase-functions/logger';
import * as axios from 'axios';
import { FieldValue } from 'firebase-admin/firestore';

const xeroClientId = '5C93C5512BE849F0BFAB488727B9F29F';
const xeroClientSecret = 'F1I5W-zPLxaa5jtfkR6UEUwiKsj9p_GWeYb6WGUZr4QRNbBZ';
const xeroTokenUrl = 'https://identity.xero.com/connect/token';

exports.getXeroTenants = functions.https.onCall(async (data) => {
  try {
    const response = await axios.default.get(data.url, {
      headers: {
        Authorization: `Bearer ${data.accessToken}`,
      },
    });
    return response.data;
  } catch (error) {
    logger.error(`Error getting Xero tenants: ${error}`);
    throw new functions.https.HttpsError(
      'internal',
      'Error getting Xero tenants'
    );
  }
});

exports.getXeroAPI = functions.https.onCall(async (data) => {
  try {
    const response = await axios.default.get(data.url, {
      headers: {
        Authorization: `Bearer ${data.accessToken}`,
        'Xero-tenant-id': data.tenantID,
      },
    });
    return response.data;
  } catch (error) {
    logger.error(`Error getting Xero Data: ${data}`);
    throw new functions.https.HttpsError('internal', 'Error getting Xero data');
  }
});

exports.putXeroAPI = functions.https.onCall(async (data) => {
  try {
    const response = await axios.default.put(
      data.url,
      { ...data.body },
      {
        headers: {
          Authorization: `Bearer ${data.accessToken}`,
          'Xero-tenant-id': data.tenantID,
        },
      }
    );
    return response.data;
  } catch (error) {
    logger.error(`Error putting Xero Data: ${data}`);
    throw new functions.https.HttpsError('internal', 'Error putting Xero data');
  }
});

exports.refreshXeroTokens = functions.pubsub
  .schedule('*/20 * * * *')
  .onRun(async () => {
    try {
      const companies = await admin
        .firestore()
        .collection('company')
        .orderBy('tokens', 'asc')
        .get();

      for (const companyDoc of companies.docs) {
        const company = companyDoc.data();
        const { refreshToken } = company.tokens;

        try {
          const response = await axios.default.post(
            xeroTokenUrl,
            {
              grant_type: 'refresh_token',
              refresh_token: refreshToken,
            },
            {
              headers: {
                'Content-Type': 'application/x-www-form-urlencoded',
                Authorization:
                  'Basic ' + btoa(xeroClientId + ':' + xeroClientSecret),
              },
            }
          );

          const { access_token: accessToken, refresh_token: newRefreshToken } =
            response.data;

          await companyDoc.ref.update({
            'tokens.accessToken': accessToken,
            'tokens.refreshToken': newRefreshToken,
            'tokens.lastUpdated': FieldValue.serverTimestamp(),
          });

          logger.log('Tokens refreshed successfully.');
        } catch (error) {
          logger.error(
            `Error refreshing Xero tokens for client ${company.id}: ${error}`
          );
          throw new Error('Error refreshing Xero tokens.');
        }
      }

      return '200';
    } catch (error) {
      logger.error(`Error refreshing Xero tokens: ${error}`);
      return '500';
    }
  });
