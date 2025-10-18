const express = require('express');
const router = express.Router();
const presensiController = require('../../Controllers/presensiController');
const { addUserData } = require('../../Middleware/permissionMinddleware');
router.use(addUserData);
router.post('/check-in', presensiController.CheckIn);
router.post('/check-out', presensiController.CheckOut);
module.exports = router;
