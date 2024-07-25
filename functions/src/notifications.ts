/* eslint-disable max-len */
/* eslint-disable @typescript-eslint/naming-convention */
import * as functions from 'firebase-functions';
import * as admin from 'firebase-admin';
import * as logger from 'firebase-functions/logger';

exports.enquiryCreated = functions.firestore
  .document('company/{companyId}/enquiries/{id}')
  .onCreate(async (change, context) => {
    const users = await getUsers(context.params.companyId, ['Enquiries']);
    if (users) {
      for await (const user of users.docs) {
        await admin
          .firestore()
          .collection(`users/${user.id}/notifications`)
          .add({
            title: 'New Enquiry',
            date: admin.firestore.FieldValue.serverTimestamp(),
            message: `A new enquiry ${
              change.data().code
            } has been created for ${
              change.data().siteName
            }. Check details and update if necessary.`,
          });
      }
    }
  });

exports.estimateCreated = functions.firestore
  .document('company/{companyId}/estimates/{id}')
  .onCreate(async (change, context) => {
    const users = await getUsers(context.params.companyId, ['Estimates']);
    if (users) {
      for await (const user of users.docs) {
        await admin
          .firestore()
          .collection(`users/${user.id}/notifications`)
          .add({
            title: 'New Estimate',
            date: admin.firestore.FieldValue.serverTimestamp(),
            message: `A new estimate ${
              change.data().code
            } has been created for ${
              change.data().siteName
            }. Check details and update if necessary.`,
          });
      }
    }
  });

exports.estimateUpdates = functions.firestore
  .document('company/{companyId}/estimates/{id}')
  .onUpdate(async (change, context) => {
    if (change.after.data().status === 'accepted') {
      const users = await getUsers(context.params.companyId, ['Estimates']);
      if (users) {
        for await (const user of users.docs) {
          await admin
            .firestore()
            .collection(`users/${user.id}/notifications`)
            .add({
              title: 'Estimate Accepted',
              date: admin.firestore.FieldValue.serverTimestamp(),
              message: `A estimate ${
                change.after.data().code
              } has been accepted for ${change.after.data().siteName}.`,
            });
        }
      }
    } else if (change.after.data().status === 'revised') {
      const users = await getUsers(context.params.companyId, ['Estimates']);
      if (users) {
        for await (const user of users.docs) {
          await admin
            .firestore()
            .collection(`users/${user.id}/notifications`)
            .add({
              title: 'Estimate Revised',
              date: admin.firestore.FieldValue.serverTimestamp(),
              message: `A estimate ${
                change.after.data().code
              } has been revised for ${change.after.data().siteName}.`,
            });
        }
      }
    } else if (change.after.data().status === 'rejected') {
      const users = await getUsers(context.params.companyId, ['Estimates']);
      if (users) {
        for await (const user of users.docs) {
          await admin
            .firestore()
            .collection(`users/${user.id}/notifications`)
            .add({
              title: 'Estimate Rejected',
              date: admin.firestore.FieldValue.serverTimestamp(),
              message: `A estimate ${
                change.after.data().code
              } has been rejected for ${change.after.data().siteName}.`,
            });
        }
      }
    }
  });

exports.requestUpdates = functions.firestore
  .document('company/{companyId}/requests/{id}')
  .onUpdate(async (change, context) => {
    if (change.after.data().status === 'submitted') {
      // get inventory users
      const users = await getUsers(context.params.companyId, [
        'Inventory Requests',
      ]);

      // get site users
      const siteUsers = await getSiteUsers(
        context.params.companyId,
        change.after.data().site.id
      );

      // send notifications to site users
      if (siteUsers) {
        for await (const user of siteUsers) {
          await admin
            .firestore()
            .collection(`users/${user.id}/notifications`)
            .add({
              title: 'Inventory Request Submitted',
              date: admin.firestore.FieldValue.serverTimestamp(),
              message: `A inventory request ${
                change.after.data().code
              } has been submitted for ${
                change.after.data().site.name
              }. Check details and update if necessary.`,
            });
        }
      }

      // send notifications to inventory users
      if (users) {
        for await (const user of users.docs) {
          await admin
            .firestore()
            .collection(`users/${user.id}/notifications`)
            .add({
              title: 'New Inventory Request',
              date: admin.firestore.FieldValue.serverTimestamp(),
              message: `A inventory request ${
                change.after.data().code
              } has been submitted for ${
                change.after.data().site.name
              }. Check details and update if necessary.`,
            });
        }
      }
    } else if (change.after.data().status === 'approved') {
      // get site users
      const siteUsers = await getSiteUsers(
        context.params.companyId,
        change.after.data().site.id
      );

      // send notifications to site users
      if (siteUsers) {
        for await (const user of siteUsers) {
          await admin
            .firestore()
            .collection(`users/${user.id}/notifications`)
            .add({
              title: 'Inventory Request Approved',
              date: admin.firestore.FieldValue.serverTimestamp(),
              message: `A inventory request ${
                change.after.data().code
              } has been approved for ${change.after.data().site.name}.`,
            });
        }
      }
    }
  });

