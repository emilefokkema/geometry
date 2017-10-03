define(["canvas","planeMath","copySet","floatPattern","distinctArray"], function(canvas, planeMath, copySet, floatPattern, distinctArray){
	var allCalls = [];
	var call = function(f, name, args){
		var toString = function(getShapeName){
			return name+'('+args.map(getShapeName).join(',')+')';
		};
		return {
			f:f,
			name:name,
			args:args,
			apply:function(){
				f.apply(null, args);
			},
			toString:toString
		};
	};
	var addCall = function(f, name, args){
		allCalls.push(call(f, name, args));
	};
	var registeredMaker;
	var register = function(maker){
		registeredMaker = maker;
		for(var m in maker){
			if(maker.hasOwnProperty(m)){
				maker[m] = (function(orig, m){
					return function(){
						addCall(orig, m, Array.prototype.slice.apply(arguments));
						orig.apply(maker, arguments);
					};
				})(maker[m], m);
			}
		}
	};
	
	var toString = function(){
		var allShapes = distinctArray([]);
		allCalls.map(function(c){
			c.args.map(function(a){allShapes.push(a);});
		});
		var shapeNames = copySet(allShapes.arr, function(s, i){return i.toString();});
		return allCalls
			.map(function(c){
				return c.toString(shapeNames.copyOf);
			}).join('')+
			';['+
			allShapes.arr.map(function(s){
				return s.toConstructionString(shapeNames.copyOf);
			}).join(';')+";"+
			']';
	};
	var argumentMakers = [
		{
			level:0,
			matches:function(kind){return kind == "point";},
			make:function(info, label, hidden){
				console.log(label);
				return function(){
					var match = info.match(new RegExp("("+floatPattern+"),("+floatPattern+")"));
					var p = planeMath.point(parseFloat(match[1]), parseFloat(match[2]));
					p = canvas.addPoint({location:p});
					if(label){
						p.setLabel(label);
					}
					if(hidden){
						p.hideUnhide();
					}
					return p;
				};
			}
		},
		{
			level:0,
			matches:function(kind){return kind == "arc";},
			make:function(info, label, hidden){
				return function(){
					var match = info.match(new RegExp("\\(("+floatPattern+"),("+floatPattern+")\\),\\(("+floatPattern+"),("+floatPattern+")\\),\\(("+floatPattern+"),("+floatPattern+")\\)"));
					var arc = canvas.addArc({
						end1:planeMath.point(parseFloat(match[1]), parseFloat(match[2])),
						middle:planeMath.point(parseFloat(match[3]), parseFloat(match[4])),
						end2:planeMath.point(parseFloat(match[5]), parseFloat(match[6]))
					});
					if(label){
						arc.setLabel(label);
					}
					if(hidden){
						arc.hideUnhide();
					}
					return arc;
				};
			}
		},
		{
			level:0,
			matches:function(kind){return kind == "circle";},
			make:function(info, label, hidden){
				return function(){
					var match = info.match(new RegExp("\\(("+floatPattern+"),("+floatPattern+")\\),("+floatPattern+")"));
					var c = canvas.addCircle({center:planeMath.point(parseFloat(match[1]), parseFloat(match[2])),r:parseFloat(match[3])});
					if(label){
						c.setLabel(label);
					}
					if(hidden){
						c.hideUnhide();
					}
					return c;
				};
			}
		},
		{
			level:0,
			matches:function(kind){return kind == "line";},
			make:function(info, label, hidden){
				return function(){
					var match = info.match(new RegExp("\\(("+floatPattern+"),("+floatPattern+")\\),\\(("+floatPattern+"),("+floatPattern+")\\)"));
					var l = canvas.addLine({p1:planeMath.point(parseFloat(match[1]),parseFloat(match[2])),p2:planeMath.point(parseFloat(match[3]),parseFloat(match[4]))});
					if(label){
						l.setLabel(label);
					}
					if(hidden){
						l.hideUnhide();
					}
					return l;
				};
			}
		},
		{
			level:0,
			matches:function(kind){return kind == "segment";},
			make:function(info, label, hidden){
				return function(){
					var match = info.match(new RegExp("\\(("+floatPattern+"),("+floatPattern+")\\),\\(("+floatPattern+"),("+floatPattern+")\\)"));
					var l = canvas.addSegment({p1:planeMath.point(parseFloat(match[1]),parseFloat(match[2])),p2:planeMath.point(parseFloat(match[3]),parseFloat(match[4]))});
					if(label){
						l.setLabel(label);
					}
					if(hidden){
						l.hideUnhide();
					}
					return l;
				};
			}
		},
		{
			level:1,
			matches:function(kind){return kind == "intersection";},
			make:function(info){
				return function(argByIndex){
					var matchWithId, matchWithPoint = info.match(new RegExp("(\\d+),(\\d+),\\(("+floatPattern+"),("+floatPattern+")\\)"));
					if(matchWithPoint){
						return canvas.getIntersectionForShapesAndPoint(argByIndex(matchWithPoint[1]), argByIndex(matchWithPoint[2]), planeMath.point(parseFloat(matchWithPoint[3]), parseFloat(matchWithPoint[4])));
					}
					else{
						matchWithId = info.match(new RegExp("(\\d+),(\\d+),(\\d+)"));
						return canvas.getIntersectionForShapesAndId(argByIndex(matchWithId[1]), argByIndex(matchWithId[2]), parseInt(matchWithId[3]));
					}
				};
			}
		},{
			level:0,
			matches:function(kind){return kind == "locus";},
			make:function(info, label, hidden){
				return function(){
					return canvas.addLocus({});
				};
			}
		}
	];
	
	var backFromString = function(s){
		var match = s.match(/^((?:\w+\([^)]+\))+);\[([^\]]+)\]$/);
		if(match){
			var commands = match[1].match(/\w+\([^)]+\)(?:\.\{[^}]+\})?/g);
			var argsStrings = match[2].match(/.*?;/g);
			var makers = argsStrings.map(function(s){
				var match = s.match(/(\w+)\((.*)\)(?:\.\{([^}]+)\})?(h)?;/);
				var maker = argumentMakers.filter(function(m){return m.matches(match[1])})[0];
				return {level:maker.level,make:maker.make(match[2], match[3], match[4])};
			});
			var argsArr = Array.apply(null, new Array(argsStrings.length));
			var argByIndex = function(i){return argsArr[i];};
			var levels = distinctArray(makers.map(function(m){return m.level;})).arr.sort(function(a,b){return a-b;});
			levels.map(function(l){
				makers.filter(function(m){return m.level == l}).map(function(m){
					argsArr[makers.indexOf(m)] = m.make(argByIndex);
				});
			});
			commands.map(function(c){
				var match = c.match(/(\w+)\(([^)]+)\)/);
				var methodName = match[1];
				var args = match[2].match(/\d+/g).map(function(i){return argsArr[parseInt(i)];});
				registeredMaker[methodName].apply(null, args);
			});
		}
	};
	var removeCallsWithArgument = function(a){
		allCalls = allCalls.filter(function(c){
			return !c.args.some(function(aa){return aa == a;});
		});
	};
	canvas.newShapeOnRemove(function(getWrapper){
		return function(){
			removeCallsWithArgument(getWrapper());
		};
	});
	return {
		addCall: addCall,
		register:register,
		toString:toString,
		backFromString:backFromString,
		removeCallsWithArgument:removeCallsWithArgument
	};
});
	

	
