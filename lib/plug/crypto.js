var crypto = require('crypto');

//加密
module.exports.encrypt = function (input, password, callback) {
    //md5加密Password，生成key
    var m = crypto.createHash('md5');
    m.update(password)
    var key = m.digest('hex');

    //生成iv
    m = crypto.createHash('md5');
    m.update(password + key)
    var iv = m.digest('hex').slice(0,16);

    //utf8格式化需要加密的明文
    var data = new Buffer(input, 'utf8').toString('binary');

    //生成aes-256-cbc模式
    var cipher = crypto.createCipheriv('aes-256-cbc', key, iv);

    //应该是查看nodejs版本吧，处理兼容性罢了，我觉得可以去掉；注掉了，默认最新
    //var nodev = process.version.match(/^v(\d+)\.(\d+)/);
    var encrypted;

    //版本判断后，参数不一样而已；注掉了，默认最新
    //if( nodev[1] === '0' && parseInt(nodev[2]) < 10) {
    //    encrypted = cipher.update(data, 'binary') + cipher.final('binary');
    //} else {
    encrypted = cipher.update(data, 'utf8', 'binary') + cipher.final('binary');
    //}

    //Base64编码
    var encoded = new Buffer(encrypted, 'binary').toString('base64');
    callback(encoded);
};

//解密
module.exports.decrypt = function (input, password, callback) {
    // Convert urlsafe base64 to normal base64
    var input = input.replace(/\-/g, '+').replace(/_/g, '/');

    // Convert from base64 to binary string
    var edata = new Buffer(input, 'base64').toString('binary')

    // Create key from password
    var m = crypto.createHash('md5');
    m.update(password)
    var key = m.digest('hex');

    // Create iv from password and key
    m = crypto.createHash('md5');
    m.update(password + key)
    var iv = m.digest('hex');

    // Decipher encrypted data
    var decipher = crypto.createDecipheriv('aes-256-cbc', key, iv.slice(0,16));

    // UPDATE: crypto changed in v0.10
    // https://github.com/joyent/node/wiki/Api-changes-between-v0.8-and-v0.10
    //var nodev = process.version.match(/^v(\d+)\.(\d+)/);
    var decrypted, plaintext;

    //if( nodev[1] === '0' && parseInt(nodev[2]) < 10) {
    //    decrypted = decipher.update(edata, 'binary') + decipher.final('binary');
    //    plaintext = new Buffer(decrypted, 'binary').toString('utf8');
    //} else {
    plaintext = (decipher.update(edata, 'binary', 'utf8') + decipher.final('utf8'));
    //}

    callback(plaintext);
};

//方法调用
// encrypt(input, password, function (encoded) {
//     console.log(encoded);
//     decrypt(encoded, password, function (output) {
//         console.log(output);
//     });
// });
