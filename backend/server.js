const express = require("express");
const mysql = require("mysql2");
const cors = require("cors");

const app = express();

app.use(cors());
app.use(express.json());
app.use(
    "/pdf_library",
    express.static("pdf_library")
);

const db = mysql.createConnection({
    host: "localhost",
    user: "root",
    password: "***********",
    database: "elibrary"
});

db.connect((err) => {

    if(err){

        console.log(err);

    }else{

        console.log("MySQL Connected");
    }

});


// REGISTER API

app.post("/register",(req,res)=>{

    const {name,email,password} = req.body;

    db.query(
        "SELECT * FROM users WHERE email=?",
        [email],
        (err,result)=>{

            if(err){

                console.log(err);

                return res.send(
                    "Registration Failed"
                );
            }

            if(result.length > 0){

                return res.send(
                    "Email already registered"
                );
            }

            db.query(
                "INSERT INTO users(name,email,password) VALUES(?,?,?)",
                [name,email,password],
                (err,result)=>{

                    if(err){

                        console.log(err);

                        return res.send(
                            "Registration Failed"
                        );

                    }else{

                        return res.send(
                            "Registration Successful"
                        );
                    }
                }
            );
        }
    );

});


// LOGIN API

app.post("/login", (req, res) => {

    const { username, password } = req.body;

    db.query(

        "SELECT * FROM users WHERE email = ?",

        [username],

        (err, result) => {

            if (err) {

                console.log(err);

                return res.status(500).json({
                    message: "Login Failed"
                });

            }

            if (result.length === 0) {

                return res.json({
                    message: "User Not Found"
                });

            }

            const user = result[0];

            if (user.password === password) {

                return res.json({

                    message: "Login Successful",

                    userId: user.id,

                    userName: user.name,

                    email: user.email

                });

            }

            return res.json({
                message: "Incorrect Password"
            });

        }

    );

});

app.get("/categories", (req, res) => {

    db.query(
        "SELECT * FROM categories",
        (err, result) => {

            if(err){
                console.log(err);
                return res.status(500).send("Database Error");
            }

            res.json(result);

        }
    );

});

app.get("/categories/:id/pdfs", (req, res) => {

    const categoryId = req.params.id;

    db.query(

        `SELECT *
         FROM pdfs
         WHERE category_id = ?`,

        [categoryId],

        (err, result) => {

            if(err){

                console.log(err);

                return res.status(500).send(
                    "Database Error"
                );

            }

            res.json(result);

        }

    );

});

app.get("/contributors", (req, res) => {

    db.query(
        "SELECT DISTINCT contributor FROM pdfs",
        (err, result) => {

            if(err){
                console.log(err);
                return res.status(500).send("Database Error");
            }

            res.json(result);

        }
    );

});
app.get("/trending", (req, res) => {

    db.query(

        `SELECT *
         FROM pdfs
         ORDER BY views DESC`,

        (err, result) => {

            if(err){
                return res.status(500).send("Database Error");
            }

            res.json(result);

        }

    );

});
app.get("/new-releases", (req, res) => {

    db.query(

        `SELECT *
         FROM pdfs
         ORDER BY upload_date DESC`,

        (err, result) => {

            if(err){

                return res.status(500).send(
                    "Database Error"
                );

            }

            res.json(result);

        }

    );

});

app.get("/favorites", (req, res) => {

    db.query(
        `SELECT favorites.id,
                pdfs.title,
                pdfs.contributor
         FROM favorites
         JOIN pdfs
         ON favorites.pdf_id = pdfs.id`,
        (err, result) => {

            if(err){
                console.log(err);
                return res.status(500).send("Database Error");
            }

            res.json(result);
        }
    );

});

app.post("/favorites", (req, res) => {

    const { user_id, pdf_id } = req.body;

    db.query(
        "INSERT INTO favorites (user_id, pdf_id) VALUES (?, ?)",
        [user_id, pdf_id],
        (err, result) => {

            if(err){
                console.log(err);
                return res.status(500).send("Database Error");
            }

            res.send("Favorite Added Successfully");
        }
    );

});

app.delete("/favorites/:id", (req, res) => {

    const id = req.params.id;

    db.query(
        "DELETE FROM favorites WHERE id = ?",
        [id],
        (err, result) => {

            if(err){
                console.log(err);
                return res.status(500).send("Database Error");
            }

            res.send("Favorite Removed");
        }
    );

});

// Get Reading List
app.get("/readinglist", (req, res) => {
    db.query(
        "SELECT * FROM reading_list",
        (err, result) => {
            if (err) {
                res.status(500).json(err);
            } else {
                res.json(result);
            }
        }
    );
});

// Add to Reading List
app.post("/readinglist", (req, res) => {

    const { user_id, pdf_id } = req.body;

    db.query(
        "INSERT INTO reading_list(user_id, pdf_id) VALUES (?, ?)",
        [user_id, pdf_id],
        (err, result) => {
            if (err) {
                res.status(500).json(err);
            } else {
                res.json({ message: "Added to Reading List" });
            }
        }
    );
});

