define(function(){
	return function(f, interval, immediate){
		var going = false;
		if(immediate){
			return function(){
				if(!going){
					var args = arguments;
					going = true;
					f.apply(null, args);
					setTimeout(function(){
						going = false;
					}, interval);
				}
			};
		}else{
			return function(){
				if(!going){
					var args = arguments;
					going = true;
					setTimeout(function(){
						f.apply(null, args);
						going = false;
					}, interval);
				}
			};
		}
		
	};
});