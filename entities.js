var vectorPaths = {
	'player' : [
		['m', 0, -6],
		['l', -6, 6],
		['l', 0, 3],
		['l', 6, 6],
		['c'],
	],
	'bullet' : [
		['m', -2, 2],
		['l', 0, 0],
		['l', 2,2],
	]
};

var Drawable = function() {
	this.angle = 0,
		this.color = 'white',
		this.h = 2,
		this.w = 2,
		this.halfH = 1,
		this.halfW = 1,
		this.pos = new Vector2(0,0),
		this.vel = new Vector2(0,0);

	this.draw = function(ctx) {
		ctx.save();
		ctx.translate(this.pos.x, this.pos.y);
		ctx.rotate(this.angle * TO_RADIANS);
		ctx.strokeStyle = this.color;
		ctx.beginPath();

		this.drawPath(ctx, this.vectorPath);

		ctx.stroke();
		ctx.translate(-this.pos.x, -this.pos.y);
		ctx.restore();
	};

	this.drawPath = function(ctx, path) {
		for(var i = 0; i < this.vectorPath.length; i++){
			switch (path[i][0]) {
			case 'm':
				ctx.moveTo(path[i][1], path[i][2]);
				break;
			case 'l':
				ctx.lineTo(path[i][1], path[i][2]);
				break;
			case 'c':
				ctx.closePath();
				break;
			case 'f':
				ctx.fill();
				break;
			}
		}
	};


	this.updateMovement = function() {
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


var Bullet = function() {
	this.color = '#F66666',
		this.h = 1,
		this.w = 1,
		this.vectorPath = vectorPaths.bullet,
		this.halfH = 0,
		this.halfW = 0,
		this.life = 0,
		this.velConstant = 15;

	/*
	this.draw = function(ctx){
		ctx.beginPath();
	    ctx.arc(this.pos.x, this.pos.y, 1, 0, 2 * 3.14, false);
	    ctx.fillStyle = this.color;
	    ctx.strokeStyle = this.color;
	    ctx.fill();
		ctx.stroke();
	};
	*/

	this.update = function() {
		this.pos.plusEq(this.vel);
	}


	this.init = function() {
		var rads = (this.angle - 90) * TO_RADIANS;
		this.vel.y = Math.sin(rads) * this.velConstant;
		this.vel.x = Math.cos(rads) * this.velConstant;
	}
};


var Star = function() {
	this.color = '#BBB';
	this.update = function(d) {
		this.pos.minusEq(viewport.vel.divideNew(this.distance));
		if(this.pos.x < d.l) {
			this.pos.x = d.r;
			this.pos.y = d.t + rand(0, d.h);
		} else if(this.pos.x > d.r) {
			this.pos.x = d.l;
			this.pos.y = d.t + rand(0, d.h);
		};

		if(this.pos.y < d.t) {
			this.pos.y = d.b;
			this.pos.x = d.l + rand(0, d.w);
		} else if(this.pos.y > d.b) {
			this.pos.y = d.t;
			this.pos.x = d.l + rand(0, d.w);
		};
	};


	this.draw = function(ctx) {
		ctx.beginPath();
	    ctx.arc(this.pos.x, this.pos.y, this.size, 0, 2 * 3.14, false);
	    ctx.fillStyle = this.color;
	    ctx.strokeStyle = this.color;
	    ctx.fill();
		ctx.stroke();
	};

	this.init = function() {
		this.size = Math.floor(9 - this.size - this.distance);
		this.size = (this.size > 1) ? this.size : 1;
	}
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
		this.bulletSpread = 10,
		this.braking = .10,
		this.color = 'white',
		this.handling = .25,
		this.h = 11,
		this.w = 11,
		this.rotationalVel = 0,
		this.rotationalSpeedLimit = 5,
		this.speedLimit = 10,
		this.vectorPath = vectorPaths.player,
		this.goingForth = 0,
		this.goingBack = 0,
		this.shooting = 0,
		this.shootTimer = 0,
		this.name = 'player',
		this.rotatingLeft = 0,
		this.rotatingRight = 0;


	this.update = function() {
		this.updateMovement();
		this.updateActions();
	};


	this.updateActions = function() {
		function color() {
			return 100+randInt(0,155)
		}

		if(this.shooting == true) {
			if(this.shootTimer === 0) {
				drawables.push(makeDrawable(Bullet, {
					'pos' : this.pos.clone(),
					'angle' : this.angle + rand(-this.bulletSpread, this.bulletSpread)
					//'color' : 'rgb(' + color() + ', ' + color() + ', ' + color() + ')',
				}));
				this.shootTimer = 3;
			} else {
				this.shootTimer--;
			}
		}
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
	var distance = rand(5, 10);
	function color() {return Math.floor(150 + rand(0, 500) / distance)};

	return makeDrawable(Star, {
			'pos' : new Vector2(
				randInt(0, width),
				randInt(0, height)
			),
			'distance' : distance,
			//'color' : 'rgb(' + color() + ', ' + color() + ', ' + color() + ')',
			'size' : randInt(1, 4)
		})
}
