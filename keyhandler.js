var keyPresses = {
	current : {},
	press : function(e){
			this.current[e.keyCode] = 1;
	},
	release : function(e){
			this.current[e.keyCode] = 0;
	}
};


function handleKeys() {
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

function handleKeys() {
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