const Staff = require('../models/staff');
const moment = require('moment');
const Attendance = require('../models/attendance');
const Leave = require('../models/annualLeave');



exports.getWorkInfo = (req, res, next) => {

    //Nếu là lần cuối cùng của ngày thì hiện tổng số giờ làm theo ngày  
    //(số giờ đã làm của cả ngày + giờ đã đăng ký annualLeave).

    Attendance.find().then(attendances => {
        res.render('staff/workInfo', {
            attendances: attendances,
            pageTitle: 'Work Info',
            path: '/workInfo'
        })
    })

}

exports.postAnnualLeave = (req, res, next) => {
    const dayLeaveRequest = parseFloat(req.body.hoursLeave / 8);
    if (dayLeaveRequest > req.staff.annualLeave) {
        res.render('errMess', {
            pageTitle: 'Invalid request',
            errMess: 'Your annual leave is not valid',
            path: '/err'
        })
    } else {
        const leaveDate = new Date(req.body.leaveDate);
        const reason = req.body.reason;
        const hours = req.body.hoursLeave;
        const userId = req.staff._id;
        const leave = new Leave({
            leaveDate: leaveDate,
            reason: reason,
            hours: hours,
            userId: userId
        })
        leave.save().catch(err => {
            console.log(err)
        })

        const annualLeave = req.staff.annualLeave;
        const daysRemain = annualLeave - dayLeaveRequest;
        const staff = req.staff;
        staff.annualLeave = daysRemain;
        staff.save().catch(err => {
            console.log(err)
        })
        return res.redirect('/')

    }
}

exports.getAnnualLeave = (req, res, next) => {
    res.render('staff/annualLeave', {
        pageTitle: 'Annual Leave',
        remainLeave: req.staff.annualLeave,
        path: '/annualLeave'
    })
}

exports.postCheckOutAttendance = (req, res, next) => {
    const checkOut = req.body.checkOut;
    Attendance.findOne({ statusWork: true })
        .then(attendance => {

            let totalTimeOfDay = attendance.totalTimeOfDay;

            attendance.statusWork = false;
            const items = attendance.items;
            for (let attendance of items) {
                if (attendance.statusWork === true) {

                    //Ignore if checkOut in other day
                    const dayOfCheckIn = attendance.checkIn.getDate();
                    const dayOfCheckOut = new Date(checkOut).getDate();

                    if (dayOfCheckIn != dayOfCheckOut) {

                        attendance.remove()
                        res.render('errMess', {
                            pageTitle: 'Error Check Out',
                            errMess: 'You expired check out. Because check in and check out in different days. Your time work will be ignore. You need to check in again. Please careful in next time.',
                            path: '/err'
                        })
                    } else {
                        const diff = Math.abs(new Date(checkOut) - new Date(attendance.checkIn));
                        const diffMins = minutes = Math.floor((diff / 1000) / 60);

                        attendance.timeOfSession = diffMins
                        totalTimeOfDay += diffMins;
                        attendance.statusWork = false;
                        attendance.checkOut = checkOut;
                        if (diffMins > 480) {
                            attendance.overtime = diffMins - 480;
                        }
                    }

                }
            }
            attendance.totalTimeOfDay = totalTimeOfDay;
            attendance.save()
            return res.redirect('/');

        })
        .catch(err => {
            console.log(err);
        })
}

exports.getCheckInAttendance = (req, res, next) => {
    const staffId = req.staff._id;
    Staff.findById(staffId)
        .then(staff => {
            res.render('staff/attendanceCheckIn', {
                staff: staff,
                pageTitle: 'Check In',
                path: '/attendanceCheckIn'
            })
        })
        .catch(err => {
            console.log(err);
        })
}

