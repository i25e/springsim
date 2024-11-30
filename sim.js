const G = 9.8;

let moving = false;
let offset = -1;

function F_g(m, g) { return m * g; }
function F_spring(k, d) { return -k * d; }
function gravitational_energy(m, g, h) { return m * g * h; }
function kinetic_energy(m, v) { return 0.5 * m * v * v; }
function elastic_energy(k, d) { return 0.5 * k * d * d; }

function horizontal_spring(start, end, y, width, turns)
{
    console.log(start + " -> " + end);

    step = (end - start) / turns;

    for (i = 0; i < turns; ++i) {
	line(start + i * step, y - width, start + (i + 1) * step, y + width);
	line(start + i * step, y + width, start + (i + 1) * step, y - width);
    }

    circle(end, y, 40);
}

function mousePressed(event) { offset = displacement - mouseX; moving = true; }
function mouseReleased(event) { moving = false; }

function setup()
{
    createCanvas(windowWidth, windowHeight);

    spring_constant = 0.5; /* N/m */
    mass = 100;          /* kg */
    velocity = 0;        /* M/s */
    displacement = 0;    /* meters */
    equilibrium = 200;   /* meters */
}

function draw()
{
    net_force = F_spring(spring_constant, displacement);
    acceleration = net_force / mass;
    velocity += acceleration;
    displacement += velocity;

    if (moving) {
	displacement = offset + mouseX;
	acceleration = velocity = 0;
	console.log("offset: " + offset);
    }

    background(200);
    horizontal_spring(0, equilibrium + displacement, 100, 20, 10);
}
