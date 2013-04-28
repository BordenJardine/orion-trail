var Viewport = function() {
	baseZoom = 1.5;
	minZoom = .5;
	maxZoom = 2;		
	margin = 50;
	marginTwice = margin*2;
	this.width = 0;
	this.height = 0;
	this.Offset = new Vector2(0,0);
	this.zoom = 1;

	this.centerOn = function(position) {
		this.Offset.x = -position.x * this.zoom + this.width / 2;
		this.Offset.y = -position.y * this.zoom + this.height / 2;
	};

	this.getDimensions = function() {
		l = -this.Offset.x - margin;
		t = -this.Offset.y - margin;
		return {
			'l' : l,
			't' : t,
			'r' : l + this.width + marginTwice,
			'b' : t + this.height + marginTwice
		}
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
