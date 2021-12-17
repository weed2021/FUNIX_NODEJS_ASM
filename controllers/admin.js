const Staff = require('../models/staff');


exports.getAddStaff = (req,res,next) =>{
    res.render('admin/add-staff',{
        pageTitle: 'Add Staff',
        path: '/add-staff'
    })

}

exports.postAddStaff = (req, res, next) =>{
    const name = req.body.name;
    const doB = new Date(req.body.doB);
    const salaryScale = req.body.salaryScale;
    const startDate = new Date(req.body.startDate);
    const department = req.body.department;
    const annualLeave = req.body.annualLeave;
    const image = req.body.image;
    //console.log(doB)
    const staff = new Staff({
        name: name,
        doB: doB,
        salaryScale: salaryScale,
        startDate: startDate,
        department: department,
        annualLeave: annualLeave,
        image: image
    })

    staff.save()
        .then(()=>{
            console.log('Staff created');
            res.redirect('/')
        })
        .catch(err => {
            console.log(err)
        })
}