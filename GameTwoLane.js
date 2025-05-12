
class GameTwoLane {
    instructions = "Use 'w' or 'up' or 'click' to dodge left or right";
    mobileInstructions = "Tap anywhere to dodge left or right";
    
    enemyConfig = {
        minSpeed: 10,
        incSpeed: 0,
        minDelay: 800 / 30,
        incDelay: 50 / 30,
        minHeight: 125,
        incHeight: 50,
    }

    enemies = [];
    enemiesSpawned = 0;
    enemyTimer;

    playerV;

    aiPlayers = [];

    ended = false;

    playerExists = false;

    canvasWidth;
    canvasHeight;

    maxConsecutive = 1;
    consecutive = 0;

    gameView;


    constructor(width, height, gameView) {
        this.canvasWidth = width;
        this.canvasHeight = height;
        this.gameView = gameView;

        this.playerV = new TwoLanePlayer(width / 2, height - 200, 50, true);

        this.enemyTimer = new Timer(this.enemyConfig.minDelay, this.enemyConfig.incDelay);

        this.gameView.canvas.onPointerDown = e => {
            this.playerV.swapLane();
            console.log("A");
            this.gameView.vfx.push(new GrowingRing(e.x, e.y, '#666600', 50, 3, 0.3, 0));
        }
        this.gameView.canvas.onPointerUp = e => {
            this.gameView.vfx.push(new GrowingRing(e.x, e.y, '#666600', 50, 3, 0.3, 0));
        }
        this.gameView.canvas.onPointerUpAnywhere = () => {
        }
    }

    loadAis(ais) {
        ais.forEach(ai => this.aiPlayers.push(new TwoLaneAI(new TwoLanePlayer(this.playerV.location.x, this.playerV.location.y, this.playerV.location.padding, false), ai)));
    }

    destroy() {
        this.playerV.destroy();
    }

    reset() {
        this.enemyTimer.delay = 1;
        this.enemies = [];
        this.enemiesSpawned = 0;
        this.ended = false;
        this.consecutive = 0;

        this.playerV.reset();
        this.aiPlayers.forEach(ai => ai.reset());

        var oldAi = this.aiPlayers;
        this.aiPlayers = [];
        while(oldAi.length > 0) {
            var i = Math.floor(Math.random() * oldAi.length);
            this.aiPlayers.push(oldAi[i]);
            oldAi.splice(i, 1);
        }
    }

