require("dotenv").config()  // Load env variables
const express = require('express') // bring in express to make our app
const morgan = require('morgan') // nice logger for our request
const methodOverride = require('method-override') // allows us to override post request from our ejs/forms
const mongoose = require('mongoose') // gives us that db connection and cool methods for CRUD to the datas
const PORT = process.env.PORT

const app = express()

//////////////////////////////////////////////
//////// Database Connections
///////////////////////////////////////////////


// Setup inputs for our connect function
const DATABASE_URL = process.env.DATABASE_URL
const CONFIG = {
    useNewUrlParser: true,
    useUnifiedTopology: true
}

//Establish our connections
mongoose.connect(DATABASE_URL, CONFIG)

// Log connections events from mongoose
mongoose.connection
    .on('open', () => console.log('Mongoose connected'))
    .on('close', () => console.log('Disconnected from Mongoose'))
    .on('error', (error) => console.log('Mongoose error', error))



//////////////////////////////////////////////
//////// Fruits Model
///////////////////////////////////////////////

const { Schema, model } = mongoose

// make fruits schema
const fruitsSchema = new Schema({
    name: String,
    color: String,
    readyToEat: Boolean
})

// make fruit model
const Fruit = model('Fruit', fruitsSchema)



/////////////////////////////////////////////////////
// Middleware
/////////////////////////////////////////////////////
app.use(morgan('tiny')) //logging
app.use(methodOverride('_method')) // override for put and delete requests from forms
app.use(express.urlencoded({ extended: true })) // parse urlencoded request bodies
app.use(express.static('public')) // serve files from public statically


////////////////////////////////////////////
// Routes
////////////////////////////////////////////
app.get('/', (req, res) => {
    res.send('your server is running... better catch it.')
})

app.get('/fruits/seed', (req, res) => {

    // array of starter fruits
    const starterFruits = [
        { name: 'Orange', color: 'orange', readyToEat: false },
        { name: 'Grape', color: 'purple', readyToEat: true },
        { name: 'Banana', color: 'orange', readyToEat: false },
        { name: 'Strawberry', color: 'red', readyToEat: true },
        { name: 'Coconut', color: 'brown', readyToEat: false },
    ]

    // Delete all fruits
    Fruit.deleteMany({}, (err, data) => {
        // Seed Starter Fruits
        Fruit.create(starterFruits, (err, createdFruits) => {
            // send created fruits as response to confirm creation
            res.json(createdFruits);
        }
        );
    });
});

app.get('/fruits', (req, res) => {
    // get all fruits from mongo and send them back
    Fruit.find({})
        .then((fruits) => {
            // res.json(fruits)
            res.render('fruits/index.ejs', { fruits })
        })
        .catch(err => console.log(err))
})

// new route
app.get("/fruits/new", (req, res) => {
    res.render("fruits/new.ejs")
})


// create route
app.post("/fruits", (req, res) => {
    // check if the readyToEat property should be true or false
    req.body.readyToEat = req.body.readyToEat === "on" ? true : false
    // create the new fruit
    Fruit.create(req.body, (err, fruit) => {
        // redirect the user back to the main fruits page after fruit created
        res.redirect("/fruits")
    })
})


// edit route
app.get("/fruits/:id/edit", (req, res) => {
    // get the id from params
    const id = req.params.id
    // get the fruit from the database
    Fruit.findById(id, (err, fruit) => {
        // render template and send it fruit
        res.render("fruits/edit.ejs", { fruit })
    })
})


//update route
app.put("/fruits/:id", (req, res) => {
    // get the id from params
    const id = req.params.id
    // check if the readyToEat property should be true or false
    req.body.readyToEat = req.body.readyToEat === "on" ? true : false
    // update the fruit
    Fruit.findByIdAndUpdate(id, req.body, { new: true }, (err, fruit) => {
        // redirect user back to main page when fruit 
        res.redirect("/fruits")
    })
})


// delete route
app.delete("/fruits/:id", (req, res) => {
    // get the id from params
    const id = req.params.id
    // delete the fruit
    Fruit.findByIdAndRemove(id, (err, fruit) => {
        // redirect user back to index page
        res.redirect("/fruits")
    })
})



app.get('/fruits/:id', (req, res) => {
    // go and get the fruit from the database
    Fruit.findById(req.params.id)
        .then((fruit) => {
            res.render('fruits/show.ejs', { fruit })
        })
})

////////////////////////////////////////////
// Server Listener
////////////////////////////////////////////
app.listen(PORT, () => console.log(`Who let the dogs out on port: ${PORT}`))