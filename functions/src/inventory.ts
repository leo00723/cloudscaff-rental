/* eslint-disable @typescript-eslint/naming-convention */
import * as functions from 'firebase-functions';
import * as admin from 'firebase-admin';
import * as logger from 'firebase-functions/logger';
import { Timestamp, FieldValue } from 'firebase-admin/firestore';

exports.manageBulkUpdate = functions.firestore
  .document('company/{companyId}/bulkUpdates/{bulkUpdateId}')
  .onUpdate(async (change, context) => {
    await updateItems(change, context);
  });

exports.manageShipment = functions.firestore
  .document('company/{companyId}/shipments/{shipmentId}')
  .onUpdate(async (change, context) => {
    if (
      change.before.data().status !== 'sent' &&
      change.before.data().status !== 'received' &&
      (change.after.data().status === 'sent' ||
        change.after.data().status === 'received')
    ) {
      await shipItems(context, change.after.data());
    }

    await reserveItems(change, context);
    await deliveryTransaction(change, context);
  });

exports.manageSplitDelivery = functions.firestore
  .document('company/{companyId}/shipments/{shipmentId}')
  .onCreate(async (change, context) => {
    if (change.data().status === 'received') {
      await shipItems(context, change.data());
    }
  });

exports.manageBillableShipment = functions.firestore
  .document('company/{companyId}/billableShipments/{shipmentId}')
  .onUpdate(async (change, context) => {
    if (
      change.before.data().status !== 'sent' &&
      change.before.data().status !== 'received' &&
      (change.after.data().status === 'sent' ||
        change.after.data().status === 'received')
    ) {
      await shipItems(context, change.after.data());
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

        // Check if this is a same-site transfer (different PO numbers)
        if (transfer.fromSite.id === transfer.toSite.id) {
          // For same-site transfers, we only need to handle transactions
          // No inventory movement is needed as items stay at the same site
          await transferReturnTransaction(transfer);
          await transferDeliveryTransaction(transfer);
          return '200';
        }

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
            location: item?.location || '',
            supplier: item?.supplier || '',
            type: item?.type || '',
            hireCost: item?.hireCost || '',
            replacementCost: item?.replacementCost || '',
            sellingCost: item?.sellingCost || '',
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
              inventoryItem.totalTransferredOut =
                (inventoryItem.totalTransferredOut || 0) + item.availableQty;
              inventoryItem.lastMovementDate = new Date();
              inventoryItem.lastMovementType = 'Transfer Out';

              //if quantity goes to 0 or below, keep the item but set available to 0
              if (inventoryItem.availableQty < 0) {
                inventoryItem.availableQty = 0;
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
              inventoryItem.totalTransferredIn =
                (inventoryItem.totalTransferredIn || 0) + item.availableQty;
              inventoryItem.lastMovementDate = new Date();
              inventoryItem.lastMovementType = 'Transfer In';
            } else {
              const newItem = {
                id: item.id,
                code: item.code,
                category: item.category,
                name: item.name,
                weight: item.weight,
                availableQty: item.availableQty,
                totalDelivered: 0,
                totalReturned: 0,
                totalTransferredIn: item.availableQty,
                totalTransferredOut: 0,
                totalOverages: 0,
                location: item.location,
                supplier: item.supplier,
                type: item.type,
                hireCost: item.hireCost,
                replacementCost: item.replacementCost,
                sellingCost: item.sellingCost,
                lastMovementDate: new Date(),
                lastMovementType: 'Transfer In',
              };
              toSiteItems.push(newItem);
            }
          });

          //update the from site document data
          const fromItemIds = fromSiteItems.map((item: any) => item.id);
          const updatedFromInventory = {
            items: fromSiteItems,
            ids: fromItemIds,
            site: transfer.fromSite,
            siteTotals: {
              totalItemsDelivered: fromSiteItems.reduce(
                (sum: number, item: any) => sum + (item.totalDelivered || 0),
                0
              ),
              totalItemsReturned: fromSiteItems.reduce(
                (sum: number, item: any) => sum + (item.totalReturned || 0),
                0
              ),
              totalItemsTransferredIn: fromSiteItems.reduce(
                (sum: number, item: any) =>
                  sum + (item.totalTransferredIn || 0),
                0
              ),
              totalItemsTransferredOut: fromSiteItems.reduce(
                (sum: number, item: any) =>
                  sum + (item.totalTransferredOut || 0),
                0
              ),
              totalOverages: fromSiteItems.reduce(
                (sum: number, item: any) => sum + (item.totalOverages || 0),
                0
              ),
              currentAvailableItems: fromSiteItems.reduce(
                (sum: number, item: any) => sum + (item.availableQty || 0),
                0
              ),
              lastUpdated: FieldValue.serverTimestamp(),
            },
          };

          // update the to site document data
          const toItemIds = toSiteItems.map((item: any) => item.id);
          const updatedToInventory = {
            items: toSiteItems,
            ids: toItemIds,
            site: transfer.toSite,
            siteTotals: {
              totalItemsDelivered: toSiteItems.reduce(
                (sum: number, item: any) => sum + (item.totalDelivered || 0),
                0
              ),
              totalItemsReturned: toSiteItems.reduce(
                (sum: number, item: any) => sum + (item.totalReturned || 0),
                0
              ),
              totalItemsTransferredIn: toSiteItems.reduce(
                (sum: number, item: any) =>
                  sum + (item.totalTransferredIn || 0),
                0
              ),
              totalItemsTransferredOut: toSiteItems.reduce(
                (sum: number, item: any) =>
                  sum + (item.totalTransferredOut || 0),
                0
              ),
              totalOverages: toSiteItems.reduce(
                (sum: number, item: any) => sum + (item.totalOverages || 0),
                0
              ),
              currentAvailableItems: toSiteItems.reduce(
                (sum: number, item: any) => sum + (item.availableQty || 0),
                0
              ),
              lastUpdated: FieldValue.serverTimestamp(),
            },
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
          // Create the site inventory with tracking fields
          const items = transfer.items.map((item: any) => ({
            id: item.id,
            code: item.code,
            category: item.category,
            name: item.name,
            weight: +item.weight,
            availableQty: +item.shipmentQty,
            totalDelivered: 0,
            totalReturned: 0,
            totalTransferredIn: +item.shipmentQty,
            totalTransferredOut: 0,
            totalOverages: 0,
            location: item?.location || '',
            supplier: item?.supplier || '',
            type: item?.type || '',
            hireCost: item?.hireCost || '',
            replacementCost: item?.replacementCost || '',
            sellingCost: item?.sellingCost || '',
            lastMovementDate: new Date(),
            lastMovementType: 'Transfer In',
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
              inventoryItem.totalTransferredOut =
                (inventoryItem.totalTransferredOut || 0) + item.availableQty;
              inventoryItem.lastMovementDate = new Date();
              inventoryItem.lastMovementType = 'Transfer Out';

              //if quantity goes to 0 or below, keep the item but set available to 0
              if (inventoryItem.availableQty < 0) {
                inventoryItem.availableQty = 0;
              }
            }
          });

          //update the from site document data
          const fromItemIds = fromSiteItems.map((item: any) => item.id);
          const updatedFromInventory = {
            items: fromSiteItems,
            ids: fromItemIds,
            site: transfer.fromSite,
            siteTotals: {
              totalItemsDelivered: fromSiteItems.reduce(
                (sum: number, item: any) => sum + (item.totalDelivered || 0),
                0
              ),
              totalItemsReturned: fromSiteItems.reduce(
                (sum: number, item: any) => sum + (item.totalReturned || 0),
                0
              ),
              totalItemsTransferredIn: fromSiteItems.reduce(
                (sum: number, item: any) =>
                  sum + (item.totalTransferredIn || 0),
                0
              ),
              totalItemsTransferredOut: fromSiteItems.reduce(
                (sum: number, item: any) =>
                  sum + (item.totalTransferredOut || 0),
                0
              ),
              totalOverages: fromSiteItems.reduce(
                (sum: number, item: any) => sum + (item.totalOverages || 0),
                0
              ),
              currentAvailableItems: fromSiteItems.reduce(
                (sum: number, item: any) => sum + (item.availableQty || 0),
                0
              ),
              lastUpdated: FieldValue.serverTimestamp(),
            },
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
            siteTotals: {
              totalItemsDelivered: items.reduce(
                (sum: number, item: any) => sum + (item.totalDelivered || 0),
                0
              ),
              totalItemsReturned: items.reduce(
                (sum: number, item: any) => sum + (item.totalReturned || 0),
                0
              ),
              totalItemsTransferredIn: items.reduce(
                (sum: number, item: any) =>
                  sum + (item.totalTransferredIn || 0),
                0
              ),
              totalItemsTransferredOut: items.reduce(
                (sum: number, item: any) =>
                  sum + (item.totalTransferredOut || 0),
                0
              ),
              totalOverages: items.reduce(
                (sum: number, item: any) => sum + (item.totalOverages || 0),
                0
              ),
              currentAvailableItems: items.reduce(
                (sum: number, item: any) => sum + (item.availableQty || 0),
                0
              ),
              lastUpdated: FieldValue.serverTimestamp(),
            },
          };
          await admin
            .firestore()
            .doc(
              `company/${context.params.companyId}/siteStock/${transfer.toSite.id}`
            )
            .set(updatedInventory);
        }

        // Add logs for transfer movements (only for different sites)
        const batch = admin.firestore().batch();

        transfer.items.forEach((item: any) => {
          // Log as return from source site
          addLog(
            context.params.companyId,
            item.id,
            batch,
            transfer.code,
            transfer.fromSite.name,
            transfer.fromSite.customer.name,
            item.shipmentQty,
            'Transfer Out'
          );

          // Log as delivery to destination site
          addLog(
            context.params.companyId,
            item.id,
            batch,
            transfer.code,
            transfer.toSite.name,
            transfer.toSite.customer.name,
            item.shipmentQty,
            'Transfer In'
          );
        });

        await batch.commit();

        // Add site movements for regular transfer tracking
        const movementBatch = admin.firestore().batch();

        transfer.items.forEach((item: any) => {
          // Get inventory items for proper tracking
          const fromInventoryItem = fromSiteInventory
            .data()
            ?.items.find((i: any) => i.id === item.id);
          const toInventoryItem = toSiteInventory.exists
            ? toSiteInventory.data()?.items.find((i: any) => i.id === item.id)
            : null;

          // Track "Transfer Out" movement for source site
          addSiteMovement(
            context.params.companyId,
            {
              itemId: item.id,
              siteId: transfer.fromSite.id,
              movementType: 'Transfer Out',
              quantity: -item.shipmentQty,
              previousQty: fromInventoryItem
                ? fromInventoryItem.availableQty + item.shipmentQty
                : item.shipmentQty,
              newQty: fromInventoryItem ? fromInventoryItem.availableQty : 0,
              sourceDocumentId: context.params.transferId,
              sourceDocumentCode: transfer.code,
              sourceDocumentType: 'transfer',
              createdBy: transfer.createdBy || 'system',
              createdByName: transfer.createdByName || 'System',
              inventoryItem: fromInventoryItem || item,
              siteData: transfer.fromSite,
              transferData: transfer,
              notes: `Transfer to ${transfer.toSite.name}`,
            },
            movementBatch
          );

          // Track "Transfer In" movement for destination site
          addSiteMovement(
            context.params.companyId,
            {
              itemId: item.id,
              siteId: transfer.toSite.id,
              movementType: 'Transfer In',
              quantity: item.shipmentQty,
              previousQty: toInventoryItem
                ? toInventoryItem.availableQty - item.shipmentQty
                : 0,
              newQty: toInventoryItem
                ? toInventoryItem.availableQty
                : item.shipmentQty,
              sourceDocumentId: context.params.transferId,
              sourceDocumentCode: transfer.code,
              sourceDocumentType: 'transfer',
              createdBy: transfer.createdBy || 'system',
              createdByName: transfer.createdByName || 'System',
              inventoryItem: toInventoryItem || item,
              siteData: transfer.toSite,
              transferData: transfer,
              notes: `Transfer from ${transfer.fromSite.name}`,
            },
            movementBatch
          );
        });

        await movementBatch.commit();

        return '200';
      }
      return true;
    } catch (error) {
      logger.error(error);
      return error;
    }
  });

