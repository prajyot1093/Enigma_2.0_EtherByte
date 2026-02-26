const jwt = require("jsonwebtoken");
const Admin = require("../models/Admin");

const signAdminToken = (admin) => {
  return jwt.sign(
    {
      id: admin._id,
      role: admin.role,
      walletAddress: admin.walletAddress,
    },
    process.env.JWT_SECRET,
    { expiresIn: "7d" }
  );
};

const loginAdmin = async (req, res, next) => {
  try {
    const { walletAddress } = req.body;

    if (!walletAddress || !/^0x[a-fA-F0-9]{40}$/.test(walletAddress)) {
      return res.status(400).json({ success: false, message: "Valid walletAddress is required" });
    }

    const admin = await Admin.findOne({ walletAddress: walletAddress.toLowerCase() });
    if (!admin || !admin.isActive) {
      return res.status(401).json({ success: false, message: "Unauthorized" });
    }

    const token = signAdminToken(admin);

    return res.json({
      success: true,
      message: "Admin login successful",
      data: {
        token,
        admin: {
          id: admin._id,
          name: admin.name,
          role: admin.role,
          walletAddress: admin.walletAddress,
          isActive: admin.isActive,
        },
      },
    });
  } catch (error) {
    return next(error);
  }
};

const getCurrentAdmin = async (req, res, next) => {
  try {
    const admin = req.admin;
    return res.json({
      success: true,
      data: {
        id: admin._id,
        name: admin.name,
        role: admin.role,
        walletAddress: admin.walletAddress,
        isActive: admin.isActive,
      },
    });
  } catch (error) {
    return next(error);
  }
};

const createAdmin = async (req, res, next) => {
  try {
    const { name, walletAddress, role } = req.body;

    if (!name || !walletAddress) {
      return res.status(400).json({ success: false, message: "name and walletAddress are required" });
    }

    if (!/^0x[a-fA-F0-9]{40}$/.test(walletAddress)) {
      return res.status(400).json({ success: false, message: "walletAddress is invalid" });
    }

    const normalizedWallet = walletAddress.toLowerCase();
    const existing = await Admin.findOne({ walletAddress: normalizedWallet });
    if (existing) {
      return res.status(409).json({ success: false, message: "Admin already exists for this wallet" });
    }

    const admin = await Admin.create({
      name,
      walletAddress: normalizedWallet,
      role: role || "admin",
      isActive: true,
    });

    return res.status(201).json({
      success: true,
      message: "Admin created successfully",
      data: {
        id: admin._id,
        name: admin.name,
        role: admin.role,
        walletAddress: admin.walletAddress,
        isActive: admin.isActive,
      },
    });
  } catch (error) {
    return next(error);
  }
};

const listAdmins = async (req, res, next) => {
  try {
    const admins = await Admin.find().sort({ createdAt: -1 });
    return res.json({ success: true, data: admins });
  } catch (error) {
    return next(error);
  }
};

module.exports = {
  loginAdmin,
  getCurrentAdmin,
  createAdmin,
  listAdmins,
};
