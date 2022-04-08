const bcrypt = require('bcryptjs')
const Staff = require('../models/staff')

exports.getLogin = (req, res, next) => {
    res.render('auth/login', {
        pageTitle: 'Login',
        path: '/login',
        isAuthenticated: req.session.isLoggedIn
    })
}
exports.postLogin = (req, res, next) => {
    const email = req.body.email;
    const password = req.body.password;
    
    Staff.findOne({email: email})
        .then(staff => {
            console.log(staff.email)
            if(!staff){
                return res.redirect('/login')
            }
            bcrypt.compare(password,staff.password)
                .then(doMatch =>{
                    if(doMatch){
                        req.session.isLoggedIn = true;
                        req.session.staff = staff;
                        req.session.isManager = staff.isManager;
                        return req.session.save(err => {
                            //console.log(err);
                            res.redirect('/');  
                        })      
                    }
                    return res.redirect('/login')
                })
                .catch(err => {
                    console.log(err);
                })    
        })
        .catch(err => {
            console.log(err);
        })
}

exports.postLogout = (req, res, next) => {
    req.session.destroy(err => {
        console.log(err);
        res.redirect('/');
    })
}