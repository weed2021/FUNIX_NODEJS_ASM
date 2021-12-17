const path = require('path');
const express = require('express');
const bodyParser = require('body-parser');
const app = express();
const staffRoutes = require('./routes/staff');
const adminRoutes = require('./routes/admin');
const errorController = require('./controllers/error');
const mongoose = require('mongoose');

const Staff = require('./models/staff');

app.set('view engine', 'ejs');
app.set('views', 'views');



app.use(bodyParser.urlencoded({ extended: false }))
app.use(express.static(path.join(__dirname, 'public')));

app.use((req, res, next) => {
    Staff.findOne()
        .then(staff => {
            req.staff = staff;
            // console.log(req.staff.name);
            next();
        })
        .catch(err => {
            console.log(err);
        })
})

app.use(adminRoutes);
app.use(staffRoutes);







app.use(errorController.get404)

mongoose.connect('mongodb+srv://funix:funix@cluster0.xox99.mongodb.net/NodeJs_ASM1')
    .then(() => {
        app.listen(3000)
        console.log('Connected!')
    })
    .catch(err => {
        console.log(err)
    })

