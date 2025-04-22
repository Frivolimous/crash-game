class GameAbstract {
    instructions = "There is no game. Just wait.";
    
    ended = false;
    playerExists = false;

    constructor() {}

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