const Staff = require('../models/staff');
const moment = require('moment');
const Attendance = require('../models/attendance');
const Leave = require('../models/annualLeave');
const Covid = require('../models/covid');
const fileHelper = require('../util/file');

const ITEMS_PER_PAGE = 2;
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
                    if (item.workplace.includes(request, 0)) {
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
                if (att.totalTimeOfDay > 8 && att.month == month) {
                    resultsOverLack.push(att)
                }
            }
            return res.render('staff/result-search', {
                overLack: resultsOverLack,
                attendances: results,
                pageTitle: 'Result Search',
                path: '/result-search',
                isAuthenticated: req.session.isLoggedIn
            })
            //return resultsOverLack
        }

        //Lack of time Days
        else if (wildCard === "lackOfTimeDays") {
            const month = req.body.lackOfTimeDays;
            for (let att of attendances) {
                if (att.totalTimeOfDay < 8 && att.month == month) {
                    resultsOverLack.push(att)
                }
            }
            return res.render('staff/result-search', {
                overLack: resultsOverLack,
                attendances: results,
                pageTitle: 'Result Search',
                path: '/result-search',
                isAuthenticated: req.session.isLoggedIn
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
            isAuthenticated: req.session.isLoggedIn
        })
    })
        .catch(err => {
            console.log(err)
        })
}

