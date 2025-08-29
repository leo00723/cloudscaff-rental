/* eslint-disable max-len */
/* eslint-disable @typescript-eslint/naming-convention */
import * as functions from 'firebase-functions';
import * as admin from 'firebase-admin';
import * as logger from 'firebase-functions/logger';

// Constants
const BATCH_SIZE = 450; // Firestore batch limit is 500, using 450 for safety
const DEFAULT_ALERT_DAYS = 3;
const QUERY_LIMIT = 500; // Reasonable limit for scaffold query

exports.scaffoldNeedsDismantleEmail = functions.pubsub
  .schedule('00 03 * * *')
  .timeZone('America/Los_Angeles')
  .onRun(async () => {
    try {
      // Only fetch companies that have the alert setting enabled
      const companiesSnapshot = await admin
        .firestore()
        .collection('company')
        .where('scaffoldDismantleAlert', '>', 0)
        .get();

      if (companiesSnapshot.empty) {
        logger.log('No companies with scaffold dismantle alerts found');
        return true;
      }

      // Process all companies in parallel for better performance
      const companyPromises = companiesSnapshot.docs.map((companyDoc) =>
        processCompany(companyDoc)
      );

      await Promise.all(companyPromises);
      logger.log('Scaffold dismantle email process completed successfully');
      return true;
    } catch (err: any) {
      logger.error('Error in scaffold dismantle email function', {
        error: err.message,
        stack: err.stack,
      });
      return false;
    }
  });

/**
 * Process a single company document
 */
const processCompany = async (
  companyDoc: admin.firestore.QueryDocumentSnapshot<admin.firestore.DocumentData>
) => {
  try {
    const companyData = companyDoc.data();
    const companyId = companyDoc.id;

    // Calculate alert threshold date
    const alertDays = +companyData.scaffoldDismantleAlert || DEFAULT_ALERT_DAYS;
    const thresholdDate = new Date();
    thresholdDate.setDate(thresholdDate.getDate() + alertDays);
    const thresholdDateString = thresholdDate.toISOString().split('T')[0]; // "YYYY-MM-DD" format

    // Find scaffolds that need dismantling
    const scaffoldsSnapshot = await admin
      .firestore()
      .collection(`company/${companyId}/scaffolds`)
      .where('status', 'in', ['active-Handed over'])
      .where('endDate', '<=', thresholdDateString)
      .orderBy('endDate', 'desc') // Only keep essential ordering
      .limit(QUERY_LIMIT)
      .get();

    if (scaffoldsSnapshot.empty) {
      logger.log(`No scaffolds needing dismantle for company: ${companyId}`);
      return;
    }

    logger.log(
      `Processing ${scaffoldsSnapshot.size} scaffolds for company: ${companyId}`
    );

    // Get unique site IDs from scaffolds
    const siteIds = scaffoldsSnapshot.docs.map((doc) => doc.data().siteId);
    const uniqueSiteIds = [...new Set(siteIds)].filter(Boolean);

    if (uniqueSiteIds.length === 0) {
      logger.warn(`No valid site IDs found for company: ${companyId}`);
      return;
    }

    // Bulk fetch site data for performance
    const sitesMap = await fetchSitesData(companyId, uniqueSiteIds);

    // Process scaffolds and send emails
    await sendBatchedEmails(
      companyData,
      scaffoldsSnapshot.docs,
      sitesMap,
      companyId
    );
  } catch (err: any) {
    logger.error('Error processing company', {
      companyId: companyDoc.id,
      error: err.message,
      stack: err.stack,
    });
  }
};

/**
 * Fetch multiple sites in one query and return as a map
 */
const fetchSitesData = async (companyId: any, siteIds: string | any[]) => {
  // Split into chunks of 10 for Firestore 'in' query limit
  const sitesMap: any = {};

  // Process site IDs in chunks (Firestore 'in' query has a limit of 10)
  for (let i = 0; i < siteIds.length; i += 10) {
    const chunk = siteIds.slice(i, i + 10);

    const sitesSnapshot = await admin
      .firestore()
      .collection(`company/${companyId}/sites`)
      .where(admin.firestore.FieldPath.documentId(), 'in', chunk)
      .get();

    sitesSnapshot.forEach((doc) => {
      sitesMap[doc.id] = doc.data();
    });
  }

  return sitesMap;
};
/**
 * Send emails using optimized batching
 */
const sendBatchedEmails = async (
  company: any,
  scaffolds: any[],
  sitesMap: any,
  companyId: any
) => {
  try {
    let operationCount = 0;
    let currentBatch = admin.firestore().batch();
    let totalEmailsQueued = 0;

    for (const scaffoldDoc of scaffolds) {
      const scaffold = scaffoldDoc.data();
      scaffold.id = scaffoldDoc.id;

      // Skip if no site ID or site doesn't exist in our map
      if (!scaffold.siteId || !sitesMap[scaffold.siteId]) {
        logger.warn(`Missing site data for scaffold: ${scaffold.id}`);
        continue;
      }

      const siteData = sitesMap[scaffold.siteId];

      // Only send if we have an email
      const email = siteData.repEmail || company.email;
      if (!email) {
        logger.warn(`No email found for scaffold: ${scaffold.id}`);
        continue;
      }

      const link = `https://app.cloudscaff.com/dashboard/scaffold/${companyId}-${scaffold.siteId}-${scaffold.id}`;

      const emailData = {
        to: email,
        cc: [],
        template: {
          name: 'share',
          data: {
            title: `${scaffold.siteName} ${scaffold.code} - ${scaffold.scaffold?.description} - ${scaffold.scaffold?.location}`,
            message: `This scaffold is due for dismantle. Dismantle the scaffold or extend it's end date.`,
            btnText: 'View scaffold',
            link,
            subject: `Scaffold Needs Dismantle - ${scaffold.siteName}/${scaffold.code}`,
          },
        },
      };

      // Add to current batch
      const emailRef = admin.firestore().collection('mail').doc();
      currentBatch.set(emailRef, JSON.parse(JSON.stringify(emailData)));
      totalEmailsQueued++;

      // Commit batch when it reaches size limit
      operationCount++;
      if (operationCount >= BATCH_SIZE) {
        await currentBatch.commit();
        logger.log(`Committed batch of ${operationCount} emails`);
        currentBatch = admin.firestore().batch();
        operationCount = 0;
      }
    }

    // Commit any remaining operations
    if (operationCount > 0) {
      await currentBatch.commit();
      logger.log(`Committed final batch of ${operationCount} emails`);
    }

    logger.log(`Total dismantle emails queued: ${totalEmailsQueued}`);
    return true;
  } catch (error: any) {
    logger.error('Error sending dismantle emails', {
      companyId: company.id,
      error: error.message,
      stack: error.stack,
    });
    return false;
  }
};
