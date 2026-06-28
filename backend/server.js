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

                return res.send(
                    "Registration Failed"
                );

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

                (err,userResult)=>{

                    if(err){

                        console.log(err);

                        return res.send(
                            "Registration Failed"
                        );

                    }

                    const newUserId =
                    userResult.insertId;

                    // Create Default Settings

                    db.query(

                        `INSERT INTO settings
                        (
                            user_id,
                            dark_mode,
                            auto_save_progress,
                            remember_last_page,
                            continuous_scrolling,
                            enable_bookmarks,
                            reading_progress_bar
                        )
                        VALUES
                        (
                            ?,
                            0,
                            1,
                            1,
                            0,
                            0,
                            1
                        )`,

                        [newUserId],

                        (settingsErr)=>{

                            if(settingsErr){

                                console.log(
                                    "Settings Error:",
                                    settingsErr
                                );

                            }

                        }

                    );

                    // Welcome Notification

                    db.query(

                        `INSERT INTO notifications
                        (
                            user_id,
                            message,
                            type
                        )
                        VALUES(?,?,?)`,

                        [
                            newUserId,

                            "🎉 Welcome to E-Library! Start exploring PDFs and build your reading journey.",

                            "welcome"
                        ],

                        (notifErr)=>{

                            if(notifErr){

                                console.log(
                                    "Notification Error:",
                                    notifErr
                                );

                            }

                        }

                    );

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
                    message: "Incorrect email or password"
                });

            }

            const user = result[0];
            const previousLogin = user.last_login;

            const match = await bcrypt.compare(
                password,
                user.password
            );

            if (match) {

                if (
                    previousLogin &&
                    new Date(previousLogin) <=
                    new Date(Date.now() - 7 * 24 * 60 * 60 * 1000)
                ) {

                    db.query(

                        `
                        INSERT INTO notifications
                        (
                            user_id,
                            message,
                            type
                        )
                        VALUES
                        (
                            ?,
                            ?,
                            'welcome_back'
                        )
                        `,

                        [
                            user.id,
                            "🌷 Welcome back! We've missed you. Continue your reading journey."
                        ],

                        (err) => {

                            if (err) {
                                console.log("Welcome Back Notification Error:", err);
                            }

                        }

                    );

                }

                db.query(

                    `
                    UPDATE users
                    SET last_login = CURRENT_TIMESTAMP
                    WHERE id = ?
                    `,

                    [user.id],

                    (err) => {

                        if (err) {
                            console.log("Last Login Update Error:", err);
                        }

                    }

                );

                return res.json({

                    message: "Login Successful",

                    userId: user.id,

                    userName: user.name,

                    email: user.email,

                    avatar: user.avatar

                });

            }

            return res.json({
                message: "Incorrect email or password"
            });

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

res.json({
success:true,
message:"Password Updated"
});
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
         ORDER BY rh.last_read DESC LIMIT 3`,

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
app.get("/notifications/:userId", (req, res) => {

    const userId = req.params.userId;

    db.query(

        `
        SELECT
            n.*,
            p.pdf_link
        FROM notifications n
        LEFT JOIN pdfs p
            ON p.id = n.pdf_id
        WHERE n.user_id = ?
        AND n.type IN
        (
            'welcome',
            'welcome_back',
            'reading_reminder',
            'reading_list_reminder',
            'completed_pdf'
        )
        ORDER BY n.created_at DESC
        `,

        [userId],

        (err, result) => {

            if(err){
                return res.status(500).json(err);
            }

            res.json(result);

        }

    );

});
app.get("/notifications/recent/:userId",(req,res)=>{

    const userId = req.params.userId;

    db.query(

        `
        SELECT
            n.*,
            p.pdf_link
        FROM notifications n
        LEFT JOIN pdfs p
            ON n.pdf_id = p.id
       WHERE n.user_id = ?
