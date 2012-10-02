var TO_RADIANS = Math.PI/180;
var FRAME_RATE = 30;
var $can;
var keyPresses = {
	current : {},
	press : function(e){
			this.current[e.keyCode] = 1;
	},
	release : function(e){
			this.current[e.keyCode] = 0;
	}
};
var shipPaths = {
	'player' : [
		[0,0,-6],
		[1,-6,6],
		[1,0,3],
		[1,6,6],
		[1,0,-6]
	]
};
var entities = generateEntities();
var player = entities.player;
var protoViewport = function($can){
		this.margin = 50;
		this.marginTwice = this.margin*2;
		this.l = 0;
		this.r = 0;
		this.w = 0;
		this.h = 0;
		this.t = 0;
		this.b = 0;
		this.$can = $can;
		this.canW = $can.width();
		this.canH = $can.height();
		this.halfCanW = this.canW/2;
		this.halfCanH = this.canH/2;
		this.ctx = $can[0].getContext('2d');
		this.ctxOffset = {'x' : 0, 'y' : 0}; 
		this.zoom = 1;		
		this.clear = function(alpha){
			alpha = (alpha == undefined) ? 1 : alpha;
			this.ctx.fillStyle='rgba(0,0,0,' + alpha + ')';
			this.ctx.fillRect(this.l+this.margin, this.t+this.margin, this.w-this.marginTwice, this.h-this.marginTwice);
			return 0;
		};
		this.translate = function(){
			this.l = -this.ctxOffset.x - this.margin;
			this.t = -this.ctxOffset.y - this.margin;
			this.w = this.canW + this.marginTwice;
			this.h = this.canH + this.marginTwice;
			this.r = this.l + this.w;
			this.b = this.t + this.h;
		};
		this.translateCtxOffset = function(newOriginVector){
			this.ctxOffset.x = -newOriginVector.x * this.zoom + this.halfCanW;
			this.ctxOffset.y = -newOriginVector.y * this.zoom + this.halfCanH;
		};	
		this.zoomIn = function(){
			this.zoom = (this.zoom < 2) ? this.zoom + .1 : 2;
		};
		this.zoomOut = function(){
			this.zoom = (this.zoom > .5) ? this.zoom - .1 : .5;
		};
};
var viewport;
var lastUpdate = Date.now();
function animationLoop() {
	var now = Date.now();
	var elapsedMils = now - lastUpdate;
	if(elapsedMils>=(1000/FRAME_RATE)) {
		tick();
		lastUpdate = now;
	}
	requestAnimationFrame(animationLoop);
}

function cloneObj(obj) {
	if (null == obj || 'object' != typeof obj) return obj;
	var copy = obj.constructor();
	for (var attr in obj) {
		if (obj.hasOwnProperty(attr)) copy[attr] = obj[attr];
	}
	return copy;
}

var drawDispatch = function(viewport){
	viewport.ctx.save();
	
	viewport.ctx.translate(viewport.ctxOffset.x, viewport.ctxOffset.y);
	viewport.clear();
	viewport.ctx.scale(viewport.zoom, viewport.zoom);

	$.each(entities, function(id, entityToDraw){
		if (
			intBetween(entityToDraw.pos.x * viewport.zoom, viewport.l, viewport.r) &&
			intBetween(entityToDraw.pos.y * viewport.zoom, viewport.t, viewport.b)
		){
			entityToDraw.draw(viewport.ctx);
		}
	});

	viewport.ctx.restore();

	return 0;
}


function entity(attributes){
	this.pos = new Vector2(0,0);
	this.h = 8;
	this.w = 8;
	this.color = 'lightblue';
	this.draw = function(ctx){
		ctx.fillStyle = this.color;
		ctx.fillRect(this.pos.x - this.w/2, this.pos.y - this.h/2, this.w, this.h);

		ctx.fillStyle = 'white'; // just to show where we are drawing these things
		ctx.fillText(this.pos.x + ', ' + this.pos.y, this.pos.x, this.pos.y);
	};

	for (var key in attributes){
		this[key] = attributes[key];
	}

	if (typeof this.init == 'function') {this.init()};
}


function extendObj(target, extender){
	var object = cloneObj(target);
	for (var key in extender){
		if (object[key] = undefined) object[key] = extender[key];
	}
	return object;
}


function fastRound(num){
	return ~~ (num + (num > 0 ? .5 : -.5));
}