exports.postCheckInAttendance = (req, res, next) => {
    const workplace = req.body.workplace;
    const checkIn = req.body.checkIn;
    const checkOut = null;
    // ...
    const statusWork = true;

    //Annual Leave

    Attendance.findOne({ statusWork: true })
        .then(atd => {
            if (atd) {
                return res.redirect('/err');
            } else {
                Attendance.findOne({ day: new Date(checkIn).getDate() })
                    .then(attendance => {
                        if (attendance) {
                            Leave.find()
                                .then(leaves => {
                                    const inLeave = leaves.find(leave => {
                                        return new Date(leave.leaveDate).getDate() === new Date(checkIn).getDate();
                                    });
                                    if (inLeave) {
                                        const updatedItems = {
                                            checkIn: checkIn,
                                            checkOut: checkOut,
                                            workplace: workplace,
                                            statusWork: statusWork
                                        }
                                        attendance.items.push(updatedItems)

                                        attendance.statusWork = true;
                                        attendance.annualLeave = inLeave.hours;

                                        attendance.save()
                                        return res.redirect('/');
                                    } else {
                                        const updatedItems = {
                                            checkIn: checkIn,
                                            checkOut: checkOut,
                                            workplace: workplace,
                                            statusWork: statusWork
                                        }
                                        attendance.items.push(updatedItems)

                                        attendance.statusWork = true;
                                        attendance.save()
                                        return res.redirect('/');
                                    }

                                })
                        }
                        else {
                            Leave.find()
                                .then(leaves => {
                                    const inLeave = leaves.find(leave => {
                                        return new Date(leave.leaveDate).getDate() === new Date(checkIn).getDate();
                                    });

                                    if (inLeave) {
                                        console.log(inLeave.hours)
                                        const attendance = new Attendance({
                                            day: new Date(checkIn).getDate(),
                                            month: new Date(checkIn).getMonth() + 1,
                                            items: [{
                                                checkIn: checkIn,
                                                checkOut: checkOut,
                                                workplace: workplace,
                                                statusWork: statusWork
                                            }],
                                            annualLeave: inLeave.hours,
                                            staffId: req.staff._id,
                                            statusWork: statusWork,
                                            //...
                                        })
                                        attendance.save();
                                        return res.redirect('/');
                                    }
                                    else {
                                        const attendance = new Attendance({
                                            day: new Date(checkIn).getDate(),
                                            month: new Date(checkIn).getMonth() + 1,
                                            items: [{
                                                checkIn: checkIn,
                                                checkOut: checkOut,
                                                workplace: workplace,
                                                statusWork: statusWork
                                            }],
                                            staffId: req.staff._id,
                                            statusWork: statusWork,
                                            //...
                                        })
                                        attendance.save();
                                        return res.redirect('/');
                                    }
                                })
                                .catch(err => {
                                    console.log(err);
                                })
                        }
                    })
                    .catch(err => {
                        console.log(err);
                    })
            }
        })
        .catch(err => {
            console.log(err);
        })
}

exports.getStaff = (req, res, next) => {
    Staff.find().then(staffs => {
        res.render('staff/info', {
            name: staffs[0].name,
            doB: moment(staffs[0].doB).format('L'),
            salaryScale: staffs[0].salaryScale,
            startDate: moment(staffs[0].startDate).format('L'),
            department: staffs[0].department,
            annualLeave: staffs[0].annualLeave,
            department: staffs[0].department,
            image: staffs[0].image,
            id: staffs[0]._id,
            pageTitle: 'Staff Info',
            path: '/info'
        })
    })
}

exports.postStaff = (req, res, next) => {
    const staffId = req.body.staffId;
    const UpdatedImageUrl = req.body.image;

    Staff.findById(staffId)
        .then(staff => {
            staff.image = UpdatedImageUrl;
            return staff.save()
        })
        .then(() => {
            res.redirect('/info')
        })
        .catch(err => {
            consolog.log(err);
        })
}

exports.getHomePage = (req, res, next) => {
    res.render('staff/homepage', {
        pageTitle: 'Staff Info',
        path: '/info'
    })
}