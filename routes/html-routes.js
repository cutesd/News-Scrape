
const cheerio = require("cheerio");
const request = require("request");
const db = require("../models");

module.exports = function (app) {

    // get main index
    app.get("/", (req, res) => {
        db.Article.find()
            .then(dbArticles => res.render("index", {
                articles: dbArticles,
                rndNum: Math.floor(Math.random() * 5) + 1,
                helpers: {
                    ifArticles: function (arr, options) {
                        if (arr.length > 0) {
                            return options.fn(this);
                        }
                        return options.inverse(this);
                    }
                }
            }))
            .catch(err => res.json(err));

    });


    // get saved page
    app.get("/saved", (req, res) => {
        db.Article.find({ saved: true })
            .then(dbArticles => res.render("saved", {
                articles: dbArticles,
                rndNum: Math.floor(Math.random() * 5) + 1,
                helpers: {
                    ifArticles: function (arr, options) {
                        if (arr.length > 0) {
                            return options.fn(this);
                        }
                        return options.inverse(this);
                    }
                }
            }))
            .catch(err => res.json(err));

    });

    // Scrape for articles
    app.get("/scrape", (req, res) => {

        request("https://www.huffingtonpost.com/topic/funny", (err, response, html) => {

            // Load the HTML into cheerio and save it to a variable
            // '$' becomes a shorthand for cheerio's selector commands, much like jQuery's '$'
            const $ = cheerio.load(html);

            // Now, we grab every h2 within an article tag, and do the following:
            $(".card__content").each((i, element) => {
                // Save an empty result object
                let result = {};

                let img = $(element).find(".card__image__src").attr("src");
                if (img) img = img.split(",")[0];

                result.title = $(element).find(".card__headline__text").text().replace(/\n/g, '');
                result.body = $(element).find(".card__link").text().replace(/\n/g, '');
                result.link = "https://www.huffingtonpost.com" + $(element).find(".card__image__wrapper").attr("href");
                result.img = img;

                // Create a new Article using the `result` object built from scraping
                db.Article.create(result)
                    .then(dbArticle => console.log("article saved"))
                    .catch(err => res.json(err));
            });

            res.send("Scrape Complete")
        });
    });


};