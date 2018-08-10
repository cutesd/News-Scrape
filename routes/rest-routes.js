const db = require("../models");


module.exports = function (app) {

    app.get("/articles", (req, res) =>
        db.Article.find()
            .then(dbArticles => res.json(dbArticles))
            .catch(err => res.json(err))
    );

    // Route for grabbing a specific Article by id, populate it with it's note
    app.get("/articles/:id", (req, res) =>
        db.Article.findById(req.params.id)
            .populate("notes")
            .then(dbArticle => res.json(dbArticle))
            .catch(err => res.json(err))
    );

    //Route for saving Article by ID
    app.put("/articles/:id", (req, res) =>
        db.Article.findByIdAndUpdate(req.params.id, { $set: { saved: req.body.saved } }, { new: true })
            .then(dbArticle => res.json(dbArticle))
            .catch(err => res.json(err))
    );

    // Route for saving/updating an Article's associated Note
    app.post("/notes/:id", (req, res) =>
        db.Note.create(req.body)
            .then(dbNote => db.Article.findByIdAndUpdate(req.params.id, {
                $push: {
                    notes: dbNote._id
                }
            }, { new: true }))
            .then(dbArticle => res.json(dbArticle))
            .catch(err => res.json(err))
    );

    // Delete note by id
    app.delete("/notes/:id", (req, res) =>
        db.Note.findByIdAndRemove(req.params.id)
            .then(dbNote => res.json(dbNote))
            .catch(err => res.json(err))
    );

    // Delete all
    app.delete("/articles/clear", (req, res) =>
        db.Note.remove({})
            .then(dbNote => db.Article.remove({})
                .then(result => res.json(result))
                .catch(err => res.json(err))
            )
    );

}