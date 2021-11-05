console.log("a mae ta on 💁‍♀️", $);

const canvas = $(".canvas");
const signature = $("#signature");
const ctx = canvas[0].getContext("2d");

ctx.fillStyle = "rgba(0, 0, 0, 255)";

let coord = { x: 0, y: 0 };
let drawing = false;

const getPosition = (e) => {
    const rect = e.target.getBoundingClientRect();
    coord.x = e.clientX - rect.left;
    coord.y = e.clientY - rect.top;
};

const startDrawing = (e) => {
    drawing = true;
    getPosition(e);
};

const stopDrawing = () => {
    drawing = false;
};

function draw(e) {
    if (drawing) {
        ctx.beginPath();
        ctx.lineWidth = 4;
        ctx.lineCap = "round";
        ctx.moveTo(coord.x, coord.y);
        getPosition(e);
        ctx.lineTo(coord.x, coord.y);
        ctx.stroke();
    }
}

canvas.on("mousedown", (e) => {
    startDrawing(e);

    canvas.on("mousemove", (e) => {
        draw(e);
    });
});

canvas.on("mouseup", () => {
    stopDrawing();
    const dataURL = canvas[0].toDataURL();
    signature.val(dataURL);
});
