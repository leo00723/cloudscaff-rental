/* eslint-disable @typescript-eslint/naming-convention */
import * as functions from 'firebase-functions';
import * as admin from 'firebase-admin';
import * as logger from 'firebase-functions/logger';

exports.watchEnquiries = functions.firestore
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
            message: `A new enquiry has been generated for ${
              change.data().siteName
            }. Check details and update if necessary.`,
          });
      }
    }
  });

// eslint-disable-next-line prefer-arrow/prefer-arrow-functions
async function getUsers(companyId: string, permissions: string[]) {
  try {
    const users = await admin
      .firestore()
      .collection('users')
      .where('company', '==', companyId)
      .where('permissionsList', 'array-contains-any', [
        'Super Admin',
        ...permissions,
      ])
      .get();
    return users;
  } catch (error) {
    logger.log(error);
    return null;
  }
}
