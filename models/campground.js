const mongoose = require('mongoose');
const Review = require('./review'); 
const Schema = mongoose.Schema;

const ImageSchema = new Schema({
    url: String,
    filename: String
});

ImageSchema.virtual('thumbnail').get(function () {
    return this.url.replace('/upload', '/upload/w_200');
});

const opts = {toJSON: {virtuals: true}};

const CampgroundSchema = new Schema ( {
    title: String,
    images: [ImageSchema], 
    geometry: {
        type: {
          type: String, // Don't do `{ location: { type: String } }`
          enum: ['Point'], // 'location.type' must be 'Point'
          required: true
        },
        coordinates: {
          type: [Number],
          required: true
        }
      }, 
    price: Number,
    description: String, 
    location: String,
    author: {
        type: Schema.Types.ObjectId,
        ref: 'User'
    },
    reviews: [{
        type: Schema.Types.ObjectId,   //connect to reviews id
        ref: 'Review'   //connect specifally to objects in the review model
    }]
}, opts);

CampgroundSchema.virtual('properties.popUpMarkup').get(function() {
    return `<strong><a href="/campgrounds/${this._id}"> ${this.title} </a><strong>
    <p>${this.description.substring(0,20)}...</p>`; 
});

CampgroundSchema.post('findOneAndDelete', async function(doc) {
    if(doc) { //if there is something that gets deleted
        await Review.deleteMany({ //them we remove the reviews with these ids 
            _id: { //the id array 
                $in: doc.reviews //the $in operator gets the ids from the review attribute of the doc object
            }
        })
    }
})

module.exports = mongoose.model('Campground', CampgroundSchema); 
//mongoose.model() actually complies the schema 
