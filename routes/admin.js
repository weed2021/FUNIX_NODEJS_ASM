const express = require('express');
const router = express.Router();
const adminController =  require('../controllers/admin');

router.get('/add-staff',adminController.getAddStaff);
router.post('/add-staff',adminController.postAddStaff)

module.exports = router;