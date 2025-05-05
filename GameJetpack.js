
class GameJetpack {
    instructions = "Click, W or 'Up' to fly upwards. release to fall.";
    mobileInstructions = 'Tap and hold to fly upwards, release to fall.';

    ended = false;
    playerExists = false;

    canvasWidth;
    canvasHeight;

    minY;
    maxY;

    enemyConfig = {
        minSpeed: 5,
        incSpeed: 5,
        minDelay: 500 / 30,
        incDelay: 200 / 30,
    }
    bullets = [];
    enemies = [];
    enemiesSpawned = 0;
    enemyTimer;

    bulletCountdown = 0;
    bulletDelay = 10;
    bulletSpeed = 10;

    playerV;

    constructor(width, height) {
        this.canvasWidth = width;
        this.canvasHeight = height;
        this.minY = 0.3 * height;
        this.maxY = 0.9 * height;

        this.playerV = new JetpackPlayer(width / 4, height * 3 / 4, 0.31 * height, 0.89 * height);
        this.enemyTimer = new Timer(this.enemyConfig.minDelay, this.enemyConfig.incDelay);

        canvasView.canvas.onPointerDown = e => {
            canvasView.vfx.push(new GrowingRing(e.x, e.y, '#666600', 50, 3, 0.3, 0));
            this.playerV.climbing = true;
        }
        canvasView.canvas.onPointerUp = e => {
            canvasView.vfx.push(new GrowingRing(e.x, e.y, '#666600', 50, 3, 0.3, 0));
            this.playerV.climbing = false;
        }
        canvasView.canvas.onPointerUpAnywhere = () => {
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
    }

    onTick() {
        if (this.playerExists) {
            this.playerV.update();
        }

        this.enemyTimer.tick();
        if (this.enemyTimer.complete()) {
            this.enemyTimer.reset();
            this.addEnemy();
        }

        for (var i = this.bullets.length - 1; i >= 0; i--) {
            this.bullets[i].update();
            if (this.bullets[i].toDestroy) {
                this.bullets.splice(i, 1);
            }
        }

        for (var i = this.enemies.length - 1; i >= 0; i--) {
            var el = this.enemies[i];
            el.update();
            if (el.borderTest(0, 0, this.canvasWidth, this.canvasHeight)) {
                el.toDestroy = true;
            }
            if (this.playerExists) {
                if (el.collisionTest(this.playerV, el.size + 5)) {
                    this.playerExists = false;
                    canvasView.vfx.push(new Firework(this.playerV.x, this.playerV.y, 10, '#00ff00', 1));
                }
            }

            this.bullets.forEach(bullet => {
                if (bullet.collisionTest(el, 15)) {
                    bullet.toDestroy = true;
                    el.toDestroy = true;
                    canvasView.vfx.push(new Firework(el.x, el.y, 5, '#aa6666', 1));
                }
            });

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
        if (!this.ended) this.drawMainShip(canvas,this.playerV.x, this.playerV.centerY);
        if (this.playerExists) {
            this.drawPlayer(canvas,this.playerV.x, this.playerV.y);
        }

        this.enemies.forEach(el => this.drawEnemy(canvas, el.x, el.y, el.size));
        this.bullets.forEach(el => this.drawBullet(canvas, el.x, el.y));
        canvas.addText(650, 80, `Enemies Spawned: ${this.enemiesSpawned}`, 12);

        canvas.drawRect(0, 0, this.canvasWidth, this.playerV.minY, 0x003300, 0.1);
        canvas.drawRect(0, this.playerV.maxY, this.canvasWidth, this.canvasHeight - this.playerV.maxY, 0x003300, 0.1);
    }

    drawMainShip(canvas, x, y) {
        canvas.drawCircle(x, y, 30, '#000000', '#00aaff');
    }
    
    drawPlayer(canvas, x, y) {
        canvas.drawCircle(x, y, 10, '#000000', '#00ff00');
    }

    drawShield(canvas, x, y, percent) {
        canvas.drawCircle(x, y, 40, '#00ccff', '#00ffff', 0.5);
    }

    bailoutEffect() {
        canvasView.vfx.push(new GrowingCircle(this.playerV.x, this.playerV.y, '#00ff00', 10, 1, 0.05));
        canvasView.vfx.push(new FlyingText(this.playerV.x, this.playerV.y, 'Bailout!', '#000000', 10, 1.5, 0.03));
        canvasView.vfx.push(new GrowingRing(this.playerV.x, this.playerV.y, '#44ff77', 1, 3, 0.1, 0));
        canvasView.vfx.push(new GrowingRing(this.playerV.x, this.playerV.y, '#44ff77', 1, 3, 0.1, 6));
        canvasView.vfx.push(new GrowingRing(this.playerV.x, this.playerV.y, '#44ff77', 1, 3, 0.1, 12));
    }

    drawEnemy(canvas, x, y, size) {
        canvas.drawCircle(x, y, size, '#000000', '#aa6666');
    }
    drawBullet(canvas, x, y) {
        canvas.drawCircle(x, y, 5, '#000000', '#6666aa');
    }

    addEnemy() {
        // var x = this.playerV.x;
        // var y = this.playerV.y;
        var x = this.canvasWidth;
        var y = this.minY + Math.random() * (this.maxY - this.minY);

        if (Math.random() < 0.1) {
            y = this.maxY - Math.random() * 50;
        }
        var speed = this.enemyConfig.minSpeed + Math.random() * this.enemyConfig.incSpeed;

        // if (Math.random() < 0.8) {
        //     x += 200 * Math.random() - 100;
        //     y += 200 * Math.random() - 100;
        // }

        this.enemies.push(new JetpackEnemy(x, y, speed, Math.PI, 15 + Math.random() * 10));
        // this.enemies.push(new JetpackEnemy(x, y, speed, Math.PI * 2 * Math.random()));
        this.enemiesSpawned++;
    }

    addBullet(angle) {
        var bullet = new JetpackEnemy(0, 0, 0, 0);
        bullet.x = this.playerV.x;
        bullet.y = this.playerV.y;
        bullet.vX = this.bulletSpeed * Math.cos(angle);
        bullet.vY = this.bulletSpeed * Math.sin(angle);

        this.bullets.push(bullet);
    }
}

class JetpackPlayer {
    position = 0;

    climbing = false;

    x;
    y;
    minY;
    maxY;
    vY = 0;
    climbA = -1.5;
    fallA = 1;
    centerY;

    constructor(x, y, minY, maxY) {
        this.x = x;
        this.y = y;
        this.centerY = y;
        this.minY = minY;
        this.maxY = maxY;

        window.addEventListener('keydown', this.keyDown);
        window.addEventListener('keyup', this.keyUp);        
    }

    reset() {
        this.y = this.centerY;
        this.vY = 0;
    }

    destroy() {
        window.removeEventListener('keydown', this.keyDown);
        window.removeEventListener('keyup', this.keyUp);        
    }

    keyDown = (e) => {
        switch(e.key.toLowerCase()) {
            case 'w': case 'arrowup': this.climbing = true; break;
        }
    }

    keyUp = (e) => {
        switch(e.key.toLowerCase()) {
            case 'w': case 'arrowup': this.climbing = false; break;
        }
    }

    update() {
        if (this.climbing) this.vY += this.climbA;
        else this.vY += this.fallA;

        this.y += this.vY;
        if (this.y < this.minY) {
            this.y = this.minY;
            this.vY = 0;
        } else if (this.y > this.maxY) {
            this.y = this.maxY;
            this.vY = 0;
        }
    }
}

class JetpackEnemy {
    speed = 0;
    x = 0;
    y = 0;
    vX = 0;
    vY = 0;
    maxY = 0;
    size = 15;
    toDestroy = false;

    constructor(targetX, targetY, speed, angle, size) {
        this.x = targetX - Math.cos(angle);
        this.y = targetY - Math.sin(angle);
        this.vX = speed * Math.cos(angle);
        this.vY = speed * Math.sin(angle);
        this.size = size;
    }

    update() {
        this.x += this.vX;
        this.y += this.vY;
    }

    borderTest(left, top, right, bottom) {
        if ((this.vX > 0 && this.x > right) ||
            (this.vX < 0 && this.x < left) ||
            (this.vY > 0 && this.y > bottom) ||
            (this.vY < 0 && this.y < top)) {
            return true;
        }
        
        return false;
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
