// File: routes/presensi.js

const express = require("express");
const router = express.Router();
const { body, validationResult } = require("express-validator");
const presensiController = require("../Controllers/presensiController");
const permission = require("../middleware/permissionMiddleware");

// Validasi untuk update presensi
const validatePresensiUpdate = [
  body("checkIn")
    .optional()
    .isISO8601()
    .withMessage("checkIn harus berupa format tanggal yang valid (ISO8601)"),
  body("checkOut")
    .optional()
    .isISO8601()
    .withMessage("checkOut harus berupa format tanggal yang valid (ISO8601)"),
  (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res
        .status(400)
        .json({ message: "Validasi gagal", errors: errors.array() });
    }
    next();
  },
];

// Routes
router.post(
  "/check-in",
  permission.authenticateToken,
  presensiController.checkIn
);

router.post(
  "/check-out",
  permission.authenticateToken,
  presensiController.checkOut
);

router.put(
  "/:id",
  permission.authenticateToken,
  validatePresensiUpdate,
  presensiController.updatePresensi
);

router.delete(
  "/:id",
  permission.authenticateToken,
  presensiController.deletePresensi
);

// Search presensi berdasarkan email (admin only)
router.get(
  "/search",
  permission.authenticateToken,
  permission.isAdmin,
  presensiController.searchByEmail
);

// Search presensi berdasarkan tanggal (admin only)
router.get(
  "/search-by-date",
  permission.authenticateToken,
  permission.isAdmin,
  presensiController.searchByTanggal
);

// Laporan harian (admin only)
router.get(
  "/daily-report",
  permission.authenticateToken,
  permission.isAdmin,
  presensiController.getDailyReport
);

module.exports = router;
