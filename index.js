const fs = require("fs");
const https = require('https');
const express = require('express');
const app = express();
const cors = require("cors");
const bodyParser = require("body-parser");
const pg = require('pg');
pg.defaults.ssl = true;


const productionMode = true;
const dbUrl = productionMode ? process.env.DATABASE_URL : "postgres:///localchatwall";

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(function(req, res, next) {
	console.log(`${req.method} request for '${req.url}' - ${JSON.stringify(req.body)}`);
	next();
});
app.use(express.static("./public"));
app.use(cors());

// GET MESSAGES
app.get('/chat-wall-api', function (req, res) {
    pg.connect(dbUrl, function(err, client, done) {
        if (err) { 
            console.error(err)
            res.send("DB CONNECTION Error " + err); 
        }
        client.query('SELECT * FROM test_table', function(err, result) {
            done();
            if (err) { console.error(err); res.send("DB CB Error " + err); 
            }else{ 
                console.log('results row',result.rows);
                res.status(200).json({ 'messages': result.rows });
            }
        });
    });
});

// POST MESSAGE
app.post('/chat-wall-api', function(req, res){
    pg.connect(dbUrl, function(err, client, done) {
        if(err){
            console.log('problem connecting to db');
             res.json({ 'pushSuccess' : false });
            throw err;
        }
        if(req.query.name && req.query.message){
            client.query(`INSERT INTO test_table(name, message) VALUES ('${req.query.name}', '${req.query.message}')`, function(err, result) {
                done();
                if(err){
                    res.json({ 'postSuccess' : false });
                    throw err;
                }
                client.query('SELECT * FROM test_table', function(err, result) {
                    done();
                    if (err) { res.json({ 'postSuccess' : false }); throw err;
                    }else{ 
                        console.log('results row',result.rows);
                        res.status(200).json({ 'messages': result.rows, 'postSuccess' : true });
                    }
                });
            });
        } else {
            throw new Error('Name and Message must be provided');
        }
    });
   
});

// DELETE MESSAGE
app.delete('/chat-wall-api/:id', function(req, res){
    pg.connect(dbUrl, function(err, client, done) {
        if (err) { 
            res.json({ 'deleteSuccess' : false });
            throw err; 
        }
        client.query(`DELETE FROM test_table WHERE '${req.params.id}' = test_table.id `, function(err, result) {
            done();
            if (err) { res.json({ 'deleteSuccess' : false }); throw err; 
            }else{ 
                client.query('SELECT * FROM test_table', function(err, result) {
                    done();
                    if (err) { console.error(err); res.send("DB CB Error " + err); 
                    }else{ 
                        console.log('results row',result.rows);
                        res.status(200).json({ 'messages': result.rows, 'deleteSuccess' : true });
                    }
                });
            }
        });
    });
});


// SERVER TYPE
if(productionMode){
    // Production http server
    app.listen( process.env.PORT, function () {
        console.log('Listening on port ' + process.env.PORT);
    });
}else{
    // Dev https server
   var privateKey = fs.readFileSync(__dirname + '/server.key', 'utf8');
    var certificate = fs.readFileSync(__dirname + '/server.crt', 'utf8');
    var credential = { key: privateKey, cert: certificate };

    https.createServer(credential, app).listen(3000, function(){
        console.log('Https App started on ', 3000);
    });

    /*app.listen( 3000, function () {
        console.log('Listening on port ' + 3000);
    });*/
}


module.exports = app;
