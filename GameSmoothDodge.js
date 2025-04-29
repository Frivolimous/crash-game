
class GameSmoothDodge {
    instructions = "Use 'a' and 'd' or Left / Right Arrows to move left or right, or click and drag";
    mobileInstructions = "drag left or right to move back and forth.";
    
    enemyConfig = {
        minSpeed: 10,
        incSpeed: 10,
        minDelay: 500 / 30,
        incDelay: 500 / 30,
    }
    enemies = [];
    enemiesSpawned = 0;
    enemyTimer;

    playerV;

    ended = false;

    playerExists = false;

    canvasWidth;
    canvasHeight;

    mouseDown = false;

    constructor(width, height) {
        this.canvasWidth = width;
        this.canvasHeight = height;

        this.playerV = new SmoothDodgePlayer(width / 2, height - 250, 100);

        this.enemyTimer = new Timer(this.enemyConfig.minDelay, this.enemyConfig.incDelay);

        canvasView.canvas.onPointerDown = e => {
            canvasView.vfx.push(new GrowingRing(e.x, e.y, '#666600', 50, 3, 0.3, 0));

            this.mouseDown = true;
            this.playerV.dragX = e.x;
        }
        canvasView.canvas.onPointerUp = e => {

            this.mouseDown = false;
            this.playerV.dragX = null;
        }
        canvasView.canvas.onPointerMove = e => {
            if (this.mouseDown) {
                this.playerV.dragX = e.x;
            }
        }
    }

    destroy() {
        this.playerV.destroy();
    }

    reset() {
        this.enemyTimer.delay = 1;
        this.enemies = [];
        this.enemiesSpawned = 0;
        this.ended = false;
    }

    onTick() {
        if (this.playerExists) {
            this.playerV.update();
        }

        this.enemyTimer.tick();
        if (this.enemyTimer.complete()) {
            this.enemyTimer.reset();
            this.addEnemy(Math.floor( this.playerV.centerX - this.playerV.distance + Math.random() * this.playerV.distance * 2))
        }

        for (var i = this.enemies.length - 1; i >= 0; i--) {
            var el = this.enemies[i];
            el.update();
            if (this.playerExists && el.collisionTest(this.playerV, 25)) {
                this.playerExists = false;
                canvasView.vfx.push(new Firework(this.playerV.x, this.playerV.y, 10, '#00ff00', 1));
            }

            if (el.toDestroy) {
                this.enemies.splice(i, 1);
            }
        }
    }

    addPlayer() {
        this.playerExists = true;
    }

    bailout() {
        this.playerExists = false;
        this.bailoutEffect(this.playerV);
    }

    gameEnd() {
        this.ended = true;
        canvasView.vfx.push(new Firework(this.playerV.centerX, this.playerV.y, 20, '#00aaff', 2));
        if (this.playerExists) {
            canvasView.vfx.push(new Firework(this.playerV.x, this.playerV.y, 10, '#00ff00', 1));
            this.playerExists = false;
        }
    }

    draw(canvas) {
        if (!this.ended) this.drawMainShip(canvas,this.playerV.centerX, this.playerV.y);
        if (this.playerExists) this.drawPlayer(canvas,this.playerV.x, this.playerV.y);
        this.enemies.forEach(el => this.drawEnemy(canvas, el.x, el.y));
        canvas.addText(650, 80, `Enemies Spawned: ${this.enemiesSpawned}`, 12);
    }

    drawMainShip(canvas, x, y) {
        canvas.drawCircle(x, y, 30, '#000000', '#00aaff');
    }
    
    drawPlayer(canvas, x, y) {
        canvas.drawCircle(x, y, 10, '#000000', '#00ff00');
    }

    bailoutEffect() {
        canvasView.vfx.push(new GrowingCircle(this.playerV.x, this.playerV.y, '#00ff00', 10, 1, 0.01));
        canvasView.vfx.push(new FlyingText(this.playerV.x, this.playerV.y, 'Bailout!', '#000000', 10, 1.5, 0.03));
        canvasView.vfx.push(new GrowingRing(this.playerV.x, this.playerV.y, '#44ff77', 1, 3, 0.1, 0));
        canvasView.vfx.push(new GrowingRing(this.playerV.x, this.playerV.y, '#44ff77', 1, 3, 0.1, 6));
        canvasView.vfx.push(new GrowingRing(this.playerV.x, this.playerV.y, '#44ff77', 1, 3, 0.1, 12));
    }

    drawEnemy(canvas, x, y) {
        canvas.drawCircle(x, y, 25, '#000000', '#aa6666');
    }

    addEnemy(row) {
        this.enemies.push(new SmoothDodgeEnemy(this.enemyConfig.minSpeed + Math.random() * this.enemyConfig.incSpeed, row, this.canvasHeight));
        this.enemiesSpawned++;
    }
}

class SmoothDodgePlayer {
    leftButton = false;
    rightButton = false;

    x;
    y;

    dragX = null;

    centerX;
    distance;
    
    vX = 0;
    vA = 2;

    constructor(x, y, distance) {
        this.x = x;
        this.y = y;
        this.centerX = x;
        this.distance = distance;
        window.addEventListener('keydown', this.keyDown);
        window.addEventListener('keyup', this.keyUp);        
    }

    destroy() {
        window.removeEventListener('keydown', this.keyDown);
        window.removeEventListener('keyup', this.keyUp);        
 
    }

    keyDown = (e) => {
        switch(e.key.toLowerCase()) {
            case 'a': case 'arrowleft': this.leftButton = true; break;
            case 'd': case 'arrowright': this.rightButton = true; break;
        }
    }
    
    keyUp = (e) => {
        switch(e.key.toLowerCase()) {
            case 'a': case 'arrowleft': this.leftButton = false; break;
            case 'd': case 'arrowright': this.rightButton = false; break;
        }
    }

    update() {
        this.vX *= 0.9;

        if (this.dragX) {
            if (this.dragX < this.x) {
                this.vX -= this.vA;
                this.x += this.vX;
                if (this.x < this.dragX) {
                    this.x = this.dragX;
                    this.vX = 0;
                }
            } else if (this.dragX > this.x) {
                this.vX += this.vA;
                this.x += this.vX;
                if (this.x > this.dragX) {
                    this.x = this.dragX;
                    this.vX = 0;
                }
            }
        } else {
            if (this.leftButton === this.rightButton) null;
            else if (this.leftButton) this.vX -= this.vA;
            else this.vX += this.vA;
    
            this.x += this.vX;
        }

        if (this.x < this.centerX - this.distance) {
            this.x = this.centerX - this.distance;
            this.vX = 0;
        } else if (this.x > this.centerX + this.distance) {
            this.x = this.centerX + this.distance;
            this.vX = 0;
        }
    }
}

class SmoothDodgeEnemy {
    row = 0;
    speed = 0;
    x = 0;
    y = 0;
    maxY = 0;
    toDestroy = false;

    constructor(speed, x, maxY) {
        this.speed = speed;
        this.x = x;
        this.maxY = maxY;
    }

    update() {
        this.y += this.speed;
        if (this.y > this.maxY) {
            this.toDestroy = true;
        }
    }

    collisionTest = (player, radius) => {
        if (this.distanceTo(player.x, player.y) <= radius) {
            return true;
        }

        return false;
    }

    distanceTo(x, y) {
        return Math.sqrt(Math.pow(x - this.x, 2) + Math.pow(y - this.y, 2));
    }
}