var TO_RADIANS = Math.PI / 180;
var FRAME_RATE = 60;
var ONE_SECOND = 1000;
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
		lastFPSDraw = now;
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


function resizeCanvas(can) {
	if(can.width != can.clientWidth) {
		can.width = can.clientWidth;
	}
	if(can.height != can.clientHeight) {
		can.height = can.clientHeight;
	}
}


function tick() {	
	resizeCanvas(viewport.can);
	handleKeys();
	updateEntities();
	viewport.translateCtxOffset(player.pos);
	viewport.translate();
	drawDispatch();
	return 0;
}


function updateEntities() {
	for (i = entities.length - 1; i >= 0; i--) {
		if(entities[i].update != undefined && typeof entities[i].update == 'function') {entities[i].update();}
	}

	return 0;
}


$(function() {
	var $can = $('#canvas');
	var can = $can[0];
	can.getContext('2d').font = '8px sans';
	$can.attr('tabindex', 1);
	viewport = new Viewport(can);
	entities = generateEntities();
    player = entities[0];
	
	can.addEventListener('keydown', function(e) {e.preventDefault(); keyPresses.press(e);});
	can.addEventListener('keyup', function(e) {e.preventDefault(); keyPresses.release(e);});
    
	$can.focus();
	animationLoop();
});
