(function(){
	var makeIntersectionSet = function(planeMath, shapeFilter){
		return function(){
			var intersection = function(s1, s2, calculate, id){
				return {
					id:id,
					s1:s1,
					s2:s2,
					calculate:function(){
						return calculate(s1.getSpecs(), s2.getSpecs());
					}
				};
			};
			var intersectionKinds = [
				{
					matches:function(s1, s2){
						return s1.passesFilter(shapeFilter.LINE) && s2.passesFilter(shapeFilter.LINE);
					},
					makeForShapes: function(s1, s2){
						return [
							intersection(s1, s2, function(s1specs, s2specs){
								return planeMath.intersectLines(s1specs.p1, s1specs.p2, s2specs.p1, s2specs.p2);
							}, 0)
						];
					}
				},
				{
					matches: function(s1, s2){
						return s1.passesFilter(shapeFilter.SEGMENT) && s2.passesFilter(shapeFilter.SEGMENT);
					},
					makeForShapes: function(s1, s2){
						return [
							intersection(s1, s2, function(s1specs, s2specs){
								return planeMath.intersectSegments(s1specs.p1, s1specs.p2, s2specs.p1, s2specs.p2);
							}, 0)
						];
					}
				},
				{
					matches: function(s1, s2){
						return s1.passesFilter(shapeFilter.SEGMENT) && s2.passesFilter(shapeFilter.LINE);
					},
					makeForShapes: function(s1, s2){
						return [
							intersection(s1, s2, function(s1specs, s2specs){
								return planeMath.intersectLineAndSegment(s2specs.p1, s2specs.p2, s1specs.p1, s1specs.p2);
							}, 0)
						];
					}
				},
				{
					matches:function(s1, s2){
						return s1.passesFilter(shapeFilter.CIRCLE) && s2.passesFilter(shapeFilter.CIRCLE);
					},
					makeForShapes:function(s1, s2){
						return [0,1].map(function(i){
							return intersection(s1, s2, function(s1specs, s2specs){
								return planeMath.intersectCircles(s1specs.center, s1specs.r, s2specs.center, s2specs.r, i);
							}, i);
						});
					}
				},{
					matches:function(s1, s2){
						return s1.passesFilter(shapeFilter.LINE) && s2.passesFilter(shapeFilter.CIRCLE);
					},
					makeForShapes:function(s1, s2){
						return [0,1].map(function(i){
							return intersection(s1, s2, function(s1specs, s2specs){
								return planeMath.intersectLineAndCircle(s1specs.p1, s1specs.p2, s2specs.center, s2specs.r, i);
							}, i);
						});
					}
				},{
					matches:function(s1, s2){
						return s1.passesFilter(shapeFilter.SEGMENT) && s2.passesFilter(shapeFilter.CIRCLE);
					},
					makeForShapes:function(s1, s2){
						return [0,1].map(function(i){
							return intersection(s1, s2, function(s1specs, s2specs){
								return planeMath.intersectSegmentAndCircle(s1specs.p1, s1specs.p2, s2specs.center, s2specs.r, i);
							}, i);
						});
					}
				}
			];
			var all = [];
			
			var getForShapes = function(s1, s2, p){
				var candidates = all.filter(function(i){return i.s1 == s1 && i.s2 == s2 || i.s2 == s1 && i.s1 == s2;});
				var result = candidates.lastMin(function(c){return (c.calculate()||planeMath.point(0,0)).minus(p).mod();});
				if(result.calculate()){
					return result;
				}
				return null;
			};
			var getForShapesAndId = function(s1, s2, id){
				var candidates = all.filter(function(i){return i.s1 == s1 && i.s2 == s2 || i.s2 == s1 && i.s1 == s2;});
				return candidates.filter(function(i){return i.id == id;})[0];
			};
			var makeForShapes = function(s1, s2){
				for(var i=0;i<intersectionKinds.length;i++){
					if(intersectionKinds[i].matches(s1, s2)){
						intersectionKinds[i].makeForShapes(s1, s2).map(function(ii){
							all.push(ii);
						});
						return;
					}else if(intersectionKinds[i].matches(s2, s1)){
						intersectionKinds[i].makeForShapes(s2, s1).map(function(ii){
							all.push(ii);
						});
						return;
					}
				}
				all.push(intersection(s1, s2, function(){return null;}));
			};
			var removeForShape = function(s){
				all = all.filter(function(i){return i.s1 != s && i.s2 != s;});
			};
			return {
				getForShapes:getForShapes,
				getForShapesAndId:getForShapesAndId,
				makeForShapes:function(sarr){
					for(var i=0;i<sarr.length;i++){
						for(var j=i+1;j<sarr.length;j++){
							makeForShapes(sarr[i], sarr[j]);
						}
					}
				},
				removeForShape: removeForShape
			};
		};
	};
	

	window.initGeometry = (function(orig){
		return function(obj){
			orig(obj);
			obj.intersectionSet = makeIntersectionSet(obj.planeMath, obj.shapeFilter);
		};
	})(window.initGeometry || function(){});
})();