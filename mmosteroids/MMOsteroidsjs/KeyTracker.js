KeyTracker = new (function(){
	
	this.keysPressed = {}; 
	this.UP = 38; 
	this.LEFT = 37; 
	this.RIGHT = 39; 
	this.DOWN = 40; 
	var defaultKeys = [32,37, 38, 39, 40];
	
	this.isKeyDown = function (key) { 
		if (typeof key == 'string')
			key = key.charCodeAt(0); 
		return(this.keysPressed[key]);
	};
	
	document.addEventListener("keydown", function(e) {	
		if(defaultKeys.indexOf(e.keyCode)>-1) e.preventDefault(); 
		KeyTracker.keysPressed[e.keyCode] = true; 
		}); 
	document.addEventListener("keyup", 	function(e) {
		if(defaultKeys.indexOf(e.keyCode)>-1) e.preventDefault(); 
		KeyTracker.keysPressed[e.keyCode] = false;
		}); 
		
})();