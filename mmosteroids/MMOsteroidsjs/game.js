
// canvas element and 2D context
var canvas = document.createElement( 'canvas' ),
	context = canvas.getContext( '2d' );

canvas.width = window.innerWidth; 
canvas.height = window.innerHeight; 
document.body.appendChild(canvas);
var gameWidth = 1000, 	
	gameHeight = 1000,
	maxSpeed = 10, 
	WAITING = 0, 
	PLAYING = 1, 
	state = WAITING, 
	aspect = canvas.height/canvas.width,
	viewRect = {x:gameWidth/2-300, y:gameHeight/2-300*aspect, w:600, h:600*aspect},
	targetRect = {x:gameWidth/2-300, y:gameHeight/2-300*aspect, w:600, h:600*aspect},
	viewVel = {x:0, y:0},
	lastViewPos = {x:viewRect.x, y:viewRect.y}, 
	counter = 0, 
	numPlayers = 0, 
	invincibleTime = 120, 
	ws,
	wsConnected = false, 
	server = 'ws://node.seb.ly:8000', 
	killModeTime , 
	killMode, 
	diff = new Vector2(0,0); 

resetKillMode();
frameRate = 30;

console.log(viewRect);  

c = context; 

var ships = [], bullets = [], spareBullets = []; 

for(var i=0;i<10; i++) {
	
	makeShip();
}
var stars = []; 
for(var i=0;i<200;i++) { 
	stars.push({x:random(gameWidth), y:random(gameHeight), s:random(0.5,1)}); 	
}

var player = ships[0]; 
player.pos.reset(gameWidth/2, gameHeight/2);
player.vel.reset(0,0); 
player.invincibleCountdown = invincibleTime;
player.energy = 100;

globalPos = new Vector2(0,0);  

document.body.addEventListener('keydown', function(e) { if((!KeyTracker.isKeyDown(32)) && (e.keyCode==32)) fireBullet(player); }); 

window.addEventListener('load', function() { 
	initSockets(); 
	setTimeout(startGame, 10000); 
});


function startGame() { 
	
	if(window.state == PLAYING) return; 
	
//	window.console.log('go!');
	window.state = PLAYING; 
	newShip();
	
}
function draw() { 
	
	if(counter==killModeTime) killMode = true;
	c.globalCompositeOperation = "lighten";
	c.clearRect(0,0,canvas.width, canvas.height); 
	c.textAlign = 'center';
	
	updateViewRect(); 
	
	c.save(); 
	c.scale(canvas.width/viewRect.w, canvas.width/viewRect.w); 
	c.translate(-viewRect.x, -viewRect.y); 
	
	c.strokeStyle = 'white';
//	c.strokeRect(viewRect.x, viewRect.y, viewRect.w, viewRect.h); 

	
	drawStars(); 
	
	if(state == PLAYING) {
	
		updatePlayer(); 
		globalPos.plusEq(player.vel); 
		
		if((counter%2==0)&&(wsConnected)) {
			var update = {
				type : 'update', 
				id : wsID, 
				x : Math.round(globalPos.x*100), 
				y : Math.round(globalPos.y*100), 
				a : Math.round(player.angle*100)
			};
			// if(lander.exploding) update.exploding = 1; 
			// 	if(lander.thrusting) update.thrusting = 1; 

			ws.send(JSON.stringify(update));
			
		}
	
		updateShips(); 
		updateBullets(); 
		checkCollisions(); 
	//	player.energy--;
		if((player.respawnCountdown>0) && (counter%20<10)) { 
			c.fillStyle = 'white';
			c.fillText('RESPAWNING', viewRect.x+viewRect.w/2, viewRect.y+viewRect.h/2 ); 


		}
	
	} else { 
		if(counter%20<10) { 
				c.font = '6pt Monaco';
				c.fillStyle = 'white';
			
			c.fillText('CONNECTING',
			 viewRect.x+viewRect.w/2,viewRect.y+viewRect.h/2);
		}
	}
	c.restore();
	
	c.font = '12pt Monaco';
	c.fillStyle = 'white';
	c.textAlign = 'left';
	c.fillText('CONNECTIONS : '+numPlayers, 10,30); 

	counter++;
	
}

