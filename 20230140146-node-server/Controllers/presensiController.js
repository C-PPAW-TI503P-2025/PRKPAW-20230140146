const { Presensi, User } = require("../models");
const { Op } = require("sequelize");
const { format } = require("date-fns-tz");
const timeZone = "Asia/Jakarta";

// ===========================
// 🔹 Konfigurasi Upload Foto
// ===========================
const multer = require("multer");
const path = require("path");

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, "uploads/");
  },
  filename: (req, file, cb) => {
    cb(null, `${req.user.id}-${Date.now()}${path.extname(file.originalname)}`);
  },
});

const fileFilter = (req, file, cb) => {
  if (file.mimetype.startsWith("image/")) {
    cb(null, true);
  } else {
    cb(new Error("Hanya file gambar yang diperbolehkan!"), false);
  }
};

exports.upload = multer({ storage: storage, fileFilter: fileFilter });

// ===========================
// 🔹 CHECK-IN
// ===========================
exports.checkIn = async (req, res) => {
  try {
    const { id: userId } = req.user;
    const waktuSekarang = new Date();
    const { latitude, longitude } = req.body;

    const existingRecord = await Presensi.findOne({
      where: { userId: userId, checkOut: null },
    });

    if (existingRecord) {
      return res
        .status(400)
        .json({ message: "Anda sudah melakukan check-in hari ini." });
    }

    const newRecord = await Presensi.create({
      userId: userId,
      checkIn: waktuSekarang,
      latitude: latitude,
      longitude: longitude,
      buktiFoto: req.file ? req.file.path : null, // ⬅️ FOTO TERSIMPAN DI DATABASE
    });

    const formattedData = {
      userId: newRecord.userId,
      checkIn: format(newRecord.checkIn, "yyyy-MM-dd HH:mm:ssXXX", { timeZone }),
      checkOut: null,
      latitude: newRecord.latitude,
      longitude: newRecord.longitude,
      buktiFoto: newRecord.buktiFoto, // ⬅️ FOTO DI-RETURN JUGA
      createdAt: format(newRecord.createdAt, "yyyy-MM-dd HH:mm:ssXXX", { timeZone }),
      updatedAt: format(newRecord.updatedAt, "yyyy-MM-dd HH:mm:ssXXX", { timeZone }),
    };

    res.status(201).json({
      message: `Check-in berhasil pada pukul ${format(
        waktuSekarang,
        "HH:mm:ss",
        { timeZone }
      )} WIB`,
      data: formattedData,
    });
  } catch (error) {
    res.status(500).json({
      message: "Terjadi kesalahan pada server",
      error: error.message,
    });
  }
};

// ===========================
// 🔹 CHECK-OUT
// ===========================
exports.checkOut = async (req, res) => {
  try {
    const { id: userId } = req.user;
    const waktuSekarang = new Date();

    const recordToUpdate = await Presensi.findOne({
      where: { userId: userId, checkOut: null },
    });

    if (!recordToUpdate) {
      return res.status(404).json({
        message: "Tidak ditemukan catatan check-in yang aktif untuk Anda.",
      });
    }

    recordToUpdate.checkOut = waktuSekarang;
    await recordToUpdate.save();

    const formattedData = {
      userId: recordToUpdate.userId,
      checkIn: format(recordToUpdate.checkIn, "yyyy-MM-dd HH:mm:ssXXX", { timeZone }),
      checkOut: format(recordToUpdate.checkOut, "yyyy-MM-dd HH:mm:ssXXX", { timeZone }),
      latitude: recordToUpdate.latitude,
      longitude: recordToUpdate.longitude,
      buktiFoto: recordToUpdate.buktiFoto,
      createdAt: format(recordToUpdate.createdAt, "yyyy-MM-dd HH:mm:ssXXX", { timeZone }),
      updatedAt: format(recordToUpdate.updatedAt, "yyyy-MM-dd HH:mm:ssXXX", { timeZone }),
    };

    res.json({
      message: `Check-out berhasil pada pukul ${format(
        waktuSekarang,
        "HH:mm:ss",
        { timeZone }
      )} WIB`,
      data: formattedData,
    });
  } catch (error) {
    res.status(500).json({
      message: "Terjadi kesalahan pada server",
      error: error.message,
    });
  }
};

// ===========================
// 🔹 DELETE PRESENSI
// ===========================
exports.deletePresensi = async (req, res) => {
  try {
    const { id: userId } = req.user;
    const presensiId = req.params.id;
    const recordToDelete = await Presensi.findByPk(presensiId);

    if (!recordToDelete) {
      return res.status(404).json({ message: "Catatan presensi tidak ditemukan." });
    }

    if (recordToDelete.userId !== userId) {
      return res.status(403).json({ message: "Akses ditolak: Anda bukan pemilik catatan ini." });
    }

    await recordToDelete.destroy();
    res.status(204).send();
  } catch (error) {
    res.status(500).json({
      message: "Terjadi kesalahan pada server",
      error: error.message,
    });
  }
};

