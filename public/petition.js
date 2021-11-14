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

const draw = (x, y, e) => {
    if (drawing) {
        ctx.beginPath();
        ctx.lineWidth = 4;
        ctx.lineCap = "round";
        ctx.moveTo(coord.x, coord.y);
        getPosition(x, y, e);
        ctx.lineTo(coord.x, coord.y);
        ctx.stroke();
    }
};

canvas.on("touchstart", (e) => {
    e.preventDefault();
    const touch = e.touches[0];
    const x = touch.clientX;
    const y = touch.clientY;
    startDrawing(x, y, e);

    canvas.on("touchmove", (e) => {
        e.preventDefault();
        const touch = e.touches[0];
        const x = touch.clientX;
        const y = touch.clientY;
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
    window.location = "/petition";
});

// window.on("load", () => {
//     console.log(window.width());
//     if (window.width() >= 320 && window.width() <= 480) {
//         canvas.width = 200;
//         canvas.height = 60;
//     }
// });

const render = () => {
    ctx.canvas.width = document.documentElement.clientWidth * 0.7;
    ctx.canvas.height = document.documentElement.clientHeight * 0.3;
    console.log("canvas.height:", ctx.canvas.height);
    console.log("canvas.width:", ctx.canvas.width);

    // ctx.fillRect(0, 0, ctx.canvas.width, ctx.canvas.height);
};

$(window).on("resize", () => {
    render();
});

$(window).on("load", () => {
    render();
});

// conditiin canvas.width = ;and height to size of window

// listen for resize event on window object to change canvas size
// window.innerHeight, innerwidth
