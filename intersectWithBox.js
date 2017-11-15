define(["planeMath","point"], function(planeMath, point){
	var w = window.innerWidth, h = window.innerHeight;
	var sides = [
		{p1:point(0,0), p2: point(w,0)},
		{p1:point(w,0), p2: point(w,h)},
		{p1:point(w,h), p2: point(0,h)},
		{p1:point(0,h), p2: point(0,0)}
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
});
	

	
