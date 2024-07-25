/* eslint-disable @typescript-eslint/naming-convention */
import * as functions from 'firebase-functions';
import * as admin from 'firebase-admin';
import * as logger from 'firebase-functions/logger';

exports.manageShipment = functions.firestore
  .document('company/{companyId}/shipments/{shipmentId}')
  .onUpdate(async (change, context) => {
    await shipItems(change, context);
    await reserveItems(change, context);
  });

exports.manageBillableShipment = functions.firestore
  .document('company/{companyId}/billableShipments/{shipmentId}')
  .onUpdate(async (change, context) => {
    await shipItems(change, context);
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
          const items = transfer.items.map((item: any) => ({
            id: item.id,
            code: item.code,
            category: item.category,
            name: item.name,
            weight: +item.weight,
            availableQty: +item.shipmentQty,
          }));

          //get the items on both sites
          const fromSiteItems = fromSiteInventory.data()?.items;
          const toSiteItems = toSiteInventory.data()?.items;

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
          const items = transfer.items.map((item: any) => ({
            id: item.id,
            code: item.code,
            category: item.category,
            name: item.name,
            weight: +item.weight,
            availableQty: +item.shipmentQty,
          }));
          const fromSiteItems = fromSiteInventory.data()?.items;
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
      return true;
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
        (change.before.data().status !== 'sent' ||
          change.before.data().status !== 'received') &&
        (change.after.data().status === 'sent' ||
          change.after.data().status === 'received')
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
          const items = returnData.items.map((item: any) => ({
            id: item.id,
            code: item.code,
            category: item.category,
            name: item.name,
            weight: +item.weight,
            availableQty: +item.shipmentQty,
            damagedQty: item.damagedQty ? +item.damagedQty : 0,
            lostQty: item.lostQty ? +item.lostQty : 0,
            inMaintenanceQty: item.inMaintenanceQty
              ? +item.inMaintenanceQty
              : 0,
          }));

          const oldInventory = siteInventory.data()?.items;

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
                damagedQty: admin.firestore.FieldValue.increment(
                  item.damagedQty
                ),
                lostQty: admin.firestore.FieldValue.increment(item.lostQty),
                inMaintenanceQty: admin.firestore.FieldValue.increment(
                  item.inMaintenanceQty
                ),
                yardQty: admin.firestore.FieldValue.increment(-item.lostQty),
              });
          }
        }
        return '200';
      }
      return true;
    } catch (error) {
      logger.error(error);
      return error;
    }
  });

// exports.generateInvoices = functions.pubsub
//   .schedule('00 03 * * *')
//   .timeZone('America/Los_Angeles') // Users can choose timezone - default is America/Los_Angeles
//   .onRun(async (context) => {
//     try {
//       //get all billable sites
//       logger.log('Getting all billable sites......');
//       const data = await admin
//         .firestore()
//         .collectionGroup('sites')
//         .where('billable', '==', true)
//         .get();
//       //loop through all sites
//       logger.log('Looping all billable sites......');
//       for (const siteDoc of data.docs) {
//         const site = siteDoc.data();
//         const today = admin.firestore.Timestamp.fromDate(new Date()).seconds;
//         let daysRemaining = null;
//         daysRemaining = daysbetween(site.nextInvoiceDate.seconds, today);
//         //check if site is due for billing on the current day
//         if (daysRemaining <= 0) {
//           //get all shipments for billable site
//           logger.log('Getting all active shipments......');
//           const shipments = await admin
//             .firestore()
//             .collectionGroup('billableShipments')
//             .where('site.id', '==', siteDoc.id)
//             .where('status', '==', 'sent')
//             .get();
//           //loop through all shipments
//           logger.log('Looping all active shipments......');
//           for (const shipmentDoc of shipments.docs) {
//             const shipment = shipmentDoc.data();
//             //check if the shipment ended in the cycle
//             const daysTillEnd = daysbetween(
//               admin.firestore.Timestamp.fromDate(new Date(shipment.endDate))
//                 .seconds,
//               today
//             );
//             //check if it is the first invoice for this shipment
//             if (shipment.consumablesCharged) {
//               logger.log('shipment has been charged before');
//               let daysOnHire = 0;
//               if (daysTillEnd <= 0) {
//                 //shipment is ended
//                 daysOnHire = daysbetween(
//                   admin.firestore.Timestamp.fromDate(new Date(shipment.endDate))
//                     .seconds,
//                   shipment.lastInvoiceDate.seconds
//                 );
//                 logger.log('shipment ended', daysOnHire);
//               } else {
//                 //shipment is still active
//                 daysOnHire = daysbetween(
//                   today,
//                   shipment.lastInvoiceDate.seconds
//                 );
//                 logger.log('shipment active', daysOnHire);
//               }
//               const company = (
//                 await admin
//                   .firestore()
//                   .doc(`company/${shipment.company.id}`)
//                   .get()
//               ).data();
//               let invoice = { ...shipment };
//               invoice.code = `INV${new Date().toLocaleDateString('en', {
//                 year: '2-digit',
//               })}${(company?.totalInvoices ? company.totalInvoices + 1 : 1)
//                 .toString()
//                 .padStart(6, '0')}`;
//               invoice.type = 'shipment';
//               invoice.date = admin.firestore.FieldValue.serverTimestamp();

