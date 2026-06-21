const express = require("express");
const mysql = require("mysql2");
const cors = require("cors");
const multer = require("multer");
const path = require("path");
const bcrypt = require("bcrypt");
const app = express();

app.use(cors());
app.use(express.json());
app.use(
    "/pdf_library",
    express.static("pdf_library")
);
app.use(
    "/avatars",
    express.static("avatars")
);
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

const storage = multer.diskStorage({

    destination: (req, file, cb) => {

        cb(null, "avatars/");
    },

    filename: (req, file, cb) => {

        cb(
            null,
            Date.now() + path.extname(file.originalname)
        );

    }

});

const upload = multer({
    storage: storage
});
// REGISTER API

app.post("/register", async (req,res)=>{

    const {name,email,password} = req.body;

    if(!name || !email || !password){

        return res.send("All fields are required");

    }

    db.query(
        "SELECT * FROM users WHERE email=?",
        [email],
        async (err,result)=>{

            if(err){

                console.log(err);
                return res.send("Registration Failed");

            }

            if(result.length > 0){

                return res.send(
                    "Email already registered"
                );

            }

            const hashedPassword =
            await bcrypt.hash(password,10);

            db.query(

                "INSERT INTO users(name,email,password) VALUES(?,?,?)",

                [
                    name,
                    email,
                    hashedPassword
                ],

                (err)=>{

                    if(err){

                        console.log(err);

                        return res.send(
                            "Registration Failed"
                        );

                    }

                    res.send(
                        "Registration Successful"
                    );

                }

            );

        }

    );

});


// LOGIN API

app.post("/login", (req, res) => {

    const { username, password } = req.body;
if (!username || !password) {

    return res.json({
        message: "All fields are required"
    });

}
    db.query(

        "SELECT * FROM users WHERE email = ?",

        [username],
async (err, result) => {


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

           const match =
await bcrypt.compare(
    password,
    user.password
);

if(match) {

                return res.json({

                    message: "Login Successful",

                    userId: user.id,

                    userName: user.name,

                    email: user.email,

                   avatar:user.avatar
                });

            }

            return res.json({
                message: "Incorrect Password"
            });

        }

    );

});
app.get("/home-trending", (req,res)=>{

    db.query(
        "SELECT * FROM pdfs ORDER BY views DESC LIMIT 8",
        (err,result)=>{
            res.json(result);
        }
    );

});

