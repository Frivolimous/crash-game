
class GameJump {
    instructions = "Use 'w', up or click to jump. Duck under the floating bars!";
    mobileInstructions = "Tap anywhere to jump. Duck under the floating bars!";
    
    enemyConfig = {
        minSpeed: 10,
        incSpeed: 10,
        minDelay: 500 / 30,
        incDelay: 1000 / 30,
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

        this.playerV = new JumpPlayer(width / 2, height - 250, 100);

        this.enemyTimer = new Timer(this.enemyConfig.minDelay, this.enemyConfig.incDelay);

        canvasView.canvas.onPointerDown = e => {
            canvasView.vfx.push(new GrowingRing(e.x, e.y, '#666600', 50, 3, 0.3, 0));

            this.playerV.jumping = true;
        }
        canvasView.canvas.onPointerUp = e => {

            this.playerV.jumping = false;
        }
        canvasView.canvas.onPointerMove = e => {
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
            this.addEnemy(this.playerV.x)
        }

        for (var i = this.enemies.length - 1; i >= 0; i--) {
            var el = this.enemies[i];
            el.update();
            if (this.playerExists && el.collisionTest(this.playerV, 25)) {
                if ((!el.high && this.playerV.z <= 15) || (el.high && this.playerV.z >= 40)) {
                    this.playerExists = false;
                    canvasView.vfx.push(new Firework(this.playerV.x, this.playerV.y - this.playerV.z, 10, '#00ff00', 1));
                }
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
        canvasView.vfx.push(new Firework(this.playerV.x, this.playerV.y, 20, '#00aaff', 2));
        if (this.playerExists) {
            canvasView.vfx.push(new Firework(this.playerV.x, this.playerV.y, 10, '#00ff00', 1));
            this.playerExists = false;
        }
    }

    draw(canvas) {
        if (!this.ended) this.drawMainShip(canvas,this.playerV.x, this.playerV.y);
        if (this.playerExists) {
            this.drawShadow(canvas,this.playerV.x, this.playerV.y, 1 / (1 + this.playerV.z / 50));
        }
        this.enemies.forEach(el => (!el.high && this.drawEnemy(canvas, el.x, el.y, el.high)));
        this.enemies.forEach(el => (el.high && this.drawEnemyShadow(canvas, el.x, el.y)));
        if (this.playerExists) {
            this.drawPlayer(canvas,this.playerV.x, this.playerV.y - this.playerV.z);
        }
        this.enemies.forEach(el => (el.high && this.drawEnemy(canvas, el.x, el.y, el.high)));
        canvas.addText(650, 80, `Enemies Spawned: ${this.enemiesSpawned}`, 12);
    }

    drawMainShip(canvas, x, y) {
        canvas.drawCircle(x, y, 30, '#000000', '#00aaff');
    }
    
    drawPlayer(canvas, x, y) {
        canvas.drawCircle(x, y, 10, '#000000', '#00ff00');
    }

    drawShadow(canvas, x, y, size) {
        canvas.drawElipse(x, y + 7, 10 * size, 5 * size, '#000000', '#000000', 0.5);
    }

    bailoutEffect() {
        canvasView.vfx.push(new GrowingCircle(this.playerV.x, this.playerV.y, '#00ff00', 10, 1, 0.01));
        canvasView.vfx.push(new FlyingText(this.playerV.x, this.playerV.y, 'Bailout!', '#000000', 10, 1.5, 0.03));
        canvasView.vfx.push(new GrowingRing(this.playerV.x, this.playerV.y, '#44ff77', 1, 3, 0.1, 0));
        canvasView.vfx.push(new GrowingRing(this.playerV.x, this.playerV.y, '#44ff77', 1, 3, 0.1, 6));
        canvasView.vfx.push(new GrowingRing(this.playerV.x, this.playerV.y, '#44ff77', 1, 3, 0.1, 12));
    }

    drawEnemyShadow(canvas, x, y) {
        canvas.drawRect(x - 90 / 2, y - 25 / 2, 90, 10, '#000000', 0.7);
    }

    drawEnemy(canvas, x, y, high) {
        if (high) {
            canvas.drawRect(x - 100 / 2, y - 25 / 2 - 30, 100, 25, '#7777bb');
        } else {
            canvas.drawRect(x - 100 / 2, y - 25 / 2, 100, 25, '#aa6666');
        }
    }

    addEnemy(row) {
        this.enemies.push(new JumpEnemy(this.enemyConfig.minSpeed, row, this.canvasHeight, Math.random() < 0.3));
        this.enemiesSpawned++;
    }
}

class JumpPlayer {
    x;
    y;
    z = 0;

    jumping = false;
    canJump = false;
    airborn = false;

    distance;
    
    vZ = 0;
    gravity = -1;
    jumpV = 10;

    constructor(x, y, distance) {
        this.x = x;
        this.y = y;
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
            case 'w': case 'arrowup': this.jumping = true; break;
        }
    }
    
    keyUp = (e) => {
        switch(e.key.toLowerCase()) {
            case 'w': case 'arrowup': this.jumping = false; break;
        }
    }

    update() {
        if (this.airborn) {
            this.vZ += this.gravity;
            this.z += this.vZ;
            if (this.z <= 0) {
                this.z = 0;
                this.airborn = false;
                this.vZ = 0;
            }
        } else {
            if (this.jumping && this.canJump) {
                this.canJump = false;
                this.airborn = true;
                this.vZ = this.jumpV;
            }
        }

        if (this.jumping === false) {
            this.canJump = true;
        }
    }
}

class JumpEnemy {
    row = 0;
    speed = 0;
    x = 0;
    y = 0;
    maxY = 0;
    toDestroy = false;

    high = true;

    constructor(speed, x, maxY, high) {
        this.high = high;
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