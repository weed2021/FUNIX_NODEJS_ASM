const bcrypt = require('bcryptjs')
const Staff = require('../models/staff');
const Covid = require('../models/covid');
const Attendance = require('../models/attendance');
const fs = require('fs');
const path = require('path');
const PDFDocument = require('pdfkit');
const moment = require('moment');


exports.postConfirmButton = (req, res, next) => {

    const month = req.body.month;
    const staffId = req.body.staffId;

    Attendance.find({ staffId: staffId, month: month })
        .then(attendances => {
            for (let i = 0; i < attendances.length; i++) {
                attendances[i].isConfirm = true;
                attendances[i].save();
            }
        })
        .then(() => {
            Staff.find({ managerId: req.session.staff._id })
                .then(staffs => {
                    res.render('admin/confirmWorkTime', {
                        pageTitle: "Confirm Time Work",
                        staffs: staffs,
                        path: '/confirmTimeWork'
                    })
                })
                .catch(err => { console.log(err) })
        })
}

exports.postDeleteAttendance = (req, res, next) => {
    const attendanceId = req.params.attendanceId;
    const dayId = req.body.dayId;

    Attendance.findById(dayId)
        .then(attendance => {
            const index = attendance.items.findIndex(index => {
                return index._id.toString() === attendanceId.toString();
            })

            //Update total time of day if only delete one of session.
            attendance.totalTimeOfDay -= attendance.items[index].timeOfSession;

            //Delete session work.
            attendance.items[index].remove()

            // Check if day have no check in check out session, then delete attendance.
            if (attendance.items.length === 0) {
                attendance.remove();
            }
            attendance.save()
            return attendance;
        })
        .then(attendance => {
            // Render ra page trước
            const staffId = attendance.staffId;
            const monthSearch = attendance.month;

            Staff.findById(staffId)
                .then(staff => {
                    Attendance.find({ staffId: staff._id, month: monthSearch })
                        .then(attendances => {
                            res.render('admin/confirmTimeWorkDetail', {
                                pageTitle: "Confirm Time Work",
                                path: '/confirmTimeWork',
                                attendances: attendances,
                                month: monthSearch,
                            })
                        })
                })
        })

}

exports.postEditAttendance = (req, res, next) => {
    //Lưu các giá trị từ request vào biến
    const checkIn = new Date(req.body.checkIn);
    const checkOut = new Date(req.body.checkOut);
    const workplace = req.body.workplace;

    const sessionWorkId = req.body.sessionWorkId;
    const dayId = req.body.dayId;

    //Lọc ra ngày làm việc từ dayId
    Attendance.findById(dayId)
        .then(attendance => {

            //Tìm ra index của phiên làm việc trong ngày
            const index = attendance.items.findIndex(sessionWork => {
                return sessionWork._id.toString() === sessionWorkId.toString();
            });

            //Dựa vào index để update dữ liệu.
            attendance.items[index].checkIn = checkIn;
            attendance.items[index].checkOut = checkOut;
            attendance.items[index].workplace = workplace;

            //Mili Seconds between check in and check out
            const diff = checkOut.getTime() - checkIn.getTime();
            //Change Miliseconds to minutes
            const diffMins = Math.ceil((diff / 1000) / 60)

            //Total time of day minus time of sesion before update
            attendance.totalTimeOfDay -= attendance.items[index].timeOfSession;

            //Update timeOfSession
            attendance.items[index].timeOfSession = diffMins / 60;

            //Total time of day plus time of sesion after update
            attendance.totalTimeOfDay += attendance.items[index].timeOfSession;

            //Update overtime
            if (diffMins > 480) {
                attendance.items[index] = (diffMins - 480) / 60;
            }

            attendance.save();
            return attendance;
        })
        .then(attendance => {
            // Render ra page trước
            const staffId = attendance.staffId;
            const monthSearch = attendance.month;

            Staff.findById(staffId)
                .then(staff => {
                    Attendance.find({ staffId: staff._id, month: monthSearch })
                        .then(attendances => {
                            res.render('admin/confirmTimeWorkDetail', {
                                pageTitle: "Confirm Time Work",
                                path: '/confirmTimeWork',
                                attendances: attendances,
                                month: monthSearch,
                            })
                        })
                })
        })
}

