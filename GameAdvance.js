
class GameAdvance {
    instructions = "Use 'w', up or click to jump forwards. Don't get squished!";
    mobileInstructions = "Tap anywhere to jump forwards. Don't get squished!";
    
    enemyConfig = {
        minSpeed: 10,
        incSpeed: 10,
        minDelay: 500 / 30,
        incDelay: 1000 / 30,
    }
    // {y: number, speed: number (positive = from left, negative = from right), count: number, tick: number}
    worldSpeed = 1.5;
    enemyRows = [];
    enemies = [];
    enemiesSpawned = 0;
    enemyTimer;
    enemyRowTimer;
    enemyRowDelay = 100;

    mainY = 0;
    playerV;

    ended = false;

    playerExists = false;

    canvasWidth;
    canvasHeight;

    constructor(width, height) {
        this.canvasWidth = width;
        this.canvasHeight = height;

        this.mainY = height / 2;
        this.playerV = new AdvancePlayer(width / 2, this.mainY);

        this.enemyTimer = new Timer(this.enemyConfig.minDelay, this.enemyConfig.incDelay);
        this.enemyRowTimer = new Timer(this.enemyRowDelay / this.worldSpeed, 0);

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
        this.playerV.reset();
        this.enemyRows = [];
        
        this.enemyRowTimer.delay = this.enemyRowDelay;
        for (var y = this.canvasHeight; y >= 0; y -= this.worldSpeed) {
            this.enemyRowTimer.tick();
            if (this.enemyRowTimer.complete()) {
                this.enemyRowTimer.reset();
                this.addRow(y);
            }
        }
    }

    onTick() {
        this.playerV.y += this.worldSpeed;
        this.enemies.forEach(el => el.y += this.worldSpeed);
        this.enemyRows.forEach(el => el.y += this.worldSpeed);
        if (this.playerExists) {
            this.playerV.update();
        }

        this.enemyRowTimer.tick();
        if (this.enemyRowTimer.complete()) {
            this.enemyRowTimer.reset();
            this.addRow(0);
        }

        for (var i = this.enemyRows.length - 1; i >= 0; i--) {
            var row = this.enemyRows[i];

            if (row.y > this.canvasHeight) {
                this.enemyRows.splice(i, 1);
            }

            row.tick--;
            if (row.tick <= 0) {
                row.tick = 120 / Math.abs(row.speed);
                row.counter--;
                if (row.counter > 0) {
                    this.addEnemy(row, row.speed > 0 ? 0 : this.canvasWidth);
                } else {
                    row.counter = row.count;
                }
            }
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
        canvasView.vfx.push(new Firework(this.playerV.x, this.mainY, 20, '#00aaff', 2));
        if (this.playerExists) {
            canvasView.vfx.push(new Firework(this.playerV.x, this.playerV.y, 10, '#00ff00', 1));
            this.playerExists = false;
        }
    }

    draw(canvas) {
        if (!this.ended) this.drawMainShip(canvas, this.playerV.x, this.mainY);
        this.enemyRows.forEach(row => this.drawRow(canvas, row));
        this.enemies.forEach(el => (!el.high && this.drawEnemy(canvas, el.x, el.y, el.high)));
        this.enemies.forEach(el => (el.high && this.drawEnemyShadow(canvas, el.x, el.y)));
        if (this.playerExists) {
            this.drawPlayer(canvas,this.playerV.x, this.playerV.y);
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

    drawRow = (canvas, row) => {
        canvas.drawRect(0, row.y - 25, this.canvasWidth, 50, '#ffffff', 0.3);
    }

    addEnemy(row, x) {
        var enemy = new AdvanceEnemy(x, row.y, row.speed, this.canvasWidth);
        this.enemies.push(enemy);
        this.enemiesSpawned++;
    }

    addRow(y) {
        var speed = 3 + Math.random() * 5;
        if (Math.random() < 0.5) {
            speed *= -1;
        }

        var row = {y, speed, count: Math.floor(3 + Math.random() * 3), tick: 0, counter: 0};

        this.enemyRows.push(row);

        for (var i = 0; i < this.canvasWidth; i += Math.abs(row.speed)) {
            row.tick--;
            if (row.tick <= 0) {
                row.tick = 120 / Math.abs(row.speed);
                row.counter--;
                if (row.counter > 0) {
                    this.addEnemy(row, row.speed > 0 ? i : this.canvasWidth - i);
                } else {
                    row.counter = row.count;
                }
            }
        }
    }
}

class AdvancePlayer {
    x;
    y;
    homeY;

    jumping = false;
    canJump = false;
    airborn = false;
    
    vY = 0;
    friction = 4;
    jumpV = -22.333;

    constructor(x, y) {
        this.x = x;
        this.y = y;
        this.homeY = y;
        window.addEventListener('keydown', this.keyDown);
        window.addEventListener('keyup', this.keyUp);        
    }

    reset() {
        this.vY = 0;
        this.y = this.homeY;
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
            this.vY += this.friction;
            this.y += this.vY;
            if (this.vY >= 0) {
                this.vY = 0;
                this.airborn = false;
            }
        } else {
            if (this.jumping && this.canJump) {
                this.canJump = false;
                this.airborn = true;
                this.vY = this.jumpV;
            }
        }

        if (this.jumping === false) {
            this.canJump = true;
        }
    }
}

class AdvanceEnemy {
    row = 0;
    speed = 0;
    x = 0;
    y = 0;
    maxY = 0;
    toDestroy = false;


    constructor(x, y, speed) {
        this.x = x;
        this.y = y;
        this.speed = speed;
    }

    update() {
        this.x += this.speed;
        if (this.x > this.maxX) this.toDestroy = true;
        if (this.x < 0) this.toDestroy = true;
    }

    collisionTest = (player) => {
        if (player.y > this.y - 15 &&
            player.y < this.y + 15 &&
            player.x > this.x - 50 &&
            player.x < this.x + 50
        ) {
            return true;
        }

        return false;
    }

    distanceTo(x, y) {
        return Math.sqrt(Math.pow(x - this.x, 2) + Math.pow(y - this.y, 2));
    }
}