//               invoice = calcShipmentCost(invoice, daysOnHire, false, company);
//               await admin
//                 .firestore()
//                 .collection(`company/${shipment.company.id}/invoices`)
//                 .add({
//                   ...invoice,
//                 });
//               await admin
//                 .firestore()
//                 .doc(`company/${shipment.company.id}`)
//                 .set(
//                   {
//                     totalInvoices: admin.firestore.FieldValue.increment(1),
//                   },
//                   { merge: true }
//                 );
//               await admin
//                 .firestore()
//                 .doc(
//                   `company/${shipment.company.id}/billableShipments/${shipmentDoc.id}`
//                 )
//                 .set(
//                   {
//                     lastInvoiceDate:
//                       admin.firestore.FieldValue.serverTimestamp(),
//                   },
//                   { merge: true }
//                 );
//             } else {
//               logger.log('first Invoice');
//               if (daysTillEnd <= 0) {
//                 //shipment ended so invoice full amount
//                 const company = (
//                   await admin
//                     .firestore()
//                     .doc(`company/${shipment.company.id}`)
//                     .get()
//                 ).data();
//                 const invoice = { ...shipment };
//                 invoice.code = `INV${new Date().toLocaleDateString('en', {
//                   year: '2-digit',
//                 })}${(company?.totalInvoices ? company.totalInvoices + 1 : 1)
//                   .toString()
//                   .padStart(6, '0')}`;
//                 invoice.type = 'shipment';
//                 invoice.date = admin.firestore.FieldValue.serverTimestamp();
//                 await admin
//                   .firestore()
//                   .collection(`company/${shipment.company.id}/invoices`)
//                   .add({
//                     ...invoice,
//                   });
//                 await admin
//                   .firestore()
//                   .doc(`company/${shipment.company.id}`)
//                   .set(
//                     {
//                       totalInvoices: admin.firestore.FieldValue.increment(1),
//                     },
//                     { merge: true }
//                   );
//                 await admin
//                   .firestore()
//                   .doc(
//                     `company/${shipment.company.id}/billableShipments/${shipmentDoc.id}`
//                   )
//                   .set(
//                     {
//                       consumablesCharged: true,
//                       status: 'shipment ended',
//                     },
//                     { merge: true }
//                   );
//               } else {
//                 //shipment is still active
//                 const company = (
//                   await admin
//                     .firestore()
//                     .doc(`company/${shipment.company.id}`)
//                     .get()
//                 ).data();
//                 let invoice = { ...shipment };
//                 invoice.code = `INV${new Date().toLocaleDateString('en', {
//                   year: '2-digit',
//                 })}${(company?.totalInvoices ? company.totalInvoices + 1 : 1)
//                   .toString()
//                   .padStart(6, '0')}`;
//                 invoice.type = 'shipment';
//                 invoice.date = admin.firestore.FieldValue.serverTimestamp();
//                 const daysOnHire = daysbetween(
//                   today,
//                   admin.firestore.Timestamp.fromDate(
//                     new Date(shipment.startDate)
//                   ).seconds
//                 );
//                 invoice = calcShipmentCost(invoice, daysOnHire, true, company);
//                 await admin
//                   .firestore()
//                   .collection(`company/${shipment.company.id}/invoices`)
//                   .add({
//                     ...invoice,
//                   });
//                 await admin
//                   .firestore()
//                   .doc(`company/${shipment.company.id}`)
//                   .set(
//                     {
//                       totalInvoices: admin.firestore.FieldValue.increment(1),
//                     },
//                     { merge: true }
//                   );
//                 await admin
//                   .firestore()
//                   .doc(
//                     `company/${shipment.company.id}/billableShipments/${shipmentDoc.id}`
//                   )
//                   .set(
//                     {
//                       consumablesCharged: true,
//                       lastInvoiceDate:
//                         admin.firestore.FieldValue.serverTimestamp(),
//                     },
//                     { merge: true }
//                   );
//               }
//             }
//           }
//         }
//       }
//       logger.log('completed');
//       return true;
//     } catch (err) {
//       logger.error('something went wrong somewhere', err);
//       return false;
//     }
//   });

