const Review = require('../models/review');
const Campground = require('../models/campground'); 

module.exports.createReview = async (req, res) => {
    const campground = await Campground.findById(req.params.id);
    const review = new Review(req.body.review);
    review.author = req.user._id;
    campground.reviews.push(review);
    await review.save();
    await campground.save();
    req.flash('sucess', 'Succesfully Created a new review'); 
    res.redirect(`/campgrounds/${campground._id}`);
} 

module.exports.delete = async (req, res) => {
    //find the campground, use the pull operator to look at its reviews, and then take out that reference id
    await Campground.findByIdAndUpdate(req.params.id, {$pull:{reviews: req.params.reviewId}}); 
    await Review.findByIdAndDelete(req.params.reviewId); 
    req.flash('sucess', 'Succesfully Deleted a review'); 
    res.redirect(`/campgrounds/${req.params.id}`); 
}