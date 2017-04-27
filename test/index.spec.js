const expect = require("chai").expect;
const request = require("supertest");
const app = require("../index");

describe("Index basic route", function(){
   it("GET to the / route", function(done){
       request(app).get("/chat-wall-api/").expect(200).end(function(err,res){
           expect(res.body).to.have.property("messages");
            done();
       }); 
   });

   it("DELETE to the / route", function(done){
        request(app)
        .delete("/chat-wall-api/23")
        .expect(200)
        .end(function(err, res){
            console.log(res.body.messages);
            expect(res.body.messages.length).to.eql(5);
            done();
        });
   });

   it("POST to the / route", function(done){
        request(app).post("/chat-wall-api/")
        .send({ 'name' : 'Jacobi', 'pid' : 3, 'message' : 'I like Yetis' })
        .expect(200)
        .end(function(err,res){
            console.log('RESBODY',res.body);
            done();
        });
   });

});