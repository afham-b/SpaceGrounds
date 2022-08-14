const User = require('../models/user'); 

module.exports.renderRegister = (req, res) => {
    res.render('users/register');
}; 

module.exports.register = async (req, res) => {
    try{ 
        const {username, email, password } = req.body; 
        const user = new User( {email, username}); 
        // the .register function comes from the Passport-local-mongoose we require in our user model 
        const registeredUser = await User.register(user, password); 
        //so we can automatically login in the user after succesful registration
        req.login(registeredUser, err => {
            if(err) return next (err); 
            req.flash('sucess', 'Welcome to Space Grounds!'); 
            res.redirect('/campgrounds'); 
        }); 
        //console.log(registeredUser); 
    } catch(e) {
        req.flash('error', e.message); 
        res.redirect('/register'); 
    }
}

module.exports.renderLogin = (req, res) => {
    res.render('users/login'); 
}

module.exports.login = async (req, res) => {
    req.flash('sucess', 'welcome back!'); ''
    const redirectUrl = req.session.returnTo || '/campgrounds'; 
    delete req.session.returnTo; 
    res.redirect(redirectUrl); 
}

module.exports.logout = (req, res, next) => {
    //PassportJS requires that we pass it a function
    req.logOut(function(err) {
      if (err) { return next(err); }
      req.flash('sucess', "Succesfully Logged Out");
      res.redirect('/campgrounds');
    });
  }