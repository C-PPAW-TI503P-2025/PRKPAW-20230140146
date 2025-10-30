const { Presensi } = require("../models");
const { Op } = require("sequelize");

exports.getDailyReport = async (req, res) => {
  try {
    const { nama, tanggalMulai, tanggalSelesai } = req.query;
    let where = {};

  const qnama = nama || req.query.name;
  if (qnama) {
    where.nama = { [Op.like]: `%${qnama}%` };
    }

    if (tanggalMulai) {
      const start = new Date(tanggalMulai);
      if (isNaN(start.getTime())) {
        return res.status(400).json({ message: "Format tanggalMulai tidak valid. Gunakan YYYY-MM-DD atau ISO 8601." });
      }

      let end;
      if (tanggalSelesai) {
        end = new Date(tanggalSelesai);
        if (isNaN(end.getTime())) {
          return res.status(400).json({ message: "Format tanggalSelesai tidak valid. Gunakan YYYY-MM-DD atau ISO 8601." });
        }
      } else {
        end = new Date(start);
      }

      start.setHours(0, 0, 0, 0);
      end.setHours(23, 59, 59, 999);
      where.checkIn = { [Op.between]: [start, end] };
    }

    const records = await Presensi.findAll({ where });


    res.json({
      reportDate: new Date().toLocaleDateString(),
    data: records,
    });
  } catch (error) {
    res.status(500).json({ message: "Gagal mengambil laporan" });
  }
};
