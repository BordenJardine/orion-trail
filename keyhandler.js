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
	for(var key in keyPresses.current) {
		if(!keyPresses.current.hasOwnProperty(key)) continue;
		switch(parseInt(key)) {
			case 32:
				player.shooting = keyPresses.current[key];
				break;
			case 37:
				player.rotatingLeft = keyPresses.current[key];
				break;
			case 39:
				player.rotatingRight = keyPresses.current[key];
				break;
			case 38:
				player.goingForth = keyPresses.current[key];
				break;
			case 40:
				player.goingBack = keyPresses.current[key];
				break;
			case 107:
				if(keyPresses.current[key] == 1) viewport.zoomIn();
				break;
			case 109:
				if(keyPresses.current[key] == 1) viewport.zoomOut();
				break;
			case 116:
				if(keyPresses.current[key] == 1) window.location.reload();
				break;
		}
	}

	return 0;
}
