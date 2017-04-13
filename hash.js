(function(){
	var makeHash = function(log, floatPattern, canvas){
		var shorten = function(h){
			var rgx = new RegExp("\\(("+floatPattern + ","+floatPattern+")\\)", "g");
			h = h.match(/([^\]]*)(\[[^\]]*\])/);
			var replacer = (function(){
				var seen = [];
				return function(m, p1){
					var index = seen.indexOf(p1);
					if(index == -1){
						seen.push(p1);
						return "("+p1+")";
					}else{
						return "("+index.toString()+")";
					}
				};
			})();
			return h[1]+h[2].replace(rgx, replacer);
		};
		var longen = function(h){
			var rgx = new RegExp("\\(("+floatPattern+","+floatPattern+"|\\d+)\\)","g");
			h = h.match(/([^\]]*)(\[[^\]]*\])/);
			var replacer = (function(){
				var seen = [];
				return function(m, p1){
					if(p1.indexOf(",") != -1){
						var pair = p1.match(new RegExp(floatPattern+","+floatPattern))[0];
						seen.push(pair);
						return "("+pair+")";
					}else{
						return "("+seen[parseInt(p1.match(/\d+/)[0])]+")";
					}
				}
			})();
			return h[1]+h[2].replace(rgx, replacer);
		};
		var read = function(){
			var state, s = window.location.hash.substr(1);
			if(s){
				state = longen(decodeURI(s));
				log.backFromString(state);
				history.push(state);
			}
		};
		var history = (function(){
			var states = [];
			window.states = states;
			var push = function(s){
				if(s != states[states.length-1]){
					states.push(s);
				}
			};
			var nextToLast = function(){
				if(states.length > 1){
					states.splice(states.length - 1, 1);
					return states[states.length - 1];
				}
			};
			return {
				push:push,
				nextToLast:nextToLast
			};
		})();
		var write = function(){
			console.log("writing state");
			var newState = log.toString();
			window.location.hash = encodeURI(shorten(newState));
			history.push(newState);
		};
		var nextToLast = function(){
			var oldState = history.nextToLast();
			if(oldState){
				canvas.clear();
				log.backFromString(oldState);
				window.location.hash = encodeURI(shorten(oldState));
			}
		};
		return {
			write:write,
			nextToLast:nextToLast,
			read:read
		};
	};
	

	window.initGeometry = (function(orig){
		return function(obj){
			orig(obj);
			obj.hash = makeHash(obj.log, obj.floatPattern, obj.canvas);
		};
	})(window.initGeometry || function(){});
})();