exports.getEditAttendance = (req, res, next) => {

    const attendanceId = req.params.attendanceId;
    const staffId = req.body.staffId;
    const dayId = req.body.dayId;

    Attendance.findById({ _id: dayId })
        .then(attendance => {
            const sessionWork = attendance.items.find(sessionWork => {
                return sessionWork._id.toString() === attendanceId.toString();
            })

            const checkId = moment(sessionWork.checkIn).format('YYYY-MM-DDTHH:mm');
            const checkOut = moment(sessionWork.checkOut).format('YYYY-MM-DDTHH:mm');

            res.render('admin/edit-attendance', {
                pageTitle: "Edit Attendance",
                dayId: dayId,
                sessionWork: sessionWork,
                checkIn: checkId,
                checkOut: checkOut,
                path: '/edit-attendance'
            })
        })
}

exports.getConfirmTimeWorkDetail = (req, res, next) => {
    const staffId = req.params.staffId;
    const monthSearch = req.body.month;

    Staff.findById(staffId)
        .then(staff => {
            Attendance.find({ staffId: staff._id, month: monthSearch, isConfirm: false })
                .then(attendances => {
                    return res.render('admin/confirmTimeWorkDetail', {
                        pageTitle: "Confirm Time Work",
                        path: '/confirmTimeWork',
                        attendances: attendances,
                        month: monthSearch,
                    })
                })
        })

}

exports.getConfirmTimeWork = (req, res, next) => {
    Staff.find({ managerId: req.session.staff._id })
        .then(staffs => {
            res.render('admin/confirmWorkTime', {
                pageTitle: "Confirm Time Work",
                staffs: staffs,
                path: '/confirmTimeWork'
            })
        })
        .catch(err => { console.log(err) })
}

exports.getCovidStatus = (req, res, next) => {
    Staff.find({ managerId: req.session.staff._id })
        .then(staffs => {
            let listRecordCovidStaff = [];
            for (let staff of staffs) {
                const promise = Covid
                    .findOne({ staffId: staff._id })
                    .populate('staffId')
                    .then(record => {
                        return record;
                    })
                    .catch(err => { console.log(err) })
                listRecordCovidStaff.push(promise)
            }
            Promise.all(listRecordCovidStaff).then(records => {

                const fileName = "invoice-" + req.session.staff._id + ".pdf";
                const filePath = path.join('data', 'covidRecords', fileName);

                const pdfDoc = new PDFDocument();

                pdfDoc.pipe(fs.createWriteStream(filePath));
                pdfDoc.pipe(res);

                // Content of pdf
                pdfDoc.fontSize(24).text('COVID REPORT');

                pdfDoc.text('---------------------');

                for (let record of records) {

                    pdfDoc.text('Name: ' + record.staffId.name);
                    pdfDoc.text('StaffId: ' + record.staffId._id);
                    pdfDoc.text('Temporature: ' + record.bodyTemporature.celsius);
                    pdfDoc.text('Date Register: ' + moment(record.bodyTemporature.dateRegister).format('L'));
                    pdfDoc.text('First');
                    pdfDoc.text('Type: ' + record.vaccine.first.type);
                    pdfDoc.text('Date Inject: ' + moment(record.vaccine.first.dateInjection1).format('L'));
                    pdfDoc.text('Second');
                    pdfDoc.text('Type: ' + record.vaccine.second.type);
                    pdfDoc.text('Date Inject: ' + moment(record.vaccine.second.dateInjection2).format('L'));
                    const infection = record.infection === 0 ? 'Negative' : 'Positive';
                    pdfDoc.text('Status Infection: ' + infection);
                    pdfDoc.text('---------');
                }

                pdfDoc.end()

            })

        })
        .catch(err => { console.log(err) })
}

exports.getAddStaff = (req, res, next) => {
    res.render('admin/add-staff', {
        pageTitle: 'Add Staff',
        path: '/add-staff'
    })
}

exports.postAddStaff = (req, res, next) => {
    const name = req.body.name;
    const email = req.body.email;
    const password = req.body.password;
    const doB = new Date(req.body.doB);
    const salaryScale = req.body.salaryScale;
    const startDate = new Date(req.body.startDate);
    const department = req.body.department;
    const annualLeave = req.body.annualLeave;
    const image = req.file;

    if (!image) {
        return console.log(image)
    }

    console.log("");
    Staff.findOne({ email: email })
        .then(staffDoc => {
            if (staffDoc) {
                return res.redirect('/add-staff')
            }
            return bcrypt.hash(password, 12)
                .then(hashPassword => {
                    const staff = new Staff({
                        name: name,
                        email: email,
                        password: hashPassword,
                        doB: doB,
                        salaryScale: salaryScale,
                        startDate: startDate,
                        department: department,
                        annualLeave: annualLeave,
                        image: image.path,
                        managerId: req.session.staff._id
                    })
                    return staff.save()
                })
        })
        .then(() => {
            console.log('Staff created');
            res.redirect('/')
        })
        .catch(err => {
            console.log(err)
        })
}