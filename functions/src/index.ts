import * as functions from 'firebase-functions';
import * as admin from 'firebase-admin';
import * as logger from 'firebase-functions/logger';

admin.initializeApp();

exports.regiserCompany = functions.https.onCall(async (data) => {
  try {
    const auth = await admin.auth().createUser({
      email: data.email,
      password: data.password,
      displayName: data.name,
    });
    const company = await admin
      .firestore()
      .collection('company')
      .add({ name: data.company, needsSetup: true });
    await admin.auth().setCustomUserClaims(auth.uid, { company: company.id });
    await admin.firestore().collection('users').doc(auth.uid).set({
      name: auth.displayName,
      email: auth.email,
      company: company.id,
      role: 'Owner',
      needsSetup: true,
    });
    return '200';
  } catch (error) {
    logger.log(error);
    return '500';
  }
});

exports.addUser = functions.https.onCall(async (data) => {
  try {
    const auth = await admin.auth().createUser({
      email: data.email,
      password: data.password,
    });
    await admin.auth().setCustomUserClaims(auth.uid, { company: data.company });
    await admin.firestore().collection('users').doc(auth.uid).set({
      email: auth.email,
      company: data.company,
      role: data.role,
      needsSetup: true,
    });
    return '200';
  } catch (error) {
    logger.log(error);
    return '500';
  }
});

exports.deleteUser = functions.https.onCall(async (data) => {
  try {
    await admin.auth().deleteUser(data.id);
    return '200';
  } catch (error) {
    logger.log(error);
    return '500';
  }
});

exports.manageShipment = functions.firestore
  .document('company/{companyId}/shipments/{shipmentId}')
  .onUpdate(async (change, context) => {
    try {
      if (
        change.before.data().status !== 'sent' &&
        change.after.data().status === 'sent'
      ) {
        const shipment = change.after.data();
        // Get the shipment items on site
        const siteInventory = await admin
          .firestore()
          .doc(
            `company/${context.params.companyId}/siteStock/${shipment.site.id}`
          )
          .get();
        // check if its the first time the shipment is being sent
        if (siteInventory.exists) {
          // Update the site inventory
          const items = shipment.items.map((item: any) => {
            return {
              id: item.id,
              code: item.code,
              category: item.category,
              name: item.name,
              weight: +item.weight,
              availableQty: +item.shipmentQty,
            };
          });

          const oldInventory = siteInventory.data()!.items;

          items.forEach((item: any) => {
            const inventoryItem = oldInventory.find(
              (i: any) => i.id === item.id
            );
            if (inventoryItem) {
              inventoryItem.availableQty =
                inventoryItem.availableQty + item.availableQty;
            } else {
              oldInventory.push(item);
            }
          });

          const itemIds = oldInventory.map((item: any) => item.id);
          const updatedInventory = {
            items: oldInventory,
            ids: itemIds,
            site: shipment.site,
          };

          await admin
            .firestore()
            .doc(
              `company/${context.params.companyId}/siteStock/${shipment.site.id}`
            )
            .set(updatedInventory);

          // update the stock list
          for (const item of items) {
            await admin
              .firestore()
              .doc(`company/${context.params.companyId}/stockItems/${item.id}`)
              .update({
                inUseQty: admin.firestore.FieldValue.increment(
                  item.availableQty
                ),
              });
          }
        } else {
          // Create the site inventory
          const items = shipment.items.map((item: any) => {
            return {
              id: item.id,
              code: item.code,
              category: item.category,
              name: item.name,
              weight: +item.weight,
              availableQty: +item.shipmentQty,
            };
          });
          const itemIds = shipment.items.map((item: any) => item.id);

          const updatedInventory = {
            items,
            ids: itemIds,
            site: shipment.site,
          };
          await admin
            .firestore()
            .doc(
              `company/${context.params.companyId}/siteStock/${shipment.site.id}`
            )
            .set(updatedInventory);
          // update the stock list
          for (const item of items) {
            await admin
              .firestore()
              .doc(`company/${context.params.companyId}/stockItems/${item.id}`)
              .update({
                inUseQty: admin.firestore.FieldValue.increment(
                  item.availableQty
                ),
              });
          }
        }
        return '200';
      }
    } catch (error) {
      logger.error(error);
      return error;
    }
  });

