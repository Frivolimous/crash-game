const gameConfig = {
    framerate: 30,
    startingMoney: 100,
    maxNodes: 30,
    canvasWidth: 800,
    canvasHeight: 800,
}

const header = {
    interactions: document.getElementById('interaction-select-container'),
}

const footer = {
    entryFeeText: document.getElementById('entry-fee'),
    autoToggle: document.getElementById('auto-toggle'),
    autoBail: document.getElementById('auto-bail-check'),
    autoJoin: document.getElementById('auto-join-check'),
    autoBailText: document.getElementById('auto-bail-text'),
    playerMoneyDisplay: document.getElementById('player-money'),
}

// GameControl
var mainController;

// Views
var canvasView;
var resultView;
var isMobile;

var interactionConstructors = [];

function init() {
    // select game type
    isMobile = testMobile();
    game = new GameAbstract(gameConfig.canvasWidth, gameConfig.canvasHeight);

    // initialize singletons
    canvasView = new GameView(document.getElementById('main-canvas'));
    resultView = new ResultView(
        document.getElementById('result-list'),
        yourList = document.getElementById('your-list'),
        gameConfig.maxNodes
    );
    var playerM = new PlayerModel();
    playerM.onMoneyChange = (money) => footer.playerMoneyDisplay.innerHTML = `Balance: $${money.toFixed(2)}`;
    playerM.money = gameConfig.startingMoney;

    mainController = new MainController(game, playerM);

    document.getElementById('sim-button').addEventListener('click', mainController.reset);
    document.getElementById('bail-button').addEventListener('pointerdown', mainController.bailout);
    document.getElementById('gen-button').addEventListener('click', () => addFakeResults(30));

    if (isMobile) {
        document.getElementById('bail-button').innerHTML = "Bailout";
    }

    window.addEventListener('keydown', (e) => {
        switch(e.key.toLowerCase()) {
            case 'p': mainController.reset(); break;
            case ' ': mainController.bailout(); break;
            case 'c': mainController.crash.crashed = true; break;
        }
    });

    addInteractionButton('None', GameAbstract);
    addInteractionButton('Dodge LR', GameBasic);
    addInteractionButton('Swipe LR', GameSubway);
    addInteractionButton('Float', GameJetpack);
    // addInteractionButton('Shield', GameShieldHold);
    // addInteractionButton('Rotate', GameRotate);
    // addInteractionButton('Smooth', GameSmoothDodge);
    addInteractionButton('Jump', GameJump);
    addInteractionButton('Shooter', GameShooter);
    addInteractionButton('Frogger', GameAdvance);
    addInteractionButton('TwoLane', GameTwoLane);

    addFakeResults(10);
    mainController.crash.fakeResult();
    resultView.addResult(mainController.crash.multiplier);
    resultView.playerCanceled('No Entry');
    selectGame(3);
}

function testMobile() {
    return 'ontouchstart' in window || navigator.maxTouchPoints > 0;
}

function selectGame(index) {
    var cc = interactionConstructors[index];

    var game = new cc(gameConfig.canvasWidth, gameConfig.canvasHeight, canvasView);

    document.getElementById('instructions-text').innerHTML = isMobile ? game.mobileInstructions : game.instructions;
    mainController.game.destroy();
    mainController.game = game;
    mainController.crash.crashed = true;
    game.loadAis && game.loadAis(mainController.ais);

}

function addInteractionButton(text, cc) {
    interactionConstructors.push(cc);
    var index = interactionConstructors.length - 1;

    var newButton = document.createElement('button');
    newButton.classList.add('interaction-select-button');
    newButton.innerHTML = text;
    newButton.onclick = () => selectGame(index);
    header.interactions.appendChild(newButton);
}

function addFakeResults(count, andAi = false) {
    var results = CrashManager.simulateResults(count);

    results.forEach(mult => {
        resultView.addResult(mult);
        resultView.playerCanceled('No Entry');
    });

    if (andAi) {
        var outputTable = [];
        var header = [];
        outputTable.push(header);
        mainController.ais.forEach(ai => {
            header.push(`${ai.name}: ${ai.minBail} - ${ai.maxBail}`);
        })
        results.forEach(mult => {
            var row = [];
            outputTable.push(row);
            mainController.ais.forEach(ai => {
                ai.reset();
                if (ai.bailThreshold <= mult) {
                    ai.money += ai.bailThreshold * ai.entryFee;
                }
                row.push(ai.money.toFixed(2));
            });
        });

        console.log(outputTable.map(row => row.join('	')).join('\n'));
    }
}

