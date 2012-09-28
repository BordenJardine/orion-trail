var TO_RADIANS = Math.PI/180;
var FRAME_RATE = 60;
var $can;
var	ctx;
var	canDimensions;
var ctxOffset = {
	'x' : 0,
	'y' : 0
};
var entities = generateEntities();
var keyPresses = {
	current : {},
	press : function(e){
			this.current[e.keyCode] = 1;
	},
	release : function(e){
			this.current[e.keyCode] = 0;
	}
};
var player = entities.player;
var viewport = {
	'margin' : -50,
	'marginTwice' : -100,
	'l' : 0,
	'r' : 0,
	'w' : 0,
	'h' : 0,
	't' : 0,
	'b' : 0
};


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


function clearViewport(){
	ctx.fillStyle='rgba(0,0,0,0.2)';
	ctx.fillRect(viewport.l+viewport.margin, viewport.t+viewport.margin, viewport.w-viewport.marginTwice, viewport.h-viewport.marginTwice);
	return 0;
}


function cloneObj(obj) {
	if (null == obj || 'object' != typeof obj) return obj;
	var copy = obj.constructor();
	for (var attr in obj) {
		if (obj.hasOwnProperty(attr)) copy[attr] = obj[attr];
	}
	return copy;
}


function drawDispatch() {
	ctx.save();
	ctx.translate(ctxOffset.x, ctxOffset.y);

	clearViewport();
	drawViewport();

	var drawMe = 0;
	$.each(entities, function(id, entityToDraw){
		if (intBetween(entityToDraw.pos.x, viewport.l, viewport.r) && intBetween(entityToDraw.pos.y, viewport.t, viewport.b)){
			drawMe = 1;
			entityToDraw.draw();
		} else {
			drawMe = 0;
		}
		var $context = $('#'+id, $('table#entities'));
		$('#x', $context).html(entityToDraw.pos.x);
		$('#y', $context).html(entityToDraw.pos.y);
		$('#d', $context).html(drawMe);
	});

	ctx.restore();

	return 0;
}


function drawViewport(){
	ctx.strokeStyle = "red";
	ctx.strokeRect(viewport.l, viewport.t, viewport.w, viewport.h);

	return 0;
}


function entity(attributes){
	this.pos = new Vector2(0,0);
	this.h = 8;
	this.w = 8;
	this.halfH = 4;
	this.halfW = 4;
	this.color = 'lightblue';
	this.draw = function(){
		ctx.fillStyle = this.color;
		ctx.fillRect(this.pos.x - this.halfW, this.pos.y - this.halfH, this.w, this.h);

		ctx.fillStyle = 'white'; // just to show where we are drawing these things
		ctx.fillText(this.pos.x + ', ' + this.pos.y, this.pos.x, this.pos.y);
	};

	for (var key in attributes){
		this[key] = attributes[key];
	}

	if (typeof this.init == 'function') {this.init()};

	return 0;
};


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
			'sprite' : new Image(),
			'spriteSrc' : 'images/red-arrow.gif',
			'accel' : 1,
			'braking' : .5,
			'handling' : 5,
			'goingForth' : 0,
			'goingBack' : 0,
			'rotatingLeft' : 0,
			'rotatingRight' : 0,
			'draw' : function(){
				var x = this.pos.x //= fastRound(this.pos.x);
				var y = this.pos.y //= fastRound(this.pos.y);
				ctx.save();
				ctx.translate(x, y);
				ctx.rotate(this.angle * TO_RADIANS);
				ctx.translate(-x, -y);
				ctx.drawImage(this.sprite, x - this.halfW, y - this.halfH);
				ctx.restore();
			},
			'init' : function(){
				this.sprite.src = this.spriteSrc;
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


function getCanvasDimensions($can){
	return {
		'w' : $can.width(),
		'h' : $can.height(),
		'halfW' : $can.width()/2,
		'halfH' : $can.height()/2
	};
}


function handleKeys(){
	$.each(keyPresses.current, function(key, value){
		if(key == 37) {
			player.rotatingLeft = value;
		} else if (key == 39) {
			player.rotatingRight = value;
		}else if(key == 38) {
			player.goingForth = value;
		} else if (key == 40) {
			player.goingBack = value;
		} else if(key == 116) {
			window.location.reload();
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


function initEntitiesTable($table){
	$table.html("<tr><th>Thing</th><th>X</th><th>Y</th><th>Draw</th></tr>");
	$.each(entities, function(key, value){
		$table.append(
			$(document.createElement('tr')).attr('id', key).append(
				$(document.createElement('td')).html(key),
				$(document.createElement('td')).attr('id', 'x').html(value['x']),
				$(document.createElement('td')).attr('id', 'y').html(value['y']),
				$(document.createElement('td')).attr('id', 'd').html('0')
			)
		);
	});
}


function intBetween(n, x, y){
	return (n >= x && n  <= y);
}


function prettyPrintObj(obj){
	var prettyString = '';
	for (var key in obj){
		prettyString += key + ' : ' + obj[key] + '\n';
	}
	return prettyString;
}


function tick(){
	handleKeys();
	updateEntities();
	ctxOffset = translateCtxOffset(player.pos);
	viewport = translateViewport();
	drawDispatch();

	return 0;
}


function translateCtxOffset(newOriginVector){
	ctxOffset.x = -newOriginVector.x + canDimensions.halfW;
	ctxOffset.y = -newOriginVector.y + canDimensions.halfH;

	return ctxOffset;
}


function translateViewport(){
	viewport.l = -ctxOffset.x - viewport.margin;
	viewport.t = -ctxOffset.y - viewport.margin;
	viewport.w = canDimensions.w + viewport.marginTwice;
	viewport.h = canDimensions.h + viewport.marginTwice;
	viewport.r = viewport.l + viewport.w;
	viewport.b = viewport.t + viewport.h;

	return viewport;
}


function updateEntities(){
	$.each(entities, function(key, entity){
		if(entity.update != undefined && typeof entity.update == 'function') {entity.update();}
	});

	return 0;
}


$(function(){
	$can = $('#canvas1');
	$window = $('window');
	$can.width($window.width());
	$can.height($window.height());
	ctx = $can[0].getContext('2d');
	canDimensions = getCanvasDimensions($can);
	$can.attr('tabindex', 1);
	ctx.font = '8px sans';

	$entitiesTable = $('#entities', $('#right'));
	initEntitiesTable($entitiesTable);

	$can.keydown(function(e) {e.preventDefault(); keyPresses.press(e)});
	$can.keyup(function(e) {e.preventDefault(); keyPresses.release(e)});
	$can.focus();
	animationLoop();
});
