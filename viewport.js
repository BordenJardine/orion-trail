var Viewport = function(can) {
	this.margin = 50;
	this.marginTwice = this.margin*2;
	this.width = 0;
	this.height = 0;
	this.can = can
	this.ctx = this.can.getContext('2d');
	this.Offset = {'x' : 0, 'y' : 0}; 
	this.zoom = 1;
	this.baseZoom = 1.5;
	this.minZoom = .5;
	this.maxZoom = 2;		

	this.clear = function(alpha){
		alpha = (alpha == undefined) ? 1 : alpha;
		this.ctx.fillStyle='rgba(0,0,0,' + alpha + ')';
		this.ctx.fillRect(0 - this.margin, 0 - this.margin, this.width + this.marginTwice, this.height + this.marginTwice);
		return 0;
	};

	this.centerOn = function(vector) {
		this.Offset.x = -vector.x * this.zoom + this.width / 2;
		this.Offset.y = -vector.y * this.zoom + this.height / 2;
	};

	this.getDimensions = function() {
		l = -this.Offset.x - this.margin;
		t = -this.Offset.y - this.margin;
		return {
			'l' : l,
			't' : t,
			'r' : l + this.width + this.marginTwice,
			'b' : t + this.height + this.marginTwice
		}
	};

	this.setZoom = function(amount) {
		this.zoom = this.baseZoom - amount;
		if(this.zoom < this.minZoom) {this.zoom = this.minZoom};
	};

	this.zoomIn = function() {
		this.baseZoom = (this.baseZoom < this.maxZoom) ? this.baseZoom + .01 : this.maxZoom;
		console.log(this.baseZoom);
	};

	this.zoomOut = function(){
		this.baseZoom = (this.baseZoom > this.minZoom) ? this.baseZoom - .01 : this.minZoom;
		console.log(this.baseZoom);
	};
};