function addFakeSkilledResults(count = 1000) {
    mainController.andDraw = false;
    var autojoin = footer.autoJoin.checked;
    footer.autoJoin.checked = false;

    var outputTable = [];
    var resultTable = [];
    var header = [];
    outputTable.push(header);
    resultTable.push(header);
    mainController.ais.forEach(ai => header.push(`${ai.name}: ${ai.minBail} - ${ai.maxBail}`));

    while(count > 0) {
        mainController.onTick();
        if (mainController.crash.crashed && !mainController.crashProcessed) {
            count--;

            var row = [];
            var row2 = [];
            outputTable.push(row);
            resultTable.push(row2);
            mainController.ais.forEach(ai => row.push(ai.money.toFixed(2)));
            mainController.ais.forEach(ai => row2.push(ai.status === 'Playing' ? 'Crash' : ai.status));
        }
    }

    mainController.andDraw = true;
    footer.autoJoin.checked = autojoin;
    canvasView.vfx = [];

    console.log(outputTable.map(row => row.join('	')).join('\n'));
    console.log(resultTable.map(row => row.join('	')).join('\n'));

    var sHeader = [''];
    header.forEach(el => sHeader.push(el));
    var fail = ['Fail!'];
    var crash = ['Crash'];
    var earned = ['Earned'];
    var biggest = ['Biggest Multiplier'];

    var rtp100 = ['RTP: 100'];
    var rtp500 = ['RTP: 500'];
    var rtp1000 = ['RTP:1000'];
    var summary = [sHeader, fail, crash, earned, biggest, rtp100, rtp500, rtp1000];
    var totalGames = outputTable.length - 1;

    mainController.ais.forEach((ai, i) => {
        var myStatus = resultTable.map(s => s[i]);
        var myOutput = outputTable.map(s => s[i]);
        var myMults = myOutput.map((el, i) => {
            if (i <= 1) return 0;
            return el - myOutput[i - 1] + 1;
        });

        var failRate = myStatus.filter(el => el === 'Fail!').length / totalGames;
        var crashRate = myStatus.filter(el => el === 'Crash').length / totalGames;
        
        fail.push(failRate.toFixed(2));
        crash.push(crashRate.toFixed(2));
        earned.push((1 - failRate - crashRate).toFixed(2));
        biggest.push(Math.max(...myMults));
        rtp100.push(myOutput[100] / 100);
        rtp500.push(myOutput[500] / 100);
        rtp1000.push(myOutput[1000] / 100);

    });
    console.log(summary.map(row => row.join('	')).join('\n'));

    return [summary[1][1],summary[1][6]];
}

function simulateResults(count) {
    var results = CrashManager.simulateResults(count);

    console.log(results.join(`
`));
}

class MainController {
    bailoutCash = 0;
    crashProcessed = true;
    failProcessed = true;
    countdownTimer = new Timer(5000 / 30, 0);

    game;
    crash = new CrashManager();
    playerM;
    ais = [];

    ticker = new JMTicker(gameConfig.framerate);

    andDraw = true;

    constructor(game, playerM) {
        this.game = game;
        this.playerM = playerM;

        this.countdownTimer.reset();

        this.ticker.onTick = this.onTick;
        this.ticker.start();
        this.loadAis();
    }

    loadAis() {
        this.ais = [
            new AIModel('BiggestNoob', '#ff9999', 0,  5, 5),
            new AIModel('Timid', '#cc88ff', 0.7, 1, 2),
            new AIModel('Standard', '#99ff99', 0.8, 2, 5),
            new AIModel('HighOctane', '#aacc99', 0.75, 2, 10),
            new AIModel('PrettyGood', '#9999ee', 0.94, 5, 20),
            new AIModel('Superstar', '#ffcc00', 0.97, 20, 50),
        ];
        
    }

