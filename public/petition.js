console.log("a mae ta on 💁‍♀️", $);

const erase = $(".erase");
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

const startDrawing = (x, y, e) => {
    drawing = true;
    getPosition(x, y, e);
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
    const touch = e.touches[0];
    const x = touch.pageX;
    const y = touch.pageY;
    startDrawing(x, y, e);

    canvas.on("touchmove", (e) => {
        e.preventDefault();
        const touch = e.touches[0];
        const x = touch.pageX;
        const y = touch.pageY;
        draw(x, y, e);
    });
});

canvas.on("touchend", (e) => {
    e.preventDefault();
    stopDrawing();
    const dataURL = canvas[0].toDataURL();
    signature.val(dataURL);
});

canvas.on("mousedown", (e) => {
    console.log("e on mousedown:", e);
    const x = e.clientX;
    const y = e.clientY;
    startDrawing(x, y, e);

    canvas.on("mousemove", (e) => {
        const x = e.clientX;
        const y = e.clientY;
        draw(x, y, e);
    });
});

canvas.on("mouseup", () => {
    stopDrawing();
    const dataURL = canvas[0].toDataURL();
    signature.val(dataURL);
});

erase.on("click", () => {
    console.log("button was clicked!");
    window.location = "/petition";
});