//Render form chỉnh sửa thông tin covid
exports.getEditCovidCheck = (req, res, next) => {

    Covid.findOne({ staffId: req.session.staff._id }).then(covid => {
        const celsius = covid.bodyTemporature.celsius;
        const dateRegister = moment(covid.bodyTemporature.dateRegister).format('YYYY-MM-DD');
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
            path: '/edit-covid',
            isAuthenticated: req.session.isLoggedIn
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

    Covid.findOne({ staffId: req.session.staff._id }).then(covid => {
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
        staffId: req.session.staff._id,
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
    //Check if is manager
    if (req.session.isManager) {
        Staff.find({ managerId: req.session.staff._id })
            .then(staffs => {
                let listRecordCovidStaff = [];
                for (let staff of staffs) {
                    const promise = Covid  
                        .findOne({staffId: staff._id })
                        .populate('staffId')
                        .then(record => {
                                return record;
                        })
                        .catch(err => { console.log(err) })  
                    listRecordCovidStaff.push(promise)
                }
                Promise.all(listRecordCovidStaff).then(result =>{
                    return res.render('staff/covid', {
                        listRecord: result,
                        pageTitle: 'Covid Info',
                        path: '/covid',
                    })
                })
                
            })
            .catch(err => { console.log(err) })           
    } 
    //Check if is staff
    else {
        Covid.findOne({ staffId: req.session.staff._id }).then(covid => {
            //If already have record
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
                    path: '/covid',
                    isAuthenticated: req.session.isLoggedIn
                })
            } 
            //If dont have record, then re-render to add record covid
            else {
                res.render('staff/edit-covid', {
                    pageTitle: 'Add covid info',
                    path: '/edit-covid',
                    edit: false
                })
            }

        })
    }


}

//Xử lý khi staff gửi request xem lương của tháng
exports.postSalary = (req, res, next) => {

    const salaryScale = req.session.staff.salaryScale; //Scare of salary

    Attendance.find({staffId: req.session.staff._id, month: parseInt(req.body.month) })
        .then(attendances => {
            let sumTimeMonth = 0;
            let overtime = 0;
            let lackOfHours = 0;
            for (let attendance of attendances) {
                sumTimeMonth += attendance.totalTimeOfDay;
            }

            //Đoạn này do làm biếng nhập data nên chỉ tính 2 ngày là đủ 1 tháng. 
            //2 ngày = 16h
            if (sumTimeMonth < 16) {
                lackOfHours = 16 - sumTimeMonth;
            } else if (sumTimeMonth > 16) {
                overtime = sumTimeMonth - 16;
            } else {
                sumTimeMonth = 0;
                overtime = 0;
            }

            //If a month without work any day. Salary is Zero
            if (sumTimeMonth === 0) {
                return res.render('staff/salary', {
                    month: req.body.month,
                    salary: 0,
                    pageTitle: 'Salary',
                    path: '/postSalary',
                    isAuthenticated: req.session.isLoggedIn
                })
            }

            //Công thức tính lương
            const salary = 3000000 * salaryScale + (overtime - lackOfHours) * 200000;
            
            return res.render('staff/salary', {
                month: req.body.month,
                salary: salary,
                pageTitle: 'Salary',
                path: '/postSalary',
                isAuthenticated: req.session.isLoggedIn
            })
        })

}

//Xử lý render Thông tin giờ làm việc
exports.getWorkInfo = (req, res, next) => {
    //Pagination
    const page = + req.query.page || 1;
    let totalItems;

    Attendance.find({ staffId: req.session.staff._id })
        .countDocuments()
        .then(numItems => {
            totalItems = numItems;
            return Attendance.find({ staffId: req.session.staff._id })
                .skip((page - 1) * ITEMS_PER_PAGE)
                .limit(ITEMS_PER_PAGE)
        })
        .then(attendances => {
            Staff.findById(req.session.staff.managerId)
                .then(manager => {
                    return res.render('staff/workInfo', {
                        manager: manager,
                        attendances: attendances,
                        pageTitle: 'Work Info',
                        path: '/workInfo',
                        isAuthenticated: req.session.isLoggedIn,
                        currentPage: page,
                        hasNextPage: page * ITEMS_PER_PAGE < totalItems,
                        hasPreviousPage: page > 1,
                        nextPage: page + 1,
                        previousPage: page - 1,
                        lastPage: Math.ceil(totalItems / ITEMS_PER_PAGE)
                    })
                })
                .catch(err => {
                    console.log(err)
                })
        })
        .catch(err => {
            console.log(err)
        })
}


//Xử lý khi staff gửi request muốn nghỉ phép
exports.postAnnualLeave = (req, res, next) => {
    const dayLeaveRequest = parseFloat(req.body.hoursLeave / 8);
    if (dayLeaveRequest > req.session.staff.annualLeave) {
        res.render('errMess', {
            pageTitle: 'Invalid request',
            errMess: 'Your annual leave is not valid',
            path: '/err'
        })
    } else {
        const leaveDate = new Date(req.body.leaveDate);
        const reason = req.body.reason;
        const hours = req.body.hoursLeave;
        const staffId = req.session.staff._id;
        const leave = new Leave({
            leaveDate: leaveDate,
            reason: reason,
            hours: hours,
            staffId: staffId
        })

        leave.save()

        const annualLeave = req.session.staff.annualLeave;
        const daysRemain = annualLeave - dayLeaveRequest;


        Staff.findById(req.session.staff._id)
            .then(staff =>{
                staff.annualLeave = daysRemain;
                staff.save()
            })
            .catch(err => {
                console.log(err)
            })  
        return res.redirect('/')
    }
}

//Render ra html để đăng ký nghỉ phép
exports.getAnnualLeave = (req, res, next) => {
    res.render('staff/annualLeave', {
        pageTitle: 'Annual Leave',
        remainLeave: req.session.staff.annualLeave,
        path: '/annualLeave'
    })
}

//Xử lý khi staff request check out
exports.postCheckOutAttendance = (req, res, next) => {
    const checkOut = req.body.checkOut;

    //Lọc qua các record của Attendance collection với điều kiện
    Attendance.findOne({ statusWork: true,staffId: req.session.staff._id })
        .then(attendance => {

            //Nếu ko tồn tại record thì chưa check In
            if (!attendance) {
                return res.render('errMess', {
                    pageTitle: 'Invalid Checkout',
                    errMess: 'You need to check in first!',
                    path: '/err'
                })
            }

            //Tính tổng thời gian từ lúc check out
            let TotalTimeOfDay = attendance.totalTimeOfDay;

            // Chuyển trạng thái làm việc của record ngày đó thành false
            attendance.statusWork = false;


            const items = attendance.items;
            //Lọc vào trong các phiên làm việc của record ngày
            for (let attendance of items) {
                if (attendance.statusWork === true) {
                    //Ignore if checkOut in other day
                    // const dayOfCheckIn = attendance.checkIn.getDate();
                    // const dayOfCheckOut = new Date(checkOut).getDate();

                    // if (dayOfCheckIn != dayOfCheckOut) {

                    //     attendance.remove()
                    //     res.render('errMess', {
                    //         pageTitle: 'Error Check Out',
                    //         errMess: 'You expired check out. Because check in and check out in different days. Your time work will be ignore. You need to check in again. Please careful in next time.',
                    //         path: '/err',
                    //         isAuthenticated: req.session.isLoggedIn
                    //     })
                    // } else {

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
            attendance.totalTimeOfDay = TotalTimeOfDay;
            attendance.save()

            //Chuyển trạng thái session
            req.session.isWorking = false;
            req.session.save();
            return res.redirect('/');
        })
        .catch(err => {
            console.log(err);
        })
}

//Render ra giao diện để staff check in
exports.getCheckInAttendance = (req, res, next) => {
    const staffId = req.session.staff._id;
    Staff.findById(staffId)
        .then(staff => {
            Attendance.findOne({ staffId: staffId, statusWork: true })
                .then(attendance => {
                    if (attendance) {
                        const checkIn = attendance.items.find(att => {
                            return att.statusWork === true;
                        })
                        return res.render('staff/attendanceCheckIn', {
                            checkIn: moment(checkIn.checkIn).format('LT'),
                            workplace: checkIn.workplace,
                            staff: staff,
                            pageTitle: 'Check In',
                            path: '/attendanceCheckIn',
                            isWorking: req.session.isWorking
                        })
                    }
                    return res.render('staff/attendanceCheckIn', {
                        staff: staff,
                        pageTitle: 'Check In',
                        path: '/attendanceCheckIn',
                        isWorking: req.session.isWorking
                    })
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

    Attendance.findOne({staffId: req.session.staff._id, statusWork: true })
        .then(atd => {
            if (atd) {
                return res.redirect('/err');
            } else {
                Attendance.findOne({staffId: req.session.staff._id, day: new Date(checkIn).getDate() })
                    .then(attendance => {
                        if (attendance) {
                            Leave.find()
                                .then(leaves => {
                                    //If checkin day coincedence with annualLeave day
                                    const inLeave = leaves.find(leave => {
                                        return new Date(leave.leaveDate).getDate() === new Date(checkIn).getDate();
                                    });
                                    if (inLeave) {
                                        const updatedItems = {
                                            checkIn: checkIn,
                                            checkOut: checkOut,
                                            workplace: workplace,
                                            statusWork: statusWork,
                                        }
                                        attendance.items.push(updatedItems)
                                        attendance.statusWork = true;
                                        attendance.annualLeave = inLeave.hours;
                                        attendance.save()

                                        req.session.isWorking = true;
                                        req.session.save();

                                        // Start render back to checkIn page
                                        const staffId = req.session.staff._id;
                                        Staff.findById(staffId)
                                            .then(staff => {
                                                Attendance.findOne({ staffId: staffId, statusWork: true })
                                                    .then(attendance => {
                                                        const checkIn = attendance.items.find(att => {
                                                            return att.statusWork === true;
                                                        })

                                                        res.render('staff/attendanceCheckIn', {
                                                            checkIn: moment(new Date(checkIn.checkIn)).format('L'),
                                                            workplace: checkIn.workplace,
                                                            staff: staff,
                                                            pageTitle: 'Check In',
                                                            path: '/attendanceCheckIn',
                                                            isWorking: req.session.isWorking
                                                        })
                                                    })
                                                    .catch(err => {
                                                        console.log(err);
                                                    })
                                            })
                                            .catch(err => {
                                                console.log(err);
                                            })
                                        // End render back to checkIn page
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

                                        req.session.isWorking = true;
                                        req.session.save();

                                        const staffId = req.session.staff._id;
                                        Staff.findById(staffId)
                                            .then(staff => {
                                                Attendance.findOne({ staffId: staffId, statusWork: true })
                                                    .then(attendance => {
                                                        const checkIn = attendance.items.find(att => {
                                                            return att.statusWork === true;
                                                        })
                                                        res.render('staff/attendanceCheckIn', {
                                                            checkIn: moment(checkIn.checkIn).format('LT'),
                                                            workplace: checkIn.workplace,
                                                            staff: staff,
                                                            pageTitle: 'Check In',
                                                            path: '/attendanceCheckIn',
                                                            isWorking: req.session.isWorking
                                                        })
                                                    })
                                                    .catch(err => {
                                                        console.log(err);
                                                    })
                                            })
                                            .catch(err => {
                                                console.log(err);
                                            })
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
                                            staffId: req.session.staff,
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
                                            staffId: req.session.staff,
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
    const staff = req.session.staff

    res.render('staff/info', {
        name: staff.name,
        email: req.session.staff.email,
        doB: moment(staff.doB).format('L'),
        salaryScale: staff.salaryScale,
        startDate: moment(staff.startDate).format('L'),
        department: staff.department,
        annualLeave: staff.annualLeave,
        department: staff.department,
        image: staff.image,
        id: staff._id,
        pageTitle: 'Staff Info',
        path: '/info',
        isAuthenticated: req.session.isLoggedIn
    })

}

//Xử lý request khi staff update thông tin 
exports.postStaff = (req, res, next) => {
    
    const updatedImage = req.file;

    Staff.findById(req.session.staff._id)
        .then(staff => {
            if(updatedImage){
                fileHelper.deleteFile(staff.image);
                staff.image = updatedImage.path;       
            }
            return staff.save()      
        })
        .then(() => {
            Staff.findById(req.session.staff._id).then(staff =>{
                req.session.staff = staff;
                return req.session.save();
            })   
        })
        .then(()=>{
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
        path: '/info',
        isAuthenticated: req.session.isLoggedIn
    })
}