import * as functions from 'firebase-functions';
import * as admin from 'firebase-admin';
import * as logger from 'firebase-functions/logger';

exports.regiserCompany = functions.https.onCall(async (data) => {
  try {
    const auth = await admin.auth().createUser({
      email: data.email,
      password: data.password,
      displayName: data.name,
    });
    const date = new Date();
    const trialEnd = new Date().setDate(date.getDate() + 4);
    const company = await admin
      .firestore()
      .collection('company')
      .add({
        name: data.company,
        needsSetup: true,
        trialEnded: false,
        isTrialing: true,
        removeBilling: true,
        startDate: admin.firestore.Timestamp.fromDate(date),
        trialEndDate: admin.firestore.Timestamp.fromDate(new Date(trialEnd)),
      });
    await admin.auth().setCustomUserClaims(auth.uid, { company: company.id });
    await admin
      .firestore()
      .collection('users')
      .doc(auth.uid)
      .set({
        name: auth.displayName,
        email: auth.email,
        company: company.id,
        phone: data.phone || '',
        role: 'Owner',
        permissions: [{ name: 'Super Admin', selected: true }],
        permissionsList: ['Super Admin'],
        needsSetup: false,
        startDate: admin.firestore.Timestamp.fromDate(date),
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
      permissions: data.permissions,
      permissionsList: data.permissionsList,
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

exports.checkTrials = functions.pubsub
  .schedule('00 03 * * *')
  .timeZone('America/Los_Angeles') // Users can choose timezone - default is America/Los_Angeles
  .onRun(async () => {
    try {
      const data = await admin
        .firestore()
        .collection('company')
        .where('isTrialing', '==', true)
        .get();
      for await (const companyDoc of data.docs) {
        const company = companyDoc.data();
        const today = admin.firestore.Timestamp.fromDate(new Date()).seconds;
        let daysRemaining = null;
        daysRemaining = daysBetween(company.trialEndDate.seconds, today);
        //check if company trial ended
        if (daysRemaining <= 0) {
          await companyDoc.ref.update({
            trialEnded: true,
            isTrialing: false,
          });
        }
      }
      return true;
    } catch (err) {
      logger.error('something went wrong somewhere', err);
      return false;
    }
  });

exports.checkUsers = functions.pubsub
  .schedule('00 03 * * *')
  .timeZone('America/Los_Angeles') // Users can choose timezone - default is America/Los_Angeles
  .onRun(async () => {
    try {
      const data = await admin.firestore().collection('company').get();
      for await (const companyDoc of data.docs) {
        const users = await admin
          .firestore()
          .collection('users')
          .where('company', '==', companyDoc.id)
          .get();
        //check if company trial ended
        if (users.size > 0) {
          await companyDoc.ref.update({
            totalUsers: users.size,
          });
        }
      }
      return true;
    } catch (err) {
      logger.error('something went wrong somewhere', err);
      return false;
    }
  });

const daysBetween = (startDateSeconds: number, endDateSeconds: number) =>
  Math.round((startDateSeconds - endDateSeconds) / 60 / 60 / 24);
