(function(){
	var makeIntersectWithBox = function(planeMath, w, h){
		var sides = [
			{p1:planeMath.point(0,0), p2: planeMath.point(w,0)},
			{p1:planeMath.point(w,0), p2: planeMath.point(w,h)},
			{p1:planeMath.point(w,h), p2: planeMath.point(0,h)},
			{p1:planeMath.point(0,h), p2: planeMath.point(0,0)}
		];
		var intersectWithSide = function(p1, p2, side){
			return planeMath.intersectLines(p1, p2, side.p1, side.p2);
		};
		

		return function(p1, p2){
			if(p1.x == p2.x){
				return {p1:intersectWithSide(p1, p2, sides[0]), p2: intersectWithSide(p1, p2, sides[2])};
			}
			return {p1:intersectWithSide(p1, p2, sides[1]), p2: intersectWithSide(p1, p2, sides[3])};
			
		};
	};
	

	window.initGeometry = (function(orig){
		return function(obj){
			orig(obj);
			obj.intersectWithBox = makeIntersectWithBox(obj.planeMath, obj.w, obj.h);
		};
	})(window.initGeometry || function(){});
})();