// ===========================
// 🔹 UPDATE PRESENSI
// ===========================
exports.updatePresensi = async (req, res) => {
  try {
    const presensiId = req.params.id;
    const { checkIn, checkOut } = req.body;

    if (checkIn === undefined && checkOut === undefined) {
      return res.status(400).json({
        message:
          "Request body tidak berisi data yang valid untuk diupdate (checkIn atau checkOut).",
      });
    }

    const recordToUpdate = await Presensi.findByPk(presensiId);

    if (!recordToUpdate) {
      return res.status(404).json({ message: "Catatan presensi tidak ditemukan." });
    }

    recordToUpdate.checkIn = checkIn || recordToUpdate.checkIn;
    recordToUpdate.checkOut = checkOut || recordToUpdate.checkOut;
    await recordToUpdate.save();

    res.json({
      message: "Data presensi berhasil diperbarui.",
      data: recordToUpdate,
    });
  } catch (error) {
    res.status(500).json({
      message: "Terjadi kesalahan pada server",
      error: error.message,
    });
  }
};

// ===========================
// 🔹 SEARCH PRESENSI BY TANGGAL
// ===========================
exports.searchByTanggal = async (req, res) => {
  try {
    const { tanggal } = req.query;

    if (!tanggal) {
      return res.status(400).json({
        message: "Parameter tanggal harus diisi (format: YYYY-MM-DD).",
      });
    }

    const startDate = new Date(`${tanggal}T00:00:00`);
    const endDate = new Date(`${tanggal}T23:59:59`);

    const hasil = await Presensi.findAll({
      where: {
        checkIn: { [Op.between]: [startDate, endDate] },
      },
      include: [{ model: User, as: "user", attributes: ["id", "email", "role"] }],
    });

    if (hasil.length === 0) {
      return res.status(404).json({ message: "Tidak ada presensi pada tanggal tersebut." });
    }

    res.json({
      message: `Hasil presensi untuk tanggal ${tanggal}`,
      data: hasil,
    });
  } catch (error) {
    res.status(500).json({
      message: "Terjadi kesalahan pada server",
      error: error.message,
    });
  }
};

// ===========================
// 🔹 SEARCH PRESENSI BY EMAIL
// ===========================
exports.searchByEmail = async (req, res) => {
  try {
    const { email } = req.query;

    if (!email) {
      return res.status(400).json({
        message: "Parameter email harus diisi.",
      });
    }

    const hasil = await Presensi.findAll({
      include: [
        {
          model: User,
          as: "user",
          where: {
            email: { [Op.like]: `%${email}%` },
          },
          attributes: ["id", "email", "role"],
        },
      ],
    });

    if (hasil.length === 0) {
      return res.status(404).json({ message: "Tidak ditemukan presensi dengan email tersebut." });
    }

    res.json({
      message: `Hasil pencarian presensi berdasarkan email '${email}'`,
      data: hasil,
    });
  } catch (error) {
    res.status(500).json({
      message: "Terjadi kesalahan pada server",
      error: error.message,
    });
  }
};

// ===========================
// 🔹 DAILY REPORT
// ===========================
exports.getDailyReport = async (req, res) => {
  try {
    const { email, tanggalMulai, tanggalSelesai } = req.query;
    let wherePresensi = {};
    let whereUser = {};

    if (email) {
      whereUser.email = { [Op.like]: `%${email}%` };
    }

    if (tanggalMulai) {
      const startString = `${tanggalMulai} 00:00:00`;
      const dateStart = new Date(startString);

      if (isNaN(dateStart.getTime())) {
        return res
          .status(400)
          .json({ message: "Format tanggalMulai tidak valid. Gunakan YYYY-MM-DD." });
      }

      let dateEnd;
      if (tanggalSelesai) {
        const endString = `${tanggalSelesai} 23:59:59.999`;
        dateEnd = new Date(endString);

        if (isNaN(dateEnd.getTime())) {
          return res
            .status(400)
            .json({ message: "Format tanggalSelesai tidak valid. Gunakan YYYY-MM-DD." });
        }
      } else {
        const endString = `${tanggalMulai} 23:59:59.999`;
        dateEnd = new Date(endString);
      }

      wherePresensi.checkIn = { [Op.between]: [dateStart, dateEnd] };
    }

    const records = await Presensi.findAll({
      where: wherePresensi,
      include: [
        {
          model: User,
          as: "user",
          where: whereUser,
          attributes: ["email", "role"],
        },
      ],
    });

    res.json({
      reportDate: new Date().toLocaleDateString(),
      data: records,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Gagal mengambil laporan", error: error.message });
  }
};
