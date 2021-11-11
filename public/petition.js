console.log("a mae ta on 💁‍♀️", $);

const canvas = $(".canvas");
const signature = $("#signature");
const ctx = canvas[0].getContext("2d");

ctx.fillStyle = "rgba(0, 0, 0, 255)";

let coord = { x: 0, y: 0 };
let drawing = false;

const getPosition = (x, y, e) => {
    const rect = e.target.getBoundingClientRect();
    coord.x = x - rect.left;
    coord.y = y - rect.top;
};

const startDrawing = (e) => {
    drawing = true;
    getPosition(e);
};

const stopDrawing = () => {
    drawing = false;
};

function draw(x, y, e) {
    if (drawing) {
        ctx.beginPath();
        ctx.lineWidth = 4;
        ctx.lineCap = "round";
        ctx.moveTo(coord.x, coord.y);
        getPosition(x, y, e);
        ctx.lineTo(coord.x, coord.y);
        ctx.stroke();
    }
}

canvas.on("touchstart", (e) => {
    e.preventDefault();
    startDrawing(e);

    canvas.on("touchmove", (e) => {
        e.preventDefault();
        var touch = e.touches[0];
        draw(touch.pageX, touch.pageY, e);
    });
});

canvas.on("touchend", (e) => {
    e.preventDefault();
    stopDrawing();
    const dataURL = canvas[0].toDataURL();
    signature.val(dataURL);
});

canvas.on("mousedown", (e) => {
    startDrawing(e);

    canvas.on("mousemove", (e) => {
        draw(e.clientX, e.clientY, e);
    });
});

canvas.on("mouseup", () => {
    stopDrawing();
    const dataURL = canvas[0].toDataURL();
    signature.val(dataURL);
});
