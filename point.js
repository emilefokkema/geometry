define([],function(){
	var point = function(x, y){
		if(this instanceof point){
			this.x = x;
			this.y = y;
		}else{
			return new point(x,y);
		}
	};
	point.prototype = {
		minus: function(p){return point(this.x - p.x, this.y - p.y);},
		plus: function(p){return point(this.x + p.x, this.y + p.y);},
		cross:function(p){return this.x*p.y - this.y*p.x;},
		mod: function(){return Math.sqrt(Math.pow(this.x, 2) + Math.pow(this.y, 2));},
		scale: function(r){return point(r*this.x, r*this.y);},
		unit: function(){return this.scale(1/this.mod());},
		toString: function(){return "("+this.x+","+this.y+")";},
		equals: function(p){return this == p || (this.x == p.x && this.y == p.y);},
		matrix:function(a,b,c,d){return point(a*this.x+b*this.y,c*this.x+d*this.y);},
		dot:function(p){return this.x*p.x + this.y*p.y;},
		argument:function(){
			if(this.x == 0){
				if(this.y == 0){
					return 0;
				}
				if(this.y > 0){
					return Math.PI/2;
				}
				if(this.y < 0){
					return 3*Math.PI/2;
				}
			}
			var atan = Math.atan(this.y / this.x);
			if(this.x > 0){
				if(this.y < 0){
					return 2*Math.PI + atan;
				}
				return atan;
			}
			if(this.x < 0){
				return Math.PI + atan;
			}
		}
	};
	return point;
})