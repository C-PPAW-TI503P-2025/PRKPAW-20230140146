const presensiRecords = require("../data/presensiData");
const { format } = require("date-fns");


exports.CheckIn = (req, res) => {
  const { id: userId, nama: userName } = req.user;
  const waktuSekarang = new Date();
  const existingRecord = presensiRecords.find(
    (record) => record.userId === userId && record.checkOut === null
  );
  if (existingRecord) {
    return res
      .status(400)
      .json({ message: "Anda sudah melakukan check-in hari ini." });
  }
  const newRecord = {
    userId,
    nama: userName,
    checkIn: waktuSekarang,
    checkOut: null,
  };
  presensiRecords.push(newRecord);

  // Format ISO string +07:00 (WIB)
  const checkInISO = new Date(newRecord.checkIn.getTime() + 7 * 60 * 60 * 1000)
    .toISOString()
    .replace("Z", "+07:00");

  const formattedData = {
    ...newRecord,
    checkIn: checkInISO,
  };
  console.log(
    `DATA TERUPDATE: Karyawan ${userName} (ID: ${userId}) melakukan check-in.`
  );

  res.status(201).json({
    message: `Halo ${userName}, check-in Anda berhasil pada pukul ${checkInISO}`,
    data: formattedData,
  });
};




exports.CheckOut = (req, res) => {
  const { id: userId, nama: userName } = req.user;
  const waktuSekarang = new Date();
  const recordToUpdate = presensiRecords.find(
    (record) => record.userId === userId && record.checkOut === null
  );

  if (!recordToUpdate) {
    return res.status(404).json({
      message: "Tidak ditemukan catatan check-in yang aktif untuk Anda.",
    });
  }
  recordToUpdate.checkOut = waktuSekarang;

  // Format ISO string +07:00 (WIB)
  const checkInISO = new Date(recordToUpdate.checkIn.getTime() + 7 * 60 * 60 * 1000)
    .toISOString()
    .replace("Z", "+07:00");
  const checkOutISO = new Date(recordToUpdate.checkOut.getTime() + 7 * 60 * 60 * 1000)
    .toISOString()
    .replace("Z", "+07:00");

  const formattedData = {
    ...recordToUpdate,
    checkIn: checkInISO,
    checkOut: checkOutISO,
  };

  console.log(
    `DATA TERUPDATE: Karyawan ${userName} (ID: ${userId}) melakukan check-out.`
  );

  res.json({
    message: `Selamat jalan ${userName}, check-out Anda berhasil pada pukul ${checkOutISO}`,
    data: formattedData,
  });
};
