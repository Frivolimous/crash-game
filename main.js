var mainButton = document.getElementById('sim-button');
var resultList = document.getElementById('result-list');
var yourList = document.getElementById('your-list');
var autoToggle = document.getElementById('auto-toggle');
var autoBail = document.getElementById('auto-bail-check');
var autoBailText = document.getElementById('auto-bail-text');
var playerMoneyDisplay = document.getElementById('player-money');
var canvas = new CanvasRender(800, 600, document.getElementById('main-canvas'));
var ticker = new JMTicker(30);
var player = new Player(400, 500, 100);
var enemies = [];
var vfx = [];
var crash = new CrashManager();
var resultAdded = false;
var countdownTime = -1;
var countdownDelay = 0;
var enemyDelay = 0;
var minEnemyDelay = 500 / 30;
var incEnemyDelay = 500 / 30;
var minSpeed = 10;
var incSpeed = 10;
var playerMoney = 100;
var gameDisplayLimit = 30;
var enemiesSpawned = 0;
var bailoutCash = 0;

mainButton.addEventListener('click', resetGame);
autoToggle.addEventListener('click', onAutoToggle);
document.getElementById('bail-button').addEventListener('click', bailout);
document.getElementById('gen-button').addEventListener('click', () => simulateResults(30));

window.addEventListener('keydown', (e) => {
    switch(e.key.toLowerCase()) {
        case 'p': resetGame(); break;
        case ' ': bailout(); break;
    }
});

function init() {
    ticker.onTick = onTick;
    ticker.start();
    autoToggle.checked = true;
    simulateResults(10);
    countdownTime = 5;
    countdownDelay = 1000 / 30;
    updatePlayerMoneyDisplay(playerMoney);
}

function playerJoin() {
    player.exists = true;
    playerMoney--;
    updatePlayerMoneyDisplay(playerMoney);
}

function removePlayer() {
    addYour(-2);
    player.exists = false;
    playerMoney++;
    updatePlayerMoneyDisplay(playerMoney);
}

var simulateResults = (count) =>{
    var results = [];
    console.log('count', count);
    var money = playerMoney;
    for (var i = 0; i < count; i++) {
        results.push(generateResult());
    }
    playerMoney = money;

    return JSON.stringify(results);
}

function resetGame() {
    if (!crash.crashed) addResult(-1);
    if (player.exists) addYour(-3);
    crash.reset();
    resultAdded = false;
    enemyDelay = 1;
    enemies = [];
    enemiesSpawned = 0;
    playerJoin();
}

function updatePlayerMoneyDisplay(money) {
    playerMoneyDisplay.innerHTML = `$${money.toFixed(2)}`;
}

function bailout() {
    if (!crash.crashed && player.exists) {
        addYour(crash.multiplier);
        player.exists = false;
        vfx.push(new GrowingCircle(player.x, player.y, '#00ff00', 10, 1, 0.01));
        vfx.push(new FlyingText(player.x, player.y, 'Bailout!', '#000000', 10, 1.5, 0.03));
        vfx.push(new GrowingRing(player.x, player.y, '#44ff77', 1, 3, 0.1, 0));
        vfx.push(new GrowingRing(player.x, player.y, '#44ff77', 1, 3, 0.1, 6));
        vfx.push(new GrowingRing(player.x, player.y, '#44ff77', 1, 3, 0.1, 12));
        playerMoney += crash.multiplier;
        updatePlayerMoneyDisplay(playerMoney);
    }
}

function onAutoToggle() {
    console.log(autoToggle.checked);
}

function addEnemy(row) {
    enemies.push(new Enemy(minSpeed + Math.random() * incSpeed, row, 600));
    enemiesSpawned++;
}

