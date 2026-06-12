const fs = require("fs");
const path = require("path");
const mysql = require("mysql2");

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
cd 
                const files =
                fs.readdirSync(folderPath);

                files.forEach(file => {

                    if(!file.endsWith(".pdf"))
                        return;

                    const title =
                    path.parse(file).name;

                    db.query(

                        `INSERT INTO pdfs
                        (title, category_id, contributor, pdf_link)
                        VALUES (?, ?, ?, ?)`,

                        [
                            title,
                            categoryId,
                            "Admin",
                            folder + "/" + file
                        ],

                        (err, result) => {

                            if(err){
                                console.log(err);
                                return;
                            }

                            console.log(
                                `Imported: ${file}`
                            );

                        }

                    );

                });

            }

        );

    });

}