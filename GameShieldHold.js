
class GameShieldHold {
    instructions = "Hold 's' or click anywhere to start shielding.";
    mobileInstructions = "Tap and hold anywhere to start shielding.";

    ended = false;
    playerExists = false;

    canvasWidth;
    canvasHeight;

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

    constructor(width, height) {
        this.canvasWidth = width;
        this.canvasHeight = height;

        this.playerV = new ShieldPlayer(width / 2, height / 2);
        this.enemyTimer = new Timer(this.enemyConfig.minDelay, this.enemyConfig.incDelay);

        canvasView.canvas.onPointerDown = e => {
            canvasView.vfx.push(new GrowingRing(e.x, e.y, '#666600', 50, 3, 0.3, 0));
            this.playerV.shielding = true;
        }
        canvasView.canvas.onPointerUp = e => {
            canvasView.vfx.push(new GrowingRing(e.x, e.y, '#666600', 50, 3, 0.3, 0));
            this.playerV.shielding = false;
        }
        canvasView.canvas.onPointerUpAnywhere = () => {
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

        for (var i = this.enemies.length - 1; i >= 0; i--) {
            var el = this.enemies[i];
            el.update();
            if (el.borderTest(0, 0, this.canvasWidth, this.canvasHeight)) {
                el.toDestroy = true;
            }
            if (this.playerExists) {
                if (this.playerV.activeShielding) {
                    if (el.collisionTest(this.playerV, 50)) {
                        canvasView.vfx.push(new Firework(el.x, el.y, 5, '#aa6666', 1));
                        el.toDestroy = true;
                        this.playerV.takeDamage();
                    }
                } else {
                    if (el.collisionTest(this.playerV, 15)) {
                        this.playerExists = false;
                        canvasView.vfx.push(new Firework(this.playerV.x, this.playerV.y, 10, '#00ff00', 1));
                    }
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
            this.drawPlayer(canvas,this.playerV.x, this.playerV.y);
            if (this.playerV.activeShielding) {
                this.drawShield(canvas, this.playerV.x, this.playerV.y, this.playerV.fuelAmount);
            }
            if (this.playerV.fuelAmount < 1) {
                canvas.drawPartialCirclePercent(this.playerV.x, this.playerV.y, 30, '#006699', this.playerV.fuelAmount);
            }
        }
        this.enemies.forEach(el => this.drawEnemy(canvas, el.x, el.y));
        canvas.addText(650, 80, `Enemies Spawned: ${this.enemiesSpawned}`, 12);
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

    drawEnemy(canvas, x, y) {
        canvas.drawCircle(x, y, 15, '#000000', '#aa6666');
    }

    addEnemy() {
        var x = this.playerV.x;
        var y = this.playerV.y;
        var speed = this.enemyConfig.minSpeed + Math.random() * this.enemyConfig.incSpeed;

        if (Math.random() < 0.8) {
            x += 200 * Math.random() - 100;
            y += 200 * Math.random() - 100;
        }

        this.enemies.push(new ShieldEnemy(x, y, speed, Math.PI * 2 * Math.random()));
        this.enemiesSpawned++;
    }
}

class ShieldPlayer {
    position = 0;
    fuelAmount;
    fuelDeplete = 0.005;
    fuelRecover = 0.005;
    startingFuel = 0.7;
    shielding = false;
    shieldDamageAmount = 0.1;

    x;
    y;

    get activeShielding() {
        return this.shielding && this.fuelAmount > 0;
    }

    constructor(x, y) {
        this.x = x;
        this.y = y;
        window.addEventListener('keydown', this.keyDown);
        window.addEventListener('keyup', this.keyUp);        
    }

    reset() {
        this.fuelAmount = this.startingFuel;
        this.shielding = false;
    }

    destroy() {
        window.removeEventListener('keydown', this.keyDown);
        window.removeEventListener('keyup', this.keyUp);
    }

    takeDamage() {
        this.fuelAmount -= this.shieldDamageAmount;
    }

    keyDown = (e) => {
        switch(e.key.toLowerCase()) {
            case 's': case 'arrowup': this.shielding = true; break;
        }
    }
    
    keyUp = (e) => {
        switch(e.key.toLowerCase()) {
            case 's': case 'arrowup': this.shielding = false; break;
        }
    }

    update() {
        if (this.shielding) {
            this.fuelAmount = Math.max(0, this.fuelAmount - this.fuelDeplete);
        } else {
            this.fuelAmount = Math.min(1, this.fuelAmount + this.fuelRecover);
        }    
    }
}

class ShieldEnemy {
    speed = 0;
    x = 0;
    y = 0;
    vX = 0;
    vY = 0;
    maxY = 0;
    toDestroy = false;

    constructor(targetX, targetY, speed, angle) {
        this.x = targetX - Math.cos(angle) * 500;
        this.y = targetY - Math.sin(angle) * 500;
        this.vX = speed * Math.cos(angle);
        this.vY = speed * Math.sin(angle);
    }

    update() {
        this.x += this.vX;
        this.y += this.vY;
    }

    collisionTest = (player, radius) => {
        if (this.distanceTo(player.x, player.y) <= radius) {
            return true;
        }

        return false;
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

    distanceTo(x, y) {
        return Math.sqrt(Math.pow(x - this.x, 2) + Math.pow(y - this.y, 2));
    }
}