AND n.type IN
(
    'welcome',
    'welcome_back',
    'reading_reminder',
    'reading_list_reminder',
    'completed_pdf'
)
        ORDER BY n.created_at DESC
        LIMIT 5
        `,

        [userId],

        (err,result)=>{

            if(err){
                return res.status(500).json(err);
            }

            res.json(result);

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
app.get("/hero-pdf",(req,res)=>{

    db.query(

        `
        SELECT
            id,
            title,
            contributor,
            description,
            views,
            pdf_link
        FROM pdfs
        ORDER BY views DESC
        LIMIT 1
        `,

        (err,result)=>{

            if(err){
                return res.status(500).json(err);
            }

            res.json(result[0] || null);

        }

    );

});
app.get("/browse-books", async (req, res) => {

    const keyword = req.query.keyword;

    try {

        const response = await fetch(
            `https://openlibrary.org/search.json?q=${keyword}`
        );

        const data = await response.json();

        res.json(data.docs || []);

    }
    catch(error){

        console.log(error);

        res.status(500).json({
            message:"Failed"
        });

    }

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

        `SELECT *
         FROM reading_history
         WHERE user_id = ?
         AND pdf_id = ?`,

        [userId, pdfId],

        (err, result) => {

            if(err){
                return res.status(500).send("Database Error");
            }

            const markReminderRead = () => {

                db.query(

                    `UPDATE notifications
                     SET is_read = 1
                     WHERE user_id = ?
                     AND pdf_id = ?
                     AND type = 'reading_list_reminder'`,

                    [userId, pdfId],

                    (err2) => {

                        if(err2){
                            console.log("Reminder Update Error:", err2);
                        }

                    }

                );

            };

            if(result.length > 0){

                db.query(

                    `UPDATE reading_history
                     SET last_read = CURRENT_TIMESTAMP
                     WHERE user_id = ?
                     AND pdf_id = ?`,

                    [userId, pdfId],

                    (err3) => {

                        if(err3){
                            return res.status(500).send("Database Error");
                        }

                        markReminderRead();

                        res.send("History Updated");

                    }

                );

            } else {

                db.query(

                    `INSERT INTO reading_history
                     (user_id, pdf_id)
                     VALUES (?, ?)`,

                    [userId, pdfId],

                    (err4) => {

                        if(err4){
                            return res.status(500).send("Database Error");
                        }

                        markReminderRead();

                        res.send("History Saved");

                    }

                );

            }

        }

    );

});
app.get(/^\/download\/(.+)/, (req, res) => {

    const file = decodeURIComponent(req.params[0]);

    const filePath = path.join(
        __dirname,
        "pdf_library",
        file
    );

    res.download(filePath, err => {

        if (err) {
            console.log(err);
            res.status(404).send("File not found");
        }

    });

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
app.post("/notifications/read-all/:userId", (req, res) => {

    const userId = req.params.userId;

    db.query(

        `
        UPDATE notifications
SET is_read = 1
WHERE user_id = ?
AND type IN
(
    'welcome',
    'welcome_back',
    'reading_reminder',
    'reading_list_reminder',
    'completed_pdf'
)
        `,

        [userId],

        (err) => {

            if(err){
                console.log(err);
                return res.status(500).send("Database Error");
            }

            res.send("All Notifications Marked as Read");

        }

    );

});
app.delete("/notifications/:id", (req, res) => {

    const id = req.params.id;

    db.query(

        `
        DELETE FROM notifications
        WHERE id = ?
        `,

        [id],

        (err) => {

            if(err){
                console.log(err);
                return res.status(500).send("Database Error");
            }

            res.send("Notification Deleted");

        }

    );

});
app.delete("/notifications/clear/:userId",(req,res)=>{

    const userId = req.params.userId;

    db.query(

        `
        DELETE FROM notifications
        WHERE user_id = ?
        `,

        [userId],

        (err)=>{

            if(err){
                console.log(err);
                return res.status(500).send("Database Error");
            }

            res.send("All Notifications Deleted");

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

              const saveNotificationLogic = () => {

    if (progress < 100) return;

    // Remove old reminder notifications
    db.query(
        `
        DELETE FROM notifications
        WHERE user_id = ?
        AND pdf_id = ?
        AND type IN
        (
            'reading_reminder',
            'reading_list_reminder'
        )
        `,
        [user_id, pdf_id],
        (err) => {
            if (err) console.log(err);
        }
    );

    // Insert completed notification only if it doesn't already exist
    db.query(

        `
        INSERT INTO notifications
        (
            user_id,
            message,
            type,
            pdf_id,
            is_read
        )
        SELECT
            ?,
            CONCAT('🎉 Congratulations! You completed "', p.title, '".'),
            'completed_pdf',
            p.id,
            0
        FROM pdfs p
        WHERE p.id = ?
        AND NOT EXISTS
        (
            SELECT 1
            FROM notifications n
            WHERE n.user_id = ?
            AND n.pdf_id = ?
            AND n.type = 'completed_pdf'
        )
        `,

        [
            user_id,
            pdf_id,
            user_id,
            pdf_id
        ],

        (err) => {

            if (err) {
                console.log(err);
            }

        }

    );

};
            if(result.length > 0){

                db.query(

                    `
                    UPDATE reading_history
                    SET
                        last_page = ?,
                        total_pages = ?,
                        progress = ?,
                        last_read = CURRENT_TIMESTAMP
                    WHERE user_id = ?
                    AND pdf_id = ?
                    `,

                    [
                        last_page,
                        total_pages,
                        progress,
                        user_id,
                        pdf_id
                    ],

                    (err2)=>{

                        if(err2){
                            console.log(err2);
                            return res.status(500).send("Database Error");
                        }

                        saveNotificationLogic();

                        res.send("Progress Updated");

                    }

                );

            }else{

                db.query(

                    `
                    INSERT INTO reading_history
                    (
                        user_id,
                        pdf_id,
                        last_page,
                        total_pages,
                        progress
                    )
                    VALUES (?,?,?,?,?)
                    `,

                    [
                        user_id,
                        pdf_id,
                        last_page,
                        total_pages,
                        progress
                    ],

                    (err3)=>{

                        if(err3){
                            console.log(err3);
                            return res.status(500).send("Database Error");
                        }

                        saveNotificationLogic();

                        res.send("Progress Created");

                    }

                );

            }

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
app.get("/pdfs/:id",(req,res)=>{

    const pdfId = req.params.id;

    db.query(

        "SELECT * FROM pdfs WHERE id = ?",

        [pdfId],

        (err,result)=>{

            if(err){
                console.log(err);
                return res.status(500).json(err);
            }

            if(result.length === 0){
                return res.status(404).send("PDF Not Found");
            }

            res.json(result[0]);

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
app.get("/trending-week", (req, res) => {

    db.query(

        `
        SELECT
            p.*,
            COUNT(v.id) AS weekly_views
        FROM pdfs p
        JOIN pdf_views v
            ON p.id = v.pdf_id
        WHERE v.viewed_at >= DATE_SUB(NOW(), INTERVAL 7 DAY)
        GROUP BY p.id
        ORDER BY weekly_views DESC
        LIMIT 10
        `,

        (err, result) => {

            if(err){
                console.log(err);
                return res.status(500).send("Database Error");
            }

            res.json(result);

        }

    );

});
app.post("/favorites", (req,res)=>{

    const { user_id, pdf_id } = req.body;

    db.query(

        `SELECT *
         FROM favorites
         WHERE user_id = ?
         AND pdf_id = ?`,

        [user_id,pdf_id],

        (err,result)=>{

            if(err){
                return res.status(500).send("Database Error");
            }

            if(result.length > 0){
                return res.send("Already in Favorites ❤️");
            }

            db.query(

                `INSERT INTO favorites
                 (user_id,pdf_id)
                 VALUES (?,?)`,

                [user_id,pdf_id],

                (err2)=>{

                    if(err2){
                        return res.status(500).send("Database Error");
                    }

                    res.send("Added to Favorites ❤️");

                }

            );

        }

    );

});
app.get("/favorites/:userId",(req,res)=>{

    const userId = req.params.userId;

    db.query(

        `SELECT
            f.id,
            f.user_id,
            f.pdf_id,
            p.title,
            p.contributor,
            p.pdf_link
         FROM favorites f
         JOIN pdfs p
            ON f.pdf_id = p.id
         WHERE f.user_id = ?`,

        [userId],

        (err,result)=>{

            if(err){
                return res.status(500).json(err);
            }

            res.json(result);

        }

    );

});
app.delete("/favorites/:id",(req,res)=>{

    db.query(

        `DELETE FROM favorites
         WHERE id = ?`,

        [req.params.id],

        (err)=>{

            if(err){
                return res.status(500).send("Database Error");
            }

            res.send("Favorite Removed");

        }

    );

});
app.delete("/favorites/user/:userId/pdf/:pdfId", (req, res) => {

    const { userId, pdfId } = req.params;

    db.query(

        `DELETE FROM favorites
         WHERE user_id = ?
         AND pdf_id = ?`,

        [userId, pdfId],

        (err, result) => {

            if (err) {
                return res.status(500).send("Database Error");
            }

            if (result.affectedRows === 0) {
                return res.status(404).send("Favorite not found");
            }

            res.send("Favorite Removed ❤️");

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
                    success: false,
                    message: "Already in Reading List"
                });
            }

            db.query(
                `
                INSERT INTO reading_list
                (user_id, pdf_id)
                VALUES (?, ?)
                `,
                [user_id, pdf_id],
                (err2) => {

                    if(err2){
                        return res.status(500).json(err2);
                    }

                    res.json({
                        success: true,
                        message: "Added to Reading List"
                    });

                }

            );

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
app.get("/popular-new-releases", (req, res) => {

    const sql = `
        SELECT *
        FROM pdfs
        ORDER BY upload_date DESC, views DESC
        LIMIT 10
    `;

    db.query(sql, (err, result) => {

        if(err){

            return res.status(500).send("Database Error");

        }

        res.json(result);

    });

});
app.get("/categories", (req, res) => {

    const sql = `
        SELECT
            c.id,
            c.category_name,
            COUNT(p.id) AS total_pdfs
        FROM categories c
        LEFT JOIN pdfs p
            ON c.id = p.category_id
        GROUP BY
            c.id,
            c.category_name
        ORDER BY
            c.category_name ASC
    `;

    db.query(sql, (err, result) => {

        if (err) {

            console.log(err);

            return res.status(500).send("Database Error");

        }

        res.json(result);

    });

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

                db.query(

                    `INSERT INTO settings
                    (
                        user_id,
                        dark_mode,
                        auto_save_progress,
                        remember_last_page,
                        continuous_scrolling,
                        enable_bookmarks,
                        reading_progress_bar
                    )
                    VALUES
                    (
                        ?,
                        0,
                        1,
                        1,
                        0,
                        0,
                        1
                    )`,

                    [userId],

                    (err2)=>{

                        if(err2){
                            return res.status(500).json(err2);
                        }

                        return res.json({
                            user_id: userId,
                            dark_mode: 0,
                            auto_save_progress: 1,
                            remember_last_page: 1,
                            continuous_scrolling: 0,
                            enable_bookmarks: 0,
                            reading_progress_bar: 1
                        });

                    }

                );

                return;
            }

            // Existing settings found
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
       enable_bookmarks = ?,
        reading_progress_bar = ?

        WHERE user_id = ?`,

        [

            data.dark_mode,
            data.auto_save_progress,
            data.remember_last_page,
            data.continuous_scrolling,
            data.enable_bookmarks,
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
app.post("/notifications/read/:id",(req,res)=>{

    const id = req.params.id;

    db.query(

        `UPDATE notifications
         SET is_read = 1
         WHERE id = ?`,

        [id],

        (err)=>{

            if(err){
                console.log(err);
                return res.status(500).send("Error");
            }

            res.send("Notification Read");

        }

    );

});

app.post("/notifications/generate-reading-list-reminders/:userId", (req,res)=>{

    const userId = req.params.userId;

    db.query(

        `
        SELECT
            rl.pdf_id,
            p.title
        FROM reading_list rl
        JOIN pdfs p
            ON rl.pdf_id = p.id
        LEFT JOIN reading_history rh
            ON rl.user_id = rh.user_id
            AND rl.pdf_id = rh.pdf_id
      WHERE rl.user_id = ?
AND rh.id IS NULL
AND rl.created_at <= NOW() - INTERVAL 3 DAY
        `,

        [userId],

        (err, result)=>{

            if(err){
                console.log(err);
                return res.status(500).send("Error");
            }

            result.forEach(item=>{

                db.query(

                    `
                    SELECT id
                    FROM notifications
                    WHERE user_id = ?
                    AND pdf_id = ?
                    AND type = 'reading_list_reminder'
                    AND is_read = 0
                    `,

                    [userId,item.pdf_id],
                    (err2, existing)=>{

    if(err2){

        console.log(err2);
        return;

    }

    if(existing.length === 0){

        db.query(

                                `
                                INSERT INTO notifications
                                (
                                    user_id,
                                    message,
                                    type,
                                    pdf_id,
                                    is_read
                                )
                                VALUES
                                (
                                    ?,
                                    ?,
                                    'reading_list_reminder',
                                    ?,
                                    0
                                )
                                `,

                                [
                                    userId,
                                    `"${item.title}" is waiting in your Reading List. Start reading 📚`,
                                    item.pdf_id
                                ]

                            );

                        }

                    }

                );

            });

            res.send("Reading List Reminders Checked");

        }

    );

});
app.post("/notifications/generate-reading-reminders/:userId", (req, res) => {

    const userId = req.params.userId;

    db.query(

        `
        SELECT
            rh.pdf_id,
            rh.last_page,
            rh.progress,
            p.title
        FROM reading_history rh
        JOIN pdfs p
            ON rh.pdf_id = p.id
        WHERE rh.user_id = ?
        AND rh.progress > 0
        AND rh.progress < 100
AND rh.last_read <= NOW() - INTERVAL 3 DAY
        `,

        [userId],

        (err, result) => {

            if(err){
                console.log(err);
                return res.status(500).send("Error");
            }

            result.forEach(item=>{

                db.query(

                    `
                    SELECT id
                    FROM notifications
                    WHERE user_id = ?
                    AND pdf_id = ?
                    AND type = 'reading_reminder'
                    AND is_read = 0
                    `,

                    [userId,item.pdf_id],

                    (err2, existing)=>{

                       if(err2){
    console.log(err2);
    return;
}

if(existing.length === 0){

                            db.query(

                                `
                                INSERT INTO notifications
                                (
                                    user_id,
                                    message,
                                    type,
                                    pdf_id,
                                    is_read
                                )
                                VALUES
                                (
                                    ?,
                                    ?,
                                    'reading_reminder',
                                    ?,
                                    0
                                )
                                `,

                                [
                                    userId,
                                    `Continue reading "${item.title}" 📖 You stopped at page ${item.last_page} (${item.progress}% completed).`,
                                    item.pdf_id
                                ]

                            );

                        }

                    }

                );

            });

            res.send("Reading reminders checked");

        }

    );

});
app.get("/notifications/unread-count/:userId", (req, res) => {

    const userId = req.params.userId;

    db.query(

        `
        SELECT COUNT(*) AS unread
        FROM notifications
        WHERE user_id = ?
        AND is_read = 0
        `,

        [userId],

        (err, result) => {

            if (err) {
                console.log(err);
                return res.status(500).send("Database Error");
            }

            res.json({
                unread: result[0].unread
            });

        }

    );

});
app.get("/settings/bookmarks/:userId",(req,res)=>{

    const userId = req.params.userId;

    db.query(
        `SELECT enable_bookmarks
         FROM settings
         WHERE user_id = ?`,
        [userId],
        (err,result)=>{

            if(err){
                return res.status(500).json(err);
            }

            if(result.length === 0){
                return res.json({
                    enable_bookmarks:0
                });
            }

            res.json(result[0]);

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