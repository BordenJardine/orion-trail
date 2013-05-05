
var orionCanvas  = function(canvas) {
	this.canvas = canvas;
	this.ctx = canvas.getContext('2d') ;

	this.ctx.font = '8px sans';

	this.canvas.addEventListener('keydown', function(e) {e.preventDefault(); keyPresses.press(e);});
	this.canvas.addEventListener('keyup', function(e) {e.preventDefault(); keyPresses.release(e);});

	this.clear = function(alpha) {
		alpha = alpha ? alpha : 1;
		this.ctx.fillStyle='rgba(0,0,0,' + alpha + ')';
		this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);
		return 0;
	};


	this.resize = function() {
		if(this.canvas.width != this.canvas.clientWidth ||
		    this.canvas.height != this.canvas.clientHeight) {
			this.canvas.height = this.canvas.clientHeight;
			this.canvas.width = this.canvas.clientWidth;
		}
		return [this.canvas.clientWidth, this.canvas.clientHeight];
	};


	this.drawFPS = function(fps){
		this.ctx.fillStyle = 'white';
		this.ctx.fillText('FPS: '+ fps, 5, 10);
		this.ctx.save();
	};
};
