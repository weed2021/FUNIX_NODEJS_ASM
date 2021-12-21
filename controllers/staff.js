const Staff = require('../models/staff');
const moment = require('moment');
const Attendance = require('../models/attendance');
const Leave = require('../models/annualLeave');
const Covid = require('../models/covid');

//Dữ liệu post từ form wildcard
exports.postSearch = (req, res, next) => {
    const wildCard = req.body.wildCard;

    
    Attendance.find().then(attendances => {
        let results = [];

        let resultsOverLack = [];

        //Workplace search
        if (wildCard === "workplace") {
            const request = req.body.workplace.toLowerCase();
            for (let att of attendances) {
                for (let item of att.items) {
                    if (item.workplace === request) {
                        results.push(item)
                    }
                }
            }
            return results
        }
        //Day search
        else if (wildCard === 'daySearch') {
            const daySearch = new Date(req.body.daySearch).getDate();
            const monthSearch = new Date(req.body.daySearch).getMonth() + 1;
            console.log(daySearch, monthSearch)
            for (let att of attendances) {
                if (att.day === daySearch && att.month === monthSearch) {
                    for (let item of att.items) {
                        results.push(item)
                    }
                }

            }
            return results
        }
        //Month search
        else if (wildCard === 'monthSearch') {
            const monthSearch = req.body.monthSearch
            for (let att of attendances) {
                if (att.month == monthSearch) {
                    for (let item of att.items) {
                        results.push(item)
                    }
                }

            }
            return results
        }
        //Overtime days of month
        else if (wildCard === "overTimeDays") {
            const month = req.body.overTimeDays;
            for (let att of attendances) {
                if(att.totalTimeOfDay > 8 && att.month==month){
                    resultsOverLack.push(att)
                }  
            }
            return res.render('staff/result-search', {
                overLack: resultsOverLack,
                attendances: results,
                pageTitle: 'Result Search',
                path: '/result-search',
            })
            //return resultsOverLack
        }
        
        //Lack of time Days
        else if (wildCard === "lackOfTimeDays") {
            const month = req.body.lackOfTimeDays;
            for (let att of attendances) {
                if(att.totalTimeOfDay < 8 && att.month==month){
                    resultsOverLack.push(att)
                }  
            }   
            console.log(resultsOverLack)
            return res.render('staff/result-search', {
                overLack: resultsOverLack,
                attendances: results,
                pageTitle: 'Result Search',
                path: '/result-search',
            })
            //return resultsOverLack
        }
    }).then(results => {
        res.render('staff/result-search', {
            //overLack: resultsOverLack,
            attendances: results,
            overLack: [],
            pageTitle: 'Result Search',
            path: '/result-search',
        })
    })
        .catch(err => {
            console.log(err)
        })



    //console.log(req.body.workplace)

}

//Render form chỉnh sửa thông tin covid
exports.getEditCovidCheck = (req, res, next) => {

    Covid.findOne({ userId: req.staff._id }).then(covid => {
        const celsius = covid.bodyTemporature.celsius;
        const dateRegister = moment(covid.bodyTemporature.dateRegister).format('YYYY-MM-DD');
        console.log(dateRegister)
        const type1 = covid.vaccine.first.type;
        const dateInjection1 = moment(covid.vaccine.first.dateInjection1).format('YYYY-MM-DD');
        const type2 = covid.vaccine.second.type;
        const dateInjection2 = moment(covid.vaccine.second.dateInjection2).format('YYYY-MM-DD');
        const infection = covid.infection;

        res.render('staff/edit-covid', {
            edit: true,
            celsius: celsius,
            dateRegister: dateRegister,
            type1: type1,
            dateInjection1: dateInjection1,
            type2: type2,
            dateInjection2: dateInjection2,
            infection: infection,
            covid: covid,
            pageTitle: 'Covid check',
            path: '/edit-covid'

        })
    })

}

//Xử lý data đẩy lên database khi chỉnh sửa xong thông tin covid
exports.postEditCovidCheck = (req, res, next) => {
    const celsius = req.body.celsius;
    const dateRegister = new Date(req.body.dateRegister);
    const type1 = req.body.type1;
    const dateInjection1 = new Date(req.body.dateInjection1);
    const type2 = req.body.type2;
    const dateInjection2 = new Date(req.body.dateInjection2);
    const infection = parseInt(req.body.infection);

    Covid.findOne({ userId: req.staff._id }).then(covid => {
        covid.bodyTemporature.celsius = celsius;
        covid.bodyTemporature.dateRegister = req.body.dateRegister.length > 0 ? dateRegister : null;
        covid.vaccine.first.type = type1;

        req.body.dateInjection1.length > 0 ? covid.vaccine.first.dateInjection1 = dateInjection1 : null;

        //covid.vaccine.first.dateInjection1 = req.body.dateInjection1.length>0?dateInjection1:null;
        covid.vaccine.second.type = type2;
        covid.vaccine.second.dateInjection2 = req.body.dateInjection2.length > 0 ? dateInjection2 : null;
        covid.infection = infection;
        return covid.save()
    })
        .then(() => {
            res.redirect('/covid');
        })
        .catch(err => {
            console.log(err);
        })


}

