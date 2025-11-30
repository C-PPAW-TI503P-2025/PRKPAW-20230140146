const { Presensi, User } = require("../models");
const { Op } = require("sequelize"); 

exports.getDailyReport = async (req, res) => {
  try {
    const { email, tanggalMulai, tanggalSelesai } = req.query;

    // Where clause untuk Presensi (filter tanggal)
    let wherePresensi = {}; 
    if (tanggalMulai) {
      const startString = `${tanggalMulai} 00:00:00`;
      const dateStart = new Date(startString); 
      if (isNaN(dateStart.getTime())) {
        return res.status(400).json({ message: "Format tanggalMulai tidak valid. Gunakan YYYY-MM-DD." });
      }

      let dateEnd;
      if (tanggalSelesai) {
        const endString = `${tanggalSelesai} 23:59:59.999`;
        dateEnd = new Date(endString);
        if (isNaN(dateEnd.getTime())) {
          return res.status(400).json({ message: "Format tanggalSelesai tidak valid. Gunakan YYYY-MM-DD." });
        }
      } else {
        const endString = `${tanggalMulai} 23:59:59.999`;
        dateEnd = new Date(endString);
      }
      
      wherePresensi.checkIn = { [Op.between]: [dateStart, dateEnd] };
    }

    // Filter email
    let whereUser = {};
    if (email) {
      whereUser.email = { [Op.like]: `%${email}%` };
    }

    // Ambil data presensi + user
    const records = await Presensi.findAll({ 
      where: wherePresensi,
      include: [{ 
        model: User,
        as: 'user',
        where: whereUser,
        attributes: ['email'] 
      }]
    });

    // Format response supaya ada email + tanggalMulai + tanggalSelesai
    const formattedData = records.map(r => ({
      email: r.user.email,
      tanggalMulai: tanggalMulai || null,
      tanggalSelesai: tanggalSelesai || null,
      presensi: r // optional: semua data presensi lain
    }));

    res.json({
      reportDate: new Date().toLocaleDateString(),
      data: formattedData,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Gagal mengambil laporan", error: error.message });
  }
};
