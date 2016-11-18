var assert = require('assert');
var should = require('should');
var request = require('supertest');
var uuid = require('node-uuid');

var redis=require('redis');
require("bluebird").promisifyAll(redis.RedisClient.prototype);
var redisclient = redis.createClient(require("../../config.js").redis.userdb);
var users = require("../../data.js").users;
var hostname=require("../../config.js").testhostname;

//用户注册
describe('POST /api/custcenter/register', function() {
  describe('用户注册-成功', function() {
    after(function() { 
      //todo 删除用户
    });

    it('正常', function(done) {
      request(hostname)
        .post('/api/custcenter/register')
        .send({username:users[0].name,password:users[0].password,type:0})
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

  describe('用户注册-失败', function() {
    it('用户名不全', function(done) {
      request(hostname)
        .post('/api/custcenter/register')
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

    it('密码不完整', function(done) {
      request(hostname)
        .post('/api/custcenter/register')
        .send({username:users[0].name,password:""})
        .set('Accept', 'application/json')
        .expect('Content-Type', /json/)
        .end(function (err, res) {
          should.exist(res);
          res.status.should.be.equal(200);
          res.body.errcode.should.be.equal(30001);
          done();
        });
    });

    it('已注册过', function(done) {
      request(hostname)
        .post('/api/custcenter/register')
        .send({username:users[0].name,password:users[0].password})
        .set('Accept', 'application/json')
        .expect('Content-Type', /json/)
        .end(function (err, res) {
          should.exist(res);
          res.status.should.be.equal(200);
          res.body.errcode.should.be.equal(30006);
          done();
        });
    });

    it('验证码不正确', function(done) {
      request(hostname)
        .post('/api/custcenter/login')
        .send({username:users[0].name,password:users[0].password,code:"1111"})
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
});