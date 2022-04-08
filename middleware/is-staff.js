//Nếu là staff mới được vào
module.exports = (req,res,next) =>{
    if(req.session.isManager){
        return res.redirect('/');
    }
    next();
}