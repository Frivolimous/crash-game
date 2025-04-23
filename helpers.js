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

class ColorGradient {
    startColor;
    R;
    G;
    B;

    constructor(startColor, endColor) {
        this.startColor = startColor;
        this.R = Math.floor(endColor / 0x010000) - Math.floor(startColor / 0x010000);
        this.G = Math.floor((endColor % 0x010000) / 0x000100) - Math.floor((startColor % 0x010000) / 0x000100);
        this.B = Math.floor(endColor % 0x000100) - Math.floor(startColor % 0x000100);
    }

    getColorAt = (percent) => {
        percent = Math.min(1, Math.max(0, percent));
    
        return this.startColor + Math.floor(this.R * percent) * 0x010000 + Math.floor(this.G * percent) * 0x000100 + Math.floor(this.B * percent);
    }

    getStringAt = (percent) => {
        var color = this.getColorAt(percent);
    
        var hex = color.toString(16);

        while(hex.length < 6) hex = '0' + hex;
        hex = '#' + hex;

        return hex;
    }
  }