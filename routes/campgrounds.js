const express = require('express');
const router = express.Router();
const catchAsync = require('../utils/CatchAsync'); 
const {campgroundSchema} = require('../schema.js');
const ExpressError = require('../utils/ExpressError');
const Campground = require('../models/campground'); 
const {isLoggedIn, validateCampground, isAuthor} = require('../middleware'); 
const { populate } = require('../models/campground');
const campgrounds = require('../controllers/campgrounds'); 

const multer = require('multer');
const { storage } = require('../cloudinary/index.js');
const upload = multer({ storage }); 

router.route('/')
    .get(catchAsync(campgrounds.index))
    .post(isLoggedIn,  upload.array('image'), validateCampground, catchAsync (campgrounds.createCampground));
    
router.get('/new', isLoggedIn, campgrounds.renderNewForm); 

router.route('/:id')
    .get(isLoggedIn, catchAsync (campgrounds.showCampground))
    .put(isLoggedIn, isAuthor, upload.array('image'), validateCampground, catchAsync(campgrounds.edit))
    .delete(isLoggedIn, isAuthor, catchAsync( campgrounds.delete));

router.get('/:id/edit', isLoggedIn, isAuthor, catchAsync( campgrounds.showEdit));
    

module.exports = router; 
