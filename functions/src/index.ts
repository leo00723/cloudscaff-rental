/* eslint-disable @typescript-eslint/naming-convention */
import * as admin from 'firebase-admin';

admin.initializeApp();

const accounts = require('./accounts');
const shipments = require('./shipments');
const xero = require('./xero');
const notifications = require('./notifications');

//export account functions to firebase

exports.regiserCompany = accounts.regiserCompany;
exports.addUser = accounts.addUser;
exports.deleteUser = accounts.deleteUser;
exports.checkTrials = accounts.checkTrials;
exports.checkUsers = accounts.checkUsers;

//export shipment functions to firebase

exports.manageShipment = shipments.manageShipment;
exports.manageBillableShipment = shipments.manageBillableShipment;
exports.manageTransfer = shipments.manageTransfer;
exports.manageReturn = shipments.manageReturn;

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
exports.scaffoldUpdates = notifications.scaffoldUpdates;
