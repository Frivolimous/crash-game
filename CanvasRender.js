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
    
    addText(x, y, text, size = 50) {
        this.Graphic.font = `${size}px Arial`;
        this.Graphic.fillStyle = '#000000';
        this.Graphic.fillText(text, x, y);
    }
}