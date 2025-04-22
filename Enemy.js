class Enemy {
    row = 0;
    speed = 0;
    y = 0;
    maxY = 0;
    toDestroy = false;

    constructor(speed, row, maxY) {
        this.speed = speed;
        this.row = row;
        this.maxY = maxY;
    }

    update() {
        this.y += this.speed;
        if (this.y > this.maxY) {
            this.toDestroy = true;
        }
    }

    collisionTest = (player) => {
        if (this.row === player.position) {
            if (this.y > player.location.y - 15 && this.y < player.location.y + 15) {
                return true;
            }
        }

        return false;
    }
}