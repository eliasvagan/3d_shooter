class GUI {



    constructor(canvas) {
        this.context = canvas.getContext("2d");
        this.width = canvas.width;
        this.height = canvas.height;
        this.fps = {
            value: 0.0,
            posX: 5,
            posY: 15,
            font: "monospace 10px",
            color: "blue",
            rendering: true,
        };
    }

    render() {
        this.context.clearRect(0,0,this.width, this.height);

        if (this.fps.rendering) {
            this.context.fillStyle = this.fps.color;
            this.context.font = this.fps.font;
            this.context.fillText(this.fps.value, this.fps.posX, this.fps.posY);
        }
    }
    setFps(num) {
        this.fps.value = num;
    }
}