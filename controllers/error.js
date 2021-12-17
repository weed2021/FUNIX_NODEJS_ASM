exports.get404 = (req, res, next) => {
    res
        .status(404)
        .render('errMess',
            {
                pageTitle: 'Page not found'
                , errMess: 'Page Not Found'
                , path: '404'
            });
}

exports.getCheckIn = (req, res, next) => {
    res.render('errMess', {
        pageTitle: 'Err Check In', 
        errMess: 'Please check out before do that!', 
        path: '/err'
    })
}