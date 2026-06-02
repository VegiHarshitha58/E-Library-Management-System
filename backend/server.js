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