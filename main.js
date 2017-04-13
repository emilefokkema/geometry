(function(){
	var main = function(canvas, action, hash){
		canvas.onmouseup(function(){console.log("mouseup");hash.write();});
		hash.read();
		action.doNothing();
	}; 
	

	window.initGeometry = (function(orig){
		return function(obj){
			orig(obj);
			main(obj.canvas, obj.action, obj.hash);
		};
	})(window.initGeometry || function(){});
})();