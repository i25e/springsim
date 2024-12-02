function horizontal_spring(start, end, y, width, turns, equilibrium)
{
    step = (end - start) / turns;

    for (i = 0; i < turns; ++i) {
	line(start + i * step, y - width, start + (i + 1) * step, y + width);
	line(start + i * step, y + width, start + (i + 1) * step, y - width);
    }

    stroke("red");
    line(equilibrium, 50, equilibrium, 150);

    stroke("black");
    circle(end, y, 40);
}

function vertical_spring(start, end, x, width, turns, equilibrium)
{
    step = (end - start) / turns;

    for (i = 0; i < turns; ++i) {
	line(x - width, start + i * step, x + width, start + (i + 1) * step);
	line(x + width, start + i * step, x - width, start + (i + 1) * step);
    }

    stroke("red");
    line(50, equilibrium, 150, equilibrium);

    stroke("black");
    circle(x, end, 40);
}

function F_g(m, g) { return m * g; }
function F_spring(k, d) { return -k * d; }
function E_g(m, g, h) { return m * g * h; }
function E_k(m, v) { return 0.5 * m * v * v; }
function E_el(k, d) { return 0.5 * k * d * d; }
function equilibrium_position(k, m, g) { return (m * g) / k; }

function mousePressed(event)
{
    if (vertical) {
	console.log("oh no!!!!!");
    } else if (abs(mouseY - 100) <= 50) {
	offset = displacement - mouseX;
	moving = true;
    } else {
	console.log(":(" + abs(mouseY - 100));
    }
}

function mouseReleased(event)
{
    moving = false;
}

const G = 9.8;

let moving = false;
let offset = -1;
let vertical = false;

function setup()
{
    createCanvas(windowWidth, windowHeight);
//    springs = [new Spring(2, new Weight(100, 50), 300)];

    spring_stiffness = 2;
    spring_length = 100;

    mass = 100;
    displacement = 30;
    velocity = acceleration = 0
    max_d = max_v = max_a = 0;

    // k, (m, d, v, a), e
    total_energy = E_el(spring_stiffness, displacement);
}

function draw()
{
    net_force = F_spring(spring_stiffness, displacement);
    acceleration = net_force / mass;
    velocity += acceleration;
    displacement += velocity;

    max_d = max(max_d, displacement);
    max_v = max(max_v, velocity);
    max_a = max(max_a, acceleration);

    if (moving) {
	displacement = offset + mouseX;
	acceleration = velocity = 0;
	total_energy = E_el(spring_stiffness, displacement);
    }

    background(200);

    pause = createButton("Pause");
    pause.position(500, 300);

    p_eel = min(E_el(spring_stiffness, displacement) / total_energy, 1);
    p_ek = min(E_k(mass, velocity) / total_energy, 1);

    text("Elastic energy", 450, 400);
    text("Kinetic energy", 600, 400);
    arc(500, 500, 100, 100, 0, 2 * PI * p_eel);
    arc(650, 500, 100, 100, 0, 2 * PI * p_ek);

    text("d = " + displacement, 200, 200);
    text("v = " + velocity, 200, 225);
    text("a = " + acceleration, 200, 250);
    text("(max: " + max_d + ")", 400, 200);
    text("(max: " + max_v + ")", 400, 225);
    text("(max: " + max_a + ")", 400, 250);

    horizontal_spring(0, spring_length + displacement, 100, 20, 10, spring_length);
    //    vertical_spring(0, equilibrium + displacement, 100, 20, 10, equilibrium);
}
