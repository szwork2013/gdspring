var assert = require('assert');
var should = require('should');
var request = require('supertest');

var redis=require('redis');
require("bluebird").promisifyAll(redis.RedisClient.prototype);
var redisclient = redis.createClient(require("../../config.js").redis.userdb);

var hostname=require("../../config.js").testhostname;
var users = require("../../data.js").users;

describe('验证码接口测试', function() {
    var code;
    it('获取验证码正确', function(done) {
      request(hostname)
        .get('/api/custcenter/codegenerate?username='+users[0].name+'&type=0')
        //.send({username:"13888888888",mobile:"13888888888",password:"1111"})
        .set('Accept', 'application/json')
        .expect('Content-Type', /json/)
        .end(function (err, res) {
          should.exist(res);
          res.status.should.be.equal(200);
          res.body.errcode.should.be.equal(0);
          code = res.body.data.code;
          //res.body.data.code.length.should.be.equal(4);
          done();
        });
    });

    it('验证码失败-验证码不正确', function(done) {
      request(hostname)
        .get('/api/custcenter/codeverify?username='+users[0].name+'&type=0&code=1111111')
        .set('Accept', 'application/json')
        .expect('Content-Type', /json/)
        .end(function (err, res) {
          should.exist(res);
          res.status.should.be.equal(200);
          res.body.errcode.should.be.equal(30011);
          done();
        });
    });

    it('验证码验证正确', function(done) {
      //console.log('/api/custcenter/codeverify?username='+users[0].name+'&type=0&code='+ code);
      request(hostname)
        .get('/api/custcenter/codeverify?username='+users[0].name+'&type=0&code='+ code)
        .set('Accept', 'application/json')
        .expect('Content-Type', /json/)
        .end(function (err, res) {
          should.exist(res);
          res.status.should.be.equal(200);
          res.body.errcode.should.be.equal(0);
          done();
        });
    });

    it('验证码失败-过期', function(done) {
      request(hostname)
        .get('/api/custcenter/codeverify?username='+users[0].name+'&type=0&code='+code)
        .set('Accept', 'application/json')
        .expect('Content-Type', /json/)
        .end(function (err, res) {
          should.exist(res);
          res.status.should.be.equal(200);
          res.body.errcode.should.be.equal(30011);
          done();
        });
    });
});