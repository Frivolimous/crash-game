class Player {
    position = 0;
    leftButton = false;
    rightButton = false;
    exists = false;

    location = {
        x: 0,
        y: 0,
        padding: 0
    }

    get x() {
        return this.location.x + this.location.padding * this.position;
    }

    get y() {
        return this.location.y;
    }

    constructor(x, y, padding) {
        this.location.x = x;
        this.location.y = y;
        this.location.padding = padding;
        window.addEventListener('keydown', this.keyDown);
        window.addEventListener('keyup', this.keyUp);        
    }

    keyDown = (e) => {
        switch(e.key.toLowerCase()) {
            case 'a': case 'arrowleft': this.leftButton = true; break;
            case 'd': case 'arrowright': this.rightButton = true; break;
        }
    }
    
    keyUp = (e) => {
        switch(e.key.toLowerCase()) {
            case 'a': case 'arrowleft': this.leftButton = false; break;
            case 'd': case 'arrowright': this.rightButton = false; break;
        }
    }

    update() {
        if (this.leftButton === this.rightButton) this.position = 0;
        else if (this.leftButton) this.position = -1;
        else this.position = 1;    
    }
}