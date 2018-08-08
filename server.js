var express = require("express");
var bodyParser = require("body-parser");
var mongoose = require("mongoose");
var cheerio = require("cheerio");
var request = require("request");

// Setting up port and requiring models for syncing
var PORT = process.env.PORT || 3000;
var db = require("./models");

// Creating express app and configuring middleware needed for authentication
var app = express();
// Configure middleware
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());
app.use(express.static("public"));

// Handlebars
// Set Handlebars.
var exphbs = require("express-handlebars");

app.engine("handlebars", exphbs({ defaultLayout: "main" }));
app.set("view engine", "handlebars");

// If deployed, use the deployed database. Otherwise use the local mongoHeadlines database
var MONGODB_URI = process.env.MONGODB_URI || "mongodb://localhost:27017/newsScraper";

// Set mongoose to leverage built in JavaScript ES6 Promises
// Connect to the Mongo DB
mongoose.Promise = Promise;
mongoose.connect(MONGODB_URI, { useNewUrlParser: true });

// Scrape for articles
app.get("/scrape", (req, res) => {

    request("https://www.huffingtonpost.com/topic/funny", (err, response, html) => {

        // Load the HTML into cheerio and save it to a variable
        // '$' becomes a shorthand for cheerio's selector commands, much like jQuery's '$'
        var $ = cheerio.load(html);

        // Now, we grab every h2 within an article tag, and do the following:
        $(".card__content").each((i, element) => {
            // Save an empty result object
            var result = {};

            var img = $(element).find(".card__image__src").attr("src");
            if (img) img = img.split(",")[0];

            result.title = $(element).find(".card__headline__text").text().replace(/\n/g, '');
            result.body = $(element).find(".card__link").text().replace(/\n/g, '');
            result.link = "https://www.huffingtonpost.com" + $(element).find(".card__image__wrapper").attr("href");
            result.img = img;

            // Create a new Article using the `result` object built from scraping
            db.Article.create(result)
                .then(dbArticle => console.log(dbArticle))
                .catch(err => res.json(err));
        });

        res.send("Scrape Complete")
    });
});

// 





// Start the server
app.listen(PORT, () => console.log("App running on port " + PORT + "!"));