    reset = () => {
        if (!this.crash.crashed) resultView.runCancelled();
        if (this.game.playerExists) resultView.playerCanceled();
        this.crash.reset();
        this.crashProcessed = false;
        this.failProcessed = false;
        this.game.reset();
        if (footer.autoJoin.checked) {
            this.playerJoin();
        } else {
            resultView.playerCanceled('No Entry');
            this.failProcessed = true;
        }

        this.ais.forEach(ai => ai.reset());
    }

    onTick = () => {
        if (this.crash.crashed) {
            if (!this.crashProcessed) {
                this.crashProcessed = true;
                resultView.addResult(this.crash.multiplier);
                if (!this.failProcessed) {
                    this.failProcessed = true;
                    resultView.playerCrashed();
                }
                this.game.gameEnd();
                this.ais.forEach(ai => {
                    if (ai.exists) {
                        ai.exists = false;
                        ai.status = 'Crash';
                    }
                })
                
                this.countdownTimer.reset();
            }
        
            if (footer.autoToggle.checked) {
                this.countdownTimer.tick();
                if (this.countdownTimer.complete()) {
                    this.reset();
                }
            }
        } else {
            this.crash.onTick();
            this.game.onTick(this.crash.multiplier);
    
            if (!this.game.playerExists) {
                if (!this.failProcessed) {
                    this.failProcessed = true;
                    resultView.playerFailed();
                }
            } else {
                this.bailoutCash = this.crash.multiplier * this.playerM.entryFee;
                if (footer.autoBail.checked) {
                    if (this.crash.multiplier >= Number(footer.autoBailText.value)) {
                        this.bailout();
                    }
                }
            }

            this.ais.forEach(ai => {
                if (ai.exists) {
                    if (this.crash.multiplier >= ai.bailThreshold) {
                        ai.exists = false;
                        if (this.game.aiPlayers) {
                            this.game.bailoutEffect(this.game.aiPlayers.find(el => el.ai === ai));
                        }
                        var payout = this.crash.multiplier * ai.entryFee;
                        ai.money += payout;
                        ai.status = 'Earned: $' + payout.toFixed(2);
                    }
                }
            });
        }
        
        if (this.andDraw) {
            canvasView.drawFrame();
        }
    }

    bailout = () => {
        if (!this.crash.crashed && this.game.playerExists) {
            this.game.bailout();
            this.failProcessed = true;

            var payout = this.crash.multiplier * this.playerM.entryFee;
            resultView.playerResult(payout);
            this.playerM.money += payout;
        }
    }

    playerJoin() {
        this.playerM.entryFee = Number(footer.entryFeeText.value);
        this.playerM.money -= this.playerM.entryFee;
        this.playerM.status = 'Playing';

        this.game.addPlayer();
    }
}

class ResultView {
    mainResultContainer;
    playerResultContainer;
    maxNodes;

    constructor(mainResultContainer, playerResultContainer, maxNodes = 30) {
        this.mainResultContainer = mainResultContainer;
        this.playerResultContainer = playerResultContainer;
        this.maxNodes = maxNodes;
    }

    addResult(mult) {
        let newNode = document.createElement('div');
        newNode.classList.add('result-entry');
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
        this.mainResultContainer.appendChild(newNode);
        this.checkOverflow(this.mainResultContainer);
    }

    runCancelled(text = 'Run Cancel') {
        let newNode = document.createElement('div');
        newNode.classList.add('result-entry');
        newNode.innerHTML = text;
        mainController.playerM.status = newNode.innerHTML;
        this.mainResultContainer.appendChild(newNode);
        this.checkOverflow(this.mainResultContainer);
    }

    playerCrashed() {
        let newNode = document.createElement('div');
        newNode.classList.add('result-entry');
        newNode.innerHTML = 'Crash';
        mainController.playerM.status = newNode.innerHTML;
        newNode.style.background = '#aa4444';
        this.playerResultContainer.appendChild(newNode);
        this.checkOverflow(this.playerResultContainer);
    }

    playerFailed() {
        let newNode = document.createElement('div');
        newNode.classList.add('result-entry');
        newNode.innerHTML = 'Fail!';
        mainController.playerM.status = newNode.innerHTML;
        newNode.style.background = '#bb9944';
        this.playerResultContainer.appendChild(newNode);
        this.checkOverflow(this.playerResultContainer);
    }

