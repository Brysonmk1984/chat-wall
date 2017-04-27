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

// GET MESSAGES FROM DB
const getMessages = function(client, res, done){
    client.query('SELECT * FROM messages', function(err, result) {
        done();
        if (err) {errorHandler(err, res, done, "get");
        }else{ 
            console.log('results row',result.rows);
            res.status(200).json({ 'messages': result.rows });
        }
    });
};

// HANDLE ALL ERRORS
const errorHandler = function(err, res, done, type, message){
    done();
    res.json({ requestType : type, success : false, error : err, message });
};

// ROUTE - GET MESSAGES
app.get('/chat-wall-api', function (req, res) {
    pg.connect(dbUrl, function(err, client, done) {
        if (err) { errorHandler(err, res, done, "get"); 
        }else{
            getMessages(client,res,done);
        }
    });
});

// ROUTE - POST MESSAGE
app.post('/chat-wall-api', function(req, res){
    pg.connect(dbUrl, function(err, client, done) {
        if (err) { errorHandler(err, res, done, "post"); }
        if(req.query.name && req.query.message && req.query.pid){
            client.query(`INSERT INTO messages(name, message, pid) VALUES ('${req.query.name}', '${req.query.message}', ${req.query.pid})`, function(err, result) {
                if(err){ errorHandler(err, res, done, "post");
                }else{
                    getMessages(client,res,done);
                }
            });
        }else{errorHandler(err, res, done, "get", "Name, Message, and PID required");}
    });
   
});

// ROUTE - DELETE MESSAGE
app.delete('/chat-wall-api/:id', function(req, res){
    pg.connect(dbUrl, function(err, client, done) {
        if (err) { errorHandler(err, res, done, "delete"); }
        client.query(`DELETE FROM messages WHERE '${req.params.id}' = messages.id `, function(err, result) {
            if (err) { errorHandler(err, res, done, "delete");
            }else{ 
                getMessages(client,res,done);
            }
        });
    });
});

// http server
app.listen( process.env.PORT || 3000, function () {
    console.log('Listening on port ' + (process.env.PORT || 3000));
});

module.exports = app;
