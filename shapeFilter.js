define(function(){
	var f = {
		contains: function(spec, option){
			return (spec & option) == option;
		},
		NONE:0,
		POINT: 1,
		LINE:2,
		CIRCLE:4,
		LOCUS: 8,
		SEGMENT: 16,
	};
	f.ALL = f.POINT | f.LINE | f.CIRCLE | f.LOCUS | f.SEGMENT;
	f.NOT_LOCUS = f.POINT | f.LINE | f.CIRCLE | f.SEGMENT;
	return f;
});