    playerCanceled(text = 'Canceled') {
        let newNode = document.createElement('div');
        newNode.classList.add('result-entry');
        newNode.innerHTML = text;
        mainController.playerM.status = newNode.innerHTML;
        this.playerResultContainer.appendChild(newNode);
        this.checkOverflow(this.playerResultContainer);
    }
    
    playerResult(mult) {
        let newNode = document.createElement('div');
        newNode.classList.add('result-entry');
        newNode.innerHTML = `Earned: $${mult.toFixed(2)}`;
        mainController.playerM.status = newNode.innerHTML;
        newNode.style.background = '#44dd44';
        this.playerResultContainer.appendChild(newNode);
        this.checkOverflow(this.playerResultContainer);
    }

    checkOverflow(container) {
        if (container.children.length > this.maxNodes) {
            container.removeChild(container.children[0]);
        }
    }
}

class GameView {
    canvas;
    vfx = [];
    gauge = new MultGauge(250, 125, 200, 15);

    constructor(canvasElement) {
        this.canvas = new CanvasRender(gameConfig.canvasWidth, gameConfig.canvasHeight, canvasElement);
    }

    drawFrame() {
        this.canvas.clear();
        this.canvas.drawBackground('#ffffaa');

        // draw the game and any added vfx
        mainController.game.draw(this.canvas);

        for (var i = this.vfx.length - 1; i >= 0; i--) {
            this.vfx[i].update(this.canvas);
            if (this.vfx[i].isComplete) {
                this.vfx.splice(i, 1);
            }
        }
        
        // main multiplier text
        var header = "";
        if (mainController.crash.crashed) {
            header = "Crashed At: ";
        }

        if (mainController.crash.crashed && footer.autoToggle.checked) {
            this.canvas.addText(230, 100, `Next run in: ${Math.ceil(mainController.countdownTimer.delay / 1000 * 30)}s`, 30);
        }

        // stats corner
        this.gauge.update(this.canvas, mainController.crash.crashChance / 100);
        this.canvas.addText(650, 40, `Crash Chance: ${mainController.crash.crashChance}%`, 12);
        this.canvas.addText(650, 20, `Framerate: ${mainController.ticker.framerate.toFixed(2)}`, 12);
        this.canvas.addText(650, 60, `Bailout For: $${mainController.bailoutCash.toFixed(2)}`, 12);
        this.canvas.addText(230, 200, `${header}Mult: x${mainController.crash.multiplier.toFixed(2)}`);

        //leaderboard;
        // name -- $$$ -- Status;
        var lY = 70;
        mainController.ais.forEach(ai => {
            this.canvas.addText(5, lY, ai.name, 12);
            this.canvas.addText(90, lY, '$' + ai.money.toFixed(2), 12);
            this.canvas.addText(150, lY, ai.status, 12);
            lY += 25;
        });

        this.canvas.addText(5, lY, 'You', 12);
        this.canvas.addText(90, lY, '$' + mainController.playerM.money.toFixed(2), 12);
        this.canvas.addText(150, lY, mainController.playerM.status, 12);
    }
}

class PlayerModel {
    _Money = 0;
    entryFee;
    status;

    onMoneyChange;

    get money() {
        return this._Money;
    }

    set money(amount) {
        this._Money = amount;
        this.onMoneyChange && this.onMoneyChange(amount);
    }
}

class AIModel {
    money = 100;
    entryFee;
    bailThreshold;

    exists = true;

    name;
    color;
    skill;
    minBail;
    maxBail;

    status = "No Entry";

    constructor(name, color, skill, minBail, maxBail, entryFee = 1, money = 100) {
        this.name = name;
        this.color = color;
        this.skill = skill;
        this.minBail = minBail;
        this.maxBail = maxBail;
        this.entryFee = entryFee;
        this.money = money;
    }

    reset() {
        this.exists = true;
        this.money -= this.entryFee;
        this.status = 'Playing';
        this.bailThreshold = this.minBail + (this.maxBail - this.minBail) * Math.random();
    }
}

init();
