class GUI {



    constructor(canvas) {
        this.context = canvas.getContext("2d");
        this.width = canvas.width;
        this.height = canvas.height;
        this.crosshair = {
            thickness: 2,
            size: 15,
        };
        this.fps = {
            value: 0.0,
            posX: 5,
            posY: 15,
            fontFace: "monospace",
            fontSize: 40,
            color: "yellow",
            rendering: true,
        };
    }

    render() {
        this.context.clearRect(0,0,this.width, this.height);

        { // Crosshair
            this.context.strokeStyle = "white";
            this.context.lineWidth = this.crosshair.thickness;
            this.context.moveTo(this.width / 2, this.height / 2 - this.crosshair.size / 2);
            this.context.lineTo(this.width / 2, this.height / 2 + this.crosshair.size / 2);
            this.context.moveTo(this.width / 2 - this.crosshair.size / 2, this.height / 2);
            this.context.lineTo(this.width / 2 + this.crosshair.size / 2, this.height / 2);
            this.context.stroke();
        }

        if (this.fps.rendering) {
            this.context.font = `${this.fps.fontFace} ${this.fps.fontSize}px`;
            //FPS shadow
            this.context.fillStyle = "black";
            this.context.fillText(this.fps.value, this.fps.posX + this.fps.fontSize / 30, this.fps.posY + this.fps.fontSize / 30);
            //FPS front
            this.context.fillStyle = this.fps.color;
            this.context.fillText(this.fps.value, this.fps.posX, this.fps.posY);
        }
    }
    setFps(num) {
        this.fps.value = num;
    }
}