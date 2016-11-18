require("bluebird").promisifyAll($.redis.RedisClient.prototype);

module.exports.oauthserver = $.redis.createClient($.config.redis.oauthserver);

module.exports.sessionserver = $.redis.createClient($.config.redis.session);

module.exports.userdbserver = $.redis.createClient($.config.redis.userdb);

module.exports.filedbserver = $.redis.createClient($.config.redis.filedb);
