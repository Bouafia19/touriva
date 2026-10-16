const cron = require("node-cron");
const Publication = require("./models/Announcement.js"); // adjust path

async function updateExpiredPublications() {
  const now = new Date();

  const result = await Publication.updateMany(
    { expirationOfSubscription: { $lte: now }, published: { $ne: false } },
    { $set: { published: false } }
  );

  console.log(`[CRON] ${result.modifiedCount} publications marked as expired.`);
  return result.modifiedCount;
}

// ✅ Schedule job at midnight Algeria time (disabled during automated test runs)
if (process.env.NODE_ENV !== "test") {
  cron.schedule("0 0 * * *", updateExpiredPublications, {
    timezone: "Africa/Algiers",
  });
}

// Export function for manual use
module.exports = updateExpiredPublications;