exports.manageTransfer = functions.firestore
  .document('company/{companyId}/transfers/{transferId}')
  .onUpdate(async (change, context) => {
    try {
      if (
        change.before.data().status !== 'sent' &&
        change.after.data().status === 'sent'
      ) {
        const transfer = change.after.data();
        // Get the shipment items on FROM site
        const fromSiteInventory = await admin
          .firestore()
          .doc(
            `company/${context.params.companyId}/siteStock/${transfer.fromSite.id}`
          )
          .get();

        // Get the shipment items on TO site
        const toSiteInventory = await admin
          .firestore()
          .doc(
            `company/${context.params.companyId}/siteStock/${transfer.toSite.id}`
          )
          .get();

        // check if its the first time the site is recieving a shipment
        if (toSiteInventory.exists) {
          // Update the to site inventory
          const items = transfer.items.map((item: any) => {
            return {
              id: item.id,
              code: item.code,
              category: item.category,
              name: item.name,
              weight: +item.weight,
              availableQty: +item.shipmentQty,
            };
          });

          //get the items on both sites
          const fromSiteItems = fromSiteInventory.data()!.items;
          const toSiteItems = toSiteInventory.data()!.items;

          //update the from site inventory totals
          items.forEach((item: any) => {
            const inventoryItem = fromSiteItems.find(
              (i: any) => i.id === item.id
            );
            if (inventoryItem) {
              inventoryItem.availableQty =
                inventoryItem.availableQty - item.availableQty;
              //remove item if its zero
              if (inventoryItem.availableQty <= 0) {
                fromSiteItems.splice(fromSiteItems.indexOf(inventoryItem), 1);
              }
            }
          });

          //update the to site inventory totals
          items.forEach((item: any) => {
            const inventoryItem = toSiteItems.find(
              (i: any) => i.id === item.id
            );
            if (inventoryItem) {
              inventoryItem.availableQty =
                inventoryItem.availableQty + item.availableQty;
            } else {
              toSiteItems.push(item);
            }
          });

          //update the from site document data
          const fromItemIds = fromSiteItems.map((item: any) => item.id);
          const updatedFromInventory = {
            items: fromSiteItems,
            ids: fromItemIds,
            site: transfer.fromSite,
          };

          // update the to site document data
          const toItemIds = toSiteItems.map((item: any) => item.id);
          const updatedToInventory = {
            items: toSiteItems,
            ids: toItemIds,
            site: transfer.toSite,
          };

          //update the from site document
          await admin
            .firestore()
            .doc(
              `company/${context.params.companyId}/siteStock/${transfer.fromSite.id}`
            )
            .set(updatedFromInventory);
          // update the to site document
          await admin
            .firestore()
            .doc(
              `company/${context.params.companyId}/siteStock/${transfer.toSite.id}`
            )
            .set(updatedToInventory);
        } else {
          // Create the site inventory
          const items = transfer.items.map((item: any) => {
            return {
              id: item.id,
              code: item.code,
              category: item.category,
              name: item.name,
              weight: +item.weight,
              availableQty: +item.shipmentQty,
            };
          });
          const fromSiteItems = fromSiteInventory.data()!.items;
          //update the from site inventory totals
          items.forEach((item: any) => {
            const inventoryItem = fromSiteItems.find(
              (i: any) => i.id === item.id
            );
            if (inventoryItem) {
              inventoryItem.availableQty =
                inventoryItem.availableQty - item.availableQty;
              //remove item if its zero
              if (inventoryItem.availableQty <= 0) {
                fromSiteItems.splice(fromSiteItems.indexOf(inventoryItem), 1);
              }
            }
          });

          //update the from site document data
          const fromItemIds = fromSiteItems.map((item: any) => item.id);
          const updatedFromInventory = {
            items: fromSiteItems,
            ids: fromItemIds,
            site: transfer.fromSite,
          };

          //update the from site document
          await admin
            .firestore()
            .doc(
              `company/${context.params.companyId}/siteStock/${transfer.fromSite.id}`
            )
            .set(updatedFromInventory);

          // update the to site document
          const itemIds = transfer.items.map((item: any) => item.id);
          const updatedInventory = {
            items,
            ids: itemIds,
            site: transfer.toSite,
          };
          await admin
            .firestore()
            .doc(
              `company/${context.params.companyId}/siteStock/${transfer.toSite.id}`
            )
            .set(updatedInventory);
        }
        return '200';
      }
    } catch (error) {
      logger.error(error);
      return error;
    }
  });

exports.manageReturn = functions.firestore
  .document('company/{companyId}/returns/{returnId}')
  .onUpdate(async (change, context) => {
    try {
      if (
        change.before.data().status !== 'sent' &&
        change.after.data().status === 'sent'
      ) {
        const returnData = change.after.data();
        // Get the shipment items on site
        const siteInventory = await admin
          .firestore()
          .doc(
            `company/${context.params.companyId}/siteStock/${returnData.site.id}`
          )
          .get();
        // check if its the first time the shipment is being sent
        if (siteInventory.exists) {
          // Update the site inventory
          const items = returnData.items.map((item: any) => {
            return {
              id: item.id,
              code: item.code,
              category: item.category,
              name: item.name,
              weight: +item.weight,
              availableQty: +item.shipmentQty,
            };
          });

          const oldInventory = siteInventory.data()!.items;

          items.forEach((item: any) => {
            const inventoryItem = oldInventory.find(
              (i: any) => i.id === item.id
            );
            if (inventoryItem) {
              inventoryItem.availableQty =
                inventoryItem.availableQty - item.availableQty;
              if (inventoryItem.availableQty <= 0) {
                oldInventory.splice(oldInventory.indexOf(inventoryItem), 1);
              }
            } else {
              oldInventory.push(item);
            }
          });

          const itemIds = oldInventory.map((item: any) => item.id);
          const updatedInventory = {
            items: oldInventory,
            ids: itemIds,
            site: returnData.site,
          };

          await admin
            .firestore()
            .doc(
              `company/${context.params.companyId}/siteStock/${returnData.site.id}`
            )
            .set(updatedInventory);

          // update the stock list
          for (const item of items) {
            await admin
              .firestore()
              .doc(`company/${context.params.companyId}/stockItems/${item.id}`)
              .update({
                inUseQty: admin.firestore.FieldValue.increment(
                  -item.availableQty
                ),
              });
          }
        }
        return '200';
      }
    } catch (error) {
      logger.error(error);
      return error;
    }
  });
