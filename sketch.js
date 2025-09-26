let tex;
let base;
let font;
let UI;
let img;
let loaded = false;
let dimension;
let true_resolution = 800;

let min_radius = 300;
let radius = min_radius;
let max_radius = 600;
let zoom = 20;

let radian = Math.PI / 180;
let center = [0, 0];
let angle = 1.25 * radian;
let resolution = 1;
let base_resolution = 18;
let last_drawn_point = ["N"];

let paint_mode = 1;
let globe_mode = true;


function setup() {
    dimension = Math.min(windowWidth, windowHeight) * 0.95;

    input = createFileInput(handleImage, false);
    const file_input = document.getElementsByTagName("input")[0];
    const maindiv = document.getElementById("maindiv");
    maindiv.appendChild(file_input);

    createCanvas(dimension, dimension, WEBGL);

    base = createGraphics(720, 360);
    base.noStroke();
    create_base_texture();

    tex = createGraphics(720, 360);
    tex.noSmooth();

    UI = createGraphics(true_resolution, 100);
    UI.textSize(40);

    noStroke();
}

function draw() {
    if (globe_mode) {
        background(0);
        scale(dimension / true_resolution);
        ortho();

        directionalLight(255, 255, 255, 0, 0, -1);
        directionalLight(100, 100, 100, 0, 0, -1);

        if (keyIsDown(LEFT_ARROW)) {
            center[1] -= angle;
            if (center[1] < 0) {
                center[1] += 2 * Math.PI;
            }
        }
        if (keyIsDown(RIGHT_ARROW)) {
            center[1] += angle;
            if (center[1] >= 2 * Math.PI) {
                center[1] -= 2 * Math.PI;
            }
        }
        if (keyIsDown(UP_ARROW)) {
            center[0] += angle;
            if (center[0] > Math.PI / 2) {
                center[0] = Math.PI / 2;
            }
        }
        if (keyIsDown(DOWN_ARROW)) {
            center[0] -= angle;
            if (center[0] < -Math.PI / 2) {
                center[0] = -Math.PI / 2;
            }
        }
        if (keyIsDown(83)) {
            radius -= zoom;
            if (radius < min_radius) {
                radius = min_radius;
            }
        }
        if (keyIsDown(87)) {
            radius += zoom;
            if (radius > max_radius) {
                radius = max_radius;
            }
        }

        draw_sphere(center);

        if (mouseIsPressed) {
            let mx = mouseX - width / 2;
            let my = height / 2 - mouseY;
            if (mouseButton == LEFT) {
                paint(mx * true_resolution / dimension, my * true_resolution / dimension);
            }

        }
        UI.clear();
        UI.fill(255);
        UI.textAlign(LEFT);
        UI.text([Math.round(center[0] / radian), Math.round(center[1] / radian)], 10, 45);
        UI.textAlign(RIGHT);
        if (paint_mode == 0) {
            UI.text("Erasing", true_resolution - 10, 45);
        } else {
            if (paint_mode == 1) {
                UI.fill(255, 0, 0);
            } else if (paint_mode == 2) {
                UI.fill(0, 255, 0);
            } else {
                UI.fill(0, 0, 255);
            }
            UI.text("Painting", true_resolution - 10, 45);
        }
        image(UI, -true_resolution / 2, -true_resolution / 2);
    } else {
        background(255);
        ortho();
        if (loaded) {
            image(base, -width, -height / 2, width, height);
            image(base, 0, -height / 2, width, height);
        }
        image(tex, -width, -height / 2, width, height);
        image(tex, 0, -height / 2, width, height);
    }
}

function keyPressed() {
    if (key === 'm') {
        globe_mode = !globe_mode;
        if (globe_mode) {
            resizeCanvas(dimension, dimension);
        } else {
            resizeCanvas(dimension, dimension / 2);
        }
    }
    if (key === '1') {
        paint_mode = 1;
    } else if (key === '2') {
        paint_mode = 2;
    } else if (key === '3') {
        paint_mode = 3;
    } else if (key === 'e') {
        paint_mode = 0;
    }
}

function mousePressed() {
    let mx = mouseX - width / 2;
    let my = height / 2 - mouseY;
    if (mx * mx + my * my < radius * radius) {
        last_drawn_point = [mx * true_resolution / dimension, my * true_resolution / dimension];
    }
}

function mouseReleased() {
    last_drawn_point = ["N"];
}

function draw_sphere(angles) {
    push();
    rotateX(-angles[0]);
    rotateY(-angles[1]);
    if (img && !loaded) {
        base.background(255);
        base.image(img, base.width / 2, 0, base.width, base.height);
        base.image(img, -base.width / 2, 0, base.width, base.height);
        loaded = true;
    }
    texture(base);
    sphere(radius, 60, 30);
    texture(tex);
    sphere(radius, 60, 30);
    pop();
}

function create_base_texture() {
    base.background(255);
    for (let i = 0; i < (180 / base_resolution); i++) {
        for (let j = 0; j < (360 / base_resolution); j++) {
            if ((i + j) % 2 == 0) {
                base.fill(240);
                base.rect(j * base.width / (360 / base_resolution), i * base.height / (180 / base_resolution), base.width / (360 / base_resolution), base.height / (180 / base_resolution));
            }
        }
    }
}

function paint(mX, mY) {
    if (last_drawn_point[0] !== "N") {
        let dx = Math.abs(mX - last_drawn_point[0]);
        let dy = Math.abs(mY - last_drawn_point[1]);
        let steps = max(dx, dy) + 1;
        for (let i = 0; i < steps; i++) {
            let x = last_drawn_point[0] + (mX - last_drawn_point[0]) / steps * i;
            let y = last_drawn_point[1] + (mY - last_drawn_point[1]) / steps * i;
            paint_point(x, y);

        }
    }
    last_drawn_point = [mX, mY];
}

function paint_point(mX, mY) {
    if (mX * mX + mY * mY < radius * radius) {
        let y = mX / radius;
        let z = mY / radius;
        let x = Math.sqrt(1 - y * y - z * z);

        let x_new = x * Math.cos(center[0]) - z * Math.sin(center[0]);
        let z_new = x * Math.sin(center[0]) + z * Math.cos(center[0]);

        let x_new_new = x_new * Math.cos(-center[1]) + y * Math.sin(-center[1]);
        let y_new = x_new * -Math.sin(-center[1]) + y * Math.cos(-center[1]);

        let beta = Math.asin(z_new);
        let lambda = Math.atan2(y_new, x_new_new)
        if (lambda < 0) {
            lambda += 2 * Math.PI;
        }

        let squishing = 1 / Math.cos(beta);
        let h = tex.height / 180 * resolution;
        let w = h * squishing;
        let rectX = tex.width / (2 * Math.PI) * lambda;
        let rectY = tex.height / Math.PI * (Math.PI - (beta + Math.PI / 2));


        tex.strokeWeight(0);
        if (paint_mode == 1) {
            tex.fill(255, 0, 0);
        } else if (paint_mode == 2) {
            tex.fill(0, 255, 0);
        } else if (paint_mode == 3) {
            tex.fill(0, 0, 255);
        } else {
            tex.erase();
        }

        tex.rect(rectX - w / 2, rectY - h / 2, w, h);
        tex.rect(rectX - w / 2 + tex.width, rectY - h / 2, w, h);
        tex.rect(rectX - w / 2 - tex.width, rectY - h / 2, w, h);

        tex.noErase();
    }
}

function handleImage(file) {
    if (file.type === 'image') {
        img = createImg(file.data, '');
        img.hide();

    } else {
        img = null;
    }
}
