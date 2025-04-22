class Timer {
    delay = 0;

    minDelay;
    incDelay;

    constructor(minDelay, incDelay) {
        this.minDelay = minDelay;
        this.incDelay = incDelay;
    }

    reset() {
        this.delay = this.minDelay + Math.random() * this.incDelay;
    }

    tick() {
        this.delay--;
    }

    complete() {
        return this.delay <= 0;
    }
}