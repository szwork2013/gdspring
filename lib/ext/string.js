/**
 * 使用举例:
 *     "{1}{0}".format('a','b'); ==> 'ba'
 */
String.prototype.format = function () {
    var args = arguments;
    return this.replace(/\{(\d+)\}/g,
		function (m, i) {
        return args[i];
    }
    );
};