function updatePlayer() { 
	
	if(player.enabled) { 
		player.vel.multiplyEq(0.96);
	 
		var speed = 0.5; 
		if(KeyTracker.isKeyDown(KeyTracker.RIGHT)) { 
			player.targetAngle+=radians(10);
		} 
		if(KeyTracker.isKeyDown(KeyTracker.LEFT)) { 
			player.targetAngle-=radians(10);
		}
		if(KeyTracker.isKeyDown(KeyTracker.UP)) { 
		
			player.vel.x+= Math.cos(player.angle) * speed;
			player.vel.y+= Math.sin(player.angle) * speed;
		}
		if(KeyTracker.isKeyDown(KeyTracker.DOWN)) { 
			player.vel.multiplyEq(0.9);
		}	
	} 
}

function updateShips() { 
	
	for(var i=0; i<ships.length; i++) {
	
		var p = ships[i]; 
		
		p.update(canvas); 
		
		if(!p.enabled) continue; 
		
		p.draw(c); 
	
		if((p!=player) && (Math.random()<0.05)){ 
			fireBullet(p); 
		}
	
	
	}


}

function updateBullets() { 

	for(var i=0; i<bullets.length; i++) {
	
		var b = bullets[i]; 
		if(b.enabled) { 
			b.update(canvas); 
			b.draw(c); 
		
			for(var j=0; j<ships.length; j++) { 
				var p1 = ships[j]; 
				if(p1.pos.isCloseTo(b.pos,5)) { 
				
					b.enabled = false; 
					p1.hit();
					break; 
				
				}
			
			}
	
			if(!b.enabled) spareBullets.push(b); 
		
		
		}
	}
}

function checkCollisions() { 

	for(var i=0; i<ships.length; i++) { 
		var p1 = ships[i]; 
		if(!p1.enabled) continue; 
	
		for(var j=i+1 ; j<ships.length; j++) {
		
			var p2 = ships[j]; 
			if(!p2.enabled) continue; 
		
			//var dx = p2.pos.x - p1.pos.x; 
			//var dy = p2.pos.y - p1.pos.y; 
		
		
		
			//var distance = Math.sqrt((dx*dx) + (dy*dy)); 
		
			/*if((p1==player) && killMode) {
				
				if(diff.isMagLessThan(300)) { 
				
				
			} else*/ 
			
			if((killMode)&&(p1==player)) { 
				
				diff.copyFrom (p2.pos);
				diff.minusEq(p1.pos);  
				if(diff.isMagGreaterThan(200)) {
					
					diff.normalise(); 
					diff.multiplyEq(0.2);
					p2.vel.multiplyEq(0.9);
					p2.vel.minusEq(diff); 
				}
				
			
			} 
			diff.copyFrom (p2.pos);
			diff.minusEq(p1.pos);
				
			if(diff.isMagLessThan(80)) { 
		
				var l = diff.magnitude(); 
			
				diff.normalise(); 
				var forceAmount = 1- (l/80); 
			
				if(l<=20) {
					diff.multiplyEq(forceAmount * -2);
					p2.hit(); 
					p1.hit(); 
					p2.vel.minusEq(diff); 
					p1.vel.plusEq(diff); 
		
				} else {
				
					diff.multiplyEq(forceAmount * -0.4);
					
					if(p1!=player) p1.vel.plusEq(diff);
					if((p1==player) && killMode) {
						p2.vel.multiplyEq(0.8);
						diff.multiplyEq(6);
						if(l>40) p2.vel.plusEq(diff); 
						if(random()<0.1) fireBullet(p2); 
					} else {
						p2.vel.minusEq(diff);
					}
					
				}
				
				
				if(p2.vel.isMagGreaterThan(maxSpeed)) { 
					p2.vel.multiplyEq(maxSpeed/p2.vel.magnitude());
				
				}
			
				if(p1.vel.isMagGreaterThan(maxSpeed)) { 
					p1.vel.multiplyEq(maxSpeed/p1.vel.magnitude());
				
				}
		
			}
		
		
		}
	}
}