// function calcShipmentCost(
//   shipment: any,
//   daysOnHire: number,
//   chargeConsumables: boolean,
//   company: any
// ) {
//   let itemHire = 0;

//   shipment.items.forEach((i: any) => {
//     i.totalCost =
//       +i.hireCost * +daysOnHire * (i.shipmentQty ? +i.shipmentQty : 0);
//     itemHire += i.totalCost;
//   });

//   let labour = 0;
//   let transport = 0;
//   let additionals = 0;
//   if (chargeConsumables) {
//     shipment.labour.forEach((l: any) => {
//       labour += +l.total;
//     });
//     shipment.transport.forEach((t: any) => {
//       transport += +t.total;
//     });
//     shipment.additionals.forEach((a: any) => {
//       additionals += +a.total;
//     });
//   }

//   shipment.subtotal = itemHire + labour + transport + additionals;
//   shipment.discount = shipment.subtotal * (+shipment.discountPercentage / 100);
//   shipment.totalAfterDiscount = shipment.subtotal - shipment.discount;
//   shipment.tax = shipment.totalAfterDiscount * (company.salesTax / 100);
//   shipment.vat = shipment.totalAfterDiscount * (company.vat / 100);
//   shipment.total = shipment.totalAfterDiscount + shipment.tax + shipment.vat;

//   return shipment;
// }

// eslint-disable-next-line prefer-arrow/prefer-arrow-functions
const shipItems = async (
  change: functions.Change<functions.firestore.QueryDocumentSnapshot>,
  context: functions.EventContext
) => {
  try {
    if (
      (change.before.data().status !== 'sent' ||
        change.before.data().status !== 'received') &&
      (change.after.data().status === 'sent' ||
        change.after.data().status === 'received')
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
        const items = shipment.items.map((item: any) => ({
          id: item.id,
          code: item.code,
          category: item.category,
          name: item.name,
          weight: +item.weight,
          availableQty: +item.shipmentQty,
        }));

        const oldInventory = siteInventory.data()?.items;

        items.forEach((item: any) => {
          const inventoryItem = oldInventory.find((i: any) => i.id === item.id);
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
              inUseQty: admin.firestore.FieldValue.increment(item.availableQty),
            });
        }
      } else {
        // Create the site inventory
        const items = shipment.items.map((item: any) => ({
          id: item.id,
          code: item.code,
          category: item.category,
          name: item.name,
          weight: +item.weight,
          availableQty: +item.shipmentQty,
        }));
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
              inUseQty: admin.firestore.FieldValue.increment(item.availableQty),
            });
        }
      }
      return '200';
    }
    return true;
  } catch (error) {
    logger.error(error);
    return error;
  }
};

const reserveItems = async (
  change: functions.Change<functions.firestore.QueryDocumentSnapshot>,
  context: functions.EventContext
) => {
  try {
    if (
      change.before.data().status !== 'reserved' &&
      change.after.data().status === 'reserved'
    ) {
      const shipment = change.after.data();
      // update the stock list
      for (const item of shipment.items) {
        await admin
          .firestore()
          .doc(`company/${context.params.companyId}/stockItems/${item.id}`)
          .update({
            reservedQty: admin.firestore.FieldValue.increment(
              +item.shipmentQty
            ),
          });
      }

      return '200';
    } else if (
      change.before.data().status === 'reserved' &&
      change.after.data().status === 'pending'
    ) {
      const shipment = change.after.data();
      // update the stock list
      for (const item of shipment.items) {
        await admin
          .firestore()
          .doc(`company/${context.params.companyId}/stockItems/${item.id}`)
          .update({
            reservedQty: admin.firestore.FieldValue.increment(
              -+item.shipmentQty
            ),
          });
      }

      return '200';
    }
    return true;
  } catch (error) {
    logger.error(error);
    return error;
  }
};
