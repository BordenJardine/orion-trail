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
		this.clear = function(alpha){
			alpha = (alpha == undefined) ? 1 : alpha;
			this.ctx.fillStyle='rgba(0,0,0,' + alpha + ')';
			this.ctx.fillRect(0 - this.margin, 0 - this.margin, this.w + this.marginTwice, this.h + this.marginTwice);
			return 0;
		};
		this.translate = function(){
			this.l = -this.ctxOffset.x - this.margin;
			this.t = -this.ctxOffset.y - this.margin;
			this.w = this.can.width + this.marginTwice;
			this.h = this.can.height + this.marginTwice;
			this.r = this.l + this.w;
			this.b = this.t + this.h;
		};
		this.translateCtxOffset = function(newOriginVector){
			this.ctxOffset.x = -newOriginVector.x * this.zoom + this.can.width / 2;
			this.ctxOffset.y = -newOriginVector.y * this.zoom + this.can.height / 2;
		};	
		this.zoomIn = function(){
			this.zoom = (this.zoom < 2) ? this.zoom + .1 : 2;
		};
		this.zoomOut = function(){
			this.zoom = (this.zoom > .5) ? this.zoom - .1 : .5;
		};
};