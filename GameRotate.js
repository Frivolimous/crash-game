
class GameRotate {
    instructions = "Drag around (or Left Right or A D) to rotate the shield";
    mobileInstructions = 'Aim the shield to block the asteroids using the control area';

    ended = false;
    playerExists = false;

    canvasWidth;
    canvasHeight;

    enemyConfig = {
        minSpeed: 7,
        incSpeed: 3,
        minDelay: 1000 / 30,
        incDelay: 500 / 30,
    }
    enemies = [];
    enemiesSpawned = 0;
    enemyTimer;

    controller = {
        x: 0,
        y: 0,
        size: 130,
        padding: 50,
    }

    playerV;

    constructor(width, height) {
        this.canvasWidth = width;
        this.canvasHeight = height;

        this.playerV = new RotatePlayer(width / 2, height / 2);
        this.enemyTimer = new Timer(this.enemyConfig.minDelay, this.enemyConfig.incDelay);

        this.controller.x = 0 + this.controller.size + this.controller.padding;
        this.controller.y = width - this.controller.size -this.controller.padding;

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

        canvasView.canvas.onPointerMove = e => {
            if (isMobile) {
                var distance = Math.sqrt(Math.pow(e.y - this.controller.y, 2) + Math.pow(e.x - this.controller.x, 2));
                if (distance < this.controller.size) {
                    var angle = Math.atan2(e.y - this.controller.y, e.x - this.controller.x);
                    this.playerV.shieldAngle = angle;
                }
            } else {
                angle = Math.atan2(e.y - this.playerV.y, e.x - this.playerV.x);
                this.playerV.shieldAngle = angle;
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
                if (el.collisionTest(this.playerV, 50)) {
                    var angle = Math.atan2(el.y - this.playerV.y, el.x - this.playerV.x);
                    if (angle > this.playerV.shieldAngle - this.playerV.shieldSize && angle < this.playerV.shieldAngle + this.playerV.shieldSize) {
                        el.toDestroy = true;
                        canvasView.vfx.push(new Firework(el.x, el.y, 5, '#aa6666', 1));
                    }
                }
                if (el.collisionTest(this.playerV, 15)) {
                    this.playerExists = false;
                    canvasView.vfx.push(new Firework(this.playerV.x, this.playerV.y, 10, '#00ff00', 1));
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
            canvas.drawPartialCircle(this.playerV.x, this.playerV.y, 30, '#006699', this.playerV.shieldAngle - this.playerV.shieldSize, this.playerV.shieldAngle + this.playerV.shieldSize);
        }
        if (isMobile) {
            canvas.drawCircle(this.controller.x, this.controller.y, this.controller.size, '#ffffff', '#eeeebb', 1);
            canvas.drawCircle(this.controller.x, this.controller.y, 10, '#ffffff', '#ffffff', 1);
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

        this.enemies.push(new RotateEnemy(x, y, speed, Math.PI * 2 * Math.random()));
        this.enemiesSpawned++;
    }
}

class RotatePlayer {
    position = 0;
    shieldAngle = 0;
    shieldSize = Math.PI * 0.3;
    keyboardShieldSpeed = Math.PI * 0.1;

    x;
    y;

    leftButton = false;
    rightButton = false;

    constructor(x, y) {
        this.x = x;
        this.y = y;
        window.addEventListener('keydown', this.keyDown);
        window.addEventListener('keyup', this.keyUp);        
    }

    reset() {
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
        if (this.leftButton) {
            this.shieldAngle -= this.keyboardShieldSpeed;
        }
        if (this.rightButton) {
            this.shieldAngle += this.keyboardShieldSpeed;
        }
    }
}

class RotateEnemy {
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
