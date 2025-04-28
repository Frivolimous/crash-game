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

class MultGauge {
gradient1 = new ColorGradient(0xff0000, 0xffcc00);
gradient2 = new ColorGradient(0xffcc00, 0xffff00);
gradient3 = new ColorGradient(0xffff00, 0x00ff00);
gradient4 = new ColorGradient(0x00ff00, 0xffffff);
gradient5 = new ColorGradient(0xaaaaaa, 0xffffff);

g5Percent = 0;
g5Up = true;
g5Speed = 0.1;
x;
y;
width;
height;

constructor(x, y, width, height) {
    this.x = x;
    this.y = y;
    this.width = width;
    this.height = height;
}

getColor(percent) {
    var color;
    if (percent < 0.15) {
        color = this.gradient1.getStringAt(0);
    } else if (percent < 0.2) {
        color = this.gradient1.getStringAt((percent - 0.15) / 0.05);
    } else if (percent < 0.4) {
        color = this.gradient2.getStringAt(0);
    } else if (percent < 0.45) {
        color = this.gradient2.getStringAt((percent - 0.4) / 0.05);
    } else if (percent < 0.6) {
        color = this.gradient3.getStringAt(0);
    } else if (percent < 0.65) {
        color = this.gradient3.getStringAt((percent - 0.6) / 0.05);
    } else if (percent < 0.75) {
        color = this.gradient3.getStringAt(1);
    } else if (percent < 0.8) {
        color = this.gradient4.getStringAt((percent - 0.75) / 0.05);
        this.g5Percent = 1;
    } else {
        this.g5Percent += this.g5Speed * (this.g5Up ? 1 : -1);
        if (this.g5Percent > 1) {
            this.g5Up = false;
            this.g5Percent = 1;
        }
        if (this.g5Percent < 0) {
            this.g5Up = true;
            this.g5Percent = 0;
        }
        color = this.gradient5.getStringAt(this.g5Percent);
    }

    return color;
}

update(canvas, percent) {
    var color = this.getColor(percent);
    canvas.drawRect(this.x, this.y, this.width, this.height, '#000000');
    canvas.drawRect(this.x, this.y, Math.min(1, percent / 0.8) * this.width, this.height, color);
}
}