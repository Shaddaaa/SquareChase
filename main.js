//stores all relevant data for a square
class Square {
	constructor(x,y,w,h,c,id) {
		this.id = id; //unique id
		this.div = document.createElement("div");
		this.div.id = this.id;
		this.x = x;
		this.y = y;
		this.width = w;
		this.height = h;
		this.difficulty = 0;
		this.div.style.position = "absolute"
		this.div.style.left = this.x + "px";
		this.div.style.top = this.y + "px";
		this.div.style.width = w + "px";
		this.div.style.height = h + "px";
		this.div.style.background = c;
		this.div.style.border = "3px solid blue";
		this.div.style.display = "flex";
		this.div.style.justifyContent = "center";
		this.div.style.alignItems = "center";
		this.div.style.color = "black";
		this.lastClick = new Date().getTime();
		this.div.obj = this;
		document.body.appendChild(this.div);
	}
}

//stores all global game data
class Model {
	constructor() {
		this.score = 0;
		this.highscore = 0;
		this.sqrs = [];
	}
}

//heart of the game
class Controller {
	constructor() {
		this.storage = new Model();
		if(localStorage.getItem("highscore")) {
			this.storage.highscore = localStorage.getItem("highscore");	
		}
		this.createSquare();
		this.createHighscoreDiv(0,20);
		this.createScoreDiv(0,0);
		this.createSmallerButton(0,40);
	}
	createSquare() {
		let size = 0.05*(window.innerWidth > window.innerHeight ? window.innerWidth : window.innerHeight);
		let x = window.innerWidth/2-size/2;
		let y = window.innerHeight/2-size/2;
		this.storage.sqrs[this.storage.sqrs.length] = new Square(x,y,size,size,"red", this.storage.sqrs.length);
		this.storage.sqrs[this.storage.sqrs.length-1].div.addEventListener("click", function(e) {game.onClickedSqr(e);});
	}
	createHighscoreDiv(left, top) {
		this.storage.highscoreDiv = document.createElement("div");
		this.storage.highscoreDiv.style.position = "absolute";
		this.storage.highscoreDiv.style.left = left + "px";
		this.storage.highscoreDiv.style.top = top + "px";
		this.storage.highscoreDiv.innerHTML = "Highscore: " + this.storage.highscore;
		document.body.appendChild(this.storage.highscoreDiv);
	}
	createScoreDiv(left, top) {
		this.storage.scoreDiv = document.createElement("div");
		this.storage.scoreDiv.style.position = "absolute";
		this.storage.scoreDiv.style.left = left + "px";
		this.storage.scoreDiv.style.top = top + "px";
		this.storage.scoreDiv.innerHTML = "Score: " + this.storage.score; 
		document.body.appendChild(this.storage.scoreDiv);
	}
	createSmallerButton(left, top) {
		let smallerButton = document.createElement("button");
		smallerButton.style.position = "absolute";
		smallerButton.style.left = left + "px";
		smallerButton.style.top = top + "px";
		smallerButton.innerHTML = "Smaller + Reset difficulty";
		smallerButton.addEventListener("click", function() { game.smaller(); });
		document.body.appendChild(smallerButton);
	}
	//gets called via a setinterval every 5 ms
	tick() {
		let now = new Date().getTime();
		for (let i = 0; i < this.storage.sqrs.length;i++) {
			this.displayTime(this.storage.sqrs[i], now);
		}
	}
	displayTime(sqr, now = new Date().getTime()) {
		sqr.div.innerHTML = this.timeLeft(sqr,now) + "ms";
	}
	timeLeft(sqr, now = new Date().getTime()) {
		let diff = sqr.lastClick - now;
		//timeleft based on score gained since last difficulty reset. Minimum 100, starting at 1000
		let timePer = Math.floor(100 + 900 * Math.pow(0.99, sqr.difficulty));
		return  diff + timePer;
	}
	moveRandom(sqr) {
		sqr.x += getRandom(-50,50);
		sqr.y += getRandom(-50,50);
		this.updatePosition(sqr);
	}
	//update square position and keep it in bounds
	updatePosition(sqr) {
		if(sqr.x > window.innerWidth - sqr.width) sqr.x = window.innerWidth - sqr.width;
		if(sqr.x < sqr.width) sqr.x = sqr.width;
		if(sqr.y > window.innerHeight - sqr.height) sqr.y = window.innerHeight - sqr.height;
		if(sqr.y < sqr.height) sqr.y = sqr.height;		
		sqr.div.style.left = sqr.x + "px";
		sqr.div.style.top = sqr.y + "px";
	}
	updateSize(sqr) {
		sqr.div.style.width = sqr.width + "px";
		sqr.div.style.height = sqr.height + "px";
	}
	onClickedSqr(e) {
		let sqr = this.getSqrById(e.target.id);
		if (sqr==null) {
			console.log("Square clicked... but not?");
			return;
		}
		//handle click
		let now = new Date().getTime();
		if (this.timeLeft(sqr,now) < 0) {
			this.lost();
		} else {
			sqr.difficulty++;
			this.addScore(1);
			this.moveRandom(sqr);
		}	
		sqr.lastClick = now;
	}
	getSqrById(id) {
		for (let i = 0; i < this.storage.sqrs.length;i++) {
			if(id == this.storage.sqrs[i].id) return this.storage.sqrs[i];
		}
		return null;
	}
	lost() {
		//reset squares
		this.deleteSquares();
		this.createSquare();
		//check for new Highscore
		if (this.storage.score > this.storage.highscore) {
			this.storage.highscore = this.storage.score;
			localStorage.setItem("highscore", this.storage.highscore);
		}
		//reset scores
		this.storage.score = 0;
		this.addScore(0);
		this.updateHighscore();
	}
	deleteSquares() {
		for (let i = 0; i < this.storage.sqrs.length;i++) {
			document.getElementById(this.storage.sqrs[i].id).remove();
		}
		this.storage.sqrs = [];
	}
	updateHighscore() {
		this.storage.highscoreDiv.innerHTML = "Highscore: " + this.storage.highscore;
	}
	//also updates the view
	addScore(i) {
		this.storage.score += i;
		this.storage.scoreDiv.innerHTML = "Score: " + this.storage.score;
	}
	smaller() {
		for (let i = 0; i < this.storage.sqrs.length; i++) {
			this.storage.sqrs[i].width *= 0.9;
			this.storage.sqrs[i].height *= 0.9;
			this.storage.sqrs[i].difficulty = 0;
			this.updateSize(this.storage.sqrs[i]);
		}
	}
	onkeydown(e) {
		switch(e.key) {
			case "s":
				game.smaller();
				break;
			default:
				break;
		}
	}
}

let game = new Controller();
document.body.onkeydown = game.onkeydown;
let tickInterval = setInterval(function() { game.tick(new Date().getTime()) }, 5);

//utility
function getRandom(min, max) {
	return Math.random()*(max-min) + min;
}