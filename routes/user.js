const express = require('express');
const router = express.Router( {mergeParams: true} ); 
const catchAsync = require('../utils/CatchAsync');
const passport = require('passport');
const User = require('../models/user'); 

const flash = require('connect-flash'); 
router.use(flash()); 

const users = require('../controllers/users');

router.route('/register')
    .get(users.renderRegister)
    .post(catchAsync( users.register)); 


router.route('/login')
    .get(users.renderLogin) 
    .post(passport.authenticate('local', {failureFlash: true, failureRedirect: '/login', keepSessionInfo: true}), catchAsync (users.login));

router.get('/logout', users.logout); 

module.exports = router;  