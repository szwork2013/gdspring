var assert = require('assert');
var should = require('should');
var request = require('supertest');
var util = require('util');
var redis=require('redis');
require("bluebird").promisifyAll(redis.RedisClient.prototype);
var redisclient = redis.createClient(require("../../config.js").redis.userdb);

var hostname=require("../../config.js").testhostname;
var users = require("../../data.js").users;
var data_driven = require('data-driven');

//
describe('POST /api/custcenter/login', function() {
  describe('用户登陆', function() {
    var user = users[0];
    before(()=>{
       var forceverifyid = util.format("forceverify:%s:%s", "1", users[0].name);
       redisclient.send_command("DEL",[forceverifyid]);
    });

    it('用户成功登陆', function(done) {
      request(hostname)
        .post('/api/custcenter/login')
        .send({username: users[0].name, password:users[0].password})
        .set('Accept', 'application/json')
        .expect('Content-Type', /json/)
        .end(function (err, res) {
          should.exist(res);
          res.status.should.be.equal(200);
          res.body.errcode.should.be.equal(0);
          done();
        });
    });

    it('用户登陆失败-账户为空', function(done) {
      request(hostname)
        .post('/api/custcenter/login')
        .send({username:"",password:"1111"})
        .set('Accept', 'application/json')
        .expect('Content-Type', /json/)
        .end(function (err, res) {
          should.exist(res);
          res.status.should.be.equal(200);
          res.body.errcode.should.be.equal(30001);
          done();
        });
    });

    it('用户登陆失败-密码为空', function(done) {
      request(hostname)
        .post('/api/custcenter/login')
        .send({username:"userName",password:""})
        .set('Accept', 'application/json')
        .expect('Content-Type', /json/)
        .end(function (err, res) {
          should.exist(res);
          res.status.should.be.equal(200);
          res.body.errcode.should.be.equal(30001);
          done();
        });
    });

    it('用户登陆失败-密码不正确', function(done) {
      request(hostname)
        .post('/api/custcenter/login')
        .send({username:users[0].name,password:"121212"})
        .set('Accept', 'application/json')
        .expect('Content-Type', /json/)
        .end(function (err, res) {
          should.exist(res);
          res.status.should.be.equal(200);
          res.body.errcode.should.be.equal(30003);
          done();
        });
    });
  });

  describe('强制验证码用户登陆', function() {
      before(()=>{
        var forceverifyid = util.format("forceverify:%s:%s", "1", users[0].name);
        redisclient.lpush(forceverifyid, 1, (err, data) => {
            redisclient.expire(forceverifyid, 2000);
        });
        redisclient.lpush(forceverifyid, 1, (err, data) => {
            redisclient.expire(forceverifyid, 2000);
        });
        redisclient.lpush(forceverifyid, 1, (err, data) => {
            redisclient.expire(forceverifyid, 2000);
        });
        redisclient.lpush(forceverifyid, 1, (err, data) => {
            redisclient.expire(forceverifyid, 2000);
        });
        redisclient.lpush(forceverifyid, 1, (err, data) => {
            redisclient.expire(forceverifyid, 2000);
        });
      });
      
      it('用户登陆失败-强制验证码', function(done) {
        request(hostname)
          .post('/api/custcenter/login')
          .send({username: users[0].name, password:users[0].password})
          .set('Accept', 'application/json')
          .expect('Content-Type', /json/)
          .end(function (err, res) {
            should.exist(res);
            res.status.should.be.equal(200);
            res.body.errcode.should.be.equal(30005);
            done();
          });
      });

      it('用户登陆失败-验证码不正确', function(done) {
        request(hostname)
          .post('/api/custcenter/login')
          .send({username: users[0].name, password:users[0].password,code:"111"})
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
          .get('/api/custcenter/codegenerate?username='+users[0].name+'&type=0')
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

      it('用户登陆成功', function(done) {
        request(hostname)
          .post('/api/custcenter/login')
          .send({username: users[0].name, password:users[0].password, code:code})
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