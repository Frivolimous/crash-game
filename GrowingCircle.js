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

    isComplete() {
        return this.alpha < 0;
    }
}