var TO_RADIANS = Math.PI / 180;
var FRAME_RATE = 60;
var ONE_SECOND = 1000;
var can;
var ctx;
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
		tickGame();
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
	can.clearCanvas(0.9);
	
	can.drawFPS(fps);
	
	can.ctx.translate(viewport.Offset.x, viewport.Offset.y);
	can.ctx.scale(viewport.zoom, viewport.zoom);

	var viewportDimensions = viewport.getDimensions();

	for (i = entities.length - 1; i >= 0; i--) {
		if (
			intBetween(entities[i].pos.x * viewport.zoom, viewportDimensions.l, viewportDimensions.r) &&
			intBetween(entities[i].pos.y * viewport.zoom, viewportDimensions.t, viewportDimensions.b)
		) {
			entities[i].draw(can.ctx);
		}
	}

	can.ctx.restore();

	return 0;
};


function tickGame() {	
	can.resizeCanvas(viewport);
	handleKeys();
	updateEntities();
	viewport.setZoom(player.vel.magnitude() / 25);
	viewport.centerOn(player.pos);
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
	can = new orionCanvas($can[0]);
	$can.attr('tabindex', 1);
	viewport = new Viewport();
	entities = generateEntities();
	player = entities[0];
    
	$can.focus();
	animationLoop();
});
