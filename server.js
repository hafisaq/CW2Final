const { ObjectId } = require('mongodb');
const express = require('express'); // calling the express
const MongoClient = require('mongodb').MongoClient;
const path = require('path')
const fs = require('fs')
const cors = require("cors");
//creating express.js instance:

const app = express() // initializing express framework
app.use(cors());
//config express.js
app.use(express.json())
app.set('port', 3000) // setting the port to 3000
app.use((req, res, next) => {
    res.setHeader('Access-Control-Allow-Origin', '*');
    next();
})

// connecting the database to the lessons_db database
let db;
MongoClient.connect('mongodb+srv://hafis:hafis123@cluster0.jrmnn1c.mongodb.net', (err, client) => {
    db = client.db('Project');
})

// logger middleware which outputs all requests to the server
let logger = (req, res, next) => {
    let current_datetime = new Date();
    let formatted_date =
        current_datetime.getFullYear() +
        "-" +
        (current_datetime.getMonth() + 1) +
        "-" +
        current_datetime.getDate() +
        " " +
        current_datetime.getHours() +
        ":" +
        current_datetime.getMinutes() +
        ":" +
        current_datetime.getSeconds();
    let method = req.method;
    let url = req.url;
    let status = res.statusCode;
    let log = `[${formatted_date}] ${method}:${url} ${status}`;
    console.log(log);
    next();
};

app.use(logger);

app.use('/images', function (req, res, next) {
    // Uses path.join to find the path where the file should be
    var filePath = path.join(__dirname, 'images', req.url);
    // Built-in fs.stat gets info about a file
    fs.stat(filePath, function (err, fileInfo) {
        if (err) {
            res.send("Image Does not Exist");
            next();
            return;
        }
        if (fileInfo.isFile()) res.sendFile(filePath);
        else next();
    })
})


// GET request for the the user enters : "localhost:3000"
app.get('/', (req, res, next) => {
    res.send('Select a collection, e.g., /collection/messages');
});

//setting up the parameters for the REST API 
app.param('collectionName', (req, res, next, collectionName) => {
    req.collection = db.collection(collectionName);
    return next();
})

// Rest API Task : GET Route to return all lessons
//Get request to GET all lessons and their information
app.get('/collection/:collectionName', (req, res, next) => {
    req.collection.find({}).toArray((e, results) => {
        if (e) return next(e)
        res.send(results);
    })
})

// REST API Task : POST route that saves a new order to the "order" collection
app.post('/collection/:collectionName', (req, res, next) => {
    req.collection.insertOne(req.body, (e, results) => {
        if (e) return next(e)
        res.send(results.ops);
    })
})

//retrieve an object by mongodb ID

app.get('/collection/:collectionName/:id', (req, res, next) => {
    req.collection.findOne(
        { _id: new ObjectID(req.params.id) },
        (e, result) => {
            if (e) return next(e)
            res.send(result);

        })
})



// REST API Task : PUT route that updates the number of available spaces in the ‘lesson’ collection
// REST API Task: PUT route that updates the number of available spaces in the ‘lesson’ collection
app.put('/collection/:collectionName/:id', (req, res) => {

    req.collection.update({ _id: new ObjectId(req.params.id) },
        { $set: req.body },
        { safe: true, multi: false },
        (e, result) => {
            if (e) return next(e)
            res.send((result = 1) ? { msg: "success" } : { msg: 'error' })
        })

});


//app.listen() binds and listens the connections on the specified host and port.
app.listen(3000, () => {
    console.log('Express.js server running at localhost:3000');
})
