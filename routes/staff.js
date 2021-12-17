const express = require('express');

const router = express.Router();

const staffController = require('../controllers/staff');
const errController = require('../controllers/error');

router.get('/',staffController.getHomePage);

router.post('/postSalary',staffController.postSalary);

router.get('/err',errController.getCheckIn);

router.get('/workInfo', staffController.getWorkInfo)

router.get('/annualLeave', staffController.getAnnualLeave);
router.post('/annualLeave',staffController.postAnnualLeave);

router.get('/info',staffController.getStaff);
router.post('/info',staffController.postStaff);

router.get('/attendanceCheckIn',staffController.getCheckInAttendance);
router.post('/attendanceCheckIn',staffController.postCheckInAttendance);

router.post('/attendanceCheckOut',staffController.postCheckOutAttendance);

module.exports = router;