function resetKillMode() { 
	
	killModeTime = counter+randomInteger(300,1800); 
	killMode = false;

}
function updateViewRect() { 
	
	var zoom;
	var aspect = canvas.height/canvas.width; 
	
	if(player.respawnCountdown>0) { 
		zoom = 800; 
		targetRect.x+=Math.sin(counter*0.01) *10; 
		targetRect.y+=Math.cos(counter*0.01) *10;
		resetKillMode();
	} else {
		zoom =  600 + player.vel.magnitude()*50; 
		targetRect.x = player.pos.x - targetRect.w/2; 
		targetRect.y = player.pos.y - targetRect.h/2; 
	
	}
	
	targetRect.w = zoom; 
	targetRect.h = zoom*aspect;
	
	if(targetRect.x<0) targetRect.x+=gameWidth; 
	if(targetRect.x - viewRect.x > gameWidth/2) viewRect.x+=gameWidth;
	if(targetRect.x>gameWidth) targetRect.x-=gameWidth; 
	if(targetRect.x - viewRect.x < -gameWidth/2) viewRect.x-=gameWidth;
	if(targetRect.y<0) targetRect.y+=gameHeight; 
	if(targetRect.y - viewRect.y > gameHeight/2) viewRect.y+=gameHeight;
	if(targetRect.y>gameHeight) targetRect.y-=gameWidth; 
	if(targetRect.y - viewRect.y < -gameHeight/2) viewRect.y-=gameHeight;
	
	var movespeed = 0.05;
	var zoomspeed = 0.05; 
	viewRect.x+=(targetRect.x-viewRect.x)*movespeed;
	viewRect.y+=(targetRect.y-viewRect.y)*movespeed;
	viewRect.w+=(targetRect.w-viewRect.w)*zoomspeed;
	viewRect.h+=(targetRect.h-viewRect.h)*zoomspeed;
	
	viewVel.x = viewRect.x - lastViewPos.x; 
	viewVel.y = viewRect.y - lastViewPos.y; 
	lastViewPos.x = viewRect.x; 
	lastViewPos.y = viewRect.y;
	
}


function fireBullet(ship) {
	
	var b; 
	
	if(spareBullets.length>0)  { 
		b = spareBullets.pop(); 
	} else {
		b = new Bullet(); 
		bullets.push(b); 
	}
	
	b.reset(ship.pos.x, ship.pos.y, ship.angle); 
	b.update();
	b.vel.plusEq(ship.vel);
	
}
function drawStars() { 
	c.beginPath(); 
	c.save(); 
	c.translate(viewRect.x+viewRect.width/2, viewRect.y+viewRect.height/2); 

	for(var i=0;i<stars.length;i++) { 
		var star = stars[i]; 

//		star.x -= viewVel.x/star.s; 
//		star.y -= viewVel.y/star.s; 
		var posx = star.x; 
		var posy = star.y; 


		while(posx<viewRect.x) posx+=gameWidth; 
		while(posy<viewRect.y) posy+=gameHeight; 
		while(posx>viewRect.x+viewRect.width) posx-=gameWidth; 
		while(posy>viewRect.y+viewRect.height) posy-=gameHeight;

		if(posx>viewRect.x+viewRect.w) continue; 
		if(posy>viewRect.y+viewRect.h) continue; 
		c.moveTo(posx, posy); 
		c.lineTo(posx+1, posy+1); 
		
	}
	c.lineWidth = 1;
	c.strokeStyle = '#88f';
	//c.lineCap = 'round';
	c.stroke(); 
	c.restore(); 



}


function makeShip() { 
	var particle = new Particle();
	particle.pos.reset(Math.random()*canvas.width, Math.random()*canvas.height);  
	particle.vel.reset(Math.random()*6 - 3, Math.random()*6 - 3); 
	
	ships.push(particle);
}

