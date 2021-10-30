const express = require('express');
const exphbs = require('express-handlebars');
const fileUpload = require('express-fileupload');
const mysql = require('mysql');

const app = express();
const port = process.env.PORT || 5000;

app.use(fileUpload());

app.use(express.static('public'));
app.use(express.static('upload'));

app.engine('hbs',exphbs({extname: '.hbs'}));
app.set('view engine','hbs');

const pool = mysql.createPool({
    connectionLimit : 10,
    host : 'localhost',
    user : 'root',
    password: 'password',
    database : 'userprofile'
 });

app.get('',(req,res) => {

    pool.getConnection((err,connection) => {
        if(err) throw err;
        console.log("Connected");
   
        connection.query('SELECT * FROM user WHERE id = "1"',(err,rows) => {
            connection.release();
            if(!err){
                res.render('index', { rows });
            }
        })
    })
})

app.post('',(req,res) => {
    let sampleFile;
    let uploadPath;

    if(!req.files || Object.keys(req.files).length === 0){
        return res.status(400).send("No files were uploaded.")
    }

    sampleFile = req.files.sampleFile;
    uploadPath = __dirname + '/upload/' + sampleFile.name;
    console.log(sampleFile);

    sampleFile.mv(uploadPath, function(err){
        if(err) return res.status(500).send(err);

        pool.getConnection((err,connection) => {
            if(err) throw err;
            console.log("Connected");
       
            connection.query('UPDATE user SET profile_image = ? WHERE id="1"',[sampleFile.name],(err,rows) => {
                connection.release();
                if(!err){
                    res.redirect('/');
                } else { 
                    console.log(err);
                }
            })
        })
    })
})

app.listen(port, () => console.log(`Listening on port ${port}`))