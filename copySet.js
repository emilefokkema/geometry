define(function(){
	return function(origArray, mapper){
		var set = function(o, i){
			return {
				orig: o,
				copy:mapper(o,i)
			};
		};
		var all = origArray.map(set);
		return {
			copyOf: function(o){
				for(var i=0;i<all.length;i++){
					if(all[i].orig == o){
						return all[i].copy;
					}
				}
				return null;
			},
			originalOf:function(c){
				for(var i=0;i<all.length;i++){
					if(all[i].copy == c){
						return all[i].orig;
					}
				}
				return null;
			},
			allCopies: function(){return all.map(function(o){return o.copy;});},
			addFor: function(o){
				var filtered = all.filter(function(s){return s.orig == o;});
				if(filtered.length == 0){
					newSet = set(o, all.length);
					all.push(newSet);
					return newSet.copy;
				}else{
					return filtered[0].copy;
				}
			},
			removeFor:function(o){
				var index = -1;
				for(var i=0;i<all.length;i++){
					if(all[i].orig == o){
						index = i;
					}
				}
				if(index != -1){
					all.splice(index, 1);
				}
			}
		};
	};
});