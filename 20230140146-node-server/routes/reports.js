const express = require('express');

const router = express.Router();
const reportController = require('../Controllers/reportController');
const { addUserData, isAdmin } = require('../middleware/permissionMiddleware');
router.get('/daily', [addUserData, isAdmin], reportController.getDailyReport);


module.exports = router;