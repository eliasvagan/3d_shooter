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
        this.weapon = {
            name: "Basic gun",
            ammo1Cur: 10,
            ammo1Rem: 4,
            ammo2Cur: 2,
            ammo2Rem: 0
        };
        this.globalSettings = {
            displayGUI: true
        }
    }

    render() {
        this.context.clearRect(0,0,this.width, this.height);
        if (!this.globalSettings.displayGUI) return;

        // FPS
        if (this.fps.rendering) {
            this.context.font = `${this.fps.fontFace} ${this.fps.fontSize}px`;
            //FPS shadow
            this.context.fillStyle = "black";
            this.context.fillText(this.fps.value, this.fps.posX + this.fps.fontSize / 30, this.fps.posY + this.fps.fontSize / 30);
            //FPS front
            this.context.fillStyle = this.fps.color;
            this.context.fillText(this.fps.value, this.fps.posX, this.fps.posY);
        }

        // Weapon info
        {
            const
                color1 = "#FFF",
                color2 = "rgba(255,255,255,0.3)",
                color3 = "#FF2",
                color4 = "rgba(255,185,66,0.29)",
                scale = 1 / SETTINGS.renderScale;

            this.context.beginPath();
            this.context.fillStyle = color2;
            this.context.strokeStyle = color1;
            this.context.rect(
                this.width - 10 - (200) * scale,
                this.height - 10 - (125) * scale,
                200 * scale, 60 * scale);

            this.context.stroke();
            this.context.fill();

            this.context.fillText(
                this.weapon.name,
                this.width - 10 - 200 * scale,
                this.height - 10 - 125 * scale);

            this.context.beginPath();
            this.context.fillStyle = color4;
            this.context.strokeStyle = color3;
            this.context.rect(
                this.width - 10 - (200) * scale,
                this.height - 10 - (60) * scale,
                200 * scale, 60 * scale);
            this.context.stroke();
            this.context.fill();
        }

        // Crosshair
        {
            this.context.strokeStyle = "white";
            this.context.lineWidth = this.crosshair.thickness;
            this.context.moveTo(this.width / 2, this.height / 2 - this.crosshair.size / 2);
            this.context.lineTo(this.width / 2, this.height / 2 + this.crosshair.size / 2);
            this.context.moveTo(this.width / 2 - this.crosshair.size / 2, this.height / 2);
            this.context.lineTo(this.width / 2 + this.crosshair.size / 2, this.height / 2);
            this.context.stroke();
        }


    }
    setFps(num) {
        this.fps.value = num;
    }
}