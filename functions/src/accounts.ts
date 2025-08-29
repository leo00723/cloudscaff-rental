import * as functions from 'firebase-functions';
import * as admin from 'firebase-admin';
import * as logger from 'firebase-functions/logger';
import { Timestamp } from 'firebase-admin/firestore';

interface RegisterCompanyData {
  email: string;
  password: string;
  name: string;
  company: string;
  phone?: string;
}

exports.regiserCompany = functions.https.onCall(
  async (data: RegisterCompanyData) => {
    try {
      const auth = await admin.auth().createUser({
        email: data.email,
        password: data.password,
        displayName: data.name,
      });
      const date = new Date();
      const company = await admin
        .firestore()
        .collection('company')
        .add({
          name: data.company,
          needsSetup: true,
          removeBilling: true,
          startDate: Timestamp.fromDate(date),
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
          startDate: Timestamp.fromDate(date),
        });
      return '200';
    } catch (error: any) {
      logger.error('Registration error:', error);

      // Handle specific Firebase Auth errors
      if (error.code === 'auth/email-already-exists') {
        return {
          success: false,
          error: 'Email address is already in use by another account',
          code: 'email-exists',
        };
      } else if (error.code === 'auth/invalid-email') {
        return {
          success: false,
          error: 'Invalid email address',
          code: 'invalid-email',
        };
      } else if (error.code === 'auth/weak-password') {
        return {
          success: false,
          error: 'Password is too weak',
          code: 'weak-password',
        };
      }

      // Generic error for unexpected issues
      return {
        success: false,
        error: 'Registration failed. Please try again.',
        code: 'unknown',
      };
    }
  }
);

interface OAuthCompanyData {
  companyName: string;
  userName?: string;
  phone?: string;
}

exports.setupOAuthCompany = functions.https.onCall(
  async (data: OAuthCompanyData, context) => {
    try {
      // Get the authenticated user
      if (!context || !context.auth) {
        throw new Error('Unauthorized');
      }

      const uid = context.auth.uid;
      const userRecord = await admin.auth().getUser(uid);

      const date = new Date();
      // Create company document
      const company = await admin
        .firestore()
        .collection('company')
        .add({
          name: data.companyName,
          needsSetup: true,
          removeBilling: true,
          startDate: Timestamp.fromDate(date),
        });

      // Set custom claims for the user
      await admin.auth().setCustomUserClaims(uid, { company: company.id });

      // Create user document
      await admin
        .firestore()
        .collection('users')
        .doc(uid)
        .set({
          name: userRecord.displayName || data.userName || userRecord.email,
          email: userRecord.email,
          company: company.id,
          phone: data.phone || '',
          role: 'Owner',
          permissions: [{ name: 'Super Admin', selected: true }],
          permissionsList: ['Super Admin'],
          needsSetup: false,
          isOAuthUser: true,
          photoURL: userRecord.photoURL || null,
          startDate: Timestamp.fromDate(date),
        });

      return {
        success: true,
        companyId: company.id,
        message: 'Company and user setup completed successfully',
      };
    } catch (error: any) {
      logger.error('OAuth company setup error:', error);
      return {
        success: false,
        error: error.message || 'Failed to setup company',
      };
    }
  }
);

interface AddUserData {
  email: string;
  name: string;
  phone?: string;
  title?: string;
  password?: string; // Optional for SSO users
  company: string;
  permissions: any[];
  permissionsList: string[];
  inviteType?: 'password' | 'sso'; // New field to specify invitation type
}

exports.addUser = functions.https.onCall(async (data: AddUserData) => {
  try {
    const inviteType = data.inviteType || 'password';

    if (inviteType === 'password') {
      // Traditional email/password user creation
      if (!data.password) {
        throw new Error('Password is required for password-based invitations');
      }

      const auth = await admin.auth().createUser({
        email: data.email,
        password: data.password,
        displayName: data.name,
      });

      await admin
        .auth()
        .setCustomUserClaims(auth.uid, { company: data.company });
      await admin
        .firestore()
        .collection('users')
        .doc(auth.uid)
        .set({
          name: data.name || '',
          email: auth.email,
          company: data.company,
          phone: data.phone || '',
          title: data.title || '',
          permissions: data.permissions,
          permissionsList: data.permissionsList,
          needsSetup: true,
        });

      return '200';
    } else if (inviteType === 'sso') {
      // SSO user invitation - create invitation record instead of user
      const invitationRef = await admin
        .firestore()
        .collection('userInvitations')
        .add({
          email: data.email,
          name: data.name,
          company: data.company,
          phone: data.phone || '',
          title: data.title || '',
          permissions: data.permissions,
          permissionsList: data.permissionsList,
          invitedAt: Timestamp.now(),
          status: 'pending',
          inviteType: 'sso',
        });

      return {
        success: true,
        invitationId: invitationRef.id,
        message: 'SSO invitation created successfully',
      };
    }

    throw new Error('Invalid invite type');
  } catch (error) {
    logger.log(error);
    return '500';
  }
});

interface AcceptSSOInvitationData {
  email: string;
}

exports.acceptSSOInvitation = functions.https.onCall(
  async (data: AcceptSSOInvitationData, context) => {
    try {
      // Get the authenticated user
      if (!context || !context.auth) {
        throw new Error('Unauthorized');
      }

      const uid = context.auth.uid;
      const userRecord = await admin.auth().getUser(uid);

      // Verify the email matches the authenticated user
      if (userRecord.email !== data.email) {
        throw new Error('Email mismatch with authenticated user');
      }

      // Find pending invitation for this email
      const invitationsSnapshot = await admin
        .firestore()
        .collection('userInvitations')
        .where('email', '==', data.email)
        .where('status', '==', 'pending')
        .where('inviteType', '==', 'sso')
        .get();

      if (invitationsSnapshot.empty) {
        throw new Error('No pending SSO invitation found for this email');
      }

      // Get the first (and should be only) invitation
      const invitationDoc = invitationsSnapshot.docs[0];
      const invitation = invitationDoc.data();

      // Set custom claims for the user
      await admin.auth().setCustomUserClaims(uid, {
        company: invitation.company,
      });

      // Create user document
      await admin
        .firestore()
        .collection('users')
        .doc(uid)
        .set({
          name: invitation.name || userRecord.displayName || userRecord.email,
          email: userRecord.email,
          company: invitation.company,
          phone: invitation.phone || '',
          title: invitation.title || '',
          permissions: invitation.permissions,
          permissionsList: invitation.permissionsList,
          needsSetup: false,
          isOAuthUser: true,
          photoURL: userRecord.photoURL || null,
          startDate: Timestamp.now(),
        });

      // Mark invitation as accepted
      await invitationDoc.ref.update({
        status: 'accepted',
        acceptedAt: Timestamp.now(),
        acceptedBy: uid,
      });

      return {
        success: true,
        companyId: invitation.company,
        message: 'SSO invitation accepted successfully',
      };
    } catch (error: any) {
      logger.error('SSO invitation acceptance error:', error);
      return {
        success: false,
        error: error.message || 'Failed to accept SSO invitation',
      };
    }
  }
);

interface DeleteUserData {
  id: string;
}

exports.deleteUser = functions.https.onCall(async (data: DeleteUserData) => {
  try {
    await admin.auth().deleteUser(data.id);
    return '200';
  } catch (error) {
    logger.log(error);
    return '500';
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
        //update company user count
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

// const daysBetween = (startDateSeconds: number, endDateSeconds: number) =>
//   Math.round((startDateSeconds - endDateSeconds) / 60 / 60 / 24);
