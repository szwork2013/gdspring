/**
 * 实例化mssql数据库
 */
module.exports = (dbConfig) => {
    // 配置信息是否存在
    if (!dbConfig) throw new Error(
        "MsSql[{0}]-配置错误!".format(JSON.stringify(dbConfig))
    );
    return new MsSql(dbConfig);
};

/**
 * mssql数据库访问类
 */
function MsSql(dbConfig) {
    /**
     * 获取mssql数据库连接
     * @param {Function} callback 回调函数返回连接对象
     */
    var getConnection = callback => {
        // 创建连接
        var connection = new $.mssql.Connection(dbConfig, err => {
            // 打开连接
            (request => {
                // 支持批量执行sql
                request.multiple = true;
                callback(err, request);
            })(
                new $.mssql.Request(connection)
            );
        });
    }

    /**
     * 获取mssql数据库事务连接
     * @param {Function} callback 回调函数返回数据库事务连接对象
     */
    var getTransaction = callback => {
        // 创建连接
        var tranConnection = new $.mssql.Transaction(new $.mssql.Connection(dbConfig,  err => {
                // 支持批量执行sql
                tranConnection.multiple = true;
                callback(err, tranConnection);
            })
        );
    }

    /**
     * 查询
     * @param {String} sql sql语句
     * @param {Function} callback 回调函数返回结果集
     */
    this.query = (sql, callback) => {
        // 创建并打开连接
        getConnection((err, conn) => {
            // 连接是否出错
            if (err) {
                $.plug.log.logger.error(err);
                callback(err, []);
            } else {
                // 执行查询
                conn.query(sql, (er, ds) => {
                    // 关闭连接
                    conn.cancel();
                    // 判断是否执行成功，失败抛出异常
                    if (er) {
                        $.plug.log.logger.error(er);
                        callback(er, []);
                    } else {
                        callback(null, ds.length ? ds : []);
                    }
                });
            }
        });
    };

    /**
     * 使用事务执行sql语句
     * @param {String} sql sql语句
     * @param {Function} callback 回调函数返回执行结果
     */
    this.transQuery = (sql, callback) => {
        // 创建并打开连接
        getTransaction(function(err, tran){
            // 开始事务
            tran.begin(function(err) {
                // 开启事务是否成功
                if (err) {
                    $.plug.log.logger.error(err);
                    callback(err, null);
                } else {
                    // 打开连接
                    (function (request) {
                        // 执行sql
                        request.query(sql, function(err, rows) {
                            // 是否错误
                            if (err) {
                                // 回滚事务
                                tran.rollback(function(err) {
                                    // 关闭连接
                                    request.cancel();
                                    $.plug.log.logger.error(err);
                                    callback(err, rows);
                                });
                            } else {
                                // 提交事务
                                tran.commit(function(err) {
                                    if (err) {
                                        // 回滚事务
                                        tran.rollback(function(err) {
                                            // 关闭连接
                                            request.cancel();
                                            $.plug.log.logger.error(err);
                                            callback(err, rows);
                                        });
                                    } else {
                                        // 关闭连接
                                        request.cancel();
                                        $.plug.log.logger.error(err);
                                        callback(err, rows);
                                    }
                                });
                            }
                        });
                    })(
                        new $.mssql.Request(tran)
                    );
                }
            });
        });
    };
}