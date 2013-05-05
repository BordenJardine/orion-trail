var Viewport = function() {
	var baseZoom = 1.5,
		minZoom = .5,
		maxZoom = 2,
		margin = 50,
		marginTwice = margin*2,
		width = 0,
		height = 0;
	this.Offset = new Vector2(0,0);
	this.zoom = 1;

	this.centerOn = function(position) {
		this.Offset.x = -position.x * this.zoom + width / 2;
		this.Offset.y = -position.y * this.zoom + height / 2;
	};

	this.getDimensions = function() {
		l = -this.Offset.x - margin;
		t = -this.Offset.y - margin;
		return {
			'l' : l,
			't' : t,
			'r' : l + width + marginTwice,
			'b' : t + height + marginTwice
		}
	};


	this.resize = function(dimensions) {
		width = dimensions[0];
		height = dimensions[1];
	};


	this.setZoom = function(amount) {
		this.zoom = baseZoom - amount;
		if(this.zoom < minZoom) {this.zoom = minZoom};
	};


	this.zoomIn = function() {
		baseZoom = (baseZoom < maxZoom) ? baseZoom + .01 : maxZoom;
		console.log(baseZoom);
	};


	this.zoomOut = function(){
		baseZoom = (baseZoom > minZoom) ? baseZoom - .01 : minZoom;
		console.log(baseZoom);
	};
};
