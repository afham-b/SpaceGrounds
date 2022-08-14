const { cloudinary } = require('../cloudinary');
const Campground = require('../models/campground'); 

const mbxGeocoding = require("@mapbox/mapbox-sdk/services/geocoding");
const mapBoxToken = process.env.MAPBOX_TOKEN;
const geocoder = mbxGeocoding({ accessToken: mapBoxToken });

module.exports.index = async (req,res) => {
    const campgrounds = await Campground.find({}); 
    res.render('campgrounds/index', {campgrounds}); 
}

module.exports.renderNewForm =  (req,res) => {
    res.render('campgrounds/new'); 
}

module.exports.createCampground = async(req,res, next) => {
    const geoData = await geocoder.forwardGeocode({
        query: req.body.campground.location, 
        limit: 1
    }).send(); 
    console.log(geoData.body.features[0].geometry.coordinates); 
    //if (!req.body.campground) throw new ExpressError('Ivalid Campground Data', 400); 
    //we use req.body.campground because our name value in our new.ejs 
    // uses campground[title] & campground[location]
    //whenever using this bracket style for names, we use req.body.object
    const campground = new Campground(req.body.campground);
    campground.geometry = geoData.body.features[0].geometry; 
    //the map function takes that array and copies it to the object f, 
    //then we can assign url and filename to be from that array from req.file, which is the image 
    campground.images= req.files.map( f => ({ url: f.path, filename: f.filename})); 
    campground.author = req.user._id; 
    await campground.save();
    console.log(campground); 
    req.flash('success', 'succesfully made a new spaceground'); 
    res.redirect(`/campgrounds/${campground._id}`)
}

module.exports.showCampground = async (req,res) => {
    //to get the id from the link, we use req.params.id
    const campground = await Campground.findById(req.params.id).populate({
        path: 'reviews',
        populate: {
            path: 'author' 
        } 
    }).populate('author');
    if( ! campground ) {
        req.flash('error', "Couldn't Find that Campground :( "); 
        return res.redirect('/campgrounds');
    }
    //console.log(campground); 
    res.render('campgrounds/show', {campground}); 
}

module.exports.showEdit = async (req,res) => {
    const { id } = req.params; 
    const campground = await Campground.findById(id);
    if( ! campground ) {
        req.flash('error', "Couldn't Find that Campground :( "); 
        return res.redirect('/campgrounds');
    }
    res.render('campgrounds/edit', {campground}); 
}

module.exports.edit= async (req,res) => {
    const { id } = req.params; 
    //console.log(req.body); 
    const campground = await Campground.findByIdAndUpdate(id, {...req.body.campground}); 
    const imgs = req.files.map( f => ({ url: f.path, filename: f.filename})); 
    campground.images.push(...imgs); //spread operator 
    await campground.save(); 
    
    if(req.body.deleteImages){ 
        for(let filename of req.body.deleteImages) {
            await cloudinary.uploader.destroy(filename); 
        }
        await campground.updateOne({ $pull: {images: {filename: {$in: req.body.deleteImages}}}}); 
        //console.log(campground); 
    }
    
    req.flash('sucess', 'Succesfully Edited a spaceground'); 
    res.redirect(`/campgrounds/${campground._id}`);
}

module.exports.delete = async (req,res)=> {
    const {id} = req.params; 
    await Campground.findByIdAndDelete(id); 
    req.flash('success', 'Succesfully Deleted a spaceground'); 
    res.redirect('/campgrounds'); 
}

