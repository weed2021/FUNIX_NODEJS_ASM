const express = require('express');
const router = express.Router();
const adminController =  require('../controllers/admin');
const isAdmin = require('../middleware/is-admin');

router.post('/confirmButton',isAdmin,adminController.postConfirmButton);

router.post('/delete-attendance/:attendanceId',isAdmin,adminController.postDeleteAttendance);

router.post('/edit-attendance',isAdmin,adminController.postEditAttendance);

router.use('/edit-attendance/:attendanceId',isAdmin,adminController.getEditAttendance);

router.get('/confirmTimeWork',isAdmin,adminController.getConfirmTimeWork);

router.use('/confirmTimeWork/:staffId',isAdmin,adminController.getConfirmTimeWorkDetail);

router.get('/getCovidStatus',isAdmin,adminController.getCovidStatus);

router.get('/add-staff',isAdmin,adminController.getAddStaff);

router.post('/add-staff',isAdmin,adminController.postAddStaff)

module.exports = router;