const express = require('express');

const router = express.Router();

const staffController = require('../controllers/staff');
const errController = require('../controllers/error');
const isAuth = require('../middleware/is-auth')
const isStaff = require('../middleware/is-staff')
router.get('/', isAuth, staffController.getHomePage);

router.post('/result-search', isAuth, staffController.postSearch);

router.get('/edit-covid',isStaff, isAuth, staffController.getEditCovidCheck);

router.post('/postEditCovidCheck',isStaff, isAuth, staffController.postEditCovidCheck);

router.post('/postAddCovidCheck',isStaff, isAuth, staffController.postAddCovidCheck);

router.get('/covid', isAuth, staffController.getCovidCheck);

router.post('/postSalary',isStaff, isAuth, staffController.postSalary);

router.get('/err',isStaff, isAuth, errController.getCheckIn);

router.get('/workInfo',isStaff, isAuth, staffController.getWorkInfo)

router.get('/annualLeave',isStaff, isAuth, staffController.getAnnualLeave);
router.post('/annualLeave',isStaff, isAuth, staffController.postAnnualLeave);

router.get('/info', isAuth, staffController.getStaff);
router.post('/info', isAuth, staffController.postStaff);

router.get('/attendanceCheckIn',isStaff, isAuth, staffController.getCheckInAttendance);
router.post('/attendanceCheckIn',isStaff, isAuth, staffController.postCheckInAttendance);

router.post('/attendanceCheckOut',isStaff, isAuth, staffController.postCheckOutAttendance);

module.exports = router;