define([
	"planeMath",
	"sender",
	"copySet",
	"shapeFilter",
	"intersectionSet",
	"throttle",
	"shapeLogic",
	"intersectWithBox"
	],function(planeMath, sender, copySet, shapeFilter, intersectionSet, throttle, shapeLogic, intersectWithBox){
	var w = document.body.offsetWidth, h = document.body.offsetHeight;
	var context, c = document.createElement('canvas');
	c.setAttribute('width', w);
	c.setAttribute('height', h);
	document.body.appendChild(c);
	context = c.getContext('2d');
	var ondraw = sender();
	var onshapechange = sender();
	var onmouseup = sender();
	var onmousedown = sender();
	var onclear = sender();
	var showHidden = false;

	var currentMouseFilter = shapeFilter.ALL;

	var tooltip = (function(){
		var x=100,y=100;
		var visible = true;
		var text = "hoi";
		var setPosition = function(xx,yy){
			x = xx;
			y = yy;
		};
		var draw = function(ctx){
			if(visible){
				ctx.fillStyle = "#f00";
				ctx.font = "12px Verdana";
				ctx.fillText(text, x, y);
			}
		};
		var setVisible = function(b){visible = b;};
		var setText = function(t){text = t;};
		return {
			setVisible: setVisible,
			draw: draw,
			setPosition: setPosition,
			setText:setText
		};
	})();

	var shape = makeModule(function(specs){
		var fill = specs.fill || 'transparent';
		var stroke = specs.stroke || 'black';
		var changedStroke = stroke;
		var thickness = specs.thickness || 1.5;
		var name = specs.name || 'shape';
		var label = '';
		var selected = false;
		var hidden = false;
		var draw = function(ctx){
			if(selected){
				ctx.setLineDash([5]);
				ctx.strokeStyle = '#00f';
			}else{
				ctx.setLineDash([]);
				ctx.strokeStyle = changedStroke;
			}
			if(hidden){
				ctx.strokeStyle = '#bbb';
			}
			ctx.fillStyle = stroke;
			var labelloc = logic.getLabelLocation();
			ctx.font = "12px Verdana";
			ctx.fillText(label, labelloc.x + 5, labelloc.y - 5);
			ctx.lineWidth = thickness;
			ctx.fillStyle = fill;

		};
		var logic;
		var contains = function(p){return logic.distance(p) < 10;};
		var onmouseover = sender().add(function(e){
			changedStroke = '#f00';
		});
		var ondrag = sender();
		var onmouseout = sender().add(function(e){
			changedStroke = stroke;
		});
		var onclick = sender();
		var hideUnhide = function(){
			hidden = !hidden;
		};
		var getNewShapeLogic = function(sp){};
		var toSvg = function(){};
		var setSvgAttributes = function(svgEl){
			svgEl.setAttribute('stroke',stroke);
			svgEl.setAttribute('stroke-width',thickness);
			svgEl.setAttribute('fill',fill);
		};
		var getLabelSvg = function(){
			if(label){
				var text = document.createElementNS('http://www.w3.org/2000/svg','text');
				text.setAttribute('font-family','Verdana');
				text.setAttribute('font-size','12px');
				text.setAttribute('fill', stroke);
				var loc = logic.getLabelLocation();
				text.setAttribute('x',loc.x + 5);
				text.setAttribute('y', loc.y - 5);
				text.appendChild(document.createTextNode(label));
				return text;
			}
			return null;
		};
		this.expose({
			draw: function(ctx){
				if(logic.isAvailable() && (!hidden || showHidden)){
					draw(ctx);
				}
			},
			getNewShapeLogic: function(){return getNewShapeLogic(logic.getSpecs());},
			isHidden:function(){return hidden;},
			isAvailable: function(){return logic.isAvailable();},
			contains: contains,
			makeAvailable: function(b){logic.makeAvailable(b);},
			onchangeavailability:function(f){logic.onchangeavailability(f);},
			onmouseover: onmouseover,
			onmouseout: onmouseout,
			onclick: onclick,
			ondrag: ondrag,
			onchange: function(f){logic.onchange(f);},
			setName: function(n){name = n;},
			toString:function(){return name;},
			toConstructionString:function(){
				return logic.toString() + (label ? '.{'+label+'}' : '') + (hidden ? 'h' : '');
			},
			getSpecs: function(){return logic.getSpecs();},
			getChanger: function(){return logic.changer;},
			dragTo: function(p){ondrag(p);},
			repositionPoint: function(p, oldSpecs, newSpecs){return logic.repositionPoint(p, oldSpecs, newSpecs);},
			passesFilter: function(f){return logic.passesFilter(f);},
			setSelected: function(b){selected = b;},
			hideUnhide: hideUnhide,
			closestPointTo:function(p){return logic.closestPointTo(p);},
			movePointAround: function(p){return logic.movePointAround(p);},
			setLabel:function(txt){label = txt;},
			getLabelLocation:function(){return logic.getLabelLocation();},
			toSvg:function(){
				var svg = toSvg();
				if(label){
					svg.push(getLabelSvg());
				}
				return svg;
			}
		});
		this.extend('arc', function(_specs){
			draw = this.override(draw, function(ctx){
				this(ctx);
				var radius = logic.getRadius();
				var center = logic.getCenter();
				var angles = logic.getAngles();
				ctx.beginPath();
				ctx.arc(center.x, center.y, radius, angles.from, angles.to, !angles.clockwise);
				ctx.stroke();
			});

			name = specs.name || 'arc';

			getNewShapeLogic = function(sp){return shapeLogic.arc(sp);};

			logic = getNewShapeLogic(_specs);
		});
		this.extend('circle', function(_specs){
			
			draw = this.override(draw, function(ctx){
				this(ctx);
				var sp = logic.getSpecs();
				ctx.beginPath();
				ctx.arc(sp.center.x, sp.center.y, sp.r, 0, 2*Math.PI);
				ctx.closePath();
				ctx.stroke();
			});

			name = specs.name || 'circle';

			getNewShapeLogic = function(sp){return shapeLogic.circle(sp);};

			logic = getNewShapeLogic(_specs);

			toSvg = function(){
				var circle = document.createElementNS('http://www.w3.org/2000/svg','circle');
				setSvgAttributes(circle);
				var sp = logic.getSpecs();
				circle.setAttribute('cx', sp.center.x);
				circle.setAttribute('cy', sp.center.y);
				circle.setAttribute('r', sp.r);
				return [circle];
			};
			
		});
		this.extend('line', function(_specs){

			draw = this.override(draw, function(ctx){
				this(ctx);
				var sp = logic.getSpecs();
				if(!sp.p1.equals(sp.p2)){
					var onEdges = intersectWithBox(sp.p1, sp.p2);
					
					ctx.beginPath();
					ctx.moveTo(onEdges.p1.x, onEdges.p1.y);
					ctx.lineTo(onEdges.p2.x, onEdges.p2.y);
					ctx.closePath();
					ctx.stroke();
				}
				
			});

			name = specs.name || 'line';

			getNewShapeLogic = function(sp){return shapeLogic.line(sp);};

			logic = getNewShapeLogic(_specs);

			toSvg = function(){
				var sp = logic.getSpecs();
				if(!sp.p1.equals(sp.p2)){
					var onEdges = intersectWithBox(sp.p1, sp.p2);
					var line = document.createElementNS('http://www.w3.org/2000/svg','line');
					setSvgAttributes(line);
					line.setAttribute('x1',onEdges.p1.x);
					line.setAttribute('y1',onEdges.p1.y);
					line.setAttribute('x2',onEdges.p2.x);
					line.setAttribute('y2',onEdges.p2.y);
					return [line];
				}
			};
		});
		this.extend('segment',function(_specs){
			draw = this.override(draw, function(ctx){
				this(ctx);
				var sp = logic.getSpecs();
				if(!sp.p1.equals(sp.p2)){
					
					
					ctx.beginPath();
					ctx.moveTo(sp.p1.x, sp.p1.y);
					ctx.lineTo(sp.p2.x, sp.p2.y);
					ctx.closePath();
					ctx.stroke();
				}
				
			});
			name = specs.name || 'segment';

			getNewShapeLogic = function(sp){return shapeLogic.segment(sp);};

			logic = getNewShapeLogic(_specs);

			toSvg = function(){
				var sp = logic.getSpecs();
				if(!sp.p1.equals(sp.p2)){
					
					var line = document.createElementNS('http://www.w3.org/2000/svg','line');
					setSvgAttributes(line);
					line.setAttribute('x1',sp.p1.x);
					line.setAttribute('y1',sp.p1.y);
					line.setAttribute('x2',sp.p2.x);
					line.setAttribute('y2',sp.p2.y);
					return [line];
				}
			};
		})
		this.extend('point',function(_specs){
			
			draw = this.override(draw, function(ctx){
				this(ctx);
				var sp = logic.getSpecs();
				ctx.fillStyle = ctx.strokeStyle;
				ctx.strokeStyle = 'transparent';
				ctx.beginPath();
				ctx.arc(sp.location.x, sp.location.y, 2*thickness, 0, 2*Math.PI);
				ctx.closePath();
				ctx.fill();
			});

			name = specs.name || 'point';
			getNewShapeLogic = function(sp){return shapeLogic.point(sp);}
			logic = getNewShapeLogic(_specs);

			toSvg = function(){
				var circle = document.createElementNS('http://www.w3.org/2000/svg','circle');
				circle.setAttribute('stroke','transparent');
				circle.setAttribute('fill', stroke);
				var sp = logic.getSpecs();
				circle.setAttribute('cx', sp.location.x);
				circle.setAttribute('cy', sp.location.y);
				circle.setAttribute('r', 2*thickness);
				return [circle];
			};
			
		});
		this.extend('locus', function(_specs){
			draw = this.override(draw, function(ctx){
				this(ctx);
				var ps = logic.getSpecs().pointSets;
				ps.map(function(s){
					ctx.beginPath();
					s.map(function(p, i){
						if(i==0){
							ctx.moveTo(p.x, p.y);
						}else{
							ctx.lineTo(p.x, p.y);
						}
					});
					ctx.stroke();
				});
			});
			name = specs.name || 'point';
			getNewShapeLogic = function(sp){return shapeLogic.locus(sp);}
			logic = getNewShapeLogic(_specs);
			toSvg = function(){
				var ps = logic.getSpecs().pointSets;
				return ps.map(function(s){
					var path = document.createElementNS('http://www.w3.org/2000/svg','path');
					setSvgAttributes(path);
					var d="";
					for(var i=0;i<s.length;i++){
						if(i==0){
							d += "M "+s[i].x+" "+s[i].y;
						}else{
							d += " L "+s[i].x+" "+s[i].y;
						}
					}
					path.setAttribute('d',d);
					return path;
				});
			};
		});
	});

	var intersections = intersectionSet();

	var shapes = [];

	var newShapeOnRemove = [];

	var wrapperSet = copySet([], function(s){
		var wrapper, onremove = sender();
		newShapeOnRemove.map(function(f){
			onremove.add(f(function(){return wrapper;}));
		});
		s.onchange(onshapechange);
		wrapper = {
			remove: function(){
				var index = shapes.indexOf(s);
				if(index != -1){
					shapes.splice(index, 1);
					intersections.removeForShape(s);
					wrapperSet.removeFor(s);
					onremove();
					draw();
				}
			},
			makeAvailable: function(b){s.makeAvailable(b)},
			onmouseover:function(f){s.onmouseover.add(f);},
			onmouseout: function(f){s.onmouseout.add(f);},
			onclick: function(f){s.onclick.add(f);},
			onchange: function(f){s.onchange(f);},
			onchangeavailability: function(f){s.onchangeavailability(f);},
			ondrag: function(f){s.ondrag.add(f);},
			onremove: function(f){onremove.add(f);},
			dragTo: function(p){s.dragTo(p);},
			getChanger: s.getChanger,
			getSpecs: s.getSpecs,
			exclude: function(b){s.toBeExcludedFromMouseEvents = b;},
			closestPointTo: s.closestPointTo,
			repositionPoint: s.repositionPoint,
			hideUnhide:s.hideUnhide,
			getNewShapeLogic: s.getNewShapeLogic,
			toString:s.toString,
			passesFilter:s.passesFilter,
			movePointAround: s.movePointAround,
			setLabel:s.setLabel,
			getLabelLocation:s.getLabelLocation,
			toConstructionString:s.toConstructionString
		};
		return wrapper;
	});

	var intersectionWrapperSet = copySet([], function(i){
		return {
			s1: wrapperBelongingTo(i.s1),
			s2: wrapperBelongingTo(i.s2),
			calculate: i.calculate,
			toConstructionString:function(getShapeName){
				var currentLoc = i.calculate();
				return 'intersection('+getShapeName(this.s1)+','+getShapeName(this.s2)+','+(currentLoc ? currentLoc.toString() : i.id.toString())+')';
			},
			toString:function(){return "intersection";}
		};
	});

	var wrapperBelongingTo = function(s){
		return wrapperSet.copyOf(s);
	};

	var shapeBelongingTo = function(w){
		return wrapperSet.originalOf(w);
	};

	var getIntersectionForShapesAndPoint = function(w1, w2, p){
		return intersectionWrapperSet.addFor(intersections.getForShapes(shapeBelongingTo(w1), shapeBelongingTo(w2), p));
	};

	var getIntersectionForShapesAndId = function(w1, w2, id){
		return intersectionWrapperSet.addFor(intersections.getForShapesAndId(shapeBelongingTo(w1), shapeBelongingTo(w2), id));
	};

	var draw = throttle(function(){
		c.width = w;
		shapes.map(function(s){
			s.draw(context);
		});
		tooltip.draw(context);
		ondraw();
	}, 10);

	var onmouseovershape = function(s, e){};

	var onclickshape = function(s, e){};

	var onmousedownonshape = function(s, e){};

	var onmouseovernotshape = function(e){};

	var onmouseoverintersection = function(s1, s2, e){};

	var onclickintersection = function(i, e){};

	var onmouseupSingle = function(e){};

	var onclicknotshape = function(e){};

	var addShape = function(s, toBeExcludedFromMouseEvents){
		shapes.map(function(ss){
			intersections.makeForShapes([s, ss]);
		});
		//s.setName('shape'+(shapes.length));
		s.toBeExcludedFromMouseEvents = toBeExcludedFromMouseEvents || false;
		shapes.push(s);
		shapes.sort((function(){
			var pointness = function(s){return s.passesFilter(shapeFilter.POINT)?1:0;};
			return function(a,b){return pointness(a) - pointness(b);};
		})());
		var wrapper = wrapperSet.addFor(s);
		draw();
		return wrapper;
	};

	var toSvg = function(){
		var svg = document.createElementNS('http://www.w3.org/2000/svg','svg');
		svg.setAttribute('width',w);
		svg.setAttribute('height', h);
		svg.setAttribute('xmlns','http://www.w3.org/2000/svg');
		shapes.map(function(s){
			if(s.isAvailable() && !s.isHidden()){
				var els = s.toSvg();
				if(els && els.length){
					els.map(function(el){
						svg.appendChild(el);
					});
				}
			}
		});
		return svg;
	};

	var selection = (function(){
		var all = [];
		var addShape = function(w){
			var s = shapeBelongingTo(w);
			s.setSelected(true);
			all.push(s);
		};
		var clear = function(){
			all.map(function(s){s.setSelected(false);});
			all = [];
		};
		var removeAll = function(){
			all.map(function(s){wrapperBelongingTo(s).remove();});
			clear();
		};
		return {
			addShape: addShape,
			clear: clear,
			removeAll:removeAll
		};
	})();

	var clear = function(){
		var all;
		while((all = wrapperSet.allCopies()).length > 0){
			all[0].remove();
		}
		onclear();
	};

	var mouseActionHandler = function(doToHitShape, doToNotHitShape, doIfNotHitShape, doToHitIntersection, drawAfter){
		doToHitShape = doToHitShape || function(){};
		doToNotHitShape = doToNotHitShape || function(){};
		doIfNotHitShape = doIfNotHitShape || function(){};
		doToHitIntersection = doToHitIntersection || function(){};
		var toReturn = function(e){
			tooltip.setVisible(false);
			var hitPoints, hitShape, hitIntersection, intersectingShape1, intersectingShape2, hitShapes = [];
			shapes.map(function(s){
				if(!s.toBeExcludedFromMouseEvents && s.isAvailable() && (!s.isHidden() || showHidden) && s.passesFilter(currentMouseFilter) && s.contains(planeMath.point(e.clientX, e.clientY))){
					hitShapes.push(s);
					
				}else{
					doToNotHitShape(s, e);
				}
			});
			if(hitShapes.length == 0){
				doIfNotHitShape(e);
			}else{
				tooltip.setPosition(e.clientX, e.clientY);
				tooltip.setVisible(true);
				tooltip.setText("");
				hitPoints = hitShapes.filter(function(s){return s.passesFilter(shapeFilter.POINT);});
				if(hitPoints.length > 0){
					doToHitShape(hitPoints[hitPoints.length - 1], e);
				}else{
					if(hitShapes.length == 1){
						doToHitShape(hitShapes[hitShapes.length - 1], e);
					}else{
						hitIntersection = intersections.getForShapes(hitShapes[hitShapes.length - 2], hitShapes[hitShapes.length - 1], planeMath.point(e.clientX, e.clientY));
						if(hitIntersection){
							doToHitIntersection((function(i){
								return intersectionWrapperSet.addFor(i);
							})(hitIntersection), e);
						}else{
							doToHitShape(hitShapes[hitShapes.length - 1], e);
						}
						
					}
				}
				
			}
			if(drawAfter){
				draw();
			}
			
		};
		return toReturn;
	};

	var cursorSetter = {
		abouttograb: function(){c.style.cursor = "-webkit-grab";},
		grabbing:function(){c.style.cursor = "-webkit-grabbing";},
		none: function(){c.style.cursor = "default";},
		pointer: function(){c.style.cursor = 'pointer';}
	};

	var shapeCursor = cursorSetter.none;
	var noShapeCursor = cursorSetter.none;
	var getTooltipTextFromSetter = function(wrappedShape, tooltipSetter){
		var result = "";
		var type = typeof tooltipSetter;
		if(type === "string"){
			return tooltipSetter;
		}
		if(type === "function"){
			return tooltipSetter(wrappedShape);
		}
		return result;
	};
	var moveHandler = mouseActionHandler(
		function(s, e){
			shapeCursor();
			s.onmouseover(e);
			var tooltipText = "";
			var wrapped = wrapperBelongingTo(s);
			onmouseovershape(wrapped, e, function(tooltipSetter){
				tooltipText = getTooltipTextFromSetter(wrapped, tooltipSetter);
			});
			tooltip.setText(tooltipText);
		},
		function(s, e){
			s.onmouseout(e);
		},
		function(e){
			noShapeCursor();
			onmouseovernotshape(e);
		},
		function(i, e){
			var tooltipText = "";
			onmouseoverintersection(i, e, function(tooltipSetter){
				tooltipText = getTooltipTextFromSetter(i, tooltipSetter);
			});
			tooltip.setText(tooltipText);
		},
		true
	);

	var downHandler = mouseActionHandler(
		function(s, e){
			onmousedownonshape(wrapperBelongingTo(s), e);
		}
	);

	var clickHandler = mouseActionHandler(
		function(s, e){
			s.onclick(e);
			onclickshape(wrapperBelongingTo(s), e);
		},
		function(s, e){
			s.onmouseout(e);
		},
		function(e){
			onclicknotshape(e);
		},
		function(i, e){
			onclickintersection(i, e);
		}
		
	);

	c.addEventListener('mousemove', moveHandler);

	c.addEventListener('mousedown', function(e){onmousedown(e);downHandler(e);});

	c.addEventListener('mouseup', function(e){
		onmouseupSingle(e);
		onmouseup(e);
		draw();
	});

	c.addEventListener('click', clickHandler);

	return {
		newShapeOnRemove:function(f){
			newShapeOnRemove.push(f);
		},
		addCircle: function(specs, toBeExcludedFromMouseEvents){
			return addShape(shape.circle({stroke:'#d66'}, specs), toBeExcludedFromMouseEvents);
		},
		addArc: function(specs, toBeExcludedFromMouseEvents){
			return addShape(shape.arc({stroke:'#d6d'}, specs), toBeExcludedFromMouseEvents);
		},
		addPoint: function(specs, toBeExcludedFromMouseEvents){
			return addShape(shape.point({stroke:'#66d'}, specs), toBeExcludedFromMouseEvents);
		},
		addLine: function(specs, toBeExcludedFromMouseEvents){
			return addShape(shape.line({stroke:'#6d6'}, specs), toBeExcludedFromMouseEvents);
		},
		addLocus: function(specs, toBeExcludedFromMouseEvents){
			return addShape(shape.locus({stroke:'#dd6'}, specs), toBeExcludedFromMouseEvents);
		},
		addSegment: function(specs, toBeExcludedFromMouseEvents){
			return addShape(shape.segment({stroke:'#d6d'}, specs), toBeExcludedFromMouseEvents);
		},
		onmouseovershape: function(f){onmouseovershape = f || function(){};},
		onmousedownonshape: function(f){onmousedownonshape = f || function(){};},
		onmouseovernotshape: function(f){
			onmouseovernotshape = f || function(){};
		},
		clear:clear,
		ondraw:function(f){ondraw.add(f);},
		onclear:function(f){onclear.add(f);},
		onshapechange:function(f){onshapechange.add(f);},
		getIntersectionForShapesAndPoint:getIntersectionForShapesAndPoint,
		getIntersectionForShapesAndId:getIntersectionForShapesAndId,
		onmouseoverintersection: function(f){onmouseoverintersection = f || function(){};},
		onclickintersection: function(f){onclickintersection = f || function(){};},
		onclickshape: function(f){onclickshape = f || function(){};},
		onclicknotshape: function(f){onclicknotshape = f || function(){};},
		onmouseupSingle: function(f){onmouseupSingle = f || function(){};},
		onmouseup:function(f){onmouseup.add(f);},
		onmousedown:function(f){onmousedown.add(f);},
		setMouseFilter: function(f){currentMouseFilter = f;},
		selectShape: function(s){selection.addShape(s);},
		clearSelection: function(){selection.clear();},
		removeSelection: function(){selection.removeAll();},
		showHidden:function(){showHidden = true;},
		hideHidden: function(){showHidden = false;},
		setShapeCursor: function(c){shapeCursor = c;},
		setNoShapeCursor: function(c){noShapeCursor = c;},
		cursor: cursorSetter,
		toSvg:toSvg

	};
});