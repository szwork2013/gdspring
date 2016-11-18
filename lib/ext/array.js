//数据去重
Array.prototype.removeDup3 = function(){
    var result = [];
    var obj = {};
    for(var i = 0; i < this.length; i++){
        if(!obj[this[i]]){
            result.push(this[i]);
            obj[this[i]] = 1;
        }
    }
    return result;
}