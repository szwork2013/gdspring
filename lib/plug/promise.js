/* -----开火车喽-----
 * 调用：$.plug.promise(fun(data, cb)).then(fun(data, cb)).end(fun(err, data));
 **/
module.exports = cb => {
    // 造火车
    var funs = [ cb ], $this = this;
    // 火车厢
    this.then = cb => {
        funs.push(cb);
        return $this;
    };
    // 火车尾
    this.end = cb => {
        // 同步执行掉
        (fun => {
            fun(funs, fun, funs.length, null);
        })((arr, fun, i, val) => {
            // 是否执行完
            if (i) {
                arr[arr.length - i](val, v => {
                    fun(arr, fun, --i, v)   
                });
            } else {
                cb(null, val);
            }
        });
    }
    // 开火车
    return this;
};