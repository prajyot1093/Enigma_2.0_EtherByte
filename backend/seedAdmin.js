/**
 * One-time seed script — creates the first superadmin in MongoDB.
 *
 * Usage:
 *   cd backend
 *   node seedAdmin.js 0xYourWalletAddress "Your Name"
 *
 * Example:
 *   node seedAdmin.js 0x2fa1F17E046B1C38b89052A60d72F68D6d9d796A "Prajyot"
 *
 * Run this ONCE. After that, the superadmin can create other admins
 * from the Admin Dashboard.
 */

require("dotenv").config();
const mongoose = require("mongoose");
const Admin = require("./models/Admin");
const connectDB = require("./config/connectDB");

const walletAddress = process.argv[2];
const name = process.argv[3] || "Superadmin";

if (!walletAddress) {
  console.error("Usage: node seedAdmin.js <walletAddress> [name]");
  process.exit(1);
}

(async () => {
  await connectDB();

  const existing = await Admin.findOne({ walletAddress: walletAddress.toLowerCase() });
  if (existing) {
    console.log(`Admin already exists: ${existing.walletAddress} (${existing.role})`);
    process.exit(0);
  }

  const admin = await Admin.create({
    walletAddress: walletAddress.toLowerCase(),
    name,
    role: "superadmin",
    isActive: true,
  });

  console.log("\n✅ Superadmin created successfully!");
  console.log(`   Name    : ${admin.name}`);
  console.log(`   Wallet  : ${admin.walletAddress}`);
  console.log(`   Role    : ${admin.role}`);
  console.log("\nYou can now log in at http://localhost:5173/admin/login\n");

  await mongoose.disconnect();
  process.exit(0);
})();
