const express = require("express");
const mysql = require("mysql2");
const cors = require("cors");

const app = express();

app.use(cors());
app.use(express.json());

const db = mysql.createConnection({
    host: "localhost",
    user: "root",
    password: "Harshitha@1435",
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

app.post("/login",(req,res)=>{

    const {username,password} = req.body;

    db.query(
        "SELECT * FROM users WHERE email=?",
        [username],
        (err,result)=>{

            if(err){

                console.log(err);

                return res.send(
                    "Login Failed"
                );
            }

            if(result.length === 0){

                return res.send(
                    "User Not Found"
                );
            }

            if(result[0].password === password){

                return res.send(
                    "Login Successful"
                );
            }

            return res.send(
                "Incorrect Password"
            );

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
        "SELECT * FROM pdfs",
        (err, result) => {

            if(err){
                return res.status(500).send("Database Error");
            }

            res.json(result);
        }
    );

});
app.get("/newreleases", (req, res) => {

    db.query(
        "SELECT * FROM pdfs",
        (err, result) => {

            if(err){

                console.log(err);

                return res.status(500)
                .send("Database Error");
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

// HOME ROUTE

app.get("/",(req,res)=>{

    res.send(
        "E-Library Backend Running"
    );

});


// SERVER

app.listen(5000,()=>{

    console.log(
        "Server running on port 5000"
    );

});
