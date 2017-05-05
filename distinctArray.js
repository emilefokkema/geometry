define(function(){
	return function(arr){
		var arr2 = arr.slice();
		var push = function(o){
			if(arr.indexOf(o) == -1){
				arr.push(o);
			}
		};
		arr.splice(0,arr.length);
		arr2.map(function(o){push(o);});
		return {
			arr:arr,
			push:push
		};
	};
});