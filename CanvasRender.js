class CanvasRender {
    Element;
    Graphic;
    Width;
    Height;
    
    onPointerDown;
    onPointerUp;
    onPointerUpAnywhere;
    onPointerMove;

    constructor(width, height, element) {
        this.Element = element;
        this.Graphic = element.getContext('2d');
        this.Width = width;
        this.Height = height;

        element.width = this.Width;
        element.height = this.Height;

        element.addEventListener('pointerdown', e => {
            let r = element.getBoundingClientRect();
            
            var location = {x: e.offsetX * element.width / r.width, y: e.offsetY * element.height / r.height};
            this.onPointerDown && this.onPointerDown(location);
        });

        element.addEventListener('pointerup', e => {
            let r = element.getBoundingClientRect();
            
            var location = {x: e.offsetX * element.width / r.width, y: e.offsetY * element.height / r.height};
            this.onPointerUp && this.onPointerUp(location);
        });

        element.addEventListener('pointerleave', e => {
            this.onPointerUpAnywhere && this.onPointerUpAnywhere();
        });

        element.addEventListener('touchmove', e => {
            let r = element.getBoundingClientRect();
            var x = e.targetTouches[0].pageX * element.width / r.width;
            var y = e.targetTouches[0].pageY * element.height / r.height;
            var location = {x, y};
            this.onPointerMove && this.onPointerMove(location);
        });

        element.addEventListener('mousemove', e => {
            let r = element.getBoundingClientRect();
            
            var location = {x: e.offsetX * element.width / r.width, y: e.offsetY * element.height / r.height};
            this.onPointerMove && this.onPointerMove(location);
        });
    }

    clear() {
        this.Graphic.clearRect(0, 0, this.Width, this.Height);
    }
    
    drawBackground(bgColor) {
        this.Graphic.beginPath();
        this.Graphic.rect(0, 0, this.Width, this.Height);
        this.Graphic.fillStyle = bgColor;
        this.Graphic.fill();
    }

    drawRect(x, y, width, height, color) {
        this.Graphic.beginPath();
        this.Graphic.rect(x, y, width, height);
        this.Graphic.fillStyle = color;
        this.Graphic.strokeStyle = "#000000";
        this.Graphic.lineWidth = 2;
        this.Graphic.fill();
        this.Graphic.stroke();
    }
    
    drawCircle(x, y, radius, strokeColor, fillColor, alpha = 1) {
        this.Graphic.beginPath();
        this.Graphic.arc(x, y, radius, 0, 2 * Math.PI);
        this.Graphic.lineWidth = "3";
        this.Graphic.strokeStyle = strokeColor;
        this.Graphic.fillStyle = fillColor;
        this.Graphic.globalAlpha = Math.max(alpha, 0);
        this.Graphic.fill();
        this.Graphic.stroke();
        this.Graphic.globalAlpha = 1;
    }

    drawRing(x, y, radius, strokeColor, fillColor, alpha = 1) {
        this.Graphic.beginPath();
        this.Graphic.arc(x, y, radius, 0, 2 * Math.PI);
        this.Graphic.lineWidth = "10";
        this.Graphic.strokeStyle = fillColor;
        // this.Graphic.fillStyle = fillColor;
        this.Graphic.globalAlpha = Math.max(alpha, 0);
        // this.Graphic.fill();
        this.Graphic.stroke();
        this.Graphic.globalAlpha = 1;
    }

    drawPartialCirclePercent(x, y, radius, color, percent) {
        this.Graphic.beginPath();
        this.Graphic.arc(x, y, radius, -Math.PI / 2, -Math.PI / 2 + 2 * Math.PI * percent);
        this.Graphic.lineWidth = "10";
        this.Graphic.strokeStyle = color;
        this.Graphic.globalAlpha = 1;
        this.Graphic.stroke();
        this.Graphic.globalAlpha = 1;
    }

    drawPartialCircle(x, y, radius, color, startAngle, endAngle) {
        this.Graphic.beginPath();
        this.Graphic.arc(x, y, radius, startAngle, endAngle);
        this.Graphic.lineWidth = "10";
        this.Graphic.strokeStyle = color;
        this.Graphic.globalAlpha = 1;
        this.Graphic.stroke();
        this.Graphic.globalAlpha = 1;
    }

    drawParticle(x, y, radius, fillColor, alpha) {
        this.Graphic.beginPath();
        this.Graphic.arc(x, y, radius, 0, 2 * Math.PI);
        this.Graphic.lineWidth = "1";
        this.Graphic.strokeStyle = '#000000';
        this.Graphic.globalAlpha = Math.max(alpha, 0);
        this.Graphic.fillStyle = fillColor;
        this.Graphic.fill();
        this.Graphic.stroke();
        this.Graphic.globalAlpha = 1;
    }
    
    addText(x, y, text, size = 50, color = '#000000', alpha = 1) {
        this.Graphic.font = `${size}px Arial`;
        this.Graphic.fillStyle = color;
        this.Graphic.globalAlpha = Math.max(alpha, 0);
        this.Graphic.fillText(text, x, y);
        this.globalAlpha = 1;
    }
}