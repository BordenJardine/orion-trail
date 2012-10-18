var Viewport = function(can){
		this.margin = 50;
		this.marginTwice = this.margin*2;
		this.l = 0;
		this.r = 0;
		this.w = 0;
		this.h = 0;
		this.t = 0;
		this.b = 0;
		this.can = can
		this.ctx = this.can.getContext('2d');
		this.ctxOffset = {'x' : 0, 'y' : 0}; 
		this.zoom = 1;
		this.baseZoom = 1.5;
		this.minZoom = .5;
		this.maxZoom = 2;		
		this.clear = function(alpha){
			alpha = (alpha == undefined) ? 1 : alpha;
			this.ctx.fillStyle='rgba(0,0,0,' + alpha + ')';
			this.ctx.fillRect(0 - this.margin, 0 - this.margin, this.w + this.marginTwice, this.h + this.marginTwice);
			return 0;
		};
		this.translate = function(newOrigin){
			this.zoom = this.baseZoom - newOrigin.vel.magnitude() / 25;
			if(this.zoom < this.minZoom) {this.zoom = this.minZoom};
			
			this.ctxOffset.x = -newOrigin.pos.x * this.zoom + this.can.width / 2;
			this.ctxOffset.y = -newOrigin.pos.y * this.zoom + this.can.height / 2;
			
			this.l = -this.ctxOffset.x - this.margin;
			this.t = -this.ctxOffset.y - this.margin;
			this.w = this.can.width + this.marginTwice;
			this.h = this.can.height + this.marginTwice;
			this.r = this.l + this.w;
			this.b = this.t + this.h;
		};
		this.zoomIn = function(){
			this.baseZoom = (this.baseZoom < this.maxZoom) ? this.baseZoom + .01 : this.maxZoom;
			console.log(this.baseZoom);
		};
		this.zoomOut = function(){
			this.baseZoom = (this.baseZoom > this.minZoom) ? this.baseZoom - .01 : this.minZoom;
			console.log(this.baseZoom);
		};
};