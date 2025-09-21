let radian = Math.PI / 180;
let sphere_points = [];
let sphere_mesh = [];
let radius = 300;
let resolution = 2.5;
let angle = 1 * radian;
let center = [0, 0];

function setup() {
  createCanvas(800, 800);
  generate_sphere();
  generate_sphere_mesh();
  stroke(0);
  strokeWeight(1);
  noStroke();
  textSize(40);
}

function draw() {
  background(0);
  fill(255);
  text(Math.round(frameRate()), 0, 50);
  translate(width/2, height/2);
  scale(1, -1);
  draw_sphere();
  
  if (keyIsDown(LEFT_ARROW)) {
    center[1] -= angle;
    rotate_sphere(center);
  }
  if (keyIsDown(RIGHT_ARROW)) {
    center[1] += angle;
    rotate_sphere(center);
  }
  if (keyIsDown(UP_ARROW)) {
    center[0] -= angle;
    if (center[0] < -Math.PI/2) {
      center[0] = -Math.PI/2;
    }
    rotate_sphere(center);
  }
  if (keyIsDown(DOWN_ARROW)) {
    center[0] += angle;
    if (center[0] > Math.PI/2) {
      center[0] = Math.PI/2;
    }
    rotate_sphere(center);
  }
}

function generate_sphere() {
  sphere_points = [];
  for (let latitude = -90/resolution; latitude < 91/resolution; latitude++) {
    let array = [];
    for (let longitude = 0; longitude < 360/resolution; longitude ++) {
      let beta = latitude * resolution * radian;
      let lambda = longitude * resolution * radian;
      
      let x = Math.cos(beta) * Math.cos(lambda);
      let y = Math.cos(beta) * Math.sin(lambda);
      let z = Math.sin(beta);
      array.push([x, y, z, latitude, longitude]);
    }
    sphere_points.push(array);
  }
}

function generate_sphere_mesh() {
  sphere_mesh = [];
  for (let i = 0; i < sphere_points.length - 1; i++) {
    for (let j = 0; j < sphere_points[0].length; j++) {
      
      let beta = i + 1;
      let lambda = j + 1;
      if (lambda == sphere_points[0].length) {
        lambda = 0;
      }
      
      let mesh_square = [i, j, beta, lambda];
      sphere_mesh.push(mesh_square);
    }
  }
}

function draw_sphere() {
  for (let k = 0; k < sphere_mesh.length; k++) {
    let polygon = sphere_mesh[k];
    let i = polygon[0];
    let j = polygon[1];
    let beta = polygon[2];
    let lambda = polygon[3];
    
    let x1 = sphere_points[i][j][0];
    let x2 = sphere_points[beta][j][0];
    let x3 = sphere_points[beta][lambda][0];
    let x4 = sphere_points[i][lambda][0];
    
    let x_avg = (x1 + x2 + x3 + x4)/4;
    
    if (x_avg > 0) {
      let y1 = radius * sphere_points[i][j][1];
      let z1 = radius * sphere_points[i][j][2];
      let y2 = radius * sphere_points[beta][j][1];
      let z2 = radius * sphere_points[beta][j][2];
      let y3 = radius * sphere_points[beta][lambda][1];
      let z3 = radius * sphere_points[beta][lambda][2];
      let y4 = radius * sphere_points[i][lambda][1];
      let z4 = radius * sphere_points[i][lambda][2];
      fill(x_avg * 255);
      quad(y1, z1, y2, z2, y3, z3, y4, z4);
    }
  }
}

function rotate_sphere(center_coords) {
  sphere_points = [];
  for (let latitude = -90/resolution; latitude < 91/resolution; latitude++) {
    let array = [];
    for (let longitude = 0; longitude < 360/resolution; longitude ++) {
      let beta = latitude * resolution * radian;
      let lambda = longitude * resolution * radian;
      
      let x = Math.cos(beta) * Math.cos(lambda);
      let y = Math.cos(beta) * Math.sin(lambda);
      let z = Math.sin(beta);
      
      let x_new = x * Math.cos(center_coords[1]) + y * Math.sin(center_coords[1]);
      let y_new = x * -Math.sin(center_coords[1]) + y * Math.cos(center_coords[1]);
      
      let x_new_new = x_new * Math.cos(center_coords[0]) - z * Math.sin(center_coords[0]);
      let z_new = x_new * Math.sin(center_coords[0]) + z * Math.cos(center_coords[0]);
      array.push([x_new_new, y_new, z_new, latitude, longitude]);
    }
    sphere_points.push(array);
  }
}
