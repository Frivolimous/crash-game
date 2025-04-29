class GameAbstract {
    instructions = "There is no game. Just wait.";
    mobileInstructions = "There is no game. Just wait.";

    ended = false;
    playerExists = false;

    canvasWidth;
    canvasHeight;

    constructor(width, height) {
        this.canvasWidth = width;
        this.canvasHeight = height;
    }

    destroy() {}

    reset() {
        this.ended = false;
    }

    onTick() {}

    addPlayer() {
        this.playerExists = true;
    }

    bailout() {
        this.playerExists = false;
    }

    gameEnd() {
        this.ended = true;
        this.playerExists = false;
    }

    draw(canvas) {}
}