app.get("/home-new-releases", (req,res)=>{

    db.query(
        "SELECT * FROM pdfs ORDER BY upload_date DESC LIMIT 8",
        (err,result)=>{
            res.json(result);
        }
    );

});
app.get("/home-academic", (req,res)=>{

    db.query(
        "SELECT * FROM pdfs LIMIT 8",
        (err,result)=>{
            res.json(result);
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

    const checkSql = `
        SELECT *
        FROM reading_list
        WHERE user_id = ?
        AND pdf_id = ?
    `;

    db.query(
        checkSql,
        [user_id, pdf_id],
        (err, result) => {

            if(err){

                return res.status(500).json(err);

            }

            if(result.length > 0){

                return res.json({
                    success:false,
                    message:"Already in Reading List"
                });

            }

            db.query(
                "INSERT INTO reading_list(user_id, pdf_id) VALUES (?, ?)",
                [user_id, pdf_id],
                (err2, result2) => {

                    if(err2){

                        return res.status(500).json(err2);

                    }

                    res.json({
                        success:true,
                        message:"Added to Reading List"
                    });

                }
            );

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
app.get("/api/profile/:id", (req, res) => {
   const userId = req.params.id;
    db.query(
        "SELECT * FROM users WHERE id=?",
        [userId],
        (err, result) => {

            if(err){
                return res.status(500).json(err);
            }

            res.json(result[0]);

        }
    );

});
app.put("/api/profile", (req, res) => {

    const { userId, name, email, bio } = req.body;

db.query(
    "UPDATE users SET name=?, email=?, bio=? WHERE id=?",
    [name, email, bio, userId],
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
app.post(
    "/api/profile/avatar",
    upload.single("avatar"),
    (req, res) => {

        const avatarPath =
        "avatars/" + req.file.filename;
const userId = req.body.userId;
        db.query(

            "UPDATE users SET avatar=? WHERE id=?",

              [avatarPath, userId],

            (err) => {

                if(err){

                    return res
                    .status(500)
                    .json({
                        message:"Database Error"
                    });

                }

                res.json({

                    message:"Avatar Updated",

                    avatar: avatarPath

                });

            }

        );

    }
);
app.delete("/api/profile/avatar/:userId", (req, res) => {

    const userId = req.params.userId;

    db.query(

        "UPDATE users SET avatar=NULL WHERE id=?",

        [userId],

        (err) => {

            if(err){
                return res.status(500).json(err);
            }

            res.json({
                message: "Avatar Removed"
            });

        }

    );

});
app.post("/reading-history", (req, res) => {
    const { userId, pdfId } = req.body;

    db.query(

        `SELECT * FROM reading_history
         WHERE user_id=? AND pdf_id=?`,

        [userId, pdfId],

        (err, result) => {

            if(err){
                return res.status(500).send("Database Error");
            }

            if(result.length > 0){

                db.query(

                    `UPDATE reading_history
                     SET last_read = CURRENT_TIMESTAMP
                     WHERE user_id=? AND pdf_id=?`,

                    [userId, pdfId],

                    (err) => {

                        if(err){
                            return res.status(500).send("Database Error");
                        }

                        res.send("History Updated");
                    }

                );

            } else {

                db.query(

                    `INSERT INTO reading_history
                     (user_id, pdf_id)
                     VALUES (?, ?)`,

                    [userId, pdfId],

                    (err) => {

                        if(err){
                            return res.status(500).send("Database Error");
                        }

                        res.send("History Saved");
                    }

                );

            }

        }

    );

});
app.get("/reading-history/:userId", (req, res) => {

    const userId = req.params.userId;

    db.query(

        `SELECT
            rh.*,
            p.title,
            p.pdf_link
         FROM reading_history rh
         JOIN pdfs p
            ON rh.pdf_id = p.id
         WHERE rh.user_id = ?
         ORDER BY rh.last_read DESC`,

        [userId],

        (err, result) => {

            if(err){
                return res.status(500).send("Database Error");
            }

            res.json(result);

        }

    );

});

app.post("/api/progress/update", (req, res) => {

    const {
        user_id,
        pdf_id,
        last_page,
        total_pages
    } = req.body;

    if(!user_id || !pdf_id){
        return res.status(400).send("Missing Data");
    }

    const progress =
    total_pages > 0
        ? Math.round((last_page / total_pages) * 100)
        : 0;

    db.query(

        `SELECT id
         FROM reading_history
         WHERE user_id = ?
         AND pdf_id = ?`,

        [user_id, pdf_id],

        (err, result) => {

            if(err){
                console.log(err);
                return res.status(500).send("Database Error");
            }

            if(result.length > 0){

                db.query(

                    `UPDATE reading_history
                     SET
                        last_page = ?,
                        total_pages = ?,
                        progress = ?,
                        last_read = CURRENT_TIMESTAMP
                     WHERE user_id = ?
                     AND pdf_id = ?`,

                    [
                        last_page,
                        total_pages,
                        progress,
                        user_id,
                        pdf_id
                    ],

                    (err2) => {

                        if(err2){
                            console.log(err2);
                            return res.status(500).send("Database Error");
                        }

                        res.send("Progress Updated");

                    }

                );

            }
            else{

                db.query(

                    `INSERT INTO reading_history
                    (
                        user_id,
                        pdf_id,
                        last_page,
                        total_pages,
                        progress
                    )
                    VALUES(?,?,?,?,?)`,

                    [
                        user_id,
                        pdf_id,
                        last_page,
                        total_pages,
                        progress
                    ],

                    (err3) => {

                        if(err3){
                            console.log(err3);
                            return res.status(500).send("Database Error");
                        }

                        res.send("Progress Created");

                    }

                );

            }

        }

    );

});

app.get("/api/progress/continue/:userId", (req, res) => {

    const userId = req.params.userId;

    db.query(

        `SELECT
            rh.pdf_id,
            rh.last_page,
            rh.total_pages,
            rh.progress,
            rh.last_read,
            p.title,
            p.pdf_link
         FROM reading_history rh
         JOIN pdfs p
            ON rh.pdf_id = p.id
         WHERE rh.user_id = ?
         ORDER BY rh.last_read DESC`,

        [userId],

        (err, result) => {

            if(err){
                console.log(err);
                return res.status(500).json(err);
            }

            res.json(result);

        }

    );

});
app.get("/api/progress/:userId/:pdfId", (req,res)=>{

    const { userId, pdfId } = req.params;

    db.query(

        `SELECT *
         FROM reading_history
         WHERE user_id = ?
         AND pdf_id = ?`,

        [userId,pdfId],

        (err,result)=>{

            if(err){
                console.log(err);
                return res.status(500).json(err);
            }

            if(result.length === 0){
                return res.json({});
            }

            res.json(result[0]);

        }

    );

});

app.get("/recommended/:userId", (req, res) => {

    const userId = req.params.userId;

    db.query(

        `SELECT rh.pdf_id,
                p.category_id
         FROM reading_history rh
         JOIN pdfs p
         ON rh.pdf_id = p.id
         WHERE rh.user_id = ?
         ORDER BY rh.last_read DESC
         LIMIT 1`,

        [userId],

        (err, result) => {

            if(err){
                return res.status(500).json(err);
            }

            if(result.length === 0){

                return db.query(

                    `SELECT *
                     FROM pdfs
                     ORDER BY views DESC
                     LIMIT 8`,

                    (err2, rows) => {

                        if(err2){
                            return res.status(500).json(err2);
                        }

                        res.json(rows);

                    }

                );

            }

            const categoryId =
            result[0].category_id;

            const currentPdf =
            result[0].pdf_id;

            db.query(

                `SELECT *
                 FROM pdfs
                 WHERE category_id = ?
                 AND id != ?
                 LIMIT 8`,

                [categoryId, currentPdf],

                (err3, rows) => {

                    if(err3){
                        return res.status(500).json(err3);
                    }

                    res.json(rows);

                }

            );

        }

    );

});
app.get("/top-picks/:userId", (req, res) => {

    const userId = req.params.userId;

    db.query(

        `SELECT p.category_id,
                COUNT(*) AS cnt
         FROM reading_history rh
         JOIN pdfs p
         ON rh.pdf_id = p.id
         WHERE rh.user_id = ?
         GROUP BY p.category_id
         ORDER BY cnt DESC
         LIMIT 1`,

        [userId],

        (err, result) => {

            if(err){
                return res.status(500).json(err);
            }

            if(result.length === 0){

                return db.query(
                    `SELECT *
                     FROM pdfs
                     ORDER BY views DESC
                     LIMIT 8`,
                    (err2, rows) => {
                        if(err2) return res.status(500).json(err2);
                        res.json(rows);
                    }
                );

            }

            const categoryId = result[0].category_id;

            db.query(

                `SELECT *
                 FROM pdfs
                 WHERE category_id = ?
                 ORDER BY views DESC
                 LIMIT 8`,

                [categoryId],

                (err3, rows) => {

                    if(err3){
                        return res.status(500).json(err3);
                    }

                    res.json(rows);

                }

            );

        }

    );

});
app.get("/recommended-all/:userId", (req, res) => {

    const userId = req.params.userId;

    db.query(

        `SELECT rh.pdf_id,
                p.category_id
         FROM reading_history rh
         JOIN pdfs p
         ON rh.pdf_id = p.id
         WHERE rh.user_id = ?
         ORDER BY rh.last_read DESC
         LIMIT 1`,

        [userId],

        (err, result) => {

            if(err){
                return res.status(500).json(err);
            }

            if(result.length === 0){

                return db.query(

                    `SELECT *
                     FROM pdfs
                     ORDER BY views DESC`,

                    (err2, rows) => {

                        if(err2){
                            return res.status(500).json(err2);
                        }

                        res.json(rows);

                    }

                );

            }

            const categoryId =
            result[0].category_id;

            const currentPdf =
            result[0].pdf_id;

            db.query(

                `SELECT *
                 FROM pdfs
                 WHERE category_id = ?
                 AND id != ?`,

                [categoryId, currentPdf],

                (err3, rows) => {

                    if(err3){
                        return res.status(500).json(err3);
                    }

                    res.json(rows);

                }

            );

        }

    );

});

app.get("/get-settings/:id", (req, res) => {

    const userId = req.params.id;

    db.query(
        "SELECT * FROM settings WHERE user_id = ?",
        [userId],
        (err, result) => {

            if(err){

                console.log(err);

                return res.status(500).json({
                    error: "Database Error"
                });

            }

            if(result.length === 0){

                return res.status(404).json({
                    message: "Settings Not Found"
                });

            }

            res.json(result[0]);

        }
    );

});


// SAVE SETTINGS

app.post("/save-settings", (req, res) => {

    const data = req.body;

    db.query(

        `UPDATE settings SET

        dark_mode = ?,
        auto_save_progress = ?,
        remember_last_page = ?,
        continuous_scrolling = ?,
        fullscreen_reader = ?,
        reading_progress_bar = ?

        WHERE user_id = ?`,

        [

            data.dark_mode,
            data.auto_save_progress,
            data.remember_last_page,
            data.continuous_scrolling,
            data.fullscreen_reader,
            data.reading_progress_bar,

            data.user_id

        ],

        (err, result) => {

            if(err){

                console.log(err);

                return res.status(500).json({
                    message: "Database Error"
                });

            }

            console.log(
                "Settings Updated:",
                result.affectedRows
            );

            res.send(
                "Settings Saved Successfully"
            );

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

app.post("/reset-password",async (req,res)=>{

const {email,password}=req.body;

const sql =
"UPDATE users SET password=? WHERE email=?";

const hashedPassword =
await bcrypt.hash(password,10);

db.query(
sql,
[hashedPassword,email],
(err,result)=>{

if(err){

res.send("Database Error");

}
else if(result.affectedRows === 0){

        res.send("Email Not Found");

    }

else{

res.send("Password Updated");

}

});

});

app.post("/check-email", (req,res)=>{

    const {email} = req.body;

    const sql =
    "SELECT * FROM users WHERE email=?";

    db.query(sql,[email],(err,result)=>{

        if(err){

            return res.json({
                exists:false
            });

        }

        if(result.length > 0){

            res.json({
                exists:true
            });

        }else{

            res.json({
                exists:false
            });

        }

    });

});

app.post("/check-reset-email",(req,res)=>{

    const { email } = req.body;

    db.query(
        "SELECT * FROM users WHERE email=?",
        [email],
        (err,result)=>{

            if(err){

                return res.json({
                    success:false
                });

            }

            if(result.length > 0){

                res.json({
                    success:true
                });

            }
            else{

                res.json({
                    success:false
                });

            }

        }
    );

});
app.get("/reading-list/:userId", (req, res) => {

    const userId = req.params.userId;

    const sql = `
        SELECT
            pdfs.id,
            pdfs.title,
            pdfs.contributor,
            pdfs.pdf_link
        FROM reading_list
        JOIN pdfs
        ON reading_list.pdf_id = pdfs.id
        WHERE reading_list.user_id = ?
    `;

    db.query(sql, [userId], (err, result) => {

        if(err){

            console.log(err);

            return res.status(500).json({
                error:"Database Error"
            });

        }

        res.json(result);

    });

});


app.delete("/reading-list/:userId/:pdfId", (req, res) => {

    const userId = req.params.userId;
    const pdfId = req.params.pdfId;

    const sql = `
        DELETE FROM reading_list
        WHERE user_id = ?
        AND pdf_id = ?
    `;

    db.query(
        sql,
        [userId, pdfId],
        (err, result) => {

            if(err){

                console.log(err);

                return res.status(500).json({
                    error:"Database Error"
                });

            }

            res.json({
                message:"Removed Successfully"
            });

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
         WHERE title LIKE ?
         OR contributor LIKE ?
         OR description LIKE ?`,

        [
            `%${keyword}%`,
            `%${keyword}%`,
            `%${keyword}%`
        ],

        (err, result) => {

            if(err){
                return res.status(500)
                .send("Database Error");
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