function generateEntities(){
	return {
		'player' : new entity({
			'angle' : 0,
			'vel' : new Vector2(0,0),
			'h' : 11,
			'w' : 11,
			'halfH' : 6,
			'halfW' : 6,
			'color' : 'red',
			'accel' : 1,
			'braking' : .5,
			'handling' : 5,
			'goingForth' : 0,
			'goingBack' : 0,
			'rotatingLeft' : 0,
			'rotatingRight' : 0,
			'vectorPath': shipPaths.player,
			'draw' : function(ctx){
				ctx.save();
				ctx.translate(this.pos.x, this.pos.y);
				ctx.rotate(this.angle * TO_RADIANS);
				ctx.strokeStyle = 'white';
				ctx.beginPath();
				for(i=0; i<this.vectorPath.length; i++){
					if(this.vectorPath[i][0] == 0){
						ctx.moveTo(this.vectorPath[i][1], this.vectorPath[i][2]);
					}else{
						ctx.lineTo(this.vectorPath[i][1], this.vectorPath[i][2]);
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
				player.vel.multiplyEq(0.99);
				var rads = this.angle * TO_RADIANS;
				if(player.goingForth == true) {
					this.vel.x+= Math.sin(rads) * this.accel;
					this.vel.y-= Math.cos(rads) * this.accel;
				} else if(player.goingBack == true) {
					this.vel.x-= Math.sin(rads) * this.braking;
					this.vel.y+= Math.cos(rads) * this.braking;
				}
				if(player.rotatingLeft == true) {
					this.angle -= this.handling;
					if (this.angle < 0){
						this.angle += 360;
					}
				} else if(player.rotatingRight == true) {
					this.angle += this.handling;
						if (this.angle >= 360){
						this.angle -= 360;
					}
				}
				this.pos.plusEq(this.vel);
			}
		}),
		'origin' : new entity({'color' : 'black', 'h' : 2, 'w': 2, 'halfH' : 1, 'halfW' : 1}),
		's1' : new entity({'pos' : new Vector2(50,50)}),
		's2' : new entity({'pos' : new Vector2(15,22)}),
		's3' : new entity({'pos' : new Vector2(-150,180)}),
		's4' : new entity({'pos' : new Vector2(620,580)}),
		's5' : new entity({'pos' : new Vector2(570,80)}),
		's6' : new entity({'pos' : new Vector2(-400,100)}),
		's7' : new entity({'pos' : new Vector2(170,-45)}),
		's8' : new entity({'pos' : new Vector2(130,370)}),
		's9' : new entity({'pos' : new Vector2(330,470)}),
		's10' : new entity({'pos' : new Vector2(230,570)}),
		's11' : new entity({'pos' : new Vector2(-30,-70)}),
		's12' : new entity({'pos' : new Vector2(650,57)})
	};
}


function handleKeys(){
	$.each(keyPresses.current, function(key, value){
		switch(parseInt(key)){
			case 37:
				player.rotatingLeft = value;
				break;
			case 39:
				player.rotatingRight = value;
				break;
			case 38:
				player.goingForth = value;
				break;
			case 40:
				player.goingBack = value;
				break;
			case 107:
				if(value == 1) viewport.zoomIn();
				break;
			case 109:
				if(value == 1) viewport.zoomOut();
				break;
			case 116:
				if(value == 1) window.location.reload();
				break;
		}
	});

	return 0;
}


function initEntities(){
	$.each(entities, function(key, entity){
		if (entity.init != undefined){
			entity.init();
		}
	});

	return 0;
}


function intBetween(n, x, y){
	return (n >= x && n  <= y);
}


function prettyPrintObj(obj){
	var prettyString = '';
	for(var key in obj){
		prettyString += key + ' : ' + obj[key] + '\n';
	}
	return prettyString;
}


function resizeCanvas($can){
	var can = $can[0];
	if(can.width != can.clientWidth){
		can.width = can.clientWidth;
	}
	if(can.height != can.clientHeight){
		can.height = can.clientHeight;
	}
}

var debugMils = Date.now();
var debugNow = Date.now();
var elapsed = 0;
function tick(){
	debugMils = Date.now();
	
	resizeCanvas(viewport.$can);
	$('#resizeCanvas').html(Date.now() - debugMils);
	debugMils = Date.now();
	
	handleKeys();
	$('#handleKeys').html(Date.now() - debugMils);
	debugMils = Date.now();
	
	updateEntities();
	$('#updateEntities').html(Date.now() - debugMils);
	debugMils = Date.now();
	
	viewport.translateCtxOffset(player.pos);
	$('#translateCtxOffset').html(Date.now() - debugMils);
	debugMils = Date.now();	
	
	viewport.translate();
	$('#translate').html(Date.now() - debugMils);
	debugMils = Date.now();
	
	drawDispatch(viewport);
	$('#drawDispatch').html(Date.now() - debugMils);
	debugMils = Date.now();
	return 0;
}


function updateEntities(){
	$.each(entities, function(key, entity){
		if(entity.update != undefined && typeof entity.update == 'function') {entity.update();}
	});

	return 0;
}


$(function(){
	var $can = $('#canvas');
	ctx = $can[0].getContext('2d');
	$can.attr('tabindex', 1);
	ctx.font = '8px sans';
	viewport = new protoViewport($can);
	$can.keydown(function(e) {e.preventDefault(); keyPresses.press(e);});
	$can.keyup(function(e) {e.preventDefault(); keyPresses.release(e);});
	$can.focus();
	animationLoop();
});
