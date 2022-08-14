const {campgroundSchema} = require('./schema.js');
const ExpressError = require('./utils/ExpressError');
const Campground = require('./models/campground'); 

const {reviewSchema} = require('./schema.js');
const Review = require('./models/review');
const review = require('./models/review');

module.exports.isLoggedIn= (req, res, next ) => {
    console.log('Req.user...', req.user); 
    if (!req.isAuthenticated()) {
        req.session.returnTo = req.originalUrl; 
        req.flash('error', 'You must be signed in to To View or Create a Space Ground');
        return res.redirect('/login'); 
    }
    next(); 
}

module.exports.validateCampground = (req,res, next) => {
    const {error} = campgroundSchema.validate(req.body);
    if (error){
        const msg = error.details.map( el => el.message).join(', ')
        throw new ExpressError(msg, 400);
    } else {next(); }  
} 

module.exports.isAuthor = async(req, res, next) => {
    const { id } = req.params; 
    const campground = await Campground.findById(id); 
    if (!campground.author.equals(req.user._id)) {
        req.flash('error', 'You do not have permission!');
        return res.redirect(`/campgrounds/${id}`); 
    }
    next(); 
}

module.exports.validateReview = (req,res, next) => {
    const {error} = reviewSchema.validate(req.body); 
    if(error){
        const msg = error.details.map( el => el.message).join(', ')
        throw new ExpressError(msg, 400);
    } else {next();}  
} 

module.exports.isReviewAuthor = async(req, res, next) => {
    //review id will get use id of the review, not the campground id
    // id here is campground id, which we need for the redirect 
    const { id , reviewId } = req.params; 
    const review = await Review.findById(reviewId); 
    if (!review.author.equals(req.user._id)) {
        req.flash('error', 'You do not have permission!');
        return res.redirect(`/campgrounds/${id}`); 
    }
    next(); 
}
