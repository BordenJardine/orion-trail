var Viewport = function() {
	var baseZoom = 1.5,
		minZoom = .5,
		maxZoom = 2,
		margin = 50,
		marginTwice = margin*2,
		width = 0,
		height = 0;

	this.Offset = new Vector2(0,0);
	this.vel = new Vector2(0,0);
	this.zoom = 1;

	this.centerOn = function(position) {
		this.Offset.x = -position.x * this.zoom + width / 2;
		this.Offset.y = -position.y * this.zoom + height / 2;
	};


	this.getDimensions = function() {
		var l = -this.Offset.x,
			t = -this.Offset.y;
			
		return {
			'l' : l,
			't' : t,
			'r' : l + width,
			'b' : t + height,
			'w' : width,
			'h' : height,
			'z' : this.zoom
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
	};


	this.zoomOut = function() {
		baseZoom = (baseZoom > minZoom) ? baseZoom - .01 : minZoom;
	};
};
