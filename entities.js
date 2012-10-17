var shipPaths = {
	'player' : [
		[0,0,-6],
		[1,-6,6],
		[1,0,3],
		[1,6,6],
		[1,0,-6]
	]
};

var Entity = function(attr){
	this.pos = new Vector2(0,0);
	this.angle = 0;
	this.h = 8;
	this.w = 8;
	this.halfH = 4;
	this.halfW = 4;
	this.vel = new Vector2(0,0);
	this.color = 'lightblue';
	this.draw = function(ctx){
		ctx.fillStyle = this.color;
		ctx.fillRect(this.pos.x - this.halfW, this.pos.y - this.halfH, this.w, this.h);

		ctx.fillStyle = 'white';
		ctx.fillText(this.pos.x + ', ' + this.pos.y, this.pos.x, this.pos.y);
	};

	if(attr != undefined) {
		for(var key in attr) {
			if(attr.hasOwnProperty(key)){
				this[key] = attr[key];
			}
		}
	
		if (typeof this.init == 'function') {this.init()}
	}
};

var newPlayer = function(attr){
	var defaults = {
		'name' : 'player',
		'h' : 11,
		'w' : 11,
		'accel' : .25,
		'braking' : .10,
		'handling' : .25,
		'rotationalVel' : 0,
		'rotationalSpeedLimit' : 5,
		'goingForth' : 0,
		'goingBack' : 0,
		'rotatingLeft' : 0,
		'rotatingRight' : 0,
		'speedLimit' : 12,
		'vectorPath': shipPaths.player,
		'draw' : function(ctx){
			ctx.save();
			ctx.translate(this.pos.x, this.pos.y);
			ctx.rotate(this.angle * TO_RADIANS);
			ctx.strokeStyle = 'white';
			ctx.beginPath();
			for(p=0; p<this.vectorPath.length; p++){
				if(this.vectorPath[p][0] == 0){
					ctx.moveTo(this.vectorPath[p][1], this.vectorPath[p][2]);
				}else{
					ctx.lineTo(this.vectorPath[p][1], this.vectorPath[p][2]);
				}
			}
			ctx.stroke();				
			ctx.translate(-this.pos.x, -this.pos.y);				
			ctx.restore();
		},
		'init' : function(){
			//this.sprite.src = this.spriteSrc;
		},
		'update' : function() {
			this.vel.multiplyEq(0.99);
			this.rotationalVel *= .95;
			var rads = this.angle * TO_RADIANS;
			if(this.goingForth == true) {
				if(this.vel.isMagLessThan(this.speedLimit)) { 
					this.vel.x+= Math.sin(rads) * this.accel;
					this.vel.y-= Math.cos(rads) * this.accel;
				}
			} else if(this.goingBack == true) {
				if(this.vel.isMagLessThan(this.speedLimit)) { 
					this.vel.x-= Math.sin(rads) * this.braking;
					this.vel.y+= Math.cos(rads) * this.braking;
				}
			}
			if(this.rotatingLeft == true) {
				if(this.rotationalVel > -this.rotationalSpeedLimit) {
					this.rotationalVel -= this.handling;
				}
			} else if(this.rotatingRight == true) {
				if(this.rotationalVel < this.rotationalSpeedLimit) {
					this.rotationalVel += this.handling;
				}					
			}
			
			this.angle += this.rotationalVel;
			if(this.angle < 0) {
				this.angle += 360;
			} else if(this.angle >= 360) {
				this.angle -= 360;
			}
			this.pos.plusEq(this.vel);
		}
	};
	
	attr = extendObj(attr, defaults);
	
	return new Entity(attr);
};


function generateEntities(){
	return [
		newPlayer(),
		new Entity({'name' : 'origin', 'color' : 'black', 'h' : 2, 'w': 2, 'halfH' : 1, 'halfW' : 1}),
		new Entity({'pos' : new Vector2(50,50)}),
		new Entity({'pos' : new Vector2(15,22)}),
		new Entity({'pos' : new Vector2(-150,180)}),
		new Entity({'pos' : new Vector2(620,580)}),
		new Entity({'pos' : new Vector2(570,80)}),
		new Entity({'pos' : new Vector2(-400,100)}),
		new Entity({'pos' : new Vector2(170,-45)}),
		new Entity({'pos' : new Vector2(130,370)}),
		new Entity({'pos' : new Vector2(330,470)}),
		new Entity({'pos' : new Vector2(230,570)}),
		new Entity({'pos' : new Vector2(-30,-70)}),
		new Entity({'pos' : new Vector2(650,57)})
	];
}