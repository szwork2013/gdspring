var assert = require('assert');
var should = require('should');
var request = require('supertest');
var uuid = require('node-uuid');

var redis=require('redis');
require("bluebird").promisifyAll(redis.RedisClient.prototype);
var redisclient = redis.createClient(require("../../config.js").redis.userdb);
var users = require("../../data.js").users;
var hostname=require("../../config.js").testhostname;

//重置密码
describe('重置密码', function() {
  describe('重置密码', function() {
    after(function() { 
      
    });

    it('失败缺参数', function(done) {
      request(hostname)
        .post('/api/custcenter/resetpassword')
        .send({})
        .set('Accept', 'application/json')
        .expect('Content-Type', /json/)
        .end(function (err, res) {
          should.exist(res);
          res.status.should.be.equal(200);
          res.body.errcode.should.be.equal(30001);
          done();
        });
    });

    it('失败验证码不正确', function(done) {
      request(hostname)
        .post('/api/custcenter/resetpassword')
        .send({username:users[0].name,newpassword:"12345678",code:"1111212"})
        .set('Accept', 'application/json')
        .expect('Content-Type', /json/)
        .end(function (err, res) {
          should.exist(res);
          res.status.should.be.equal(200);
          res.body.errcode.should.be.equal(30011);
          done();
        });
    });

     var code;
     it('获取验证码正确', function(done) {
        request(hostname)
          .get('/api/custcenter/codegenerate?username='+users[0].name+'&type=2')
          .set('Accept', 'application/json')
          .expect('Content-Type', /json/)
          .end(function (err, res) {
            should.exist(res);
            res.status.should.be.equal(200);
            res.body.errcode.should.be.equal(0);
            code = res.body.data.code;
            done();
          });
      });

    it('正常', function(done) {
      request(hostname)
        .post('/api/custcenter/resetpassword')
        .send({username:users[0].name,newpassword:"1234567890",code:code})
        .set('Accept', 'application/json')
        .expect('Content-Type', /json/)
        .end(function (err, res) {
          should.exist(res);
          res.status.should.be.equal(200);
          res.body.errcode.should.be.equal(0);
          done();
        });
    });
  });
});