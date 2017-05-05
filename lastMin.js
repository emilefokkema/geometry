define(function(){
	Array.prototype.lastMin = function(amount){
		var result, m, min = Infinity;
		for(var i = 0; i<this.length;i++){
			m = amount(this[i]);
			if(m <= min){
				min = m;
				result = this[i];
			}
		}
		return result;
	};
});