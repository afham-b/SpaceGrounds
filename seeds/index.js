const mongoose = require('mongoose');  
const Campground = require('../models/campground'); 
const { places, descriptors } = require('./seedHelpers');// link seed file for random description 
const cities = require('./cities');//links the city seed file 
const axios = require('axios'); 

mongoose.connect('mongodb://localhost:27017/yelp-camp',{
    useNewUrlParser: true,
    //useCreateIndex: true,
    useUnifiedTopology: true
}).
    then( () => {
        console.log("Mongo connection Open")
    }).
    catch( err=> {
        console.log("Mongo Connection Error")
        console.log(err);
    })

const db = mongoose.connection;
db.on("error", console.error.bind(console,"connection error"));
db.once("open", () => {
    console.log("Database Connected."); 
});

const sample = array => array[Math.floor(Math.random() * array.length)]; 


 // call unsplash and return small image
 async function seedImg() {
    try {
      const resp = await axios.get('https://api.unsplash.com/photos/random', {
        params: {
          client_id: 'wrLowLCXEmVpkiceqLlK2SALuY7hOu_VHSfo_0jpJPA',
          collections: 8666820,
        },
      })
      return resp.data.urls.small
    } catch (err) {
      console.error(err)
    }
  }


const seedDB= async ()=> {
    await Campground.deleteMany({}); 
    
    for( let i= 0; i<200; i++){
        const randomNum = Math.floor(Math.random()*1000)+1; 
        const price = Math.floor(Math.random()*20) +10; 
        const camp = new Campground({
            author: '62e1a93fb2e5d4284c1a2bdc',
            location: `${cities[randomNum].city},${cities[randomNum].state}`, 
            //randomly selects city,state
            title: `${sample(descriptors)} ${sample(places)}` ,
            //randomy combines a descroption and place for a name 
            //image: await seedImg(),
            //uses random image from an unsplash photo collection 
            description: 'Lorem ipsum dolor sit amet consectetur, adipisicing elit. Dolorum assumenda blanditiis corrupti culpa alias libero quasi. Veritatis possimus dolorem dignissimos vitae aut eum quos. Rem necessitatibus iure nostrum quam similique.',
            price, 
            geometry: {
              type: "Point",
              coordinates: [
                  cities[randomNum].longitude,
                  cities[randomNum].latitude,
              ]
            },
            images: [ 
              {
                url: 'https://res.cloudinary.com/hamaf/image/upload/v1660084947/YelpCamp/xh4frjjelzinpnzelrnm.jpg',
                filename: 'YelpCamp/xh4frjjelzinpnzelrnm'
              }
            ]
        })
        await camp.save(); 
    }
}

seedDB().then(() => {
    mongoose.connection.close();
    console.log('connection closed');
}) //closes the mongodb conenction 