function newShip() { 
	
	if(ships.length<100) { 
		makeShip(); 
		
	}
	if(numPlayers<random(1500,2000)) { 
		setTimeout(newShip, 1);
		numPlayers+=randomInteger(1,5);
			
	} else { 
		setTimeout(newShip, random(10,1000));
		numPlayers+=randomInteger(-1,1);
	}

	 
	
}
function Particle() {
	
	var pos = this.pos = new Vector2(0,0); 
	var vel = this.vel = new Vector2(0,0); 
	this.angle = 0; 
	this.energy = randomInteger(60,100); 
	

	this.shieldsUp = 0; 

	this.exploding = 0; 
	this.enabled = true; 
	this.counter = 0; 
	this.targetAngle = 0; 
	
	this.respawnCountdown = 0;
	this.invincibleCountdown = 0;
	
	this.update = function(canvas) { 
		
		if(this.exploding>0) {
			
			this.exploding--; 
			if(this.exploding==0) { 
				this.enabled =false; 
				// trigger respawn
				
				this.respawnCountdown = 100; 
				
				this.vel.reset(0,0); 
				this.energy =100; 
				
			}
		} else if(this.respawnCountdown>0){
			this.respawnCountdown--; 
			if(this.respawnCountdown<=0) { 
				this.enabled = true; 
				this.energy =100; 
				if(this == player) {
					this.pos.reset(viewRect.x+viewRect.w/2, viewRect.y+viewRect.h/2); 
					globalPos.reset(0,0); 
				}
				//this.pos.x+=random(gameWidth, gameWidth*2);
				//this.pos.y+=random(gameHeight, gameHeight*2);
				this.invincibleCountdown = invincibleTime; 
			}
		} else {
			
		//	vel.multiplyEq(0.99); 
			pos.plusEq(vel); 
		
			if(this.invincibleCountdown>0) this.invincibleCountdown--; 
		
			while(pos.x<0) pos.x+=gameWidth; 
			while(pos.y<0) pos.y+=gameHeight; 
			pos.x = pos.x%gameWidth; 
			pos.y = pos.y%gameHeight;
			
			if(this!=player) {
				if((killMode) && (this.pos.isCloseTo(player.pos, 200))) { 
					diff.copyFrom(player.pos); 
					diff.minusEq(this.pos); 
					this.targetAngle = diff.angle(true); 
				} else { 
					this.targetAngle = Math.atan2(vel.y, vel.x);
				}
			}
			
		    if (this.targetAngle > this.angle+Math.PI) this.targetAngle -= Math.PI*2;
		    if (this.targetAngle < this.angle-Math.PI) this.targetAngle += Math.PI*2;

		    this.angle += (this.targetAngle - this.angle) * 0.4;
		
		
			if(this.energy<0) {
				this.energy = 0; 
				this.exploding = 10; 
	
			}
			// else if(this.energy>100) this.energy = 100; 
			// 	if(this.showEnergy>0) this.showEnergy--; 
			// 	
		}
		this.counter++;
	};
	
	this.draw = function(c) { 
		
		var posx = pos.x;// % gameWidth; 
		var posy = pos.y;// % gameHeight;
		if(posx<viewRect.x) posx+=gameWidth; 
		if(posy<viewRect.y) posy+=gameHeight; 
		
		if(posx>viewRect.x+viewRect.w) return; 
		if(posy>viewRect.y+viewRect.h) return;
		// 	
		
		if(this.exploding) { 
			c.fillStyle = 'red';
			c.beginPath(); 
			c.arc(posx, posy, Math.sin(this.exploding/10*Math.PI)*20, 0, Math.PI*2, true); 
			c.fill(); 
		} else {
		
		
			var hitStrength = this.shieldsUp/20; 
		
			if(this.shieldsUp>0) {
				c.strokeStyle = 'rgb('+ ((this==player)? Math.round(hitStrength*255) : 255) +', '+Math.round((1-hitStrength)*255)+', '+Math.round((1-hitStrength)*255)+')'; 
		
			} else {
				c.strokeStyle = (this==player)?'rgb(0,255,255)' : "white"; 
			}
			c.lineWidth = 1; 
			c.beginPath(); 
			c.save(); 
			c.translate(posx, posy); 
			c.save(); 
			c.rotate(this.angle); 
		
			c.moveTo(-4, -4); 
			c.lineTo(6, 0); 
			c.lineTo(-4,4); 
			c.closePath(); 
			if(this==player) {
				c.fillStyle = c.strokeStyle;
				c.fill();
			}
			if(vel.isMagGreaterThan(2)) {
				//c.strokeStyle = "white"; 
				c.moveTo(-6,-2); 
				c.lineTo(-5-(5*(this.counter%2)), 0); 
				c.lineTo(-6,2); 
			
			}
		
			c.stroke();
			c.restore(); 
			
			if((this.invincibleCountdown>0) && ((counter%6)<3)) { 
				c.strokeStyle = (this==player)?'rgb(0,255,255)' : "white"; 
				c.strokeCircle(0,0,10); 
			} else if(this.shieldsUp>0) { 
				
				c.beginPath(); 
				c.strokeStyle = 'hsl(0,0%,'+Math.min(30,Math.round(hitStrength*60))+'%)';
				c.lineWidth = 1; 
				c.arc(0,0,10,0,Math.PI*2,true); 
				c.stroke(); 
	
				c.beginPath(); 
				c.lineWidth = 1; 
				c.strokeStyle = 'lightgreen';
				c.moveTo(-10,10); 
				c.lineTo(this.energy/100*20 -10,10); 
				c.stroke(); 
				c.beginPath(); 
				c.strokeStyle = 'red'; 
				c.moveTo(this.energy/100*20 -10,10); 
				c.lineTo(10,10); 
	
				c.stroke(); 
		
				this.shieldsUp--;
			
			}
		
			c.restore();
		}
	};

	this.hit = function() { 
		if(this.invincibleCountdown>0) return;
		this.shieldsUp = 20;
		this.energy-=2; 
	};
	
}