exports.managePOTransfer = functions.firestore
  .document('company/{companyId}/poTransfers/{transferId}')
  .onUpdate(async (change, context) => {
    try {
      if (
        change.before.data().status !== 'sent' &&
        change.after.data().status === 'sent'
      ) {
        const transfer = change.after.data();

        // Check if this is a same-site transfer (different PO numbers)
        if (transfer.fromSite.id === transfer.toSite.id) {
          // For same-site transfers, we only need to handle transactions
          // No inventory movement is needed as items stay at the same site
          await transferReturnTransaction(transfer);
          await transferDeliveryTransaction(transfer);
          return '200';
        }

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
            id: item.itemId,
            availableQty: +item.returnQty,
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
            id: item.itemId,
            code: item.code,
            category: item.category,
            name: item.name,
            weight: +item.weight,
            availableQty: +item.returnQty,
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
          const itemIds = transfer.items.map((item: any) => item.itemId);
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

        await transferReturnTransaction(transfer);
        await transferDeliveryTransaction(transfer);

        // Add logs for PO transfer movements (only for different sites)
        const batch = admin.firestore().batch();

        transfer.items.forEach((item: any) => {
          // Log as return from source site
          addLog(
            context.params.companyId,
            item.itemId,
            batch,
            transfer.code,
            transfer.fromSite.name,
            transfer.fromSite.customer.name,
            item.returnQty,
            'PO Transfer Out'
          );

          // Log as delivery to destination site
          addLog(
            context.params.companyId,
            item.itemId,
            batch,
            transfer.code,
            transfer.toSite.name,
            transfer.toSite.customer.name,
            item.returnQty,
            'PO Transfer In'
          );
        });

        await batch.commit();

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
    await returnItems(change, context);
    await returnTransaction(change, context);
    await returnTransactionItems(change, context);
  });
exports.manageOverReturn = functions.firestore
  .document('company/{companyId}/overReturns/{overReturnId}')
  .onCreate(async (change, context) => {
    await reverseOverageItems(change, context);
    await overageReversalTransaction(change, context);
  });
exports.updateOverReturn = functions.firestore
  .document('company/{companyId}/overReturns/{overReturnId}')
  .onUpdate(async (change, context) => {
    await approveOverageItems(change, context);
  });
exports.manageAdjustment = functions.firestore
  .document('company/{companyId}/adjustments/{adjustmentId}')
  .onUpdate(async (change, context) => {
    await adjustmentTransaction(change, context);
    await returnTransactionItems(change, context, false);
  });

exports.saleInvoiceCreated = functions.firestore
  .document('company/{companyId}/saleInvoices/{invoiceId}')
  .onCreate(async (change, context) => {
    await reserveSaleItems(change, context);
  });

exports.saleInvoiceUpdated = functions.firestore
  .document('company/{companyId}/saleInvoices/{invoiceId}')
  .onUpdate(async (change, context) => {
    await manageSaleItems(change, context);
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
//         const today = Timestamp.fromDate(new Date()).seconds;
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
//               Timestamp.fromDate(new Date(shipment.endDate))
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
//                   Timestamp.fromDate(new Date(shipment.endDate))
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
//               invoice.date = FieldValue.serverTimestamp();

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
//                     totalInvoices: FieldValue.increment(1),
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
//                       FieldValue.serverTimestamp(),
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
//                 invoice.date = FieldValue.serverTimestamp();
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
//                       totalInvoices: FieldValue.increment(1),
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
//                 invoice.date = FieldValue.serverTimestamp();
//                 const daysOnHire = daysbetween(
//                   today,
//                   Timestamp.fromDate(
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
//                       totalInvoices: FieldValue.increment(1),
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
//                         FieldValue.serverTimestamp(),
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

const updateItems = async (
  change: functions.Change<functions.firestore.QueryDocumentSnapshot>,
  context: functions.EventContext
) => {
  try {
    if (
      (change.before.data().status === 'pending' &&
        change.after.data().status === 'approved') ||
      (change.before.data().status === 'approved' &&
        change.after.data().status === 'reversed')
    ) {
      const bulkUpdate = change.after.data();

      // Prepare a batch to group all updates
      const batch = admin.firestore().batch();

      // Process each item in the bulk update
      for (const item of bulkUpdate.items) {
        const stockItemRef = admin
          .firestore()
          .doc(`company/${context.params.companyId}/stockItems/${item.id}`);

        // Get the current stock item data to compare changes
        const currentStockItem = await stockItemRef.get();

        if (!currentStockItem.exists) {
          logger.warn(`Stock item ${item.id} not found`);
          continue;
        }

        const currentData = currentStockItem.data();
        if (!currentData) {
          logger.warn(`Stock item ${item.id} has no data`);
          continue;
        }
        const updateData: any = {};
        let hasMetadataChange = false;
        let hasYardQtyChange = false;

        // Check for metadata changes (non-quantity fields)
        const metadataFields = [
          'code',
          'name',
          'category',
          'size',
          'weight',
          'hireCost',
          'sellingCost',
          'replacementCost',
          'location',
          'lowPercentage',
        ];

        metadataFields.forEach((field) => {
          if (item[field] !== undefined && currentData[field] !== item[field]) {
            updateData[field] = item[field];
            hasMetadataChange = true;
          }
        });

        // Check for yardQty changes
        if (item.shipmentQty !== undefined && item.shipmentQty !== 0) {
          const qtyDifference = +item.shipmentQty;
          updateData.yardQty = FieldValue.increment(+item.shipmentQty || 0);
          hasYardQtyChange = true;

          // Also update the total quantity if yardQty changed
          if (qtyDifference !== 0) {
            const logItem = {
              message:
                qtyDifference > 0
                  ? `Added ${qtyDifference} items to Yard Qty.`
                  : `Removed ${Math.abs(qtyDifference)} items from Yard Qty.`,
              user: {
                name: bulkUpdate.updatedByName || bulkUpdate.createdByName,
              },
              date: new Date(),
              status: qtyDifference > 0 ? 'add' : 'remove',
              comment: `Bulk Update ${bulkUpdate.code}`,
            };
            updateData.log = FieldValue.arrayUnion(logItem);
          }
        }

        // Apply the update if there are changes
        if (Object.keys(updateData).length > 0) {
          batch.update(stockItemRef, updateData);

          // Add logs based on the conditions
          if (hasMetadataChange) {
            // Log for metadata changes only
            addLog(
              context.params.companyId,
              item.id,
              batch,
              bulkUpdate.code,
              'Metadata Update',
              bulkUpdate.company?.name || 'System',
              0, // No quantity change
              'Bulk Update - Metadata'
            );
          }

          if (hasYardQtyChange) {
            // Log for yardQty changes
            const qtyDifference = item.shipmentQty;
            addLog(
              context.params.companyId,
              item.id,
              batch,
              bulkUpdate.code,
              'Yard Quantity Update',
              bulkUpdate.company?.name || 'System',
              qtyDifference,
              qtyDifference > 0 ? 'Bulk Update - Add' : 'Bulk Update - Remove'
            );
          }
        }
      }

      // Commit all updates in a single batch
      await batch.commit();

      logger.info(`Bulk update ${bulkUpdate.code} processed successfully`);
      return '200';
    }
    return true;
  } catch (error) {
    logger.error('Error in updateItems function:', error);
    return error;
  }
};

const shipItems = async (context: functions.EventContext, data: any) => {
  try {
    const shipment = data;
    // Get the shipment items on site
    const siteInventory = await admin
      .firestore()
      .doc(`company/${context.params.companyId}/siteStock/${shipment.site.id}`)
      .get();

    // Get sitestock document ref
    const siteStockRef = admin
      .firestore()
      .doc(`company/${context.params.companyId}/siteStock/${shipment.site.id}`);

    // Get shipments items
    const items = shipment.items.map((item: any) => ({
      id: item.id,
      code: item.code,
      category: item.category,
      name: item.name,
      weight: +item.weight,
      availableQty: +item.shipmentQty,
      totalDelivered: +item.shipmentQty,
      totalReturned: 0,
      totalTransferredIn: 0,
      totalTransferredOut: 0,
      totalOverages: 0,
      damagedQty: 0,
      lostQty: 0,
      inMaintenanceQty: 0,
      location: item?.location || '',
      supplier: item?.supplier || '',
      type: item?.type || '',
      hireCost: item?.hireCost || '',
      replacementCost: item?.replacementCost || '',
      sellingCost: item?.sellingCost || '',
      lastMovementDate: new Date(),
      lastMovementType: 'Delivery',
    }));

    // create batch
    const batch = admin.firestore().batch();

    // check if its the first time the shipment is being sent
    if (siteInventory.exists) {
      // Update the site inventory

      const oldInventory = siteInventory.data()?.items;

      items.forEach((item: any) => {
        // check if item exists on site
        const inventoryItem = oldInventory.find((i: any) => i.id === item.id);
        if (inventoryItem) {
          // if item exists on site. increment site qty and totals
          inventoryItem.availableQty =
            inventoryItem.availableQty + item.availableQty;
          inventoryItem.totalDelivered =
            (inventoryItem.totalDelivered || 0) + item.availableQty;
          inventoryItem.location = item?.location || '';
          inventoryItem.supplier = item?.supplier || '';
          inventoryItem.type = item?.type || '';
          inventoryItem.lastMovementDate = new Date();
          inventoryItem.lastMovementType = 'Delivery';
        } else {
          // if items doesnt exist on site.
          oldInventory.push(item);
        }
      });

      const itemIds = oldInventory.map((item: any) => item.id);
      const updatedInventory = {
        items: oldInventory,
        ids: itemIds,
        site: shipment.site,
        siteTotals: {
          totalItemsDelivered: oldInventory.reduce(
            (sum: number, item: any) => sum + (item.totalDelivered || 0),
            0
          ),
          totalItemsReturned: oldInventory.reduce(
            (sum: number, item: any) => sum + (item.totalReturned || 0),
            0
          ),
          totalItemsTransferredIn: oldInventory.reduce(
            (sum: number, item: any) => sum + (item.totalTransferredIn || 0),
            0
          ),
          totalItemsTransferredOut: oldInventory.reduce(
            (sum: number, item: any) => sum + (item.totalTransferredOut || 0),
            0
          ),
          totalOverages: oldInventory.reduce(
            (sum: number, item: any) => sum + (item.totalOverages || 0),
            0
          ),
          currentAvailableItems: oldInventory.reduce(
            (sum: number, item: any) => sum + (item.availableQty || 0),
            0
          ),
          lastUpdated: FieldValue.serverTimestamp(),
        },
      };

      // Update sitestock document
      batch.set(siteStockRef, updatedInventory);
    } else {
      // Create the site inventory
      const itemIds = shipment.items.map((item: any) => item.id);

      const updatedInventory = {
        items,
        ids: itemIds,
        site: shipment.site,
        siteTotals: {
          totalItemsDelivered: items.reduce(
            (sum: number, item: any) => sum + (item.totalDelivered || 0),
            0
          ),
          totalItemsReturned: 0,
          totalItemsTransferredIn: 0,
          totalItemsTransferredOut: 0,
          totalOverages: 0,
          currentAvailableItems: items.reduce(
            (sum: number, item: any) => sum + (item.availableQty || 0),
            0
          ),
          lastUpdated: FieldValue.serverTimestamp(),
        },
      };

      // Update sitestock document
      batch.set(siteStockRef, updatedInventory);
    }

    // update the stock list
    items.forEach((item: any) => {
      // Create a new document reference with auto-generated ID
      const itemRef = admin
        .firestore()
        .doc(`company/${context.params.companyId}/stockItems/${item.id}`); // No need for 'await' or 'add()'

      // Add the set operation to the batch
      batch.update(itemRef, {
        inUseQty: FieldValue.increment(item.availableQty),
      });

      addLog(
        context.params.companyId,
        item.id,
        batch,
        shipment.code,
        shipment.site.name,
        shipment.site.customer.name,
        item.availableQty,
        'Delivery'
      );
    });

    // Add site movement tracking for deliveries
    if (siteInventory.exists) {
      const oldInventory = siteInventory.data()?.items;
      items.forEach((item: any) => {
        const inventoryItem = oldInventory.find((i: any) => i.id === item.id);
        const previousQty = inventoryItem
          ? inventoryItem.availableQty - item.availableQty
          : 0;
        const newQty = inventoryItem
          ? inventoryItem.availableQty
          : item.availableQty;

        addSiteMovement(
          context.params.companyId,
          {
            itemId: item.id,
            siteId: shipment.site.id,
            movementType: 'Delivery',
            quantity: item.availableQty,
            previousQty,
            newQty,
            sourceDocumentId: shipment.id,
            sourceDocumentCode: shipment.code,
            sourceDocumentType: 'delivery',
            createdBy: shipment.createdBy || 'system',
            createdByName: shipment.createdByName || 'System',
            inventoryItem: inventoryItem || item,
            siteData: shipment.site,
            notes: `Delivered ${item.availableQty} ${item.name} to ${shipment.site.name}`,
          },
          batch
        );
      });
    } else {
      // New site - all items are new deliveries
      items.forEach((item: any) => {
        addSiteMovement(
          context.params.companyId,
          {
            itemId: item.id,
            siteId: shipment.site.id,
            movementType: 'Delivery',
            quantity: item.availableQty,
            previousQty: 0,
            newQty: item.availableQty,
            sourceDocumentId: shipment.id,
            sourceDocumentCode: shipment.code,
            sourceDocumentType: 'delivery',
            createdBy: shipment.createdBy || 'system',
            createdByName: shipment.createdByName || 'System',
            inventoryItem: item,
            siteData: shipment.site,
            notes: `Initial delivery of ${item.availableQty} ${item.name} to new site ${shipment.site.name}`,
          },
          batch
        );
      });
    }

    // start batch
    await batch.commit();

    return '200';
  } catch (error) {
    logger.error(error);
    return error;
  }
};

const returnItems = async (
  change: functions.Change<functions.firestore.QueryDocumentSnapshot>,
  context: functions.EventContext
) => {
  try {
    if (
      change.before.data().status !== 'sent' &&
      change.before.data().status !== 'received' &&
      !change.before.data().jobReference &&
      (change.after.data().status === 'sent' ||
        change.after.data().status === 'received') &&
      !change.before.data().jobReference
    ) {
      const returnData = change.after.data();
      // Get the shipment items on site
      const siteInventory = await admin
        .firestore()
        .doc(
          `company/${context.params.companyId}/siteStock/${returnData.site.id}`
        )
        .get();
      // check if site has inventory
      if (siteInventory.exists) {
        // Map items for the site inventory
        const items = returnData.items.map((item: any) => ({
          id: item.id,
          code: item.code,
          category: item.category,
          name: item.name,
          weight: +item.weight,
          availableQty: +item.shipmentQty,
          damagedQty: item.damagedQty ? +item.damagedQty : 0,
          lostQty: item.lostQty ? +item.lostQty : 0,
          inMaintenanceQty: item.inMaintenanceQty ? +item.inMaintenanceQty : 0,
          excess: 0,
        }));

        const oldInventory = siteInventory.data()?.items;

        items.forEach((item: any) => {
          // check if item is on site
          const inventoryItem = oldInventory.find((i: any) => i.id === item.id);
          if (inventoryItem) {
            // decrease site qty and update totals
            inventoryItem.availableQty =
              inventoryItem.availableQty - item.availableQty;
            inventoryItem.totalReturned =
              (inventoryItem.totalReturned || 0) + item.availableQty;
            inventoryItem.damagedQty =
              (inventoryItem.damagedQty || 0) + item.damagedQty;
            inventoryItem.lostQty = (inventoryItem.lostQty || 0) + item.lostQty;
            inventoryItem.inMaintenanceQty =
              (inventoryItem.inMaintenanceQty || 0) + item.inMaintenanceQty;
            inventoryItem.lastMovementDate = new Date();
            inventoryItem.lastMovementType = 'Return';

            if (inventoryItem.availableQty <= 0) {
              //if site qty goes below 0, track excess but keep the item
              item.excess = Math.abs(inventoryItem.availableQty);
              inventoryItem.availableQty = 0; // Set to 0 instead of removing
              inventoryItem.totalOverages =
                (inventoryItem.totalOverages || 0) + item.excess;
              inventoryItem.lastMovementType = 'Return (Overage)';
            }
          } else {
            // Item doesn't exist on site - this is all overage
            item.excess = item.availableQty;
            const newItem = {
              id: item.id,
              code: item.code,
              category: item.category,
              name: item.name,
              weight: item.weight,
              availableQty: 0,
              totalDelivered: 0,
              totalReturned: item.availableQty,
              totalTransferredIn: 0,
              totalTransferredOut: 0,
              totalOverages: item.excess,
              damagedQty: item.damagedQty,
              lostQty: item.lostQty,
              inMaintenanceQty: item.inMaintenanceQty,
              lastMovementDate: new Date(),
              lastMovementType: 'Return (Overage)',
            };
            oldInventory.push(newItem);
          }
        });

        const itemIds = oldInventory.map((item: any) => item.id);
        const updatedInventory = {
          items: oldInventory,
          ids: itemIds,
          site: returnData.site,
          siteTotals: {
            totalItemsDelivered: oldInventory.reduce(
              (sum: number, item: any) => sum + (item.totalDelivered || 0),
              0
            ),
            totalItemsReturned: oldInventory.reduce(
              (sum: number, item: any) => sum + (item.totalReturned || 0),
              0
            ),
            totalItemsTransferredIn: oldInventory.reduce(
              (sum: number, item: any) => sum + (item.totalTransferredIn || 0),
              0
            ),
            totalItemsTransferredOut: oldInventory.reduce(
              (sum: number, item: any) => sum + (item.totalTransferredOut || 0),
              0
            ),
            totalOverages: oldInventory.reduce(
              (sum: number, item: any) => sum + (item.totalOverages || 0),
              0
            ),
            currentAvailableItems: oldInventory.reduce(
              (sum: number, item: any) => sum + (item.availableQty || 0),
              0
            ),
            lastUpdated: FieldValue.serverTimestamp(),
          },
        };

        await admin
          .firestore()
          .doc(
            `company/${context.params.companyId}/siteStock/${returnData.site.id}`
          )
          .set(updatedInventory);

        // update the stock list
        // Prepare a batch to group all updates
        const batch = admin.firestore().batch();

        for (const item of items) {
          const stockItemRef = admin
            .firestore()
            .doc(`company/${context.params.companyId}/stockItems/${item.id}`);

          const updateData: any = {
            inUseQty: FieldValue.increment(-(item.availableQty - item.excess)),
            damagedQty: FieldValue.increment(item.damagedQty),
            lostQty: FieldValue.increment(item.lostQty),
            inMaintenanceQty: FieldValue.increment(item.inMaintenanceQty),
            yardQty: FieldValue.increment(item.excess - item.lostQty),
          };

          if (item.excess > 0) {
            const logItem = {
              message: `Added ${item.excess} items to Total Qty.`,
              user: { name: returnData.createdByName },
              date: new Date(),
              status: 'add',
              comment: `More inventory returned than what was on site. See Return ${returnData.code}`,
            };
            updateData.log = FieldValue.arrayUnion(logItem);
          }

          // Add the update operation to the batch
          batch.update(stockItemRef, updateData);

          // Add log for the main return operation
          addLog(
            context.params.companyId,
            item.id,
            batch,
            returnData.code,
            returnData.site.name,
            returnData.site.customer.name,
            item.availableQty - item.excess,
            'Return'
          );
        }

        // Add site movement tracking for returns (only for non-PO returns)
        items.forEach((item: any) => {
          const inventoryItem = oldInventory.find((i: any) => i.id === item.id);

          if (inventoryItem) {
            // Regular return
            const previousQty = inventoryItem.availableQty + item.availableQty;
            const newQty = inventoryItem.availableQty;

            addSiteMovement(
              context.params.companyId,
              {
                itemId: item.id,
                siteId: returnData.site.id,
                movementType: 'Return',
                quantity: -item.availableQty,
                previousQty,
                newQty,
                sourceDocumentId: returnData.id,
                sourceDocumentCode: returnData.code,
                sourceDocumentType: 'return',
                createdBy: returnData.createdBy || 'system',
                createdByName: returnData.createdByName || 'System',
                inventoryItem,
                siteData: returnData.site,
                notes: `Returned ${item.availableQty} ${item.name} from ${returnData.site.name}`,
              },
              batch
            );

            // Track overage if detected
            if (item.excess > 0) {
              addSiteMovement(
                context.params.companyId,
                {
                  itemId: item.id,
                  siteId: returnData.site.id,
                  movementType: 'Overage',
                  quantity: item.excess,
                  previousQty: 0,
                  newQty: 0,
                  sourceDocumentId: returnData.id,
                  sourceDocumentCode: returnData.code,
                  sourceDocumentType: 'return',
                  createdBy: returnData.createdBy || 'system',
                  createdByName: returnData.createdByName || 'System',
                  inventoryItem,
                  siteData: returnData.site,
                  notes: `Overage detected: ${item.excess} ${item.name} returned but not on site`,
                },
                batch
              );
            }
          } else {
            // Item doesn't exist on site - all overage
            const newItem = oldInventory.find((i: any) => i.id === item.id);
            addSiteMovement(
              context.params.companyId,
              {
                itemId: item.id,
                siteId: returnData.site.id,
                movementType: 'Overage',
                quantity: item.availableQty,
                previousQty: 0,
                newQty: 0,
                sourceDocumentId: returnData.id,
                sourceDocumentCode: returnData.code,
                sourceDocumentType: 'return',
                createdBy: returnData.createdBy || 'system',
                createdByName: returnData.createdByName || 'System',
                inventoryItem: newItem || item,
                siteData: returnData.site,
                notes: `Full overage: ${item.availableQty} ${item.name} returned but item not on site`,
              },
              batch
            );
          }
        });

        // Commit the batch update
        await batch.commit();
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

      // Prepare a batch to group all updates
      const batch = admin.firestore().batch();

      // update the stock list
      for (const item of shipment.items) {
        const stockItemRef = admin
          .firestore()
          .doc(`company/${context.params.companyId}/stockItems/${item.id}`);

        batch.update(stockItemRef, {
          reservedQty: FieldValue.increment(+item.shipmentQty),
        });

        addLog(
          context.params.companyId,
          item.id,
          batch,
          shipment.code,
          shipment.site.name,
          shipment.site.customer.name,
          item.shipmentQty,
          'Reserve'
        );
      }

      await batch.commit();
      return '200';
    } else if (
      change.before.data().status === 'reserved' &&
      (change.after.data().status === 'pending' ||
        change.after.data().status === 'void')
    ) {
      const shipment = change.after.data();

      // Prepare a batch to group all updates
      const batch = admin.firestore().batch();

      // update the stock list
      for (const item of shipment.items) {
        const stockItemRef = admin
          .firestore()
          .doc(`company/${context.params.companyId}/stockItems/${item.id}`);

        batch.update(stockItemRef, {
          reservedQty: FieldValue.increment(-+item.shipmentQty),
        });

        addLog(
          context.params.companyId,
          item.id,
          batch,
          shipment.code,
          shipment.site.name,
          shipment.site.customer.name,
          item.shipmentQty,
          'Unreserve'
        );
      }

      await batch.commit();
      return '200';
    }
    return true;
  } catch (error) {
    logger.error(error);
    return error;
  }
};

const reserveSaleItems = async (
  change: functions.firestore.QueryDocumentSnapshot,
  context: functions.EventContext
) => {
  try {
    if (change.exists) {
      const invoice = change.data();

      const batch = admin.firestore().batch();

      for (const item of invoice.estimate.items) {
        if (item.id && item.sellQty) {
          const stockItemRef = admin
            .firestore()
            .doc(`company/${context.params.companyId}/stockItems/${item.id}`);

          batch.update(stockItemRef, {
            reservedQty: FieldValue.increment(+item.sellQty),
          });

          addLog(
            context.params.companyId,
            item.id,
            batch,
            invoice.code,
            'Sale Invoice',
            invoice.customer?.name || 'Customer',
            item.sellQty,
            'Reserve Sale'
          );
        } else {
          logger.warn(`Invalid item data: ${JSON.stringify(item)}`);
        }
      }

      await batch.commit();

      return '200';
    } else {
      return '404';
    }
  } catch (error) {
    logger.error('Error reserving sale items: ', error);
    return '500';
  }
};

const manageSaleItems = async (
  change: functions.Change<functions.firestore.QueryDocumentSnapshot>,
  context: functions.EventContext
) => {
  try {
    const beforeData = change.before.data();
    const afterData = change.after.data();

    if (!beforeData || !afterData) {
      throw new Error('Missing document data.');
    }

    const invoice = afterData.estimate?.items;
    if (!invoice || invoice.length === 0) {
      throw new Error('No items in the invoice.');
    }

    const batch = admin.firestore().batch();

    // When the status changes to 'accepted'
    if (beforeData.status !== 'accepted' && afterData.status === 'accepted') {
      for (const item of afterData.estimate.items) {
        if (item.id && item.sellQty) {
          const stockItemRef = admin
            .firestore()
            .doc(`company/${context.params.companyId}/stockItems/${item.id}`);

          batch.update(stockItemRef, {
            reservedQty: FieldValue.increment(-item.sellQty),
            yardQty: FieldValue.increment(-item.sellQty),
            log: FieldValue.arrayUnion({
              message: `Sold ${item.sellQty} items.`,
              user: { name: afterData.createdByName },
              date: new Date(),
              status: 'remove',
              comment: `Items sold on invoice ${afterData.code}`,
            }),
          });

          addLog(
            context.params.companyId,
            item.id,
            batch,
            afterData.code,
            'Sale Invoice',
            afterData.customer?.name || 'Customer',
            item.sellQty,
            'Sale'
          );
        } else {
          logger.warn(`Invalid item data: ${JSON.stringify(item)}`);
        }
      }

      // When the status changes to 'void'
    } else if (beforeData.status !== 'void' && afterData.status === 'void') {
      for (const item of afterData.estimate.items) {
        if (item.id && item.sellQty) {
          const stockItemRef = admin
            .firestore()
            .doc(`company/${context.params.companyId}/stockItems/${item.id}`);

          batch.update(stockItemRef, {
            reservedQty: FieldValue.increment(-item.sellQty),
          });

          addLog(
            context.params.companyId,
            item.id,
            batch,
            afterData.code,
            'Sale Invoice',
            afterData.customer?.name || 'Customer',
            item.sellQty,
            'Void Sale'
          );
        } else {
          logger.warn(`Invalid item data: ${JSON.stringify(item)}`);
        }
      }
    } else {
      return '404'; // No status change we care about
    }

    await batch.commit();
    return '200';
  } catch (error) {
    logger.error('Error managing sale items: ', error);
    return '500';
  }
};

const deliveryTransaction = async (
  change: functions.Change<functions.firestore.QueryDocumentSnapshot>,
  context: functions.EventContext
) => {
  try {
    if (
      change.before.data().status !== 'received' &&
      change.after.data().status === 'received' &&
      change.after.data().jobReference
    ) {
      const delivery = change.after.data();

      // Create the items for the transaction log
      const items = delivery.items.map((item: any) => ({
        itemId: item.id,
        code: item.code,
        category: item.category,
        size: item.size,
        name: item.name,
        weight: +item.weight,
        deliveredQty: +item.shipmentQty,
        invoiceQty: +item.shipmentQty,
        balanceQty: +item.shipmentQty,
        returnTotal: 0,
        returnQty: 0,
        location: item?.location || '',
        deliveryId: delivery.id,
        deliveryCode: delivery.code,
        deliveryDate: FieldValue.serverTimestamp(),
        invoiceStart: FieldValue.serverTimestamp(),
        invoiceEnd: null,
        hireRate: +item.hireCost || 0,
        jobReference: delivery.jobReference,
        transactionType: 'Delivery',
        siteId: delivery.site.id,
        status: 'active',
      }));

      // Batch the writes for better performance
      const batch = admin.firestore().batch();

      items.forEach((item: any) => {
        // Create a new document reference with auto-generated ID
        const itemRef = admin
          .firestore()
          .collection(`company/${context.params.companyId}/transactionLog`)
          .doc(); // No need for 'await' or 'add()'

        // Add the set operation to the batch
        batch.set(itemRef, { ...item, id: itemRef.id });
      });

      await batch.commit(); // Commit the batch

      return '200';
    }
    return true;
  } catch (error) {
    logger.error(error);
    return error;
  }
};

const adjustmentTransaction = async (
  change: functions.Change<functions.firestore.QueryDocumentSnapshot>,
  context: functions.EventContext
) => {
  try {
    if (
      change.before.data().status !== 'received' &&
      change.after.data().status === 'received' &&
      change.after.data().jobReference
    ) {
      const adjustmentDoc = change.after.data();
      const returnDate = new Date(adjustmentDoc.returnDate);
      // Create the items for the transaction log
      const items = adjustmentDoc.items.map((item: any) => ({
        deliveryLogId: item.id,
        itemId: item.itemId,
        code: item.code,
        category: item.category,
        size: item.size,
        name: item.name,
        weight: +item.weight,
        deliveredQty: +item.deliveredQty,
        invoiceQty: +item.returnQty,
        balanceQty: +item.balanceQty - +item.returnQty,
        returnTotal: item.returnTotal,
        adjustmentTotal: (+item.adjustmentTotal || 0) + +item.returnQty,
        returnQty: +item.returnQty,
        location: item?.location || '',
        returnId: adjustmentDoc.id,
        returnCode: adjustmentDoc.code,
        returnDate: FieldValue.serverTimestamp(),
        invoiceStart: item.invoiceStart,
        invoiceEnd: Timestamp.fromDate(returnDate),
        hireRate: 0,
        jobReference: adjustmentDoc.jobReference,
        transactionType: 'Adjustment',
        siteId: adjustmentDoc.site.id,
        status: 'completed',
      }));

      // Batch the writes for better performance
      const batch = admin.firestore().batch();
      items.forEach((item: any) => {
        // Create a new document reference with auto-generated ID
        const itemRef = admin
          .firestore()
          .collection(`company/${context.params.companyId}/transactionLog`)
          .doc(); // No need for 'await' or 'add()'
        // Add the set operation to the batch
        batch.set(itemRef, { ...item, id: itemRef.id });

        //update the delivery tranaction log for recurring billing
        const delLogItemRef = admin
          .firestore()
          .doc(
            `company/${context.params.companyId}/transactionLog/${item.deliveryLogId}`
          );
        batch.update(delLogItemRef, {
          invoiceQty: FieldValue.increment(-+item.returnQty),
          balanceQty: FieldValue.increment(-+item.returnQty),
          adjustmentTotal: FieldValue.increment(+item.returnQty),
          returnQty: 0,
          invoiceEnd: null,
          status: +item.balanceQty === 0 ? 'completed' : 'active',
        });
      });
      await batch.commit(); // Commit the batch

      return '200';
    }
    return true;
  } catch (error) {
    logger.error(error);
    return error;
  }
};

const returnTransaction = async (
  change: functions.Change<functions.firestore.QueryDocumentSnapshot>,
  context: functions.EventContext
) => {
  try {
    if (
      change.before.data().status !== 'received' &&
      change.after.data().status === 'received' &&
      change.after.data().jobReference
    ) {
      const returnDoc = change.after.data();
      const returnDate = new Date(returnDoc.returnDate);

      // Create the items for the transaction log (regular items)
      const regularItems = returnDoc.items.map((item: any) => ({
        deliveryLogId: item.id,
        itemId: item.itemId,
        code: item.code,
        category: item.category,
        size: item.size,
        name: item.name,
        weight: +item.weight,
        deliveredQty: +item.deliveredQty,
        invoiceQty: +item.returnQty,
        balanceQty: +item.balanceQty - +item.returnQty,
        returnTotal: +item.returnTotal + +item.returnQty,
        returnQty: +item.returnQty,
        location: item?.location || '',
        returnId: returnDoc.id,
        returnCode: returnDoc.code,
        returnDate: FieldValue.serverTimestamp(),
        invoiceStart: item.invoiceStart,
        invoiceEnd: Timestamp.fromDate(returnDate),
        hireRate: item.hireRate || 0,
        jobReference: item.jobReference,
        transactionType: 'Return',
        siteId: returnDoc.site.id,
        status: 'active',
      }));

      // Create transaction log items for overage items
      const overageItems =
        returnDoc.overageItems?.map((item: any) => ({
          deliveryLogId: null, // No original delivery for overage items
          itemId: item.id,
          code: item.code,
          category: item.category,
          size: item.size,
          name: item.name,
          weight: +item.weight,
          deliveredQty: 0, // No original delivery
          invoiceQty: +item.shipmentQty, // Quantity being returned
          balanceQty: 0, // No balance since there was no original delivery
          returnTotal: +item.shipmentQty,
          returnQty: +item.shipmentQty,
          location: item?.location || '',
          returnId: returnDoc.id,
          returnCode: returnDoc.code,
          returnDate: FieldValue.serverTimestamp(),
          invoiceStart: Timestamp.fromDate(returnDate), // Start billing from return date
          invoiceEnd: Timestamp.fromDate(returnDate), // End immediately for overage
          hireRate: item.hireCost || 0,
          jobReference: returnDoc.jobReference, // Use the return's PO number
          transactionType: 'Overage Return',
          siteId: returnDoc.site.id,
          status: 'completed', // Overage items are immediately completed
          isOverage: true, // Flag to identify overage items
        })) || [];

      // Combine both regular and overage items
      // const allItems = [...regularItems, ...overageItems];

      // Batch the writes for better performance
      const batch = admin.firestore().batch();

      // Process regular items
      regularItems.forEach((item: any) => {
        // Create a new document reference with auto-generated ID
        const itemRef = admin
          .firestore()
          .collection(`company/${context.params.companyId}/transactionLog`)
          .doc();

        // Add the set operation to the batch
        batch.set(itemRef, { ...item, id: itemRef.id });

        // Update the delivery transaction log for recurring billing
        const delLogItemRef = admin
          .firestore()
          .doc(
            `company/${context.params.companyId}/transactionLog/${item.deliveryLogId}`
          );
        batch.update(delLogItemRef, {
          invoiceQty: FieldValue.increment(-+item.returnQty),
          balanceQty: FieldValue.increment(-+item.returnQty),
          returnTotal: FieldValue.increment(+item.returnQty),
          returnQty: 0,
          invoiceEnd: null,
          status: +item.balanceQty === 0 ? 'completed' : 'active',
        });
      });

      // Process overage items (no delivery log to update)
      overageItems.forEach((item: any) => {
        // Create a new document reference with auto-generated ID
        const itemRef = admin
          .firestore()
          .collection(`company/${context.params.companyId}/transactionLog`)
          .doc();

        // Add the set operation to the batch
        batch.set(itemRef, { ...item, id: itemRef.id });

        // Note: No delivery log to update for overage items since they weren't originally delivered
      });

      await batch.commit(); // Commit the batch

      return '200';
    }
    return true;
  } catch (error) {
    logger.error(error);
    return error;
  }
};

const returnTransactionItems = async (
  change: functions.Change<functions.firestore.QueryDocumentSnapshot>,
  context: functions.EventContext,
  isReturn = true
) => {
  try {
    if (
      change.before.data().status !== 'received' &&
      change.after.data().status === 'received' &&
      change.after.data().jobReference
    ) {
      const returnData = change.after.data();
      // Get the shipment items on site
      const siteInventory = await admin
        .firestore()
        .doc(
          `company/${context.params.companyId}/siteStock/${returnData.site.id}`
        )
        .get();
      // Site stock ref
      const siteStockRef = admin
        .firestore()
        .doc(
          `company/${context.params.companyId}/siteStock/${returnData.site.id}`
        );
      // Prepare a batch to group all updates
      const batch = admin.firestore().batch();
      // check if site has inventory
      if (siteInventory.exists) {
        // Map items for the site inventory
        const items = returnData.items.map((item: any) => ({
          id: item.itemId,
          code: item.code,
          category: item.category,
          name: item.name,
          weight: +item.weight,
          availableQty: +item.returnQty,
          damagedQty: item.damagedQty ? +item.damagedQty : 0,
          lostQty: item.lostQty ? +item.lostQty : 0,
          inMaintenanceQty: item.inMaintenanceQty ? +item.inMaintenanceQty : 0,
          excess: 0,
          jobReference: item.jobReference,
        }));

        const oldInventory = siteInventory.data()?.items;

        items.forEach((item: any) => {
          // check if item is on site
          const inventoryItem = oldInventory.find((i: any) => i.id === item.id);
          if (inventoryItem) {
            // decrease site qty and update totals
            inventoryItem.availableQty =
              inventoryItem.availableQty - item.availableQty;
            inventoryItem.totalReturned =
              (inventoryItem.totalReturned || 0) + item.availableQty;
            inventoryItem.damagedQty =
              (inventoryItem.damagedQty || 0) + item.damagedQty;
            inventoryItem.lostQty = (inventoryItem.lostQty || 0) + item.lostQty;
            inventoryItem.inMaintenanceQty =
              (inventoryItem.inMaintenanceQty || 0) + item.inMaintenanceQty;
            inventoryItem.lastMovementDate = new Date();
            inventoryItem.lastMovementType = isReturn ? 'Return' : 'Adjustment';

            if (inventoryItem.availableQty <= 0) {
              //if site qty goes below 0, track excess but keep the item
              item.excess = Math.abs(inventoryItem.availableQty);
              inventoryItem.availableQty = 0; // Set to 0 instead of removing
              inventoryItem.totalOverages =
                (inventoryItem.totalOverages || 0) + item.excess;
              inventoryItem.lastMovementType = `${
                isReturn ? 'Return' : 'Adjustment'
              } (Overage)`;
            }
          } else {
            // Item doesn't exist on site - this is all overage
            item.excess = item.availableQty;
            const newItem = {
              id: item.id,
              code: item.code,
              category: item.category,
              name: item.name,
              weight: item.weight,
              availableQty: 0,
              totalDelivered: 0,
              totalReturned: item.availableQty,
              totalTransferredIn: 0,
              totalTransferredOut: 0,
              totalOverages: item.excess,
              damagedQty: item.damagedQty,
              lostQty: item.lostQty,
              inMaintenanceQty: item.inMaintenanceQty,
              lastMovementDate: new Date(),
              lastMovementType: `${
                isReturn ? 'Return' : 'Adjustment'
              } (Overage)`,
              jobReference: item.jobReference,
            };
            oldInventory.push(newItem);
          }
        });

        const itemIds = oldInventory.map((item: any) => item.id);
        const updatedInventory = {
          items: oldInventory,
          ids: itemIds,
          site: returnData.site,
          siteTotals: {
            totalItemsDelivered: oldInventory.reduce(
              (sum: number, item: any) => sum + (item.totalDelivered || 0),
              0
            ),
            totalItemsReturned: oldInventory.reduce(
              (sum: number, item: any) => sum + (item.totalReturned || 0),
              0
            ),
            totalItemsTransferredIn: oldInventory.reduce(
              (sum: number, item: any) => sum + (item.totalTransferredIn || 0),
              0
            ),
            totalItemsTransferredOut: oldInventory.reduce(
              (sum: number, item: any) => sum + (item.totalTransferredOut || 0),
              0
            ),
            totalOverages: oldInventory.reduce(
              (sum: number, item: any) => sum + (item.totalOverages || 0),
              0
            ),
            currentAvailableItems: oldInventory.reduce(
              (sum: number, item: any) => sum + (item.availableQty || 0),
              0
            ),
            lastUpdated: FieldValue.serverTimestamp(),
          },
        };

        // update the stock list
        batch.set(siteStockRef, updatedInventory);

        for (const item of items) {
          const stockItemRef = admin
            .firestore()
            .doc(`company/${context.params.companyId}/stockItems/${item.id}`);

          const updateData: any = {
            inUseQty: FieldValue.increment(-(item.availableQty - item.excess)),
            damagedQty: FieldValue.increment(item.damagedQty),
            lostQty: FieldValue.increment(item.lostQty),
            inMaintenanceQty: FieldValue.increment(item.inMaintenanceQty),
            yardQty: FieldValue.increment(item.excess - item.lostQty),
          };

          if (item.excess > 0) {
            const logItem = {
              message: `Added ${item.excess} items to Total Qty.`,
              user: { name: returnData.createdByName },
              date: new Date(),
              status: 'add',
              comment: `More inventory returned than what was on site. See ${
                isReturn ? 'Return' : 'Adjustment'
              } ${returnData.code}`,
            };
            updateData.log = FieldValue.arrayUnion(logItem);
            addLog(
              context.params.companyId,
              item.id,
              batch,
              returnData.code,
              `${returnData.site.name}-${item.jobReference} excess`,
              returnData.site.customer.name,
              item.excess,
              isReturn ? 'Return' : 'Adjustment'
            );
          }

          // Add the update operation to the batch
          batch.update(stockItemRef, updateData);

          addLog(
            context.params.companyId,
            item.id,
            batch,
            returnData.code,
            `${returnData.site.name}-${item.jobReference}`,
            returnData.site.customer.name,
            item.availableQty - item.excess,
            isReturn ? 'Return' : 'Adjustment'
          );
        }
      }
      const overageItems = returnData?.overageItems || [];

      for (const item of overageItems) {
        const stockItemRef = admin
          .firestore()
          .doc(`company/${context.params.companyId}/stockItems/${item.id}`);

        const updateData: any = {
          yardQty: FieldValue.increment(item.shipmentQty),
        };

        const logItem = {
          message: `Added ${item.shipmentQty} items to Total Qty.`,
          user: { name: returnData.createdByName },
          date: new Date(),
          status: 'add',
          comment: `More inventory returned than what was on site. See ${
            isReturn ? 'Return' : 'Adjustment'
          } ${returnData.code}`,
        };

        updateData.log = FieldValue.arrayUnion(logItem);

        batch.update(stockItemRef, updateData);

        addLog(
          context.params.companyId,
          item.id,
          batch,
          returnData.code,
          `${returnData.site.name} excess`,
          returnData.site.customer.name,
          item.shipmentQty,
          isReturn ? 'Return' : 'Adjustment'
        );
      }

      // Commit the batch update
      await batch.commit();
      return '200';
    }
    return true;
  } catch (error) {
    logger.error(error);
    return error;
  }
};

const overageReversalTransaction = async (
  change: functions.firestore.QueryDocumentSnapshot,
  context: functions.EventContext
) => {
  try {
    if (change.data()?.isReversal && !change.data()?.skipTransaction) {
      const returnDoc = change.data();
      const returnDate = new Date(returnDoc.returnDate);

      // Create transaction log items for overage items
      const overageItems =
        returnDoc.overageItems?.map((item: any) => ({
          deliveryLogId: null, // No original delivery for overage items
          itemId: item.id,
          code: item.code,
          category: item.category,
          size: item.size,
          name: item.name,
          weight: +item.weight,
          deliveredQty: 0, // No original delivery
          invoiceQty: +item.returnQty, // Quantity being returned
          balanceQty: 0, // No balance since there was no original delivery
          returnTotal: +item.returnQty,
          returnQty: +item.returnQty,
          location: item?.location || '',
          returnId: change.id,
          returnCode: returnDoc.code,
          returnDate: FieldValue.serverTimestamp(),
          invoiceStart: Timestamp.fromDate(returnDate), // Start billing from return date
          invoiceEnd: Timestamp.fromDate(returnDate), // End immediately for overage
          hireRate: item.hireCost || 0,
          jobReference: returnDoc.jobReference, // Use the return's PO number
          transactionType: 'Overage Return Reversal',
          siteId: returnDoc.site.id,
          status: 'completed', // Overage items are immediately completed
          isOverage: true, // Flag to identify overage items
        })) || [];

      // Combine both regular and overage items
      // const allItems = [...regularItems, ...overageItems];

      // Batch the writes for better performance
      const batch = admin.firestore().batch();

      // Process overage items (no delivery log to update)
      overageItems.forEach((item: any) => {
        // Create a new document reference with auto-generated ID
        const itemRef = admin
          .firestore()
          .collection(`company/${context.params.companyId}/transactionLog`)
          .doc();

        // Add the set operation to the batch
        batch.set(itemRef, { ...item, id: itemRef.id });

        // Note: No delivery log to update for overage items since they weren't originally delivered
      });

      await batch.commit(); // Commit the batch

      return '200';
    }
    return true;
  } catch (error) {
    logger.error(error);
    return error;
  }
};

const approveOverageItems = async (
  change: functions.Change<functions.firestore.QueryDocumentSnapshot>,
  context: functions.EventContext
) => {
  try {
    if (
      change.before.data().status !== 'approved' &&
      change.after.data().status === 'approved'
    ) {
      const overageData = change.after.data();
      // Get the shipment items on site

      // Prepare a batch to group all updates
      const batch = admin.firestore().batch();
      // check if site has inventory

      // Get current site inventory to update overage totals
      const siteInventoryRef = admin
        .firestore()
        .doc(
          `company/${context.params.companyId}/siteStock/${overageData.site.id}`
        );

      const siteInventoryDoc = await siteInventoryRef.get();
      const currentInventory = siteInventoryDoc.data();

      // update the stock list
      for (const item of overageData?.overageItems) {
        const stockItemRef = admin
          .firestore()
          .doc(`company/${context.params.companyId}/stockItems/${item.id}`);

        const updateData: any = {
          yardQty: FieldValue.increment(item.shipmentQty),
        };

        const logItem = {
          message: `Added ${item.shipmentQty} items to Total Qty.`,
          user: { name: overageData.createdByName },
          date: new Date(),
          status: 'add',
          comment: `More inventory returned than what was on site. See Over Return ${overageData.code}`,
        };

        updateData.log = FieldValue.arrayUnion(logItem);

        batch.update(stockItemRef, updateData);

        addLog(
          context.params.companyId,
          item.id,
          batch,
          overageData.code,
          `${overageData.site.name} excess`,
          overageData.site.customer.name,
          item.shipmentQty,
          'Return'
        );
      }

      // Update site inventory to properly track overages
      if (currentInventory && currentInventory.items) {
        const updatedItems = currentInventory.items.map(
          (inventoryItem: any) => {
            const overageItem = overageData.overageItems.find(
              (item: any) => item.id === inventoryItem.id
            );
            if (overageItem) {
              return {
                ...inventoryItem,
                totalOverages:
                  (inventoryItem.totalOverages || 0) + overageItem.shipmentQty,
                lastMovementDate: new Date(),
                lastMovementType: 'Overage Approved',
              };
            }
            return inventoryItem;
          }
        );

        // Add new items for overages that don't exist in inventory
        for (const overageItem of overageData.overageItems) {
          const existsInInventory = currentInventory.items.some(
            (item: any) => item.id === overageItem.id
          );
          if (!existsInInventory) {
            updatedItems.push({
              id: overageItem.id,
              code: overageItem.code,
              category: overageItem.category,
              name: overageItem.name,
              weight: overageItem.weight,
              availableQty: 0,
              totalDelivered: 0,
              totalReturned: 0,
              totalTransferredIn: 0,
              totalTransferredOut: 0,
              totalOverages: overageItem.shipmentQty,
              damagedQty: 0,
              lostQty: 0,
              inMaintenanceQty: 0,
              lastMovementDate: new Date(),
              lastMovementType: 'Overage Approved',
            });
          }
        }

        // Update site totals
        const updatedSiteTotals = {
          totalItemsDelivered: updatedItems.reduce(
            (sum: number, item: any) => sum + (item.totalDelivered || 0),
            0
          ),
          totalItemsReturned: updatedItems.reduce(
            (sum: number, item: any) => sum + (item.totalReturned || 0),
            0
          ),
          totalItemsTransferredIn: updatedItems.reduce(
            (sum: number, item: any) => sum + (item.totalTransferredIn || 0),
            0
          ),
          totalItemsTransferredOut: updatedItems.reduce(
            (sum: number, item: any) => sum + (item.totalTransferredOut || 0),
            0
          ),
          totalOverages: updatedItems.reduce(
            (sum: number, item: any) => sum + (item.totalOverages || 0),
            0
          ),
          lastUpdated: FieldValue.serverTimestamp(),
        };

        batch.update(siteInventoryRef, {
          items: updatedItems,
          siteTotals: updatedSiteTotals,
        });
      }

      // Add site movement tracking for overage approvals
      for (const overageItem of overageData.overageItems) {
        const inventoryItem = currentInventory?.items?.find(
          (item: any) => item.id === overageItem.id
        );

        addSiteMovement(
          context.params.companyId,
          {
            itemId: overageItem.id,
            siteId: overageData.site.id,
            movementType: 'Overage Approved',
            quantity: overageItem.shipmentQty,
            previousQty: inventoryItem?.totalOverages || 0,
            newQty:
              (inventoryItem?.totalOverages || 0) + overageItem.shipmentQty,
            sourceDocumentId: overageData.id,
            sourceDocumentCode: overageData.code,
            sourceDocumentType: 'overReturn',
            createdBy: overageData.createdBy || 'system',
            createdByName: overageData.createdByName || 'System',
            inventoryItem: inventoryItem || {
              id: overageItem.id,
              code: overageItem.code,
              name: overageItem.name,
              totalOverages: overageItem.shipmentQty,
            },
            siteData: overageData.site,
            notes: `Approved overage of ${overageItem.shipmentQty} ${overageItem.name}`,
          },
          batch
        );
      }

      // Commit the batch update
      await batch.commit();

      return '200';
    }
    return true;
  } catch (error) {
    logger.error(error);
    return error;
  }
};

const reverseOverageItems = async (
  change: functions.firestore.QueryDocumentSnapshot,
  context: functions.EventContext
) => {
  try {
    if (change.data().isReversal) {
      const overReturnData = change.data();

      // Prepare a batch to group all updates
      const batch = admin.firestore().batch();

      // Get current site inventory to update overage totals
      const siteInventoryRef = admin
        .firestore()
        .doc(
          `company/${context.params.companyId}/siteStock/${overReturnData.site.id}`
        );

      const siteInventoryDoc = await siteInventoryRef.get();
      const currentInventory = siteInventoryDoc.data();

      for (const item of overReturnData?.overageItems) {
        if (item?.returnQty > 0) {
          const stockItemRef = admin
            .firestore()
            .doc(`company/${context.params.companyId}/stockItems/${item.id}`);

          const updateData: any = {
            yardQty: FieldValue.increment(-item.returnQty),
          };

          const logItem = {
            message: `Removed ${item.returnQty} items to Total Qty.`,
            user: { name: overReturnData.createdByName },
            date: new Date(),
            status: 'remove',
            comment: `Overage Reversal. See Over Return ${overReturnData.code}`,
          };

          updateData.log = FieldValue.arrayUnion(logItem);

          batch.update(stockItemRef, updateData);

          addLog(
            context.params.companyId,
            item.id,
            batch,
            overReturnData.code,
            `${overReturnData.site.name} reversed`,
            overReturnData.site.customer.name,
            item.returnQty,
            'Return'
          );
        }
      }

      // Update site inventory to reverse overages
      if (currentInventory && currentInventory.items) {
        const updatedItems = currentInventory.items.map(
          (inventoryItem: any) => {
            const overageItem = overReturnData.overageItems.find(
              (item: any) => item.id === inventoryItem.id
            );
            if (overageItem && overageItem.returnQty > 0) {
              const newTotalOverages = Math.max(
                0,
                (inventoryItem.totalOverages || 0) - overageItem.returnQty
              );
              return {
                ...inventoryItem,
                totalOverages: newTotalOverages,
                lastMovementDate: new Date(),
                lastMovementType: 'Overage Reversed',
              };
            }
            return inventoryItem;
          }
        );

        // Update site totals
        const updatedSiteTotals = {
          totalItemsDelivered: updatedItems.reduce(
            (sum: number, item: any) => sum + (item.totalDelivered || 0),
            0
          ),
          totalItemsReturned: updatedItems.reduce(
            (sum: number, item: any) => sum + (item.totalReturned || 0),
            0
          ),
          totalItemsTransferredIn: updatedItems.reduce(
            (sum: number, item: any) => sum + (item.totalTransferredIn || 0),
            0
          ),
          totalItemsTransferredOut: updatedItems.reduce(
            (sum: number, item: any) => sum + (item.totalTransferredOut || 0),
            0
          ),
          totalOverages: updatedItems.reduce(
            (sum: number, item: any) => sum + (item.totalOverages || 0),
            0
          ),
          lastUpdated: FieldValue.serverTimestamp(),
        };

        batch.update(siteInventoryRef, {
          items: updatedItems,
          siteTotals: updatedSiteTotals,
        });
      }

      // Add site movement tracking for overage reversals
      for (const overageItem of overReturnData.overageItems) {
        if (overageItem?.returnQty > 0) {
          const inventoryItem = currentInventory?.items?.find(
            (item: any) => item.id === overageItem.id
          );

          const previousQty = inventoryItem?.totalOverages || 0;
          const newQty = Math.max(0, previousQty - overageItem.returnQty);

          addSiteMovement(
            context.params.companyId,
            {
              itemId: overageItem.id,
              siteId: overReturnData.site.id,
              movementType: 'Overage Reversed',
              quantity: -overageItem.returnQty,
              previousQty,
              newQty,
              sourceDocumentId: change.id,
              sourceDocumentCode: overReturnData.code,
              sourceDocumentType: 'overReturn',
              createdBy: overReturnData.createdBy || 'system',
              createdByName: overReturnData.createdByName || 'System',
              inventoryItem: inventoryItem || {
                id: overageItem.id,
                code: overageItem.code,
                name: overageItem.name,
                category: overageItem.category || '',
                totalOverages: 0,
                totalDelivered: 0,
                totalReturned: 0,
                totalTransferredIn: 0,
                totalTransferredOut: 0,
                availableQty: 0,
                damagedQty: 0,
                lostQty: 0,
                inMaintenanceQty: 0,
              },
              siteData: overReturnData.site,
              notes: `Reversed overage of ${overageItem.returnQty} ${overageItem.name}`,
            },
            batch
          );
        }
      }

      // Commit the batch update
      await batch.commit();

      return '200';
    }
    return true;
  } catch (error) {
    logger.error(error);
    return error;
  }
};

const transferDeliveryTransaction = async (transfer: any) => {
  try {
    const transferDate = new Date(transfer.transferDate);
    // Create the items for the transaction log
    const items = transfer.items.map((item: any) => ({
      ...item,
      deliveredQty: +item.returnQty,
      invoiceQty: +item.returnQty,
      balanceQty: +item.returnQty,
      returnTotal: 0,
      returnQty: 0,
      deliveryId: transfer.id,
      deliveryCode: transfer.code,
      deliveryDate: Timestamp.fromDate(transferDate),
      invoiceStart: Timestamp.fromDate(transferDate),
      invoiceEnd: null,
      hireRate: 0,
      jobReference: transfer.toPO,
      transactionType: 'Delivery',
      siteId: transfer.toSite.id,
      status: 'active',
    }));

    // Batch the writes for better performance
    const batch = admin.firestore().batch();

    items.forEach((item: any) => {
      // Create a new document reference with auto-generated ID
      const itemRef = admin
        .firestore()
        .collection(`company/${transfer.company.id}/transactionLog`)
        .doc(); // No need for 'await' or 'add()'

      // Add the set operation to the batch
      batch.set(itemRef, { ...item, id: itemRef.id });
    });

    await batch.commit(); // Commit the batch

    return '200';
  } catch (error) {
    logger.error(error);
    return error;
  }
};

const transferReturnTransaction = async (transfer: any) => {
  try {
    const transferDate = new Date(transfer.transferDate);
    // Create the items for the transaction log
    const items = transfer.items.map((item: any) => ({
      deliveryLogId: item.id,
      itemId: item.itemId,
      code: item.code,
      category: item.category,
      size: item.size,
      name: item.name,
      weight: +item.weight,
      deliveredQty: +item.deliveredQty,
      invoiceQty: +item.returnQty,
      balanceQty: +item.balanceQty - +item.returnQty,
      returnTotal: +item.returnTotal + +item.returnQty,
      returnQty: +item.returnQty,
      location: item?.location || '',
      returnId: transfer.id,
      returnCode: transfer.code,
      returnDate: Timestamp.fromDate(transferDate),
      invoiceStart: item.invoiceStart,
      invoiceEnd: Timestamp.fromDate(transferDate),
      hireRate: item.hireRate || 0,
      jobReference: transfer.fromPO,
      transactionType: 'Return',
      siteId: transfer.fromSite.id,
      status: 'active',
    }));

    // Batch the writes for better performance
    const batch = admin.firestore().batch();
    items.forEach((item: any) => {
      // Create a new document reference with auto-generated ID
      const itemRef = admin
        .firestore()
        .collection(`company/${transfer.company.id}/transactionLog`)
        .doc(); // No need for 'await' or 'add()'
      // Add the set operation to the batch
      batch.set(itemRef, { ...item, id: itemRef.id });

      //update the delivery tranaction log for recurring billing
      const delLogItemRef = admin
        .firestore()
        .doc(
          `company/${transfer.company.id}/transactionLog/${item.deliveryLogId}`
        );
      batch.update(delLogItemRef, {
        invoiceQty: FieldValue.increment(-+item.returnQty),
        balanceQty: FieldValue.increment(-+item.returnQty),
        returnTotal: FieldValue.increment(+item.returnQty),
        returnQty: 0,
        invoiceEnd: null,
        status: +item.balanceQty === 0 ? 'completed' : 'active',
      });
    });
    await batch.commit(); // Commit the batch

    return '200';
  } catch (error) {
    logger.error(error);
    return error;
  }
};

// Site Movement Tracking Interfaces and Helper
interface SiteMovementData {
  itemId: string;
  siteId: string;
  movementType:
    | 'Delivery'
    | 'Return'
    | 'Transfer In'
    | 'Transfer Out'
    | 'Overage'
    | 'Overage Approved'
    | 'Overage Reversed';
  quantity: number;
  previousQty: number;
  newQty: number;
  sourceDocumentId: string;
  sourceDocumentCode: string;
  sourceDocumentType: 'delivery' | 'return' | 'transfer' | 'overReturn';
  createdBy: string;
  createdByName: string;
  inventoryItem: any;
  siteData: any;
  transferData?: any;
  notes?: string;
}

const addSiteMovement = async (
  companyId: string,
  movementData: SiteMovementData,
  batch: admin.firestore.WriteBatch
) => {
  const movementRef = admin
    .firestore()
    .collection(`company/${companyId}/siteMovements`)
    .doc();

  const now = new Date();

  // Helper functions for date calculations
  const getWeekNumber = (date: Date): number => {
    const firstDayOfYear = new Date(date.getFullYear(), 0, 1);
    const pastDaysOfYear =
      (date.getTime() - firstDayOfYear.getTime()) / 86400000;
    return Math.ceil((pastDaysOfYear + firstDayOfYear.getDay() + 1) / 7);
  };

  const getDayOfYear = (date: Date): number => {
    const start = new Date(date.getFullYear(), 0, 0);
    const diff = date.getTime() - start.getTime();
    return Math.floor(diff / (1000 * 60 * 60 * 24));
  };

  const movement = {
    id: movementRef.id,

    // Item reference only - metadata will be fetched from stockItems at query time
    itemId: movementData.itemId,

    // Site information
    siteId: movementData.siteId,
    siteName: movementData.siteData.name || '',
    customerName: movementData.siteData.customer?.name || '',
    customerId: movementData.siteData.customer?.id || '',

    // Movement details
    movementType: movementData.movementType,
    quantity: movementData.quantity,
    previousQty: movementData.previousQty,
    newQty: movementData.newQty,

    // Complete tracking snapshot (at time of movement)
    totalDelivered: movementData.inventoryItem.totalDelivered || 0,
    totalReturned: movementData.inventoryItem.totalReturned || 0,
    totalTransferredIn: movementData.inventoryItem.totalTransferredIn || 0,
    totalTransferredOut: movementData.inventoryItem.totalTransferredOut || 0,
    totalOverages: movementData.inventoryItem.totalOverages || 0,
    availableQty: movementData.inventoryItem.availableQty || 0,
    damagedQty: movementData.inventoryItem.damagedQty || 0,
    lostQty: movementData.inventoryItem.lostQty || 0,
    inMaintenanceQty: movementData.inventoryItem.inMaintenanceQty || 0,

    // Source document
    sourceDocumentId: movementData.sourceDocumentId,
    sourceDocumentCode: movementData.sourceDocumentCode,
    sourceDocumentType: movementData.sourceDocumentType,

    // Transfer-specific (if applicable) - only add fields that have values
    ...(movementData.transferData &&
      movementData.transferData.fromSite?.id && {
        fromSiteId: movementData.transferData.fromSite.id,
        fromSiteName: movementData.transferData.fromSite.name || '',
      }),
    ...(movementData.transferData &&
      movementData.transferData.toSite?.id && {
        toSiteId: movementData.transferData.toSite.id,
        toSiteName: movementData.transferData.toSite.name || '',
      }),

    // Metadata
    timestamp: now,
    createdBy: movementData.createdBy,
    createdByName: movementData.createdByName,
    notes: movementData.notes || '',

    // Reporting fields
    year: now.getFullYear(),
    month: now.getMonth() + 1,
    week: getWeekNumber(now),
    dayOfYear: getDayOfYear(now),
  };

  batch.set(movementRef, movement);
};

const addLog = (
  companyId: string,
  itemId: string,
  batch: admin.firestore.WriteBatch,
  code: string,
  siteName: string,
  customerName: string,
  qty: number,
  type: string
) => {
  // Create a new document reference with auto-generated ID
  const itemRef = admin
    .firestore()
    .collection(`company/${companyId}/stockItems/${itemId}/log`)
    .doc(); // No need for 'await' or 'add()'

  // Add the set operation to the batch
  batch.set(itemRef, {
    code,
    siteName,
    customerName,
    qty,
    type,
    date: FieldValue.serverTimestamp(),
  });
};
