var ctxOffset = {
	'x' : 0,
	'y' : 0
}
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

function clearViewport(ctx, viewport){
	ctx.clearRect(viewport.l+viewport.margin, viewport.t+viewport.margin, viewport.w-viewport.marginTwice, viewport.h-viewport.marginTwice);
}


function cloneObj(obj) {
	if (null == obj || "object" != typeof obj) return obj;
	var copy = obj.constructor();
	for (var attr in obj) {
		if (obj.hasOwnProperty(attr)) copy[attr] = obj[attr];
	}
	return copy;
}


function drawDispatch(ctx, ctxOffset, entities, viewport) {
	ctx.save();
	ctx.translate(ctxOffset.x, ctxOffset.y);

	clearViewport(ctx, viewport);
	drawViewport(ctx, viewport);

	var drawMe = 0;
	$.each(entities, function(id, entityToDraw){
		if (intBetween(entityToDraw.x, viewport.l, viewport.r) && intBetween(entityToDraw.y, viewport.t, viewport.b)){
			drawMe = 1;
			entityToDraw.draw(ctx);
		} else {
			drawMe = 0;
		}
		var $context = $('#'+id, $('table#entities'));
		$('#x', $context).html(entityToDraw.x);
		$('#y', $context).html(entityToDraw.y);
		$('#d', $context).html(drawMe);
	});

	ctx.restore();

	return false;
}


function drawViewport(ctx, viewport){
		ctx.strokeStyle = "red";
		ctx.strokeRect(viewport.l, viewport.t, viewport.w, viewport.h);
}


function entity(attributes){
	this.x = 0;
	this.y = 0;
	this.h = 8;
	this.w = 8;
	this.halfH = 4;
	this.halfW = 4;
	this.color = 'lightblue';
	this.draw = function(ctx){
		ctx.fillStyle = this.color;
		ctx.fillRect(this.x - this.halfW, this.y - this.halfH, this.w, this.h);

		ctx.fillStyle = 'black'; // just to show where we are drawing these things
		ctx.fillText(this.x + ', ' + this.y, this.x, this.y);
	};

	for (var key in attributes){
		this[key] = attributes[key];
	}
};


function extendObj(target, extender){
	var object = cloneObj(target);
	for (var key in extender){
		if (object[key] = undefined) object[key] = extender[key];
	}
	return object;
}


function generateEntities(){
	return {
		'player' : new entity({
			'x' : 0,
			'y' : 0,
			'color' : 'red',
			'sprite' : new Image(),
			'spriteSrc' : 'images/red-arrow.gif',
			'draw' : function(ctx){
				ctx.drawImage(this.sprite, this.x - this.halfW, this.y - this.halfH);
			},
			'init' : function(ctx){
				this.sprite.src = this.spriteSrc;
				var ga = ctx.globalAlpha;
				//ctx.globalAlpha = 1;
				ctx.drawImage(this.sprite, 0, 0);
				//ctx.globalAlpha = ga;
				this.h = this.sprite.height;
				this.w = this.sprite.width;
				this.halfH = this.h/2;
				this.halfW = this.w/2;
				alert(this.h);
			}
		}),
		'origin' : new entity({'x' : 0, 'y' : 0, 'color' : 'black', 'h' : 11, 'w': 11, 'halfH' : 5, 'halfW' : 5}),
		's1' : new entity({'x' : 50, 'y' : 50}),
		's2' : new entity({'x' : 15, 'y' : 22}),
		's3' : new entity({'x' : -150, 'y' : 180}),
		's4' : new entity({'x' : 620, 'y' : 580}),
		's5' : new entity({'x' : 570, 'y' : 80}),
		's6' : new entity({'x' : -400, 'y' : 100}),
		's7' : new entity({'x' : 170, 'y' : -45}),
		's8' : new entity({'x' : 130, 'y' : 370}),
		's9' : new entity({'x' : 330, 'y' : 470}),
		's10' : new entity({'x' : 230, 'y' : 570}),
		's11' : new entity({'x' : -30, 'y' : -70}),
		's12' : new entity({'x' : 650, 'y' : 57})
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


function handleKeys(keyPresses){
	var $table = $('table#keys');
	var currentKeyTR = undefined;
	$.each(keyPresses.current, function(key, value){
		//debug table
		$currentKeyTR = $('tr#'+key, $table);
		if ($currentKeyTR.length == 0){
			$currentKeyTR = $(document.createElement('tr')).attr('id', key);
			$currentKeyTR.append(
				$(document.createElement('td')).attr('id', key+'Key').html(key),
				$(document.createElement('td')).attr('id', key+'Value')
			);
			$table.append($currentKeyTR);
		}
		$('#'+key+'Value', $currentKeyTR).html(value);

		if (value == 1){
			if (key == 37) {
				player.x--;
			} else if (key == 39) {
				player.x++;
			}
			if (key == 38) {
				player.y--;
			} else if (key == 40) {
				player.y++;
			}
		}
	});
}


function initEntities(ctx, entities){
	$.each(entities, function(key, value){
		if (entities[key].init != undefined){
			entities[key].init(ctx);
		}
	});
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


function initKeysTable($table){
	$table.html("<tr><th>Key</th><th>On?</th>");
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


function tick(canDimensions, ctx, ctxOffset, entities, keyPresses, viewport){
	handleKeys(keyPresses);
	ctxOffset = translateCtxOffset(ctxOffset, canDimensions, player);
	viewport = translateViewport(viewport, canDimensions, ctxOffset);
	drawDispatch(ctx, ctxOffset, entities, viewport);
}


function translateCtxOffset(ctxOffset, canDimensions, player){
	ctxOffset.x = -player.x + canDimensions.halfW;
	ctxOffset.y = -player.y + canDimensions.halfH;

	return ctxOffset;
}


function translateViewport(viewport, canDimensions, ctxOffset){
	viewport.l = -ctxOffset.x - viewport.margin;
	viewport.t = -ctxOffset.y - viewport.margin;
	viewport.w = canDimensions.w + viewport.marginTwice;
	viewport.h = canDimensions.h + viewport.marginTwice;
	viewport.r = viewport.l + viewport.w;
	viewport.b = viewport.t + viewport.h;

	return viewport;
}


$(function(){
	var $can = $('#canvas1');
	var $coords = $('#coords');
	var ctx = $can[0].getContext('2d');
	var canDimensions =  getCanvasDimensions($can);
	$can.attr('tabindex', 1); // quick way to get focus so keyPresses register
	ctx.font = '8px sans';

	//debug tables
	$entitiesTable = $('#entities', $('#right'));
	$keysTable = $('#keys', $('#right'));
	initEntitiesTable($entitiesTable);
	initKeysTable($keysTable);

	initEntities(ctx, entities);

	$can.keydown(function(e) {
		keyPresses.press(e);
		tick(canDimensions, ctx, ctxOffset, entities, keyPresses, viewport);
	});
	$can.keyup(function(e) {
		keyPresses.release(e);
		tick(canDimensions, ctx, ctxOffset, entities, keyPresses, viewport);
	});

	$can.focus();
	tick(canDimensions, ctx, ctxOffset, entities, keyPresses, viewport);
});