// Remove from Reading List
app.delete("/readinglist/:id", (req, res) => {

    db.query(
        "DELETE FROM reading_list WHERE id = ?",
        [req.params.id],
        (err, result) => {
            if (err) {
                res.status(500).json(err);
            } else {
                res.json({ message: "Removed Successfully" });
            }
        }
    );
});
app.get("/api/profile", (req, res) => {

    db.query(
        "SELECT * FROM users LIMIT 1",
        (err, result) => {

            if(err){
                return res.status(500).json(err);
            }

            res.json(result[0]);

        }
    );

});
app.put("/api/profile", (req, res) => {

    const { name, email, bio } = req.body;

    db.query(
        "UPDATE users SET name=?, email=?, bio=? WHERE id=1",
        [name, email, bio],
        (err, result) => {

            if(err){
                return res.status(500).json(err);
            }

            res.json({
                message:
                "Profile Updated Successfully"
            });

        }
    );

});
app.get("/get-settings/:id", (req, res) => {

    db.query(
        "SELECT * FROM settings WHERE user_id=?",
        [req.params.id],
        (err, result) => {

            if(err){
                return res.status(500).json(err);
            }

            res.json(result[0]);

        }
    );

});
app.post("/save-settings", (req, res) => {

    const data = req.body;

    db.query(
        `UPDATE settings SET

        dark_mode=?,
        auto_save_progress=?,
        remember_last_page=?,
        continuous_scrolling=?,
        fullscreen_reader=?,
        reading_progress_bar=?,

        recommended_pdfs=?,
        recently_read_pdfs=?,
        trending_pdfs=?,
        new_releases=?,

        new_pdf_alerts=?,
        contributor_updates=?,
        weekly_summary=?

        WHERE user_id=?`,

        [

            data.dark_mode,
            data.auto_save_progress,
            data.remember_last_page,
            data.continuous_scrolling,
            data.fullscreen_reader,
            data.reading_progress_bar,

            data.recommended_pdfs,
            data.recently_read_pdfs,
            data.trending_pdfs,
            data.new_releases,

            data.new_pdf_alerts,
            data.contributor_updates,
            data.weekly_summary,

            data.user_id

        ],

        (err, result) => {

            if(err){
                return res.status(500).send("Error");
            }

            res.send("Settings Saved Successfully");

        }

    );

});
app.get("/notifications", (req, res) => {

    db.query(
        "SELECT * FROM notifications ORDER BY created_at DESC",
        (err, result) => {

            if(err){
                return res.status(500).json(err);
            }

            res.json(result);

        }
    );

});

// HOME ROUTE

app.get("/",(req,res)=>{

    res.send(
        "E-Library Backend Running"
    );

});

app.get("/pdfs", (req, res) => {

    db.query(
        "SELECT * FROM pdfs",
        (err, result) => {

            if(err){
                console.log(err);

                return res.status(500).json({
                    message: "Database Error"
                });
            }

            res.json(result);

        }
    );

});


 app.post("/pdfs/:id/view", (req, res) => {

    const pdfId = req.params.id;

    const { userId } = req.body;

    db.query(

        `SELECT * FROM pdf_views
         WHERE pdf_id = ?
         AND user_id = ?`,

        [pdfId, userId],

        (err, result) => {

            if(err){

                console.log(err);

                return res.status(500).json({
                    message: "Database Error"
                });

            }

            if(result.length > 0){

                return res.json({
                    message: "Already Viewed"
                });

            }

            db.query(

                `INSERT INTO pdf_views
                (pdf_id, user_id)
                VALUES (?, ?)`,

                [pdfId, userId],

                (err) => {

                    if(err){

                        console.log(err);

                        return res.status(500).json({
                            message: "Database Error"
                        });

                    }

                    db.query(

                        `UPDATE pdfs
                         SET views = views + 1
                         WHERE id = ?`,

                        [pdfId],

                        (err) => {

                            if(err){

                                console.log(err);

                                return res.status(500).json({
                                    message: "Database Error"
                                });

                            }

                            res.json({
                                message: "View Count Updated"
                            });

                        }

                    );

                }

            );

        }

    );

});

app.get("/search", (req, res) => {

    const keyword = req.query.keyword;

    db.query(

        `SELECT *
         FROM pdfs
         WHERE title LIKE ?`,

        [`%${keyword}%`],

        (err, result) => {

            if(err){
                return res.status(500).send("Database Error");
            }

            res.json(result);

        }

    );

});
app.post("/pdfs/:id/download", (req, res) => {

    const pdfId = req.params.id;

    db.query(

        `UPDATE pdfs
         SET downloads = downloads + 1
         WHERE id = ?`,

        [pdfId],

        (err) => {

            if(err){

                console.log(err);

                return res.status(500).send(
                    "Database Error"
                );

            }

            res.send(
                "Download Count Updated"
            );

        }

    );

});
// SERVER

app.listen(5000,()=>{

    console.log(
        "Server running on port 5000"
    );

});