class Firework {
    particles = [];

    constructor(x, y, count, color, speed) {
        for (var i = 0; i < count; i++) {
            var particle = new FireworkParticle();
            particle.vX = -speed + Math.random() * speed * 2;
            particle.vY = -speed + Math.random() * speed * 2;
            particle.x = x + Math.random() * particle.vX * 20;
            particle.y = y + Math.random() * particle.vY * 20;
            particle.color = color;
            particle.vF = -0.02 - 0.02 * Math.random();
            particle.vA = particle.vF;
            this.particles.push(particle);
        }
    }

    update = (canvas) => {
        for (var i = this.particles.length - 1; i >= 0; i--) {
            var particle = this.particles[i];
            particle.update(canvas);
            if (particle.fade <= 0) {
                this.particles.splice(i, 1);
            }
        }
    }

    get isComplete() {
        return this.particles.length === 0;
    }


}

class FireworkParticle {
    x;
    y;
    vX;
    vY;
    fade = 1;
    alpha = 1;
    vA = -0.01;
    vF = -0.01;
    color = '#00aaff';

    update = (canvas) => {
        this.x += this.vX;
        this.y += this.vY;
        this.fade += this.vF;
        this.alpha += this.vA;

        canvas.drawParticle(this.x, this.y, 5, this.color, this.alpha);
    }
}

class GrowingCircle {
    x;
    y;
    color;
    vA;
    vS;
    alpha = 1;
    size;
    vX;

    constructor(x, y, color, size, growSpeed, alphaSpeed) {
        this.x = x;
        this.y = y;
        this.color = color;
        this.size = size;
        this.vA = alphaSpeed;
        this.vS = growSpeed;
        this.vX = -5 + Math.random() * 10;
    }

    update = (canvas) => {
        this.size = Math.max(1, this.size - this.vS);
        this.alpha -= this.vA;
        this.y += this.vS * 5;
        this.x += this.vX;


        canvas.drawCircle(this.x, this.y, this.size, '#000000', this.color, this.alpha);
    }

    get isComplete() {
        return this.alpha <= 0;
    }
}

class FlyingText {
    x;
    y;
    color;
    text;
    alpha = 1;
    vY;
    vA;
    size;

    constructor(x, y, text, color, size, moveSpeed, alphaSpeed) {
        this.x = x;
        this.y = y;
        this.text = text;
        this.color = color;
        this.size = size;
        this.vY = moveSpeed;
        this.vA = alphaSpeed;
    }

    update = (canvas) => {
        this.y -= this.vY;
        this.alpha -= this.vA;
        canvas.addText(this.x, this.y, this.text, this.size, this.color, this.alpha);
    }

    get isComplete() {
        return this.alpha <= 0;
    }
}

class GrowingRing {
    x;
    y;
    color;
    vA;
    vS;
    alpha = 1;
    size;
    delay;

    constructor(x, y, color, size, growSpeed, alphaSpeed, delay) {
        this.x = x;
        this.y = y;
        this.color = color;
        this.size = size;
        this.vA = alphaSpeed;
        this.vS = growSpeed;
        this.delay = delay;
    }

    update = (canvas) => {
        if (this.delay > 0) {
            this.delay -= 1;
            return;
        }
        this.size = Math.max(1, this.size + this.vS);
        this.alpha -= this.vA;

        canvas.drawRing(this.x, this.y, this.size, '#000000', this.color, this.alpha);
    }

    get isComplete() {
        return this.alpha <= 0;
    }
}