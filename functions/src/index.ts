/* eslint-disable @typescript-eslint/naming-convention */
import * as admin from 'firebase-admin';

admin.initializeApp();

const accounts = require('./accounts');
const inventory = require('./inventory');
const notifications = require('./notifications');
const invoices = require('./invoices');
const xero = require('./xero');
const quickbooks = require('./quickbooks');
const snde = require('./snde');

//export account functions to firebase

exports.regiserCompany = accounts.regiserCompany;
exports.setupOAuthCompany = accounts.setupOAuthCompany;
exports.addUser = accounts.addUser;
exports.deleteUser = accounts.deleteUser;
exports.acceptSSOInvitation = accounts.acceptSSOInvitation;
exports.checkUsers = accounts.checkUsers;

//export shipment functions to firebase

exports.manageBulkUpdate = inventory.manageBulkUpdate;
exports.manageSplitDelivery = inventory.manageSplitDelivery;
exports.manageShipment = inventory.manageShipment;
exports.manageBillableShipment = inventory.manageBillableShipment;
exports.manageTransfer = inventory.manageTransfer;
exports.managePOTransfer = inventory.managePOTransfer;
exports.manageReturn = inventory.manageReturn;
exports.manageOverReturn = inventory.manageOverReturn;
exports.updateOverReturn = inventory.updateOverReturn;
exports.manageAdjustment = inventory.manageAdjustment;
exports.saleInvoiceCreated = inventory.saleInvoiceCreated;
exports.saleInvoiceUpdated = inventory.saleInvoiceUpdated;

//export xero functions to firebase

exports.getXeroTenants = xero.getXeroTenants;
exports.getXeroAPI = xero.getXeroAPI;
exports.putXeroAPI = xero.putXeroAPI;
exports.refreshXeroTokens = xero.refreshXeroTokens;

//export notification functions to firebase

exports.enquiryCreated = notifications.enquiryCreated;
exports.estimateCreated = notifications.estimateCreated;
exports.estimateUpdates = notifications.estimateUpdates;
exports.requestUpdates = notifications.requestUpdates;
exports.deliveryUpdates = notifications.deliveryUpdates;
exports.returnUpdates = notifications.returnUpdates;
exports.poTransferUpdates = notifications.poTransferUpdates;
exports.jobUpdates = notifications.jobUpdates;

//export invoice functions to firebase

exports.invoiceCreated = invoices.invoiceCreated;

//export Quickbooks functions to firebase

exports.initiateQuickBooksAuth = quickbooks.initiateQuickBooksAuth;
exports.handleQuickBooksCallback = quickbooks.handleQuickBooksCallback;
exports.disconnectQuickBooks = quickbooks.disconnectQuickBooks;
exports.syncCustomerToQuickBooks = quickbooks.syncCustomerToQuickBooks;
exports.syncSiteToQuickBooks = quickbooks.syncSiteToQuickBooks;
exports.syncDeliveryToQuickBooks = quickbooks.syncDeliveryToQuickBooks;

//export Email functions to firebase

exports.scaffoldNeedsDismantleEmail = snde.scaffoldNeedsDismantleEmail;
