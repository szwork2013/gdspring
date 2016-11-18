/**
 * 实例化mysql数据库
 */
module.exports = dbConfig => {
    // 配置信息是否存在
    if (!dbConfig) throw new Error(
        "MySql[{0}]-配置错误!".format(JSON.stringify(dbConfig))
    );
    // 实列化一个mysql连接对象
    return new MySql(dbConfig);
};

/**
 * mysql数据库访问类
 */
function MySql(dbConfig) {
    /**
     * 获取mysql数据库连接
     * @returns {Object} 获取到的数据库连接
     */
    var getConnection = () => {
        // 开启mysql数据库连接
        return (function (conn) {
            const DEBUG = false;
            $['mysql-queues'](conn, DEBUG);
            // 创建连接
            conn.connect();
            return conn;
        })(
            $.mysql.createConnection(dbConfig)
        );
    };

    /**
     * 查询
     * @param {String} sql sql语句
     * @param {Function} callback 回调函数返回结果集
     */
    this.query = (sql, callback) => {
        // 开启连接
        (conn => {
            // 执行查询
            conn.query(sql, (err, rows) => {
                // 关闭连接
                conn.end();
                // 是否出现异常
                if (err) {
                    //$.plug.log.logger.error(err);
                    callback(err, []);
                } else {
                    callback(null, rows.length ? rows : []);
                }
            });
        })(
            getConnection()
        );
    };

    /**
     * 使用事务执行sql语句
     * @param {String} sql sql语句
     * @param {Function} callback 回调函数返回执行结果
     */
    this.transQuery = (sql, callback) => {
        // 开启连接
        (conn => {
            // 打开事务连接
            conn.beginTransaction((err) => {
                // 开启事务是否成功
                if (err) {
                    // 关闭连接
                    conn.end();
                    //$.plug.log.logger.error(err);
                    callback(err, null);
                } else {
                    // 执行事务
                    conn.query(sql, (err, rows) => {
                        // 是否出错
                        if (err) {
                            // 回滚事务
                            conn.rollback(() => {
                                // 关闭连接
                                conn.end();
                                //$.plug.log.logger.error(err);
                                callback(err, rows);
                            });
                        } else {
                            // 提交事务
                            conn.commit(err => {
                                // 是否出错
                                if (err) {
                                    // 回滚事务
                                    conn.rollback(() => {
                                        // 关闭连接
                                        conn.end();
                                        //$.plug.log.logger.error(err);
                                        callback(err, rows);
                                    });
                                } else {
                                    // 关闭连接
                                    conn.end();
                                    callback(err, rows);
                                }
                            });
                        }
                    });
                }
            });
        })(
            getConnection()
        );
    };
}