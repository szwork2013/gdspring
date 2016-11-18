module.exports = function (grunt) {
    // 配置参数
    grunt.initConfig({
        // concat: (function(obj, arr) {
        //     for (var v of arr) {
        //         obj[v] = {
        //             src: [ 'public/js/' + v + '/*.js' ],
        //             dest: 'public/js/' + v + '.js'
        //         };
        //     }
        //     return obj;
        // })({}, (function(dirPath, type) {
        //     return (function(files) {
        //         switch (type) {
        //             case 'all':
        //                 return files;
        //             case 'file':
        //                 return files.filter(function(v) { return v.indexOf('.') != -1; });
        //             case 'folder':
        //                 return files.filter(function(v) { return v.indexOf('.') == -1; });
        //             default:
        //                 return [];
        //         }
        //     })(require('fs').readdirSync(dirPath));           
        // })('public/js', 'folder'))
        jshint: {
            all: ['controller/api/custcenter.js'] //files to lint 
        }
    });
    // 载入concat合并资源文件
    //grunt.loadNpmTasks('grunt-contrib-concat');
    // 注册任务
    //grunt.registerTask('default', ['concat']);
}