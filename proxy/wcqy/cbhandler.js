var uuid = require('node-uuid');
var bluebird = require('bluebird');
var util = require('util'),
async = $.async,
redis = $.plug.redis.userdbserver;

exports.callback = (para, callback) =>
{
    async.waterfall([
            //检察请求参数完整性
            function (cb) {
               cb();
            },
            function (cb) {
               cb();
            },
            function (cb) {
                cb();
            },
            function (cb) {
                cb();
            }
        ],
        function (err,data) {
            if (err) {
                callback(err);
            } else {
                callback($.plug.resultformat(0, ''));
            }
        });
}