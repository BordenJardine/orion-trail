var vectorPaths = {
	'player' : [
		[0,0,-6],
		[1,-6,6],
		[1,0,3],
		[1,6,6],
		[1,0,-6]
	]
};

var Drawable = function(attr){
	angle = 0;
	color = 'lightblue';
	h = 8;
	w = 8;
	halfH = 4;
	halfW = 4;
	this.pos = new Vector2(0,0);
	this.vel = new Vector2(0,0);

	this.draw = function(ctx){
		ctx.fillStyle = color;
		ctx.fillRect(this.pos.x - halfW, this.pos.y - halfH, w, h);

		ctx.fillStyle = 'white';
		ctx.fillText(this.pos.x + ', ' + this.pos.y, this.pos.x, this.pos.y);
	};

	if(attr) {
		for(var key in attr) {
			if(attr.hasOwnProperty(key)){
				this[key] = attr[key];
			}
		}
	}

	if(typeof this.init == 'function') this.init()
};

var makeDrawable = function(object, attr) {
    object.prototype = new Drawable();
    return new object();
};

var Player = function(attr) {
	accel = .25
	braking = .10
	handling = .25
	h = 11
	w = 11
	rotationalVel = 0
	rotationalSpeedLimit =  5
	speedLimit = 15
	vectorPath = vectorPaths.player
	this.goingForth = 0
	this.goingBack = 0
	this.name = 'player'
	this.rotatingLeft = 0
	this.rotatingRight = 0

	this.draw = function(ctx){
		ctx.save();
		ctx.translate(this.pos.x, this.pos.y);
		ctx.rotate(angle * TO_RADIANS);
		ctx.strokeStyle = 'white';
		ctx.beginPath();
		for(p=0; p<vectorPath.length; p++){
			if(vectorPath[p][0] == 0){
				ctx.moveTo(vectorPath[p][1], vectorPath[p][2]);
			}else{
				ctx.lineTo(vectorPath[p][1], vectorPath[p][2]);
			}
		}
		ctx.stroke();				
		ctx.translate(-this.pos.x, -this.pos.y);				
		ctx.restore();
	};


	this.update = function() {
		this.vel.multiplyEq(0.99);
		rotationalVel *= .95;
		var rads = angle * TO_RADIANS;
		if(this.goingForth == true) {
			if(this.vel.isMagLessThan(speedLimit)) { 
				this.vel.x+= Math.sin(rads) * accel;
				this.vel.y-= Math.cos(rads) * accel;
			}
		} else if(this.goingBack == true) {
			if(this.vel.isMagLessThan(speedLimit)) { 
				this.vel.x-= Math.sin(rads) * braking;
				this.vel.y+= Math.cos(rads) * braking;
			}
		}
		if(this.rotatingLeft == true) {
			if(rotationalVel > -rotationalSpeedLimit) {
				rotationalVel -= handling;
			}
		} else if(this.rotatingRight == true) {
			if(rotationalVel < rotationalSpeedLimit) {
				rotationalVel += handling;
			}					
		}
		
		angle += rotationalVel;
		if(angle < 0) {
			angle += 360;
		} else if(angle >= 360) {
			angle -= 360;
		}
		this.pos.plusEq(this.vel);
	};
};


function generateEntities() {
	return [
		makeDrawable(Player), 
		new Drawable({'name' : 'origin', 'color' : 'black', 'h' : 2, 'w': 2, 'halfH' : 1, 'halfW' : 1}),
		new Drawable({'pos' : new Vector2(50,50)}),
		new Drawable({'pos' : new Vector2(15,22)}),
		new Drawable({'pos' : new Vector2(-150,180)}),
		new Drawable({'pos' : new Vector2(620,580)}),
		new Drawable({'pos' : new Vector2(570,80)}),
		new Drawable({'pos' : new Vector2(-400,100)}),
		new Drawable({'pos' : new Vector2(170,-45)}),
		new Drawable({'pos' : new Vector2(130,370)}),
		new Drawable({'pos' : new Vector2(330,470)}),
		new Drawable({'pos' : new Vector2(230,570)}),
		new Drawable({'pos' : new Vector2(-30,-70)}),
		new Drawable({'pos' : new Vector2(650,57)})
	];
}
