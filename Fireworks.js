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

    isComplete() {
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