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
