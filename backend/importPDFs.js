const fs = require("fs");
const path = require("path");
const mysql = require("mysql2");
const ENABLE_UPLOAD_NOTIFICATIONS = true;
const db = mysql.createConnection({
    host: "localhost",
    user: "root",
    password: "Harshitha@1435",
    database: "elibrary"
});

db.connect((err) => {

    if(err){
        console.log(err);
        return;
    }

    console.log("MySQL Connected");

    importPDFs();

});

function importPDFs() {

    const libraryPath =
    path.join(__dirname, "pdf_library");

    const folders =
    fs.readdirSync(libraryPath);

    folders.forEach(folder => {

        db.query(

            "SELECT id FROM categories WHERE category_name = ?",

            [folder],

            (err, categoryResult) => {

                if(err){
                    console.log(err);
                    return;
                }

                if(categoryResult.length === 0){

                    console.log(
                        `Category not found: ${folder}`
                    );

                    return;
                }

                const categoryId =
                categoryResult[0].id;

                const folderPath =
                path.join(libraryPath, folder);
                const files =
                fs.readdirSync(folderPath);

                files.forEach(file => {

                    if(!file.endsWith(".pdf"))
                        return;

                    const title =
                    path.parse(file).name;

                    
const pdfLink =
folder + "/" + file;

db.query(

    "SELECT id FROM pdfs WHERE pdf_link = ?",

    [pdfLink],

    (err, existing) => {

        if(err){
            console.log(err);
            return;
        }

        if(existing.length > 0){

            console.log(
                `Skipped (already exists): ${file}`
            );

            return;
        }

db.query(

    `INSERT INTO pdfs
    (title, category_id, contributor, pdf_link)
    VALUES (?, ?, ?, ?)`,

    [
        title,
        categoryId,
        "Admin",
        pdfLink
    ],

    (err, pdfResult) => {

        if(err){
            console.log(err);
            return;
        }

        if (ENABLE_UPLOAD_NOTIFICATIONS) {

    db.query(

        `INSERT INTO notifications
        (
            user_id,
            message,
            type,
            pdf_id
        )
        VALUES (?, ?, ?, ?)`,

        [
            null,
            `New PDF uploaded: ${title}`,
            "new_pdf",
            pdfResult.insertId
        ],

        (err2) => {

            if(err2){
                console.log(err2);
            }

        }

    );

}

        console.log(
            `Imported: ${file}`
        );

    }

);
    

    }

);
                });

            }

        );

    });

}