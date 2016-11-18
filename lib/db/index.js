/**
 * 方便引用数据库访问方法
 */

module.exports = (result => {
    //读db配置循环数据库类型子元素
    for (var dbType in $.config.db) {
        //创建空的类型子元素对象
        result[dbType] = {};
        //循环类型子元素下的数据库对象
        for (var db in $.config.db[dbType]) {
            //执行对应文件的数据库对象,初始化数据库操作类
            result[dbType][db] = require("./" + dbType + ".js")($.config.db[dbType][db]);
        }
    }
    return result;
})({});
