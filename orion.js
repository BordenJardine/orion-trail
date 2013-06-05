var TO_RADIANS = Math.PI / 180,
	FRAME_RATE = 60,
	ONE_SECOND = 1000,
	can,
	drawables,
	framecounter = 0,
	fps = 0,
	player,
	stars,
	mouseXY,
	mouseX,
	mouseY,
	viewport;


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


var updateEntities = function() {
	var viewportDimensions = viewport.getDimensions();

	can.clear();
	can.drawFPS('FPS: ' + fps + ' O:' + drawables.length);
	updateStars(can.getDimensions());

	can.ctx.translate(viewport.offset.x, viewport.offset.y);
	can.ctx.scale(viewportDimensions.z, viewportDimensions.z);

	updateDrawables(viewportDimensions);

	can.ctx.restore();

	return 0;
};


function updateStars(dimensions) {
	for(var i = stars.length - 1; i >= 0; i--) {
		stars[i].update(dimensions);
		stars[i].draw(can.ctx);
	}

	return 0;
}


function tickGame() {
	viewport.resize(can.resize());
	handleKeys();
	viewport.setZoom(player.vel.magnitude() / 25);
	viewport.centerOn(player.pos);
	viewport.vel = player.vel;
	updateEntities();

	return 0;
}


function updateDrawables(dimensions) {
	for (var i = drawables.length - 1; i >= 0; i--) {
		var drawable = drawables[i];
		if (drawable.gcMe) {
			drawables.splice(i, i);
			continue;
		}

		drawable.checkCollisions(can.ctx, drawables.slice(0, i));

		if(drawable.update != undefined && typeof drawable.update == 'function') drawable.update();

		if (
			intBetween(drawable.pos.x * dimensions.z, dimensions.l, dimensions.r) &&
			intBetween(drawable.pos.y * dimensions.z, dimensions.t, dimensions.b)
		) {
			drawable.draw(can.ctx);
		}
	}

	return 0;
}


$(function() {
	var $can = $('#canvas');
	$can.attr('tabindex', 1);
	can = new orionCanvas($can[0]);
	viewport = new Viewport();
	drawables = generateDrawables();
	player = drawables[0];
	stars = generateStars(200, $can.width(), $can.height());

	$can[0].onmousemove = function (e) {
		var canvas = e.target;
		var context = canvas.getContext('2d');
		mouseX = e.clientX;
		mouseY = e.clientY;
	}

	$can.focus();
	animationLoop();

});
