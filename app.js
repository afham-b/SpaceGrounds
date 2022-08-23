if (process.env.NODE_ENV !== "production") {
    require('dotenv').config();
}

const express = require('express');
const app = express();
const path = require('path');
const methodOverride = require('method-override'); 
const mongoose = require('mongoose');  
const ejsMate = require('ejs-mate');  
const ExpressError = require('./utils/ExpressError'); 

const session = require('express-session'); 
const flash = require('connect-flash'); 

const passport = require('passport');
const LocalStrategy = require('passport-local'); 
const User = require('./models/user'); 

//campgrounds routes 
const campgroundsRoutes = require('./routes/campgrounds'); 
const reviewRoutes = require('./routes/reviews'); 

const mongoSanitize = require('express-mongo-sanitize'); 
const helmet = require('helmet'); 

const MongoStore = require('connect-mongo');

//for production
//const dbUrl = process.env.DB_URL; 
//for development
//'mongodb://localhost:27017/yelp-camp'; 

//const dbUrl =  process.env.DB_URL || 'mongodb://localhost:27017/yelp-camp'; 
const dbUrl =  'mongodb://localhost:27017/yelp-camp'; 

mongoose.connect(dbUrl,{
    useNewUrlParser: true,
    //useCreateIndex: true,
    useUnifiedTopology: true,
    // useFindAndModify: false 
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

app.engine('ejs', ejsMate); 
app.set('views', path.join(__dirname,'views'));
app.set('view engine','ejs');
app.use(express.urlencoded({extended: true}));
app.use(methodOverride('_method'));
app.use(mongoSanitize()); 
app.use(helmet( { crossOriginEmbedderPolicy: false, }  )); 

const scriptSrcUrls = [
    "https://stackpath.bootstrapcdn.com/",
    "https://api.tiles.mapbox.com/",
    "https://api.mapbox.com/",
    "https://kit.fontawesome.com/",
    "https://cdnjs.cloudflare.com/",
    "https://cdn.jsdelivr.net",
    "https://code.jquery.com/",
    "http://maxcdn.bootstrapcdn.com/bootstrap/",
];
//This is the array that needs added to
const styleSrcUrls = [
    "https://kit-free.fontawesome.com/",
    "https://api.mapbox.com/",
    "https://api.tiles.mapbox.com/",
    "https://fonts.googleapis.com/",
    "https://use.fontawesome.com/",
    "https://cdn.jsdelivr.net",
    "https://stackpath.bootstrapcdn.com/",
    "https://cdn.jsdelivr.net",
    "https://cdn.jsdelivr.net",
];
const connectSrcUrls = [
    "https://api.mapbox.com/",
    "https://a.tiles.mapbox.com/",
    "https://b.tiles.mapbox.com/",
    "https://events.mapbox.com/",
];
const fontSrcUrls = [
    "https://fonts.google.com/", 
    "https://fonts.googleapis.com/",
    "https://fonts.googleapis.com/",
    "https://fonts.gstatic.com/",
];

app.use(
    helmet.contentSecurityPolicy({
        directives: {
            defaultSrc: [],
            connectSrc: ["'self'", ...connectSrcUrls],
            scriptSrc: ["'unsafe-inline'", "'self'", ...scriptSrcUrls],
            styleSrc: ["'self'", "'unsafe-inline'", ...styleSrcUrls],
            workerSrc: ["'self'", "blob:"],
            objectSrc: [],
            imgSrc: [
                "'self'",
                "blob:",
                "data:",
                "https://res.cloudinary.com/hamaf/", //SHOULD MATCH YOUR CLOUDINARY ACCOUNT! 
                "https://images.unsplash.com/",
            ],
            fontSrc: ["'self'", ...fontSrcUrls],
        },
    })
);

const secret = process.env.SECRET || '3122'; 
//serve static assets from public folder 
app.use(express.static(path.join(__dirname, 'public'))); 

const store = MongoStore.create({
    mongoUrl: dbUrl,
    touchAfter: 24 * 60 * 60,
    crypto: {
        secret, //random code I picked 
    }
});

store.on("error", function(e) {
    Console.log("session store error", e); 
})


const sessionConfig = {
    store, 
    name: 'itsAtrap', 
    secret,
    resave: false,
    saveUninitialized: true,
    cookie: {
        httpOnly: true,  
        expires: Date.now()+ (1000*60*60*24*7), 
        //secure: true, 
        maxAge: (1000*60*60*24*7) 
    } 
}
app.use(session(sessionConfig)) ;
app.use(flash()); 

//for passport
app.use(passport.initialize());
//be sure to put this below app.use sessions
app.use(passport.session()); 
passport.use(new LocalStrategy(User.authenticate())); 

//how we identify a user when starting sessions and then ending session
passport.serializeUser(User.serializeUser());
passport.deserializeUser(User.deserializeUser()); 

app.use((req,res, next) => {
    
    //console.log(req.session); 
    //now all templates will have acces to currentUser
    res.locals.currentUser = req.user;
    res.locals.sucess = req.flash('sucess');
    res.locals.error = req.flash('error');
    next();
})


app.get('/fakeUser', async (req, res) => {
    const user = new User({email: 'Dtah@ymail.com', username: 'Danny' , });
    const newUser = await User.register(user, 'tanHa'); 
    res.send(newUser); 
})

//registration get and post rotues 
const userRoutes = require('./routes/user'); 
const { Console } = require('console');
app.use('/', userRoutes); 

app.use('/campgrounds', campgroundsRoutes); 
app.use('/campgrounds/:id/reviews', reviewRoutes); 

app.get('/', (req,res) => {
    res.render('home'); 
})


//the star means for every route we have
app.all('*',(req, res, next) => {
    next( new ExpressError('Page Not Found',404)); 
}); 
 
app.use((err,req,res,next)=> {
    const {statusCode = 500} = err; 
    if (!err.message) {err.message = 'Oh No! Something Broke :/' };  
    res.status(statusCode).render('error',{err});
})

const port = process.env.PORT || 3000; 
app.listen(port, () => {
    console.log(`App Listening on ${port}`);
})

