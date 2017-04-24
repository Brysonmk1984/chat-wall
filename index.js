const express = require('express');
const cors = require("cors");
const bodyParser = require("body-parser");
const pg = require('pg');

const app = express();

app.get('/db', function (request, response) {
  pg.connect(process.env.DATABASE_URL, function(err, client, done) {
    client.query('SELECT * FROM test_table', function(err, result) {
      done();
      if (err)
       { console.error(err); response.send("Error " + err); }
      else
       { response.render('pages/db', {results: result.rows} ); }
    });
  });
});


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

app.get('/chat-wall-api', function (req, res) {
    res.status(200).json({ 'messages': messages });
});

app.post('/chat-wall-api', function(req, res){
    messages.push(req.body)
    res.json({ 'messages': messages });
});

app.delete('/chat-wall-api/:id', function(req, res){
    let match = messages.find((message)=>{
        return message.id === parseInt(req.params.id);
    });
    let indexMatch = messages.indexOf(match);
    messages.splice(indexMatch,1);
    res.json({ 'messages': messages });
});

app.listen( process.env.PORT || 3000, function () {
    console.log('Listening on port ' + process.env.PORT || 3000 );
});

module.exports = app;
