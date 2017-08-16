define(["canvas","action","hash"],function(canvas, action, hash){
	var button = (function(){
		var positionProvider = function(){
			var x = 20, y = 20;
			return {
				next:function(){
					var p = {x:x,y:y};
					x += 40;
					if(x>=300){
						x = 20;
						y+=40;
					}
					return p;
				}
			};
		};
		var leftPosition = positionProvider(), rightPosition = positionProvider();
		var addClass = function(el, name){
			el.setAttribute('class', el.getAttribute('class') + " "+name);
		};
		var removeClass = function(el, name){
			el.setAttribute('class', el.getAttribute('class').split(/[\s]+/g).filter(function(c){return c!=name;}).join(' '));
		};
		var button = function(a, className, right){
			var p = (right ? rightPosition : leftPosition).next();
			var b = requireElement("<div id='1' class='button"+(className?" "+className:"")+"' style='"+(right ? "right:"+p.x+"px" : "left:"+p.x+"px")+";top:"+p.y+"px'></div>", function(div){
				var makeActive = function(){addClass(div, 'active');};
				var makeNonActive = function(){removeClass(div, 'active');};
				var normalOnClick = function(e){
					var stop;
					e.preventDefault();
					makeActive();
					stop = a(function(){
						makeNonActive();
						div.onclick = normalOnClick;
					});
					if(stop){
						div.onclick = function(){
							stop();
							makeNonActive();
							div.onclick = normalOnClick;
						};
					}
					
				};
				div.onclick = normalOnClick;
				document.body.appendChild(div);
			});
		};
		return button;
	})();

	button(function(deactivateButton){
		return action.makePointStructure(function(p){
			
		}, function(){
			action.doNothing();
			hash.write();
			deactivateButton();
		});
	}, "point");

	button(function(deactivateButton){
		return action.makeCircleStructure(function(){}, function(){
			action.doNothing();
			hash.write();
			deactivateButton();
		});
	}, "circle");

	button(function(deactivateButton){
		return action.makeArcStructure(function(){}, function(){
			action.doNothing();
			hash.write();
			deactivateButton();
		});
	}, "arc");

	button(function(deactivateButton){
		return action.makeLineStructure(function(){}, function(){
			action.doNothing();
			hash.write();
			deactivateButton();
		});
	}, "line");

	button(function(deactivateButton){
		return action.makeSegmentStructure(function(){}, function(){
			action.doNothing();
			hash.write();
			deactivateButton();
		});
	}, "segment");

	button(function(deactivateButton){
		return action.makePerpendicularLine(function(){}, function(){
			action.doNothing();
			hash.write();
			deactivateButton();
		});
	}, "perpendicular");

	button(function(deactivateButton){
		return action.makeParellelLine(function(){}, function(){
			action.doNothing();
			hash.write();
			deactivateButton();
		});
	}, "parallel");

	button(function(deactivateButton){
		return action.makePerpendicularBisector(function(){}, function(){
			action.doNothing();
			hash.write();
			deactivateButton();
		})
	},"bisect");

	button(function(deactivateButton){
		return action.makePointLineReflection(function(){}, function(){
			action.doNothing();
			hash.write();
			deactivateButton();
		});
	}, "reflect-line");

	button(function(deactivateButton){
		return action.makeMidpoint(function(){}, function(){
			action.doNothing();
			hash.write();
			deactivateButton();
		});
	}, "midpoint");

	button(function(deactivateButton){
		return action.makeLocus(function(){},function(){
			action.doNothing();
			hash.write();
			deactivateButton();
		});
	}, "locus");

	button(function(deactivateButton){
		return action.makeAngleBisector(function(){},function(){
			action.doNothing();
			hash.write();
			deactivateButton();
		});
	}, "angle-bisector");

	button(function(deactivateButton){
		return action.setLabel(function(){}, function(){
			action.doNothing();
			deactivateButton();
			hash.write();
		});
	}, "label");

	button(function(deactivateButton){
		return action.select(function(){
			action.doNothing();
			deactivateButton();
		});
		
	}, "select", true);

	button(function(deactivateButton){
		return action.hideUnhide(function(){
			action.doNothing();
			deactivateButton();
		});
	},"hide", true);

	button(function(deactivateButton){
		canvas.removeSelection();
		deactivateButton();
		hash.write();
	}, "remove", true);

	button(function(deactivateButton){
		requireElement('<div style="position:absolute;left:0px;top:0px;width:100%;height:100%;background-color:#fff" id="1"/>',function(div){
			div.appendChild(canvas.toSvg());
			document.body.innerHTML = '';
			document.body.appendChild(div);
		});
		deactivateButton();
	}, "svg", true);

	button(function(deactivateButton){
		canvas.clear();
		hash.write();
		deactivateButton();
	}, "clear", true);

	button(function(deactivateButton){
		hash.nextToLast();
		deactivateButton();
	}, "undo", true);

	return {};
});