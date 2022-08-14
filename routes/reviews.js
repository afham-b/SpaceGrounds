const express = require('express');
const router = express.Router( {mergeParams: true} ); 

const catchAsync = require('../utils/CatchAsync'); 
const {reviewSchema} = require('../schema.js');
const ExpressError = require('../utils/ExpressError');
const Campground = require('../models/campground'); 
const Review = require('../models/review');
const { validateReview, isLoggedIn, isReviewAuthor } = require('../middleware');

const reviews = require('../controllers/reviews'); 

router.post('/', isLoggedIn, validateReview, catchAsync(reviews.createReview)); 

router.delete('/:reviewId', isLoggedIn, isReviewAuthor, catchAsync( reviews.delete));  

module.exports = router; 