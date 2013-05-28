var vectorPaths = {
	'player' : [
		['m', 0, -6],
		['l', -6, 6],
		['l', 0, 3],
		['l', 6, 6],
		['c'],
	]
};

var Drawable = function() {
	this.angle = 0,
		this.color = 'white',
		this.h = 1,
		this.w = 1,
		this.halfH = 1,
		this.halfW = 1,
		this.pos = new Vector2(0,0),
		this.vel = new Vector2(0,0);

	this.draw = function(ctx){
		ctx.fillStyle = this.color;
		ctx.fillRect(this.pos.x - this.halfW, this.pos.y - this.halfH, this.w, this.h);
	};

};


var Buoy = function() {
	this.color = 'lightblue',
		this.h = 8,
		this.w = 8,
		this.halfH = 4,
		this.halfW = 4;

	this.draw = function(ctx){
		ctx.fillStyle = this.color;
		ctx.fillRect(this.pos.x - this.halfW, this.pos.y - this.halfH, this.w, this.h);

		ctx.fillStyle = 'white';
		ctx.fillText(this.pos.x + ', ' + this.pos.y, this.pos.x, this.pos.y);
	};
};

var Star = function() {
	this.update = function(d) {
		this.pos.minusEq(viewport.vel.divideNew(this.distance));
		if(this.pos.x < d.l) {
			this.pos.x = d.r;
			this.pos.y = d.t + (Math.random() * d.h);
		} else if(this.pos.x > d.r) {
			this.pos.x = d.l;
			this.pos.y = d.t + (Math.random() * d.h);
		};

		if(this.pos.y < d.t) { 
			this.pos.y = d.b;
			this.pos.x = d.l + (Math.random() * d.w);
		} else if(this.pos.y > d.b) {
			this.pos.y = d.t;
			this.pos.x = d.l + (Math.random() * d.w);
		};
	};
}


var makeDrawable = function(object, attr) {
	object.prototype = new Drawable();
	var o = new object();

	if(attr) {
		for(var key in attr) {
			if(attr.hasOwnProperty(key)) o[key] = attr[key];
		}
	}
	if(typeof o.init == 'function') o.init();

	return o;
};


var Player = function(attr) {
	this.accel = .25,
		this.braking = .10,
		this.color = 'white',
		this.handling = .25,
		this.h = 11,
		this.w = 11,
		this.rotationalVel = 0,
		this.rotationalSpeedLimit = 5,
		this.speedLimit = 15,
		this.vectorPath = vectorPaths.player,
		this.goingForth = 0,
		this.goingBack = 0,
		this.name = 'player',
		this.rotatingLeft = 0,
		this.rotatingRight = 0;

	this.draw = function(ctx) {
		ctx.save();
		ctx.translate(this.pos.x, this.pos.y);
		ctx.rotate(this.angle * TO_RADIANS);
		ctx.strokeStyle = this.color;
		ctx.beginPath();
		for(var i = 0; i < this.vectorPath.length; i++){
			switch (this.vectorPath[i][0]) {
			case 'm':
				ctx.moveTo(this.vectorPath[i][1], this.vectorPath[i][2]);
				break;
			case 'l':
				ctx.lineTo(this.vectorPath[i][1], this.vectorPath[i][2]);
				break;
			case 'c':
				ctx.closePath();
				break;
			case 'f':
				ctx.fill();
				break;
			}
		}
		ctx.stroke();				
		ctx.translate(-this.pos.x, -this.pos.y);				
		ctx.restore();
	};


	this.update = function() {
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
	};
};


function generateDrawables() {
	return [
		makeDrawable(Player), 
		makeDrawable(Buoy, {'name' : 'origin', 'color' : 'black', 'h' : 2, 'w': 2, 'halfH' : 1, 'halfW' : 1}),
		makeDrawable(Buoy, {'pos' : new Vector2(50,50)}),
		makeDrawable(Buoy, {'pos' : new Vector2(15,22)}),
		makeDrawable(Buoy, {'pos' : new Vector2(-150,180)}),
		makeDrawable(Buoy, {'pos' : new Vector2(620,580)}),
		makeDrawable(Buoy, {'pos' : new Vector2(570,80)}),
		makeDrawable(Buoy, {'pos' : new Vector2(-400,100)}),
		makeDrawable(Buoy, {'pos' : new Vector2(170,-45)}),
		makeDrawable(Buoy, {'pos' : new Vector2(130,370)}),
		makeDrawable(Buoy, {'pos' : new Vector2(330,470)}),
		makeDrawable(Buoy, {'pos' : new Vector2(230,570)}),
		makeDrawable(Buoy, {'pos' : new Vector2(-30,-70)}),
		makeDrawable(Buoy, {'pos' : new Vector2(650,57)})
	];
}

function generateStars(count, width, height) {
	var stars = [];
	for (var i = count; count > 0; count--) {
		stars.push(makeStar(width, height));
	}
	return stars;
}

function makeStar(width, height) {
	var distance = rand(5, 8);
	function color() {return randInt(155, rand(0, 500) / distance)};

	return makeDrawable(Star, {
			'pos' : new Vector2(
				Math.floor(Math.random() * width),
				Math.floor(Math.random() * height)
			),
			'distance' : distance,
			'color' : 'rgb(' + color() + ', ' + color() + ', ' + color() + ')'
		})
}