define(["planeMath","intersectionSet","copySet","log","distinctArray","sender","throttle"],function(planeMath, intersectionSet, copySet, log, distinctArray, sender, throttle){
	var linkExistence;
	var allLinks = [];
	
	
	var intersectionLinks = [];
	var getLinksForDependentShape = function(s){
		return allLinks.filter(function(l){return l.dependent == s;});
	};
	var isDependentShape = function(s){
		return getLinksForDependentShape(s).length > 0 || getIntersectionLinksForDependentShape(s).length > 0;
	};
	var isMovableShape = function(s){
		return !isDependentShape(s) || (getIntersectionLinksForDependentShape(s).length == 0 && !getLinksForDependentShape(s).some(function(l){return l.freedom == 0;}));
	};
	var getIntersectionLinksForDependentShape = function(s){
		return intersectionLinks.filter(function(l){return l.p == s;});
	};
	var getAllLinkedShapes = function(dependent, soFar){
		soFar = soFar || distinctArray([dependent]);
		getLinksForDependentShape(dependent).map(function(l){
			soFar.push(l.independent);
			getAllLinkedShapes(l.independent, soFar);
		});
		getIntersectionLinksForDependentShape(dependent).map(function(l){
			soFar.push(l.s1);
			soFar.push(l.s2);
			getAllLinkedShapes(l.s1, soFar);
			getAllLinkedShapes(l.s2, soFar);
		});
		return soFar.arr;
	};
	var getAllLinksForShape = function(dependent, soFar){
		soFar = soFar || distinctArray([]);
		getLinksForDependentShape(dependent).map(function(l){
			soFar.push(l);
			getAllLinksForShape(l.independent, soFar);
		});
		getIntersectionLinksForDependentShape(dependent).map(function(l){
			soFar.push(l);
			getAllLinksForShape(l.s1, soFar);
			getAllLinksForShape(l.s2, soFar);
		});
		return soFar.arr;
	};
	
	var changeLink = function(dependent, independent, howToChange, constants, freedom){
		var apply = function(){
			independent.onchange(function(oldSpecs, newSpecs){
				howToChange(oldSpecs, newSpecs, dependent.getChanger(), constants ? constants.map(function(s){return s.getSpecs();}) : [], dependent, independent);
			});
			linkExistence(dependent, [independent]);
		};
		var clone = function(getCopyFor, getIntersectionForShapes){
			return changeLink(getCopyFor(dependent), getCopyFor(independent), howToChange, constants ? constants.map(getCopyFor): [], freedom);
		};
		return {
			dependent: dependent,
			independent: independent,
			howToChange: howToChange,
			constants: constants,
			freedom:freedom,
			apply:apply,
			clone:clone
		};
	};
	var intersectionLink = function(pointShape, s1, s2, i){
		var apply = function(){
			var setLocation = function(){
				var loc = i.calculate();
				if(loc){
					pointShape.makeAvailable(true);
					pointShape.getChanger().setLocation(loc);
				}else{
					pointShape.makeAvailable(false);
				}
			};
			linkExistence(pointShape, [i.s1, i.s2]);
			i.s1.onchange(setLocation);
			i.s2.onchange(setLocation);
			setLocation();
		};
		var clone = function(getCopyFor, getIntersectionForShapes){
			return intersectionLink(
				getCopyFor(pointShape),
				getCopyFor(s1),
				getCopyFor(s2),
				getIntersectionForShapes(
					getCopyFor(s1),
					getCopyFor(s2),
					getCopyFor(pointShape).getSpecs().location
					)
				);
		};
		return {
			s1:s1,
			s2:s2,
			p: pointShape,
			apply: apply,
			clone: clone
		};
	};

	var movePointAround = function(pointShape){
		var independent = getLinksForDependentShape(pointShape)[0].independent;
		return independent.movePointAround(pointShape.getSpecs().location);
	};
	linkExistence = function(s, ss){
		ss.map(function(s_){
			if(s_.onremove){
				s_.onremove(function(){s.remove();});
			}
			s_.onchangeavailability(function(b){s.makeAvailable(b);});
		});
	};
	var linkChange = function(dependent, independent, howToChange, constants, freedom){
		freedom = freedom || 0;
		var link = changeLink(dependent, independent, howToChange, constants, freedom);
		allLinks.push(link);
		link.apply();
	};
	var linkToIntersection = function(dependentPoint, s1, s2, i){
		var link = intersectionLink(dependentPoint, s1, s2, i);
		intersectionLinks.push(link);
		link.apply();
	};
	var maker = {
		point: function(canvasPoint, canvasShape){
			var putOnShapeClosestTo;
			if(!canvasShape){
				canvasPoint.ondrag(function(p){
					canvasPoint.getChanger().setLocation(p);
				});
			}else{
				putOnShapeClosestTo = function(p){
					canvasPoint.getChanger().setLocation(canvasShape.closestPointTo(p));
				};
				canvasPoint.ondrag(putOnShapeClosestTo);
				putOnShapeClosestTo(canvasPoint.getSpecs().location);
				linkChange(canvasPoint, canvasShape, function(oldSpecs, newSpecs, changer, constants, dependent, independent){
					changer.setLocation(independent.repositionPoint(dependent.getSpecs().location, oldSpecs, newSpecs));
				}, null, 1);
			}
			
			return {
				onchange: function(f){canvasPoint.onchange(f);}
			};
		},
		pointOnIntersection: function(canvasPoint, i){
			
			linkToIntersection(canvasPoint, i.s1, i.s2, i);
		},
		arc:function(canvasEnd1, canvasEnd2, canvasMiddle, canvasArc){
			linkChange(
				canvasArc,
				canvasEnd1,
				function(oldSpecs, newSpecs, changer){
					changer.setEnd1(newSpecs.location);
				},
				null,0
				);
			linkChange(
				canvasArc,
				canvasEnd2,
				function(oldSpecs, newSpecs, changer){
					changer.setEnd2(newSpecs.location);
				},
				null,0
				);
			linkChange(
				canvasArc,
				canvasMiddle,
				function(oldSpecs, newSpecs, changer){
					changer.setMiddle(newSpecs.location);
				},
				null,0
				);
		},
		circle: function(canvasPointCenter, canvasCircle, canvasPointBoundary){
			if(!canvasPointBoundary){
				linkChange(canvasCircle, canvasPointCenter, function(oldSpecs, newSpecs, changer){
					changer.setCenter(newSpecs.location);
				}, null, 1);
				canvasCircle.ondrag(function(p){
					var center = canvasCircle.getSpecs().center;
					var changer = canvasCircle.getChanger();
					changer.setR(center.minus(p).mod());
				});
			}else{
				
				linkChange(
					canvasCircle,
					canvasPointBoundary,
					function(oldSpecs, newSpecs, changer, constants){
						changer.together(function(){
							this.setCenter(constants[0].location);
							this.setR(newSpecs.location.minus(constants[0].location).mod());
						});
					},
					[canvasPointCenter], 0);
				linkChange(
					canvasCircle,
					canvasPointCenter,
					function(oldSpecs, newSpecs, changer, constants){
						changer.together(function(){
							this.setCenter(newSpecs.location);
							this.setR(newSpecs.location.minus(constants[0].location).mod());
						});
					},
					[canvasPointBoundary], 0);
			}
		},
		line: function(canvasPoint1, canvasLine, canvasPoint2){
			if(!canvasPoint2){
				canvasLine.ondrag(function(p){
					canvasLine.getChanger().moveTo(p);
				});

				linkChange(canvasLine, canvasPoint1, function(oldSpecs, newSpecs, changer){
					var diff = newSpecs.location.minus(oldSpecs.location);
					changer.translateBy(diff);
				}, null, 1);
			}else{
				var changer = canvasLine.getChanger();
				changer.setP1(canvasPoint1.getSpecs().location);
				changer.setP2(canvasPoint2.getSpecs().location);
				
				

				linkChange(canvasLine, canvasPoint2, function(oldSpecs, newSpecs, changer){
					changer.setP2(newSpecs.location);
				}, null, 0);

				linkChange(canvasLine, canvasPoint1, function(oldSpecs, newSpecs, changer){
					changer.setP1(newSpecs.location);
				}, null, 0);
			}
		},
		segment: function(canvasPoint1, s, canvasPoint2){
			linkChange(s, canvasPoint2, function(oldSpecs, newSpecs, changer){
				changer.setP2(newSpecs.location);
			}, null, 0);

			linkChange(s, canvasPoint1, function(oldSpecs, newSpecs, changer){
				changer.setP1(newSpecs.location);
			}, null, 0);
		},
		perpendicularLine: function(canvasPoint, canvasPerpendicularLine, canvasLine){
			linkChange(canvasPerpendicularLine, canvasPoint, function(oldSpecs, newSpecs, changer){
				changer.translateBy(newSpecs.location.minus(oldSpecs.location));
			}, null, 0);

			linkChange(canvasPerpendicularLine, canvasLine, function(oldSpecs, newSpecs, changer){
				changer.setFromP1(newSpecs.p2.minus(newSpecs.p1).matrix(0, -1, 1, 0));
			}, null, 0);
		},
		parallelLine: function(canvasPoint, canvasParallelLine, canvasLine){
			linkChange(canvasParallelLine, canvasPoint, function(oldSpecs, newSpecs, changer){
				changer.translateBy(newSpecs.location.minus(oldSpecs.location));
			}, null, 0);

			linkChange(canvasParallelLine, canvasLine, function(oldSpecs, newSpecs, changer){
				changer.setFromP1(newSpecs.p2.minus(newSpecs.p1));
			}, null, 0);
		},
		perpendicularBisector: function(canvasPoint1, perpBis, canvasPoint2){
			linkChange(perpBis, canvasPoint1, function(oldSpecs, newSpecs, changer, constants){
				changer.together(function(){
					this.setP1(newSpecs.location.plus(constants[0].location).scale(1/2));
					this.setFromP1(constants[0].location.minus(newSpecs.location).matrix(0, -1, 1, 0));
				});
			}, [canvasPoint2], 0);

			linkChange(perpBis, canvasPoint2, function(oldSpecs, newSpecs, changer, constants){
				changer.together(function(){
					this.setP1(constants[0].location.plus(newSpecs.location).scale(1/2));
					this.setFromP1(newSpecs.location.minus(constants[0].location).matrix(0, -1, 1, 0));
				});
			}, [canvasPoint1], 0);
		},
		pointLineReflection: function(canvasPoint, line, canvasPointReflection){
			linkChange(canvasPointReflection, line, function(oldSpecs, newSpecs, changer, constants){
				changer.setLocation(planeMath.reflectPointInLine(newSpecs.p1, newSpecs.p2, constants[0].location));
			}, [canvasPoint], 0);

			linkChange(canvasPointReflection, canvasPoint, function(oldSpecs, newSpecs, changer, constants){
				changer.setLocation(planeMath.reflectPointInLine(constants[0].p1, constants[0].p2, newSpecs.location));
			}, [line], 0);
		},
		locus: function(canvasPoint1, locusShape, canvasPoint2){
			var allShapesInvolved = getAllLinkedShapes(canvasPoint1);
			var shapesToWatch = allShapesInvolved.filter(function(s){return isMovableShape(s);});

			if(shapesToWatch.some(function(s){return s == canvasPoint2;}) && isDependentShape(canvasPoint2)){
				console.log("ok");
				var allLinks = getAllLinksForShape(canvasPoint1);
				var intersections = intersectionSet();
				var copies = copySet(allShapesInvolved, function(s){return s.getNewShapeLogic();});
				intersections.makeForShapes(copies.allCopies());
				allLinks.map(function(l){
					l.clone(copies.copyOf, intersections.getForShapes).apply();
				});
				var p1Copy = copies.copyOf(canvasPoint1), p2Copy = copies.copyOf(canvasPoint2);
				var setAllCopies = (function(){
					var result = sender();
					allShapesInvolved.map(function(o){
						var c = copies.copyOf(o);
						result.add(function(){
							c.getChanger().useSpecs(o.getSpecs());
						});
					});
					return result;
				})();
				
				var createPoints = throttle(function(){
					console.log("create points");
					var originalPoints = movePointAround(canvasPoint2), pointSets = [], newPoints = [];
					pointSets.push(newPoints);
					originalPoints.map(function(p){
						p2Copy.getChanger().setLocation(p);
						if(p1Copy.isAvailable()){
							newPoints.push(p1Copy.getSpecs().location);
						}else{
							newPoints = [];
							pointSets.push(newPoints);
						}
					});
					locusShape.getChanger().setPointSets(pointSets);
					
				}, 10);
				canvasPoint1.onchange(function(oldSpecs, newSpecs){
					setAllCopies();
					createPoints();
				});
				canvasPoint1.onremove(function(){
					locusShape.remove();
				});
				locusShape.onremove(function(){createPoints = function(){};});
				createPoints();
			}else{
				console.log("not ok");
			}
		},
		midpoint: function(canvasPoint1, canvasPoint2, canvasPoint3){
			linkChange(canvasPoint2, canvasPoint1, function(oldSpecs, newSpecs, changer, constants){
				changer.setLocation(newSpecs.location.plus(constants[0].location).scale(0.5));
			}, [canvasPoint3], 0);

			linkChange(canvasPoint2, canvasPoint3, function(oldSpecs, newSpecs, changer, constants){
				changer.setLocation(newSpecs.location.plus(constants[0].location).scale(0.5));
			}, [canvasPoint1], 0);
		},
		angleBisector: function(canvasPoint1, canvasPoint2, canvasPoint3, line){
			linkChange(line, canvasPoint1, function(oldSpecs, newSpecs, changer, constants){
				changer.together(function(){
					this.setP1(constants[0].location);
					this.setP2(planeMath.getPointOnAngleBisector(newSpecs.location, constants[0].location, constants[1].location));
				});
			}, [canvasPoint2, canvasPoint3], 0);

			linkChange(line, canvasPoint2, function(oldSpecs, newSpecs, changer, constants){
				changer.together(function(){
					this.setP1(newSpecs.location);
					this.setP2(planeMath.getPointOnAngleBisector(constants[0].location, newSpecs.location, constants[1].location));
				});
			}, [canvasPoint1, canvasPoint3], 0);

			linkChange(line, canvasPoint3, function(oldSpecs, newSpecs, changer, constants){
				changer.together(function(){
					this.setP1(constants[1].location);
					this.setP2(planeMath.getPointOnAngleBisector(constants[0].location, constants[1].location, newSpecs.location));
				});
			}, [canvasPoint1, canvasPoint2], 0);
		}
	};
	log.register(maker);
	return maker;
});
	

	
