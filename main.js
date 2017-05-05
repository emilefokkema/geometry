requirejs(["canvas","action","hash","buttons","lastMin"],function(canvas, action, hash, buttons){
	canvas.onmouseup(function(){console.log("mouseup");hash.write();});
	hash.read();
	action.doNothing();
});