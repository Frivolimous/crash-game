class JMTicker {
    running = false;
    paused = false;
    tickDelay = 30;
    lastTime = 0;
    tickInc = 0;
    framerate = 0;
    lastTickTime = 0;

    onTick;

    constructor(framerate) {
        this.tickDelay = 1000 / framerate;
    }

    start() {
        this.paused = false;
        this.running = true;
        requestAnimationFrame(this.onFrame);
    }

    onFrame = (time) => {
        var deltaTime = time - this.lastTime;
        this.lastTime = time;
        this.tickInc += deltaTime;

        if (this.tickInc > this.tickDelay) {
            this.tickInc -= this.tickDelay;
            if (this.onTick) this.onTick();
            this.framerate = 1000 / (time - this.lastTickTime);
            this.lastTickTime = time;
        }

        requestAnimationFrame(this.onFrame);
    }
}