function Bullet() {
	
	var pos = this.pos = new Vector2(0,0); 
	var vel = this.vel = new Vector2(0,0); 
	this.life = 0; 
	
	this.enabled = true; 
	this.update = function(canvas) { 
		this.life++; 
		pos.plusEq(vel); 
		if(this.life>20) this.enabled = false; 
		while(pos.x<0) pos.x+=gameWidth; 
		while(pos.y<0) pos.y+=gameHeight; 
		pos.x = pos.x%gameWidth; 
		pos.y = pos.y%gameHeight; 
	};
	this.draw = function(c) {
		var posx = pos.x;// % gameWidth; 
		var posy = pos.y;// % gameHeight;
		if(posx<viewRect.x) posx+=gameWidth; 
		if(posy<viewRect.y) posy+=gameHeight;
		c.strokeStyle = 'white'; 
		c.lineWidth =2;
		c.line(posx, posy, posx+1.5, posy+1.5); 
		
	};
	
	this.reset = function(x, y, angle) { 
		pos.reset(x,y); 
		vel.reset(5,0); 
		vel.rotate(angle, true); 
		this.enabled = true; 
		this.life = 0; 
	};
	
	
}


function initSockets() { 
	
	ws = new WebSocket(server); 
	ws.onopen = function(e) { 
		
		console.log('go!'); 
		wsConnected = true; 
		startGame();
		
	};
	ws.onmessage = function(e) { 
	//	console.log(e.data); 
		
		var msg = JSON.parse(e.data); 
		
		if(msg.type=='connect') { 
			wsID = msg.id;
			
		} else if(msg.type=='join') {
			// add new player object
		} else if(msg.type=='update') { 
			// update player object
			// if(!ships[msg.id]) { 
			// 				ships[msg.id] = new Lander(); 
			// 				ships[msg.id].scale = lander.scale;
			// 			}
			// var player = players[msg.id]; 
			// 			player.pos.x = msg.posx/100; 
			// 			player.pos.y = msg.posy/100; 
			// 			player.rotation = msg.rotation; 
			// 			player.thrusting = (msg.thrusting == 1);
			
		} else if(msg.type=='leave') { 
			// delete player object
			//if(players[msg.id]) delete players[msg.id]; 

		}
			
			
		
	};
	ws.onclose = function(e) { 
		wsConnected = false; 
		//console.log("disconnected!"); 
	};
}
