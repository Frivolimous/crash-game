class CanvasRender {
    Element;
    Graphic;
    Width;
    Height;

    constructor(width, height, element) {
        this.Element = element;
        this.Graphic = element.getContext('2d');
        this.Width = width;
        this.Height = height;

        element.width = this.Width;
        element.height = this.Height;
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
    
    drawCircle(x, y, radius, strokeColor, fillColor) {
        this.Graphic.beginPath();
        this.Graphic.arc(x, y, radius, 0, 2 * Math.PI);
        this.Graphic.lineWidth = "3";
        this.Graphic.strokeStyle = strokeColor;
        this.Graphic.fillStyle = fillColor;
        this.Graphic.fill();
        this.Graphic.stroke();
    }
    
    addText(x, y, text) {
        this.Graphic.font = "50px Arial";
        this.Graphic.fillStyle = '#000000';
        this.Graphic.fillText(text, x, y);
    }
}