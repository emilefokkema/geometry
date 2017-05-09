define(["canvas","shapeFilter","planeMath","structure"],function(canvas, shapeFilter, planeMath, structure){
	var selectLocationOrPoint = function(send, suggest, tooltipMessage){
		canvas.setMouseFilter(shapeFilter.POINT);
		canvas.setShapeCursor(canvas.cursor.pointer);
		canvas.onmouseovernotshape(function(e){
			suggest(planeMath.point(e.clientX, e.clientY));
		});
		canvas.onmouseovershape(function(s, e, tooltip){
			tooltip(tooltipMessage);
			suggest(s.closestPointTo(planeMath.point(e.clientX, e.clientY)));
		});
		canvas.onclicknotshape(function(e){
			send(planeMath.point(e.clientX, e.clientY));
		});
		canvas.onclickshape(function(s,e){
			send(s.closestPointTo(planeMath.point(e.clientX, e.clientY)), s);
		});
	};
	var selectLocationOrShapeOrIntersection = function(send, suggest, tooltipMessage){
		canvas.setMouseFilter(shapeFilter.NOT_LOCUS);
		canvas.setShapeCursor(canvas.cursor.none);
		canvas.setNoShapeCursor(canvas.cursor.none);
		canvas.onmousedownonshape();
		canvas.onmouseovernotshape(function(e){
			suggest(planeMath.point(e.clientX, e.clientY));
		});
		canvas.onmouseovershape(function(s,e, tooltip){
			tooltip(tooltipMessage);
			suggest(s.closestPointTo(planeMath.point(e.clientX, e.clientY)));
		});
		canvas.onmouseoverintersection(function(i, e, tooltip){
			tooltip(tooltipMessage);
			suggest(i.calculate());
		});
		canvas.onclicknotshape(function(e){
			send(planeMath.point(e.clientX, e.clientY));
		});
		canvas.onclickshape(function(s, e){
			send(s.closestPointTo(planeMath.point(e.clientX, e.clientY)), s);
		});
		canvas.onclickintersection(function(i){
			send(null, null, i);
		});
	};
	var selectPoint = function(send, suggest, tooltipMessage){
		suggest = suggest || function(){};
		canvas.setMouseFilter(shapeFilter.POINT);
		canvas.setShapeCursor(canvas.cursor.pointer);
		canvas.setNoShapeCursor(canvas.cursor.none);
		canvas.onmousedownonshape();
		canvas.onclickshape(function(s, e){
			send(s);
		});
		canvas.onmouseovernotshape(function(e){
			suggest(planeMath.point(e.clientX, e.clientY));
		});
		canvas.onmouseovershape(function(s, e, tooltip){
			tooltip(tooltipMessage);
			suggest(s.closestPointTo(planeMath.point(e.clientX, e.clientY)));
		});
	};
	var selectLine = function(send){
		selectShape(send, shapeFilter.LINE);
	};
	var selectShape = function(send, mouseFilter, tooltipMessage){
		mouseFilter = mouseFilter || shapeFilter.ALL;
		canvas.setMouseFilter(mouseFilter);
		canvas.setShapeCursor(canvas.cursor.pointer);
		canvas.setNoShapeCursor(canvas.cursor.none);
		canvas.onmousedownonshape();
		canvas.onmouseovershape(function(s, e, tooltip){
			tooltip(tooltipMessage);
		});
		canvas.onmouseovernotshape();
		canvas.onclickshape(function(s, e){
			send(s);
		});

	};
	var self = {
		doNothing: function(){
			canvas.setMouseFilter(shapeFilter.ALL);
			canvas.setShapeCursor(canvas.cursor.abouttograb);
			canvas.setNoShapeCursor(canvas.cursor.none);
			canvas.onclickshape();
			canvas.onclicknotshape();
			canvas.onmousedownonshape(self.startMoving);
			canvas.onmouseovershape();
			canvas.onmouseoverintersection();
			canvas.onclickintersection();
			canvas.onmouseovernotshape();
			canvas.onmouseupSingle();
		},
		select: function(stop){
			canvas.setMouseFilter(shapeFilter.ALL);
			canvas.onmousedownonshape();
			canvas.setNoShapeCursor(canvas.cursor.none);
			canvas.setShapeCursor(canvas.cursor.none);
			canvas.onclickshape(function(s, e){
				canvas.selectShape(s);
			});
			canvas.onclicknotshape(function(e){
				canvas.clearSelection();
			});
			return function(){
				canvas.clearSelection();
				stop();
			};
		},
		hideUnhide: function(stop){
			canvas.showHidden();
			canvas.setMouseFilter(shapeFilter.ALL);
			canvas.onmousedownonshape();
			canvas.setNoShapeCursor(canvas.cursor.none);
			canvas.setShapeCursor(canvas.cursor.none);
			canvas.onclicknotshape();
			canvas.onclickshape(function(s, e){
				s.hideUnhide();
			});
			return function(){
				canvas.hideHidden();
				stop();
			};
		},
		startMoving: function(s, e){
			canvas.setShapeCursor(canvas.cursor.grabbing);
			canvas.setNoShapeCursor(canvas.cursor.grabbing);
			var doMove = function(e){
				s.dragTo(planeMath.point(e.clientX, e.clientY));
			};

			canvas.onmouseupSingle(self.doNothing);
			canvas.onmouseovershape(function(s, e){doMove(e);});
			canvas.onmouseovernotshape(doMove);
			canvas.onmouseoverintersection(function(i,e){doMove(e);});
			doMove(e);
		},
		makePointStructure: function(res, stop){
			var p = canvas.addPoint({
				location: planeMath.point(200,200)
			}, true);
			
			selectLocationOrShapeOrIntersection(function(l, s, i){
				if(i){
					res(structure.pointOnIntersection(p, i));
				}else{
					if(s){
						res(structure.point(p, s));
					}else{
						res(structure.point(p));
					}
				}
				p.exclude(false);
				stop();
			},function(l){
				p.getChanger().setLocation(l);
			},function(s){
				return "on this " + s.toString();
			});
			
			return function(){
				p.remove();
				stop();
			};
		},
		makeCircleStructure: function(res, stop){
			var revert = stop;
			var chosenCenter, growCircle, circle;
			selectPoint(function(s){
				chosenCenter = s;
				circle = canvas.addCircle({center:chosenCenter.getSpecs().location,r:20});
				growCircle = function(p){circle.getChanger().setR(p.minus(chosenCenter.getSpecs().location).mod());};
				selectLocationOrPoint(function(l, p){
					if(p){
						res(structure.circle(chosenCenter, circle, p));
						stop();
					}else{
						res(structure.circle(chosenCenter, circle));
						stop();
					}
				},function(l){
					growCircle(l);
				}, "this circumference point");
				
				revert = function(){
					circle.remove();
					stop();
				};
			}, function(){}, "center here");
			return function(){
				revert();
			};
		},
		makeLineStructure: function(res, stop){
			var revert = stop;
			var chosenP1, moveLine, line;
			selectPoint(function(s){
				chosenP1 = s;
				line = canvas.addLine({p1:chosenP1.getSpecs().location, p2:chosenP1.getSpecs().location.plus(planeMath.point(100,0))});
				moveLine = function(p){line.getChanger().moveTo(p);};
				selectLocationOrPoint(function(l, p){
					if(p){
						res(structure.line(chosenP1, line, p));
						stop();
					}else{
						res(structure.line(chosenP1, line));
						stop();
					}
				},function(l){
					moveLine(l);
				},"...and this point");
				
				revert = function(){
					line.remove();
					stop();
				};
			}, function(){}, "through this point...");
			return function(){
				revert();
			};
		},
		makeSegmentStructure: function(res, stop){
			var revert = stop;
			var moveSegment, segment;
			selectPoint(function(p1){
				segment = canvas.addSegment({p1:p1.getSpecs().location, p2:p1.getSpecs().location.plus(planeMath.point(100,0))});
				moveSegment = function(p){segment.getChanger().setP2(p);};
				selectPoint(function(p2){
					res(structure.segment(p1, segment, p2));
					stop();
				},function(l){
					moveSegment(l);
				},"...to this point");
				revert = function(){
					segment.remove();
					stop();
				};
			}, function(){}, "from this point...");
			return function(){
				revert();
			};
		},
		makePerpendicularLine: function(res, stop){
			var chosenPoint, revert = stop;
			selectPoint(function(s){
				chosenPoint = s;
				selectShape(function(l){
					var lSpecs = l.getSpecs(), p1 = chosenPoint.getSpecs().location, p2 = p1.plus(lSpecs.p2.minus(lSpecs.p1).matrix(0,-1,1,0));
					var perpLine = canvas.addLine({p1:p1, p2:p2});
					res(structure.perpendicularLine(chosenPoint, perpLine, l));
					stop();
				}, shapeFilter.LINE | shapeFilter.SEGMENT, function(s){return "perpendicular to this "+s.toString();});
			},function(){},"through this point");
			return function(){
				revert();
			};
		},
		makeParellelLine: function(res, stop){
			var chosenPoint, revert = stop;
			selectPoint(function(s){
				chosenPoint = s;
				selectShape(function(l){
					var lSpecs = l.getSpecs(), p1 = chosenPoint.getSpecs().location, p2 = p1.plus(lSpecs.p2.minus(lSpecs.p1));
					var perpLine = canvas.addLine({p1:p1, p2:p2});
					res(structure.parallelLine(chosenPoint, perpLine, l));
					stop();
				}, shapeFilter.LINE | shapeFilter.SEGMENT, function(s){return "...parallel to this "+s.toString();});
			},function(){},"through this point...");
			return function(){
				revert();
			};
		},
		makePerpendicularBisector: function(res, stop){
			var p1, revert = stop;
			selectPoint(function(p1){
				selectPoint(function(p2){
					var p1loc = p1.getSpecs().location, p2loc = p2.getSpecs().location, newp1loc = p1loc.plus(p2loc).scale(1/2);
					var perpBis = canvas.addLine({
						p1: newp1loc,
						p2: newp1loc.plus(p2loc.minus(p1loc).matrix(0, -1, 1, 0))
					});
					res(structure.perpendicularBisector(p1, perpBis, p2));
					stop();
				},function(){},"...and this point");
			},function(){},"between this point...");
			return function(){
				revert();
			};
		},
		makeLocus: function(res, stop){
			
			selectPoint(function(point1){
				selectPoint(function(point2){
					res(structure.locus(point1, canvas.addLocus({}), point2));
					stop();
				},function(){},"...with respect to this point");
			},function(){},"the locus of this point...");
			return stop;
		},
		makePointLineReflection: function(res, stop){
			selectPoint(function(p){
				selectShape(function(l){
					var lSpecs = l.getSpecs();
					var refl = canvas.addPoint({location: planeMath.reflectPointInLine(lSpecs.p1, lSpecs.p2, p.getSpecs().location)});
					res(structure.pointLineReflection(p, l, refl));
					stop();
				}, shapeFilter.LINE | shapeFilter.SEGMENT, function(s){return "...with respect to this "+s.toString();});
			}, function(){}, "reflect this point");
			return stop;
		},
		makeMidpoint: function(res, stop){
			selectPoint(function(p1){
				selectPoint(function(p2){
					var p = canvas.addPoint({location:p1.getSpecs().location.plus(p2.getSpecs().location).scale(0.5)});
					res(structure.midpoint(p1, p, p2));
					stop();
				},function(){},"...and this point");
			},function(){},"the point between this point...");
			return stop;
		},
		makeAngleBisector: function(res, stop){
			selectPoint(function(p1){
				selectPoint(function(p2){
					selectPoint(function(p3){
						var p1Loc = p1.getSpecs().location, p2loc = p2.getSpecs().location, p3Loc = p3.getSpecs().location;
						var p = planeMath.getPointOnAngleBisector(p1Loc, p2loc, p3Loc);
						var l = canvas.addLine({p1: p2loc, p2: p});
						res(structure.angleBisector(p1, p2, p3, l));
						stop();
					},function(){},"...this point.");
				},function(){},", this point, and...");
			},function(){},"bisect angle defined by this point, ...");
			return stop;
		},
		setLabel:function(res, stop){
			var revert = stop;
			selectShape(function(s){
				var labelloc = s.getLabelLocation();
				requireElement("<input type='text' style='width:30px;position:absolute;left:"+(labelloc.x + 5)+"px;top:"+(labelloc.y - 15)+"px' id='1'>", function(input){
					var remove = function(){
						document.body.removeChild(input);
					};
					document.body.appendChild(input);
					input.focus();
					input.addEventListener('blur',function(){
						s.setLabel(input.value);
						remove();
						res();
						stop();
					});
					
					revert = function(){
						remove();
						stop();
					};
				});
			});
			return function(){
				revert();
			};
		}
	};
	return self;
});