    onTick(multiplier) {
        if (this.playerExists) {
            this.playerV.update();
        }

        this.aiPlayers.forEach(ai => ai.update(this.enemies));

        this.enemyTimer.tick();
        if (this.enemyTimer.complete()) {
            this.enemyTimer.reset();
            this.addEnemy();
        }

        for (var i = this.enemies.length - 1; i >= 0; i--) {
            var el = this.enemies[i];
            el.update();
            if (this.playerExists && el.collisionTest(this.playerV)) {
                this.playerExists = false;
                this.gameView.vfx.push(new Firework(this.playerV.x, this.playerV.y, 10, '#00ff00', 1));
            }

            this.aiPlayers.forEach(ai => {
                if (ai.ai.exists && el.collisionTest(ai.player)) {
                    ai.ai.exists = false;
                    ai.ai.status = 'Fail!';
                    this.gameView.vfx.push(new Firework(ai.x, ai.y, 10, ai.color, 1));
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
        this.gameView.vfx.push(new Firework(this.playerV.location.x, this.playerV.location.y, 20, '#00aaff', 2));
        if (this.playerExists) {
            this.gameView.vfx.push(new Firework(this.playerV.x, this.playerV.y, 10, '#00ff00', 1));
            this.playerExists = false;
        }
        this.aiPlayers.forEach(ai => {
            if (ai.ai.exists) {
                this.gameView.vfx.push(new Firework(ai.x, ai.y, 10, ai.color, 1));
            }
         });
    }

    draw() {
        if (!this.ended) this.drawMainShip(this.playerV.location.x, this.playerV.location.y);
        this.aiPlayers.forEach(ai => {
            if (ai.ai.exists) {
                this.drawPlayer(ai.x , ai.y, ai.color);
            }
        });
        if (this.playerExists) this.drawPlayer(this.playerV.x, this.playerV.y);
        this.enemies.forEach(el => this.drawEnemy(el));
        this.gameView.canvas.addText(650, 80, `Enemies Spawned: ${this.enemiesSpawned}`, 12);
    }

    drawMainShip(x, y) {
        this.gameView.canvas.drawCircle(x, y, 30, '#000000', '#00aaff');
        this.gameView.canvas.drawElipse(x, y, 90, 30, '#000000', '#00aaff');
    }
    
    drawPlayer(x, y, color = '#00ff00') {
        this.gameView.canvas.drawCircle(x, y, 10, '#000000', color);
    }

    bailoutEffect = (player) => {
        this.gameView.vfx.push(new GrowingCircle(player.x, player.y, '#00ff00', 10, 1, 0.01));
        this.gameView.vfx.push(new FlyingText(player.x, player.y, 'Bailout!', '#000000', 10, 1.5, 0.03));
        this.gameView.vfx.push(new GrowingRing(player.x, player.y, '#44ff77', 1, 3, 0.1, 0));
        this.gameView.vfx.push(new GrowingRing(player.x, player.y, '#44ff77', 1, 3, 0.1, 6));
        this.gameView.vfx.push(new GrowingRing(player.x, player.y, '#44ff77', 1, 3, 0.1, 12));
    }

    drawEnemy(enemy) {
        this.gameView.canvas.drawRect(enemy.x - enemy.width / 2, enemy.y - enemy.height, enemy.width, enemy.height, '#aa6666');
    }

    addEnemy() {
        // var speed = this.enemyConfig.minSpeed + Math.random() * this.enemyConfig.incSpeed;
        if (this.enemies.length >= 2) {
            if (this.enemies[this.enemies.length - 1].x === this.enemies[this.enemies.length - 2].x) {
                this.consecutive++;
            } else {
                this.consecutive = 0;
            }
        }
        var row = 1 * (Math.random() < 0.5 ? 1 : -1);
        if (this.consecutive >= this.maxConsecutive) {
            row = this.enemies[this.enemies.length - 1].row * -1;
        }
        var height = this.enemyConfig.minHeight + Math.random() * this.enemyConfig.incHeight;
        var speed = this.enemyConfig.minSpeed + Math.random() * this.enemyConfig.incSpeed;
        var x = this.playerV.location.x + row * this.playerV.location.padding;
        this.enemies.push(new TwoLaneEnemy(speed, x, height, row, this.canvasHeight));
        this.enemiesSpawned++;
    }
}

class TwoLaneAI {
    player;
    offsetX = 2;
    offsetY = 3;
    get x() {return this.player.x + this.offsetX};
    get y() {return this.player.y + this.offsetY};
    ai;
    color = '#cccc00';

    skill;

    constructor(player, ai) {
        this.player = player;
        this.ai = ai;
        this.color = this.ai.color;
        this.skill = this.ai.skill;
    }

    reset() {
        this.offsetX = -10 + 20 * Math.random();
        this.offsetY = -10 + 20 * Math.random();

        this.player.reset();
    }

    update(enemies) {
        if (!this.ai.exists) return;

        this.player.update();
        
        if (!this.player.moving) {
            var nextEnemy;
            var prevEnemy;
            for (var i = 0; i < enemies.length; i++) {
                if (enemies[i].y < this.y) {
                    var prevEnemy = i > 0 && enemies[i - 1];
                    nextEnemy = enemies[i];
                    break;
                }
            }

            if (nextEnemy) {
                var dNext = this.player.y - nextEnemy.y;
                if (prevEnemy) {
                    var dPrev = prevEnemy.y - prevEnemy.height - this.player.y;
                    if (nextEnemy.row === this.player.position) {
                        if (dPrev >= -40 && dNext >= 50) {
                            if (Math.random() > 0.95 - this.skill * 0.05) {
                                this.player.swapLane();
                            }
                        } else if (dPrev < -40) {
                            // die early
                            // if (Math.random() > 1) {
                            if (Math.random() > 0.997 + this.skill * 0.003) {
                                this.player.swapLane();
                            }
                        } else if (dNext < 50) {
                            // last chance
                            // if (Math.random() > 0) {
                            if (Math.random() > 0.2 - this.skill * 0.2) {
                                this.player.swapLane();
                            }
                        }
                    }
                } else {
                    if (nextEnemy.row === this.player.position) {
                        if (dNext < 200 + 100 * this.skill) {
                            if (Math.random() > 0.7 - this.skill * 0.7) {
                                this.player.swapLane();
                            }
                        }
                    }
                }
            }
        }
    }
}

class TwoLanePlayer {
    position = -1;
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

    constructor(x, y, padding, andListen) {
        this.location.x = x;
        this.location.y = y;
        this.location.padding = padding;
        if (andListen) {
            window.addEventListener('keydown', this.keyDown);
            window.addEventListener('keyup', this.keyUp);        
        }
    }

    destroy() {
        try {
            window.removeEventListener('keydown', this.keyDown);
            window.removeEventListener('keyup', this.keyUp);        
        } catch(e) {}
    }

    reset() {
        this.position = this.movingTo;
    }

    keyDown = (e) => {
        switch(e.key.toLowerCase()) {
            case 'w': case 'arrowup': this.swapLane(); break;
        }
    }
    
    keyUp = (e) => {
    }

    swapLane() {
        if (!this.moving) {
            this.moving = true;
            this.movingTo *= -1;
        }
    }

    update() {
        if (this.moving) {
            if (this.movingTo > 0) {
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

class TwoLaneEnemy {
    speed = 0;
    x = 0;
    y = 0;
    maxY = 0;
    row;
    toDestroy = false;
    height = 100;
    width = 60;

    constructor(speed, x, height, row, maxY) {
        this.speed = speed;
        this.x = x;
        this.height = height;
        this.maxY = maxY;
        this.row = row;
    }

    update() {
        this.y += this.speed;
        if (this.y > this.maxY + this.height) {
            this.toDestroy = true;
        }
    }

    collisionTest = (player) => {
        if ((this.x > player.x - this.width) && (this.x < player.x + this.width) && this.y > player.y && this.y < player.y + this.height) {
            return true;
        }

        return false;
    }
}