var onTick = () => {
    if (crash.crashed) {
        if (!resultAdded) {
            resultAdded = true;
            if (player.exists) {
                addYour(-1);
            }
            addResult(crash.multiplier);
            vfx.push(new Firework(player.location.x, player.location.y, 20, '#00aaff', 2));
            if (player.exists) {
                player.exists = false;
                vfx.push(new Firework(player.x, player.y, 10, '#00ff00', 1));
            }
            countdownTime = 5;
            countdownDelay = 1000 / 30;
        }
    
        if (autoToggle.checked) {
            countdownDelay -= 1;
            if (countdownDelay <= 0) {
                countdownDelay += 1000 / 30;
                countdownTime--;
    
                if (countdownTime < 0) {
                    resetGame();
                }
            }
        }
    } else {
        player.update();
        crash.onTick();

        if (player.exists) {
            bailoutCash = crash.multiplier;
        }

        if (autoBail.checked) {
            if (crash.multiplier >= Number(autoBailText.value)) {
                bailout();
            }
        }
    
        enemyDelay--;
        if (enemyDelay <= 0) {
            enemyDelay = minEnemyDelay + Math.random() * incEnemyDelay;
            addEnemy(Math.floor( -1 + Math.random() * 3))
        }

        for (var i = enemies.length - 1; i >= 0; i--) {
            var el = enemies[i];
            el.update();
            if (player.exists && el.collisionTest(player)) {
                player.exists = false;
                addYour(0);
                vfx.push(new Firework(player.x, player.y, 10, '#00ff00', 1));
            }
            if (el.toDestroy) {
                enemies.splice(i, 1);
            }
        }
    }

    drawFrame();
}

function drawFrame() {
    canvas.clear();
    canvas.drawBackground('#ffffaa');
    if (!crash.crashed) drawMainShip(player.location.x, player.location.y);
    if (player.exists) drawPlayer(player.x, player.y);
    enemies.forEach(el => drawEnemy(player.location.x + el.row * player.location.padding, el.y));
    var header = "";
    if (crash.crashed) {
        header = "Crashed At: ";
    }
    for (var i = vfx.length - 1; i >= 0; i--) {
        vfx[i].update(canvas);
        if (vfx[i].isComplete()) {
            vfx.splice(i, 1);
        }
    }
    canvas.addText(650, 40, `Crash Chance: ${crash.crashChance}%`, 12);
    canvas.addText(650, 20, `Framerate: ${ticker.framerate.toFixed(2)}`, 12);
    canvas.addText(650, 60, `Enemies Spawned: ${enemiesSpawned}`, 12);
    canvas.addText(650, 80, `Bailout For: $${bailoutCash.toFixed(2)}`, 12);
    canvas.addText(200, 200, `${header}Mult: x${crash.multiplier.toFixed(2)}`);
    if (crash.crashed && autoToggle.checked) {
        canvas.addText(200, 100, `Next run in: ${countdownTime}s`, 30);
    }
}

function drawMainShip(x, y) {
    canvas.drawCircle(x, y, 30, '#000000', '#00aaff');
}

function drawPlayer(x, y) {
    canvas.drawCircle(x, y, 10, '#000000', '#00ff00');
}

function drawEnemy(x, y) {
    canvas.drawCircle(x, y, 15, '#000000', '#aa6666');
}

function addResult(mult) {
    let newNode = document.createElement('div');
    newNode.classList.add('result-entry');
    if (mult < 0) {
        newNode.append('Run Canceled');
    } else {
        newNode.append(`Crash: x${mult.toPrecision(3)}`);
        if (mult < 1) {
            newNode.style.background = '#ffcccc';
        } else if (mult < 2) {
            newNode.style.background = '#dddddd';
        } else if (mult < 4) {
            newNode.style.background = '#d0d0ee';
        } else if (mult < 6) {
            newNode.style.background = '#ccccff';
        } else if (mult < 10) {
            newNode.style.background = '#bbbbff';
        } else {
            newNode.style.background = '#ccaaff';
        }
    }
    resultList.appendChild(newNode);
    if (resultList.children.length > gameDisplayLimit) {
        resultList.removeChild(resultList.children[0]);
    }
}

function addYour(mult) {
    let newNode = document.createElement('div');
    newNode.classList.add('result-entry');
    if (mult > 0) {
        newNode.append(`Earned: $${mult.toFixed(2)}`);
        newNode.style.background = '#44dd44';
    } else {
        if (mult === -1) {
            newNode.append('Crashed...');
            newNode.style.background = '#aa4444';
        } else if (mult === -2) {
            newNode.append('Non Entry');
        } else if (mult === -3) {
            newNode.append('Canceled');
        } else {
            newNode.append('Failure!');
            newNode.style.background = '#bb9944';
        }
    }
    yourList.appendChild(newNode);
    if (yourList.children.length > gameDisplayLimit) {
        yourList.removeChild(yourList.children[0]);
    }
}

function generateResult() {
    var mult = crash.simulateResults();

    addResult(mult);
    resultAdded = true;
    addYour(-2);

    return mult;
}



init();
