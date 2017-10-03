define(function(){
	var point = function(x,y){
		
		return {
			x:x,
			y:y,
			minus: function(p){return point(x - p.x, y - p.y);},
			plus: function(p){return point(x + p.x, y + p.y);},
			cross:function(p){return x*p.y - y*p.x;},
			mod: function(){return Math.sqrt(Math.pow(x, 2) + Math.pow(y, 2));},
			scale: function(r){return point(r*x, r*y);},
			unit: function(){return this.scale(1/this.mod());},
			toString: function(){return "("+x+","+y+")";},
			equals: function(p){return this == p|| (x == p.x && y == p.y);},
			matrix:function(a,b,c,d){return point(a*x+b*y,c*x+d*y);},
			dot:function(p){return x*p.x + y*p.y;},
			argument:function(){
				if(x == 0){
					if(y == 0){
						return 0;
					}
					if(y > 0){
						return Math.PI/2;
					}
					if(y < 0){
						return 3*Math.PI/2;
					}
				}
				var atan = Math.atan(y / x);
				if(x > 0){
					if(y < 0){
						return 2*Math.PI + atan;
					}
					return atan;
				}
				if(x < 0){
					return Math.PI + atan;
				}
			}
		};
	};

	var isBetween = function(q, p1, p2){
		return q.minus(p1).dot(q.minus(p2)) <= 0;
	};

	var intersectLines = function(p1,p2,q1,q2){
		var x1 = p2.minus(p1);
		var x2 = q2.minus(q1);
		var cross = x2.cross(x1);
		if(cross == 0){
			return null;
		}
		var st = q1.minus(p1).matrix(-x2.y, x2.x, -x1.y, x1.x).scale(1/cross);
		return p1.plus(p2.minus(p1).scale(st.x));
	};

	var intersectSegments = function(p1, p2, q1, q2){
		var i = intersectLines(p1, p2, q1, q2);
		if(!i){return null;}
		var onFirst = isBetween(i,p1,p2), onSecond = isBetween(i,q1,p2);
		if(onFirst && onSecond){
			return i;
		}
		return null;
	};

	var intersectLineAndSegment = function(p1, p2, q1, q2){
		var i = intersectLines(p1, p2, q1, q2);
		if(!i){return null;}
		var onSecond = isBetween(i,q1,q2);
		if(onSecond){
			return i;
		}
		return null;
	};

	var intersectSegmentAndCircle = function(p1, p2, c, r, index){
		var i = intersectLineAndCircle(p1, p2, c, r, index);
		if(i == null){
			return null;
		}
		if(isBetween(i,p1, p2)){
			return i;
		}
		return null;
	};

	var intersectCircles = function(p1, r1, p2, r2, index){
		var sina, cosa, d = p1.minus(p2).mod();
		if(r1 + r2 < d || r1 + d < r2 || r2 + d < r1 || d == 0){
			return null;
		}else if(r1 + r2 == d){
			return p1.plus(p2.minus(p1).unit().scale(r1));
		}else{
			cosa = (r1 * r1 - r2 * r2 + d * d) / (2 * d * r1);
			sina = Math.sqrt(1 - cosa * cosa) * (index == 0 ? 1 : -1);
			return p1.plus(p2.minus(p1).unit().scale(r1).matrix(cosa, -sina, sina, cosa));
		}
	};

	var intersectLineAndCircle = function(p1, p2, c, r, index){
		var sina, cossign, cosa, x = c.minus(p1), y = p2.minus(p1);
		var cross, dot = x.dot(y);
		var closestToCenter = p1.plus(y.unit().scale(dot/y.mod()));
		var d = closestToCenter.minus(c).mod();
		if(d < 0.00001){
			return c.plus(y.unit().scale(r * (index == 0 ? 1 : -1)));
		}else if(d > r){
			return null;
		}else if(d == r){
			return closestToCenter;
		}else{
			cossign = (x.cross(y) > 0 ? 1 : -1)
			cosa = (d / r) * cossign;
			
			sina = Math.sqrt(1 - cosa * cosa) * (index == 0 ? 1 : -1);
			return c.plus(closestToCenter.minus(c).unit().scale(r * cossign).matrix(cosa, -sina, sina, cosa));
		}
	};

	var reflectPointInLine = function(p1, p2, p3){
		var x = p2.minus(p1), y = p3.minus(p1), along = x.unit().scale(x.dot(y) / x.mod()), perp = y.minus(along);
		return p1.plus(along).plus(perp.scale(-1));
	};

	var projectPointOnLine = function(p1, p2, p3){
		var x = p2.minus(p1), y = p3.minus(p1), along = x.unit().scale(x.dot(y) / x.mod());
		return p1.plus(along);
	};

	var getPointOnAngleBisector = function(p1, p2, p3){
		var x = p1.minus(p2), y = p3.minus(p2), dot = x.dot(y), along = x.unit().scale(dot / x.mod()), perp = y.minus(along), cross = x.cross(y);
		var cosx = dot / (x.mod() * y.mod()),
			sinSq = (1 - cosx) / 2,
			cosSq = 1 - sinSq,
			sin = Math.sqrt(sinSq),
			cos = Math.sqrt(cosSq) * (cross > 0 ? 1 : -1);
		return p2.plus(x.matrix(cos, -sin, sin, cos));
	};
	return {
		point:point,
		isBetween:isBetween,
		intersectLines:intersectLines,
		intersectSegments:intersectSegments,
		intersectLineAndSegment:intersectLineAndSegment,
		intersectSegmentAndCircle:intersectSegmentAndCircle,
		intersectCircles:intersectCircles,
		intersectLineAndCircle:intersectLineAndCircle,
		reflectPointInLine:reflectPointInLine,
		projectPointOnLine:projectPointOnLine,
		getPointOnAngleBisector:getPointOnAngleBisector
	};	
});