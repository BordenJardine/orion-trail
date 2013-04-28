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


var clearCanvas = function(alpha) {
	alpha = alpha ? alpha : 1;
	ctx.fillStyle='rgba(0,0,0,' + alpha + ')';
	ctx.fillRect(0 - margin, 0 - margin, viewport.width + marginTwice, viewport.height + marginTwice);
	return 0;
};


var drawDispatch = function() {
	clearCanvas(0.9);
	
	ctx.fillStyle = 'white';
	ctx.fillText('FPS: '+ fps, 5, 10);
	ctx.save();
	
	ctx.translate(viewport.Offset.x, viewport.Offset.y);

	ctx.scale(viewport.zoom, viewport.zoom);
	var viewportDimensions = viewport.getDimensions();

	for (i = entities.length - 1; i >= 0; i--) {
		if (
			intBetween(entities[i].pos.x * viewport.zoom, viewportDimensions.l, viewportDimensions.r) &&
			intBetween(entities[i].pos.y * viewport.zoom, viewportDimensions.t, viewportDimensions.b)
		) {
			entities[i].draw(ctx);
		}
	}

	ctx.restore();

	return 0;
};


function resizeCanvas() {
	if(can.width != can.clientWidth) {
		can.width = can.clientWidth;
		viewport.width = can.clientWidth;
	}
	if(can.height != can.clientHeight) {
		can.height = can.clientHeight;
		viewport.height = can.clientHeight;
	}
}


function tickGame() {	
	resizeCanvas();
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
	can = $can[0];
	ctx = can.getContext('2d') 
	ctx.font = '8px sans';
	$can.attr('tabindex', 1);
	viewport = new Viewport(can);
	entities = generateEntities();
	player = entities[0];
	
	can.addEventListener('keydown', function(e) {e.preventDefault(); keyPresses.press(e);});
	can.addEventListener('keyup', function(e) {e.preventDefault(); keyPresses.release(e);});
    
	$can.focus();
	animationLoop();
});
