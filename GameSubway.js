
class GameSubway {
    instructions = "Use 'a' and 'd' or Left / Right Arrows to dodge left or right";
    mobileInstructions = "Tap on the left or right sides of the screen to dodge left or right";
    
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

    constructor(width, height) {
        this.canvasWidth = width;
        this.canvasHeight = height;

        this.playerV = new SubwayPlayer(width / 2, height - 200, 100);

        this.enemyTimer = new Timer(this.enemyConfig.minDelay, this.enemyConfig.incDelay);

        canvasView.canvas.onPointerDown = e => {
            canvasView.vfx.push(new GrowingRing(e.x, e.y, '#666600', 50, 3, 0.3, 0));
            if (e.x < this.canvasWidth / 2) {
                this.playerV.leftButton = true;
            } else {
                this.playerV.rightButton = true;
            }
        }
        canvasView.canvas.onPointerUp = e => {
            canvasView.vfx.push(new GrowingRing(e.x, e.y, '#666600', 50, 3, 0.3, 0));
            this.playerV.leftButton = false;
            this.playerV.rightButton = false;
        }

        canvasView.canvas.onSwipe = e => {
            if (e > Math.PI * 0.9 || e < Math.PI * -0.9) {
                this.playerV.tryMoveTo(-1);
            } else if (e < Math.PI * 0.1 && e > Math.PI * -0.1) {
                this.playerV.tryMoveTo(1);
            }
        }
    }

    destroy() {
        this.playerV.destroy();
        canvasView.canvas.onSwipe = null;
    }

    reset() {
        this.enemyTimer.delay = 1;
        this.enemies = [];
        this.enemiesSpawned = 0;
        this.ended = false;
        this.playerV.reset();
    }

    onTick() {
        if (this.playerExists) {
            this.playerV.update();
        }

        this.enemyTimer.tick();
        if (this.enemyTimer.complete()) {
            this.enemyTimer.reset();
            this.addEnemy(Math.floor( -1 + Math.random() * 3))
        }

        for (var i = this.enemies.length - 1; i >= 0; i--) {
            var el = this.enemies[i];
            el.update();
            if (this.playerExists && el.collisionTest(this.playerV)) {
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
        canvasView.vfx.push(new Firework(this.playerV.location.x, this.playerV.location.y, 20, '#00aaff', 2));
        if (this.playerExists) {
            canvasView.vfx.push(new Firework(this.playerV.x, this.playerV.y, 10, '#00ff00', 1));
            this.playerExists = false;
        }
    }

    draw(canvas) {
        if (!this.ended) this.drawMainShip(canvas,this.playerV.location.x, this.playerV.location.y);
        if (this.playerExists) this.drawPlayer(canvas,this.playerV.x, this.playerV.y);
        this.enemies.forEach(el => this.drawEnemy(canvas, this.playerV.location.x + el.row * this.playerV.location.padding, el.y));
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
        canvas.drawCircle(x, y, 15, '#000000', '#aa6666');
    }

    addEnemy(row) {
        this.enemies.push(new SubwayEnemy(this.enemyConfig.minSpeed + Math.random() * this.enemyConfig.incSpeed, row, this.canvasHeight));
        this.enemiesSpawned++;
    }
}

class SubwayPlayer {
    position = 0;
    leftButton = false;
    rightButton = false;

    speed = 0.3;


    location = {
        x: 0,
        y: 0,
        padding: 0
    }

    movingTo = -1;
    moving = false;

    get x() {
        return this.location.x + this.location.padding * this.position;
    }

    get y() {
        return this.location.y;
    }

    constructor(x, y, padding) {
        this.location.x = x;
        this.location.y = y;
        this.location.padding = padding;
        window.addEventListener('keydown', this.keyDown);
        window.addEventListener('keyup', this.keyUp);        
    }

    destroy() {
        window.removeEventListener('keydown', this.keyDown);
        window.removeEventListener('keyup', this.keyUp);        
 
    }

    reset() {
        this.position = this.movingTo;
    }

    keyDown = (e) => {
        switch(e.key.toLowerCase()) {
            case 'a': case 'arrowleft': this.tryMoveTo(-1); break;
            case 'd': case 'arrowright': this.tryMoveTo(1); break;
        }
    }
    
    keyUp = (e) => {
        
    }

    tryMoveTo(moveTo) {
        if (this.moving) return;
        if (moveTo + this.position < -1 || moveTo + this.position > 1) return;

        this.moving = true;
        this.movingTo = this.position + moveTo;
    }

    update() {
        if (this.moving) {
            if (this.movingTo > this.position) {
                this.position += this.speed;
                if (this.position > this.movingTo) {
                    this.position = this.movingTo;
                    this.moving = false;
                }
            } else {
                this.position -= this.speed;
                if (this.position < this.movingTo) {
                    this.position = this.movingTo;
                    this.moving = false;
                }
            }
        }
    }
}

class SubwayEnemy {
    row = 0;
    speed = 0;
    y = 0;
    maxY = 0;
    toDestroy = false;

    constructor(speed, row, maxY) {
        this.speed = speed;
        this.row = row;
        this.maxY = maxY;
    }

    update() {
        this.y += this.speed;
        if (this.y > this.maxY) {
            this.toDestroy = true;
        }
    }

    collisionTest = (player) => {
        if (this.row === player.position) {
            if (this.y > player.location.y - 15 && this.y < player.location.y + 15) {
                return true;
            }
        }

        return false;
    }
}