var assert = require('assert');
var should = require('should');
var request = require('supertest');

var redis=require('redis');
require("bluebird").promisifyAll(redis.RedisClient.prototype);
var redisclient = redis.createClient(require("../../config.js").redis.userdb);

var hostname=require("../../config.js").testhostname;


describe('POST 密码算法', function() {
	var maskpw,message="user";

    it('加密', function(done) {
      request(hostname)
        .post('/api/custcenter/encrypt')
        .send({msg:message})
        .set('Accept', 'application/json')
        .expect('Content-Type', /json/)
        .end(function (err, res) {
          should.exist(res);
          res.status.should.be.equal(200);
          maskpw = res.body.data.msg;
          done();
        });
    });

    it('解密', function(done) {
      request(hostname)
        .post('/api/custcenter/decrypt')
        .send({msg:maskpw})
        .set('Accept', 'application/json')
        .expect('Content-Type', /json/)
        .end(function (err, res) {
          should.exist(res);
          res.status.should.be.equal(200);
          res.body.data.msg.should.be.equal(message);
          done();
        });
	});
});