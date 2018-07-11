// Require the Express Module
var express = require('express');

var session = require('express-session');
// Create an Express App
var app = express();
app.use(session({
    secret: 'keyboardkitteh',
    resave: false,
    saveUninitialized: true,
    cookie: { maxAge: 60000 }
}));
// Require body-parser (to receive post data from clients)
var bodyParser = require('body-parser');
// Integrate body-parser with our App
app.use(bodyParser.urlencoded({ extended: true }));
// Require path
var path = require('path');
// Setting our Static Folder Directory
app.use(express.static(path.join(__dirname, './static')));
// Setting our Views Folder Directory
app.set('views', path.join(__dirname, './views'));
// Setting our View Engine set to EJS
app.set('view engine', 'ejs');
//DATABASE/MONGOOSE

const flash = require('express-flash');
app.use(flash());

var mongoose = require('mongoose');

mongoose.connect('mongodb://localhost:27017/intro',{useNewUrlParser:true});

// Use native promises
mongoose.Promise = global.Promise;

//make schema
var UserSchema = new mongoose.Schema({
    name:String,
    age: Number
});

var QuoteSchema = new mongoose.Schema({
    name:{type: String, required:true, minlength:2},
    text: {type:String,required:true, minlength:5}
},{timestamps:true});

mongoose.model('Quote',QuoteSchema);

//var User = mongoose.model('User');

var Quote = mongoose.model('Quote');

// Routes
// Root Request
app.get('/', function(req, res) {
    var quotes = [];
    Quote.find({}, function(err, quotesDB) {
       if(err){
        console.log("ERROR");
        quotes.push("error");
       }
       else{
        console.log("found users");
        //console.log(quotesDB);
        for (quote in quotesDB){
            //console.log(quote);
            quotes.push(quotesDB[quote]);
        }
        //console.log(quotes);
       }
       console.log("SERVER::",quotes);
       res.render('quotes.ejs',{quotes:quotes});
    });
});
// Add User Request 
app.post('/quotes', function(req, res) {
    console.log("POST DATA:: ", req.body);
    // This is where we would add the user from req.body to the database.

    var quote = new Quote({name: req.body.name, text: req.body.text});
    console.log(quote);
    // Try to save that new user to the database (this is the method that actually inserts into the db) and run a callback function with an error (if any) from the operation.
    quote.save(function(err) {
        // if there is an error console.log that something went wrong!
        if(err) {
            console.log('something went wrong');
            console.log(err.errors);
            for (var key in err.errors){
                req.flash('registration', err.errors[key].message);
            }

        } 
        else{ // else console.log that we did well and then redirect to the root route
            console.log('successfully added a user!');
        }
    })
    res.redirect('/');
});
app.listen(8000, function() {
    console.log("listening on port 8000");
})