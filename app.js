const path = require('path');
const express = require('express');
const bodyParser = require('body-parser');
const app = express();
const staffRoutes = require('./routes/staff');
const adminRoutes = require('./routes/admin');
const authRoutes = require('./routes/auth');
const errorController = require('./controllers/error');
const mongoose = require('mongoose');
const session = require('express-session');
const MongoDBStore = require('connect-mongodb-session')(session); //Happen to yield a constructor
const MONGODB_URI = 'mongodb+srv://funix:funix@cluster0.xox99.mongodb.net/NodeJs_ASM1?retryWrites=true&w=majority';
const csrf = require('csurf');
const multer = require('multer');

const store = new MongoDBStore({
    uri: MONGODB_URI,
    collection: 'sessions'
})

const csrfProtection = csrf();

app.set('view engine', 'ejs');
app.set('views', 'views');

//Config multer path and filename
const fileStorage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, 'images');
    },
    filename: (req, file, cb) => {
        cb(null, Math.random() * 1000000000 + '-' + file.originalname);
    }
});

//Filter type of image upload
const fileFilter = (req, file, cb) => {
    if (file.mimetype === 'image/jpg'
        || file.mimetype === 'image/png'
        || file.mimetype === 'image/jpeg') {
        cb(null, true)
    } else {
        cb(null, false)
    }
}

app.use(bodyParser.urlencoded({ extended: false }))
app.use(multer({ storage: fileStorage, fileFilter: fileFilter }).single('image'));
app.use(express.static(path.join(__dirname, 'public')));
app.use('/images', express.static(path.join(__dirname, 'images')));
// app.use(express.static(path.join(__dirname, 'images')));

app.use(session({
    secret: 'my secret',
    resave: false,
    saveUninitialized: false,
    store: store
}))
app.use(csrfProtection)

app.use((req, res, next) => {
    res.locals.isAuthenticated = req.session.isLoggedIn;
    res.locals.csrfToken = req.csrfToken();
    res.locals.isManager = req.session.isManager;
    next();
})


app.use(adminRoutes);
app.use(staffRoutes);
app.use(authRoutes);

app.use(errorController.get404)

mongoose.connect(MONGODB_URI)
    .then(() => {
        app.listen(3000)
        console.log('Connected!')
    })
    .catch(err => {
        console.log(err)
    })

