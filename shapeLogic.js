define(["planeMath","sender","shapeFilter","point"],function(planeMath, sender, shapeFilter, point){
	return makeModule(function(specs){
		var getSpecs = function(){return {};},
			changer = {},
			useSpecs = function(_specs){},
			closestPointTo = function(p){return point(0,0);},
			repositionPoint = function(){},
			getChanger = function(){
				var o = {useSpecs:useSpecs};
				var inhibitPropagation = false;
				for(var f in changer){
					if(changer.hasOwnProperty(f)){
						o[f] = (function(f_){
							return function(){
								var oldSpecs = getSpecs();
								changer[f_].apply(null, arguments);
								if(!inhibitPropagation){
									onchange(oldSpecs, getSpecs());
								}
							};
						})(f)
					}
				}
				o.together = function(what){
					var oldSpecs = getSpecs();
					inhibitPropagation = true;
					what.apply(o,[]);
					onchange(oldSpecs, getSpecs());
					inhibitPropagation = false;
				};
				return o;
			},
			distance = function(p){return Infinity;},
			onchange = sender(),
			passesFilter = function(f){return shapeFilter.contains(f, filter);},
			available = true,
			onchangeavailability = sender(),
			getLabelLocation = function(){return point(0,0);},
			toString = function(){return '';},
			movePointAround = function(p){return [p];},
			filter = shapeFilter.ALL;
		this.expose({
			isAvailable: function(){return available;},
			makeAvailable: function(b){available = b;onchangeavailability(b);},
			onchangeavailability:function(f){onchangeavailability.add(f);},
			getSpecs: function(){return getSpecs();},
			getChanger: getChanger,
			closestPointTo: function(p){return closestPointTo(p);},
			repositionPoint: function(p, oldSpecs, newSpecs){return repositionPoint(p, oldSpecs, newSpecs);},
			onchange: function(f){
				onchange.add(f);
			},
			distance:function(p){return distance(p);},
			passesFilter: function(f){return passesFilter(f);},
			movePointAround: function(p){return movePointAround(p);},
			getLabelLocation:function(){return getLabelLocation();},
			toString:function(){return toString();}
		});
		this.extend('arc', function(){
			var end1, middle, end2, center, radius, calculateCenter, innerDot, isUnderArc, projectOnCircle, getAngles;
			useSpecs = function(_specs){
				end1 = _specs.end1 || point(0,0);
				end2 = _specs.end2 || point(0,0);
				middle = _specs.middle || point(0,0);
				calculateCenter();
			};
			calculateCenter = function(){
				var d1 = middle.minus(end1);
				var d2 = end2.minus(middle);
				var p1 = end1.plus(d1.scale(1/2));
				var q1 = middle.plus(d2.scale(1/2));
				var p2 = p1.plus(d1.matrix(0,-1,1,0));
				var q2 = q1.plus(d2.matrix(0,-1,1,0));
				center = planeMath.intersectLines(p1,p2,q1,q2);
				radius = center ? end1.minus(center).mod() : Infinity;
				innerDot = d1.dot(d2);
			};
			projectOnCircle = function(p){
				if(center){
					var pFromCenter = p.minus(center);
					var fromCenterMod = pFromCenter.mod();
					if(fromCenterMod == 0){return null;}
					return center.plus(pFromCenter.scale(radius / fromCenterMod));
				}
				return planeMath.projectPointOnLine(end1, end2, p);
			};
			isUnderArc = function(p){
				if(innerDot == 0){
					var normal = end1.minus(end2).matrix(0,-1,1,0);
					return p.dot(normal) * middle.dot(normal) > 0;
				}
				var projectedOnCircle = projectOnCircle(p);
				if(!projectOnCircle){return false;}
				return projectedOnCircle.minus(end1).dot(end2.minus(projectedOnCircle)) * innerDot > 0;
			};
			useSpecs(specs);
			toString = function(){return 'arc('+end1.toString()+','+middle.toString()+','+end2.toString()+')';};
			distance = function(p){
				if(isUnderArc(p)){
					return Math.abs(radius - p.minus(center).mod());
				}
				return Math.min(p.minus(end1).mod(), p.minus(end2).mod());
			};
			closestPointTo = function(p){
				if(isUnderArc(p)){
					return center.plus(p.minus(center).unit().scale(radius));
				}
				var fromEnd1 = p.minus(end1).mod();
				var fromEnd2 = p.minus(end2).mod();
				return fromEnd1 < fromEnd2 ? end1 : end2;
			};
			changer = {
				setEnd1:function(_end1){
					end1 = _end1;
					calculateCenter();
				},
				setEnd2:function(_end2){
					end2 = _end2;
					calculateCenter();
				},
				setMiddle:function(_middle){
					middle = _middle;
					calculateCenter();
				}
			};
			filter = shapeFilter.ARC;
			getSpecs = function(){
				return {
					end1:end1,
					end2:end2,
					middle:middle,
					center:center,
					radius:radius,
					innerDot:innerDot
				};
			};
			getAngles = function(){
				var angle1 = end1.minus(center).argument();
				var angle2 = end2.minus(center).argument();
				var clockwise = end2.minus(end1).cross(middle.minus(end1)) < 0;
				return {
					from:angle1,
					to:angle2,
					clockwise:clockwise
				};
			};
			movePointAround = function(){
				var angles = getAngles();
				var from = angles.from, to = angles.to;
				if(!angles.clockwise){
					var sFrom = from;
					from = to;
					to = sFrom;
				}
				if(from > to){
					from -= 2*Math.PI;
				}
				var result = [];
				var radiusOneZero = point(1,0).scale(radius);
				for(var a = from;a<=to;a+=0.05){
					var cos = Math.cos(a), sin = Math.sin(a);
					result.push(center.plus(radiusOneZero.matrix(cos, -sin, sin, cos)));
				}
				return result;
			};
			this.expose({
				changer:getChanger(),
				getAngles:getAngles
			});
		});
		this.extend('circle',function(){
			var center, r;
			useSpecs = function(_specs){
				center = _specs.center || point(0,0);
				r = _specs.r || 1;
			};
			useSpecs(specs);
			toString = function(){return 'circle('+center.toString()+','+r+')';};
			distance = function(p){
				return Math.abs(center.minus(p).mod() - r);
			};

			closestPointTo = function(p){
				return center.plus(p.minus(center).unit().scale(r));
			};

			changer = {
				setR: function(r_){r = r_;},
				setCenter: function(c_){
					center = c_;
				}
			};

			

			movePointAround = (function(){
				var arr = Array.apply(null, new Array(101)), dA = 2*Math.PI / 100;
				return function(p){
					var pMinCen = p.minus(center);
					return arr.map(function(x,t){
						var cos = Math.cos(t*dA), sin = Math.sin(t*dA);
						return center.plus(pMinCen.matrix(cos, -sin, sin, cos));
					});
				};
			})();

			filter = shapeFilter.CIRCLE;

			getSpecs = function(){
				return {
					center:center,
					r:r
				};
			};

			getLabelLocation = function(){
				var d = Math.sqrt(2) / 2;
				return center.plus(point(1,0).scale(r+2).matrix(d, d, -d, d));
			};

			repositionPoint = function(p, oldSpecs, newSpecs){
				if(oldSpecs.r == newSpecs.r){
					return p.plus(newSpecs.center.minus(oldSpecs.center));
				}else{
					return newSpecs.center.plus(p.minus(oldSpecs.center).scale(newSpecs.r/oldSpecs.r));
				}
			};
			this.expose({changer:getChanger()});
		});
		this.extend('line',function(){
			var p1, p2;
			useSpecs = function(_specs){
				p1 = _specs.p1 || point(0,0);
				p2 = _specs.p2 || point(1,0);
			};
			toString = function(){return 'line('+p1.toString()+','+p2.toString()+')';};
			useSpecs(specs);
			
			closestPointTo = function(p){
				return planeMath.projectPointOnLine(p1, p2, p);
			};
			distance = function(p){
				return p.minus(closestPointTo(p)).mod();
			};
			getSpecs = function(){
				return {
					p1:p1,
					p2:p2
				};
			};

			changer = {
				setP1:function(p){p1 = p;},
				setP2:function(p){p2 = p;},
				translateBy: function(d){
					p1 = p1.plus(d);
					p2 = p2.plus(d);
				},
				moveTo: function(p){
					if(p.minus(p1).dot(p2.minus(p1)) > 0){
						p2 = p;
					}else{
						p2 = p1.plus(p1.minus(p));
					}
				},
				setFromP1: function(d){
					p2 = p1.plus(d);
				}
			};

			filter = shapeFilter.LINE;

			repositionPoint = function(p, oldSpecs, newSpecs){
				if(oldSpecs.p1.equals(newSpecs.p1)){
					var sign = p.minus(oldSpecs.p1).dot(oldSpecs.p2.minus(oldSpecs.p1)) >=0 ? 1: -1;
					return newSpecs.p1.plus(newSpecs.p2.minus(newSpecs.p1).unit().scale(sign * p.minus(newSpecs.p1).mod()));
				}
				if(!oldSpecs.p2.equals(newSpecs.p2)){
					return p.plus(newSpecs.p2.minus(oldSpecs.p2));
				}
				var sign = p.minus(oldSpecs.p2).dot(oldSpecs.p1.minus(oldSpecs.p2)) >=0 ? 1: -1;
				return newSpecs.p2.plus(newSpecs.p1.minus(newSpecs.p2).unit().scale(sign * p.minus(newSpecs.p2).mod()));
			};
			this.expose({changer:getChanger()});
		});
		this.extend('segment',function(){
			var p1, p2, x;
			useSpecs = function(_specs){
				p1 = _specs.p1 || point(0,0);
				p2 = _specs.p2 || point(1,0);
			};
			toString = function(){return 'segment('+p1.toString()+','+p2.toString()+')';};
			useSpecs(specs);
			closestPointTo = function(p){
				var x = p2.minus(p1);
				var dot1 = p.minus(p1).dot(x), dot2 = p.minus(p2).dot(x), sign = dot1 * dot2;
				if(sign < 0){
					return planeMath.projectPointOnLine(p1, p2, p);
				}else{
					if(dot1 >= 0){
						return p2;
					}else{
						return p1;
					}
				}
			};
			distance = function(p){
				return p.minus(closestPointTo(p)).mod();
			};
			getSpecs = function(){
				return {
					p1:p1,
					p2:p2
				};
			};
			changer = {
				setP1:function(p){p1 = p;},
				setP2:function(p){p2 = p;},
				translateBy: function(d){
					p1 = p1.plus(d);
					p2 = p2.plus(d);
				},
				moveTo: function(p){
					if(p.minus(p1).dot(p2.minus(p1)) > 0){
						p2 = p;
					}else{
						p2 = p1.plus(p1.minus(p));
					}
				},
				setFromP1: function(d){
					p2 = p1.plus(d);
				}
			};

			movePointAround = (function(){
				var arr = Array.apply(null, new Array(101));
				return function(p){
					var  d = p2.minus(p1).scale(1/100);
					return arr.map(function(x,t){
						return p1.plus(d.scale(t));
					});
				};
			})();

			filter = shapeFilter.SEGMENT;

			repositionPoint = function(p, oldSpecs, newSpecs){
				if(p.equals(oldSpecs.p1)){
					return newSpecs.p1;
				}else if(p.equals(oldSpecs.p2)){
					return newSpecs.p2;
				}else{
					var ratio = p.minus(oldSpecs.p1).mod() / oldSpecs.p2.minus(oldSpecs.p1).mod();
					return newSpecs.p1.plus(newSpecs.p2.minus(newSpecs.p1).scale(ratio));
				}
			};
			this.expose({changer:getChanger()});
		})
		this.extend('point',function(){
			var loc;
			useSpecs = function(_specs){
				loc = _specs.location || point(0,0);
			};
			toString = function(){return 'point'+loc.toString();};
			useSpecs(specs);
			distance = function(p){
				return loc.minus(p).mod();
			};

			closestPointTo = function(p){return loc;};

			filter = shapeFilter.POINT;

			changer = {
				setLocation: function(l){loc = l;}
			};

			getSpecs = function(){
				return {
					location: loc
				};
			};

			getLabelLocation = function(){return loc;};
			this.expose({changer:getChanger()});
		});
		this.extend('locus',function(){
			var pointSets = [], allPoints = [];
			useSpecs = function(_specs){};
			distance = function(p){
				return Math.min.apply(null, allPoints.map(function(pp){return pp.minus(p).mod();}));
			};
			toString = function(){return 'locus()';};
			closestPointTo = function(p){
				return allPoints.lastMin(function(pp){return pp.minus(p).mod();});
			};

			filter = shapeFilter.LOCUS;

			changer = {
				setPointSets: function(ps){
					pointSets = ps;
					allPoints = ps.reduce(function(a,b){return a.concat(b);},[]);
				}
			};

			getSpecs = function(){
				return {
					pointSets: pointSets
				};
			};
			this.expose({changer:getChanger()});
		});
	});
});