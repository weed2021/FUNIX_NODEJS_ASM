
//Nếu là admin mới được vào
module.exports = (req,res,next) =>{
    if(!req.session.isManager){
        return res.redirect('/');
    }
    next();
}