//Xử lý data đẩy lên database khi tạo xong thông tin covid
exports.postAddCovidCheck = (req, res, next) => {
    const celsius = req.body.celsius;
    const dateRegister = new Date(req.body.dateRegister);
    const type1 = req.body.type1;
    const dateInjection1 = new Date(req.body.dateInjection1);
    const type2 = req.body.type2;
    const dateInjection2 = new Date(req.body.dateInjection2);
    const infection = req.body.infection;

    const covid = new Covid({
        staffId: req.staff._id,
        bodyTemporature: {
            celsius: celsius,
            dateRegister: req.body.dateRegister.length > 0 ? dateRegister : null
        },
        vaccine: {
            first: {
                type: type1,
                dateInjection1: req.body.dateInjection1.length > 0 ? dateInjection1 : null //Check if staff choose date inject vaccine
            },
            second: {
                type: type2,
                dateInjection2: req.body.dateInjection2.length > 0 ? dateInjection2 : null
            }
        },
        infection: req.body.infection ? parseInt(infection) : 0
    })
    covid.save();
    return res.redirect('/covid')
}

//Render form tạo thông tin covid
exports.getAddCovidCheck = (req, res, next) => {
    res.render('staff/edit-covid', {
        pageTitle: 'Add Covid Info',
        path: '/add-covid',
        edit: false
    })
}

//Render html show thông tin covid staff đã nhập
exports.getCovidCheck = (req, res, next) => {
    Covid.findOne({ userId: req.staff._id }).then(covid => {
        if (covid) {
            const celsius = covid.bodyTemporature.celsius;
            const dateRegister = moment(covid.bodyTemporature.dateRegister).format('L');
            const type1 = covid.vaccine.first.type;
            const dateInjection1 = moment(covid.vaccine.first.dateInjection1).format('L');
            const type2 = covid.vaccine.second.type;
            const dateInjection2 = moment(covid.vaccine.second.dateInjection2).format('L');
            const infection = covid.infection;
            res.render('staff/covid', {
                celsius: celsius ? celsius : "Chua co thong tin",
                dateRegister: (covid.bodyTemporature.dateRegister) ? dateRegister : "Chua co thong tin",
                type1: type1 ? type1 : "Chua co thong tin",
                dateInjection1: (covid.vaccine.first.dateInjection1) ? dateInjection1 : "Chua co thong tin",
                type2: type2 ? type2 : "Chua co thong tin",
                dateInjection2: (covid.vaccine.second.dateInjection2) ? dateInjection2 : "Chua co thong tin",
                infection: infection,
                covid: covid,
                pageTitle: 'Covid Info',
                path: '/covid'
            })
        } else {
            res.render('staff/edit-covid', {
                pageTitle: 'Add covid info',
                path: '/edit-covid',
                edit: false
            })
        }

    })

}

//Xử lý khi staff gửi request xem lương của tháng
exports.postSalary = (req, res, next) => {

    const salaryScale = req.staff.salaryScale;

    Attendance.find({ month: parseInt(req.body.month) })
        .then(attendances => {
            let sumTimeMonth = 0;
            let overtime = 0;
            let lackOfHours = 0;
            for (let attendance of attendances) {
                sumTimeMonth += attendance.totalTimeOfDay;
            }
            if (sumTimeMonth < 16) {
                lackOfHours = 16 - sumTimeMonth;
            } else if (sumTimeMonth > 16) {
                overtime = sumTimeMonth - 16;
            } else {
                sumTimeMonth = 0;
                overtime = 0;
            }
            //Check thang ko lam viec ngay nao
            if (sumTimeMonth === 0) {
                return res.render('staff/salary', {
                    month: req.body.month,
                    salary: 0,
                    pageTitle: 'Salary',
                    path: '/postSalary'
                })
            }
            const salary = 3000000 * salaryScale + (overtime - lackOfHours) * 200000;
            res.render('staff/salary', {
                month: req.body.month,
                salary: salary,
                pageTitle: 'Salary',
                path: '/postSalary'
            })
        })

}

//Xử lý render Thông tin giờ làm việc
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


//Xử lý khi staff gửi request muốn nghỉ phép
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

//Render ra html để đăng ký nghỉ phép
exports.getAnnualLeave = (req, res, next) => {
    res.render('staff/annualLeave', {
        pageTitle: 'Annual Leave',
        remainLeave: req.staff.annualLeave,
        path: '/annualLeave'
    })
}

//Xử lý khi staff request check out
exports.postCheckOutAttendance = (req, res, next) => {
    const checkOut = req.body.checkOut;
    Attendance.findOne({ statusWork: true })
        .then(attendance => {
            if(!attendance){
                return res.render('errMess', {
                    pageTitle: 'Invalid Checkout',
                    errMess: 'You need to check in first!',
                    path: '/err'
                })
            }
            let TotalTimeOfDay = attendance.totalTimeOfDay;

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

                        attendance.timeOfSession = diffMins / 60
                        TotalTimeOfDay += diffMins / 60;
                        attendance.statusWork = false;
                        attendance.checkOut = checkOut;
                        if (diffMins > 480) {
                            attendance.overtime = (diffMins - 480) / 60;
                        }
                    }

                }
            }
            attendance.totalTimeOfDay = TotalTimeOfDay;
            attendance.save()
            return res.redirect('/');

        })
        .catch(err => {
            console.log(err);
        })
}

//Render ra giao diện để staff check in
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

//Xử lý khi staff request check in
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
                                            totalTimeOfDay: inLeave.hours,
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

//Render ra giao diện info staff
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

//Xử lý request khi staff update thông tin 
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

//Render gia giao diện homepage
exports.getHomePage = (req, res, next) => {
    res.render('staff/homepage', {
        pageTitle: 'Staff Info',
        path: '/info'
    })
}