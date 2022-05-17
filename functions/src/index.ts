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
          const itemIds = oldInventory.map((item: any) => item.id);
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
