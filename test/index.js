var assert = require('assert');
var should = require('should');
var request = require('supertest');
require("bluebird").promisifyAll(require('redis').RedisClient.prototype);

var redis = require('redis').createClient(require("../config.js").redis.oauthserver);

module.exports.index = {
	assert : assert,
	should : should,
	request : request,
	redis :redis
};