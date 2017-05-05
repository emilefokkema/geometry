define(function(){
	return function(f, interval){
		var going = false;
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
	};
});