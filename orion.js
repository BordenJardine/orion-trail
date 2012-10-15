var TO_RADIANS = Math.PI / 180;
var FRAME_RATE = 30;
var ONE_SECOND = 1000;
var $can;
var entities;
var player;
var viewport;

var framecounter = 0;
var fps = 0;

var lastFPSDraw = Date.now();
var lastUpdate = Date.now();
function animationLoop() {
	var now = Date.now();
	var elapsedMils = now - lastUpdate;
	if(elapsedMils >= (ONE_SECOND / FRAME_RATE)) {
		tick();
		lastUpdate = now;
		framecounter++;
	}
	elapsedMils = now - lastFPSDraw;
	if(elapsedMils >= ONE_SECOND) {
		fps = framecounter;
		framecounter = 0;
		lastFPSDraw = Date.now();
	}
	requestAnimationFrame(animationLoop);
}


var drawDispatch = function() {
	viewport.clear();
	
	viewport.ctx.fillStyle = 'white';
	viewport.ctx.fillText('FPS: '+ fps, 5, 10);
	viewport.ctx.save();
	
	viewport.ctx.translate(viewport.ctxOffset.x, viewport.ctxOffset.y);

	viewport.ctx.scale(viewport.zoom, viewport.zoom);

	for (i = entities.length - 1; i >= 0; i--) {
		if (
			intBetween(entities[i].pos.x * viewport.zoom, viewport.l, viewport.r) &&
			intBetween(entities[i].pos.y * viewport.zoom, viewport.t, viewport.b)
		) {
			entities[i].draw(viewport.ctx);
		}
	}

	viewport.ctx.restore();

	return 0;
};


function resizeCanvas($can) {
	var can = $can[0];
	if(can.width != can.clientWidth) {
		can.width = can.clientWidth;
	}
	if(can.height != can.clientHeight) {
		can.height = can.clientHeight;
	}
}


function tick() {	
	resizeCanvas(viewport.$can);
	handleKeys();
	updateEntities();
	viewport.translateCtxOffset(player.pos);
	viewport.translate();
	drawDispatch();
	return 0;
}


function updateEntities() {
	$.each(entities, function(key, entity) {
		if(entity.update != undefined && typeof entity.update == 'function') {entity.update();}
	});

	return 0;
}


$(function() {
	var $can = $('#canvas');
	ctx = $can[0].getContext('2d');
	$can.attr('tabindex', 1);
	ctx.font = '8px sans';
	viewport = new Viewport($can);
	$can.keydown(function(e) {e.preventDefault(); keyPresses.press(e);});
	$can.keyup(function(e) {e.preventDefault(); keyPresses.release(e);});
        entities = generateEntities();
        player = entities[0];
	$can.focus();
	animationLoop();
});