exports.deliveryUpdates = functions.firestore
  .document('company/{companyId}/shipments/{id}')
  .onUpdate(async (change, context) => {
    const data = change.after.data();
    const companyId = context.params.companyId;
    const shipmentCode = data.code;
    const site = data.site;

    let title;
    let message;

    if (data.status === 'on-route') {
      title = 'Delivery On Route';
      message = `A new delivery ${shipmentCode} is on route for site ${site.name}.`;
    } else if (data.status === 'received') {
      title = 'Delivery Received';
      message = `Delivery ${shipmentCode} has been received by ${data.signedBy}.`;
    } else {
      // Exit early if status is not relevant
      return;
    }

    const [users, siteUsers] = await Promise.all([
      getUsers(companyId, ['Shipments', 'Deliveries']),
      getSiteUsers(companyId, site.id),
    ]);

    await Promise.all([
      sendNotifications(users, title, message),
      sendNotifications(siteUsers, title, message),
    ]);
  });

exports.returnUpdates = functions.firestore
  .document('company/{companyId}/returns/{id}')
  .onUpdate(async (change, context) => {
    const data = change.after.data();
    const companyId = context.params.companyId;
    const returnCode = data.code;
    const site = data.site;

    let title;
    let message;

    if (data.status === 'submitted') {
      title = 'Return Submitted';
      message = `A new return ${returnCode} has been submitted for ${site.name}. Check details and update if necessary.`;
    } else if (data.status === 'on-route') {
      title = 'Driver on route';
      message = `Return ${returnCode} has been approved for ${site.name}. Driver on route for collection.`;
    } else if (data.status === 'collected') {
      title = 'Return collected';
      message = `Return ${returnCode} has been collected for ${site.name}. Driver on route to yard.`;
    } else if (data.status === 'received') {
      title = 'Return has been processed';
      message = `Return ${returnCode} has been processed for ${site.name}.`;
    } else {
      // Exit early if status is not relevant
      return;
    }

    const [users, siteUsers] = await Promise.all([
      getUsers(companyId, ['Inventory Returns']),
      getSiteUsers(companyId, site.id),
    ]);

    await Promise.all([
      sendNotifications(users, title, message),
      sendNotifications(siteUsers, title, message),
    ]);
  });

exports.scaffoldUpdates = functions.firestore
  .document('company/{companyId}/scaffolds/{id}')
  .onUpdate(async (change, context) => {
    if (change.after.data().status === 'inactive-Failed Inspection') {
      const scaffold = change.after.data();
      // get site users
      const siteUsers = await getSiteUsers(
        context.params.companyId,
        change.after.data().siteId
      );
      // send notifications to site users
      if (siteUsers) {
        for await (const user of siteUsers) {
          await admin
            .firestore()
            .collection(`users/${user.id}/notifications`)
            .add({
              title: 'Scaffold Failed Inspection',
              date: admin.firestore.FieldValue.serverTimestamp(),
              message: `Scaffold ${scaffold.code} on site ${scaffold.siteCode} ${scaffold?.siteName} failed recent inspection. Please take necessary actions.`,
            });
        }
      }
      // send notifications to scaffold creator
      await admin
        .firestore()
        .collection(`users/${scaffold.createdBy}/notifications`)
        .add({
          title: 'Scaffold Failed Inspection',
          date: admin.firestore.FieldValue.serverTimestamp(),
          message: `Scaffold ${scaffold.code} on site ${scaffold.siteCode} ${scaffold?.siteName} failed recent inspection. Please take necessary actions.`,
        });
    }
  });

const sendNotifications = async (users: any, title: any, message: any) => {
  if (users && users.docs) {
    for (const user of users.docs) {
      await admin.firestore().collection(`users/${user.id}/notifications`).add({
        title,
        date: admin.firestore.FieldValue.serverTimestamp(),
        message,
      });
    }
  } else if (users) {
    for (const user of users) {
      await admin.firestore().collection(`users/${user.id}/notifications`).add({
        title,
        date: admin.firestore.FieldValue.serverTimestamp(),
        message,
      });
    }
  }
};

const getUsers = async (companyId: string, permissions: string[]) => {
  try {
    const users = await admin
      .firestore()
      .collection('users')
      .where('company', '==', companyId)
      .where('permissionsList', 'array-contains-any', [...permissions])
      .get();
    return users;
  } catch (error) {
    logger.log(error);
    return null;
  }
};

const getSiteUsers = async (companyId: string, siteId: string) => {
  try {
    const site = await admin
      .firestore()
      .doc(`company/${companyId}/sites/${siteId}`)
      .get();

    return site.data()?.users;
  } catch (error) {
    logger.log(error);
    return null;
  }
};
