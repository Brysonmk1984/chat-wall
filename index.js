const fs = require("fs");
const https = require('https');
const express = require('express');
const app = express();
const cors = require("cors");
const bodyParser = require("body-parser");
const pg = require('pg');
pg.defaults.ssl = true;


const productionMode = false;
const dbUrl = productionMode ? process.env.DATABASE_URL : "postgres:///localchatwall";

let messages = [
    { 'name' : 'Bryson', 'id' : 0, 'message' : 'You Suck!' },
    { 'name' : 'Ryan', 'id' : 1, 'message' : 'No You Suck!' },
    { 'name' : 'Matt', 'id' : 2, 'message' : 'Both of you suck' }
];

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(function(req, res, next) {
	console.log(`${req.method} request for '${req.url}' - ${JSON.stringify(req.body)}`);
	next();
});
app.use(express.static("./public"));
app.use(cors());
app.use(function (err, req, res, next) {
  console.error('err stack'.err.stack)
  res.status(500).send('Something broke!')
})

/*if(productionMode){
    pg.connect(dbUrl, function(err, client, done) {
        done();
        if (err){
            console.log('ERRORR - ', err);
            throw err;
        }
        
        
        console.log('Connected to postgres! Getting schemas...');
        client.query('SELECT * FROM test_table', function(err, result) {
            console.log('results',result.rows);
        });
    });
}*/




// TEST GET @ /DB
app.get('/db', function (req, res) {
  pg.connect(dbUrl, function(err, client, done) {
    client.query('SELECT * FROM test_table', function(err, result) {
      done();
        if (err) { console.error(err); res.send("DB CB Error " + err); 
         }else{ 
             console.log('results row',result.rows);
              res.status(200).json({ 'messages': result.rows });
        }
    });
    console.log(err)
  });
});

// GET MESSAGES
app.get('/chat-wall-api', function (req, res) {
    console.log('RESPONSE',res);
    res.status(200).json({ 'messages': messages });
});

// POST MESSAGE
app.post('/chat-wall-api', function(req, res){
    messages.push(req.body)
    res.json({ 'messages': messages });
});

// DELETE MESSAGE
app.delete('/chat-wall-api/:id', function(req, res){
    let match = messages.find((message)=>{
        return message.id === parseInt(req.params.id);
    });
    let indexMatch = messages.indexOf(match);
    messages.splice(indexMatch,1);
    res.json({ 'messages': messages });
});


// SERVER TYPE
if(productionMode){
    // Production https server
    /*https.createServer(app).listen( process.env.PORT, function(){
        console.log('Https App started on ', process.env.PORT);
    });*/

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
}


module.exports = app;
