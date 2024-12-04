function F_g(m, g) { return m * g; }
function F_spring(k, d) { return k * d; }
function E_g(m, g, h) { return m * g * h; }
function E_k(m, v) { return 0.5 * m * v * v; }
function E_el(k, d) { return 0.5 * k * d * d; }
function equilibrium() {
    if (vertical.checked())
	return (mass * G) / k;
    else
	return 0;
}

function horizontal_spring(start, end, y, width, turns)
{
    step = (end - start) / turns;

    for (i = 0; i < turns; ++i) {
	line(start + i * step, y - width, start + (i + 1) * step, y + width);
	line(start + i * step, y + width, start + (i + 1) * step, y - width);
    }

    stroke("red");
    line(length + equilibrium(), y - 50, length + equilibrium(), y + 50);

    stroke("black");
    circle(end, y, 50);
}

function vertical_spring(start, end, x, width, turns)
{
    step = (end - start) / turns;

    for (i = 0; i < turns; ++i) {
	line(x - width, start + i * step, x + width, start + (i + 1) * step);
	line(x + width, start + i * step, x - width, start + (i + 1) * step);
    }

    stroke("red");
    line(x - 50, length + equilibrium(), x + 50, length + equilibrium());

    stroke("black");
    circle(x, end, 50);
}
function mousePressed(event)
{
    if (mouseY <= 50) /* top 50 pixels reserved for controls */
	return;

    offset = displacement - (vertical.checked() ? mouseY : mouseX);
    dragging = true;
}

function mouseReleased(event) { dragging = false; }

const G = 9.8;

let paused = false;   /* simulation paused? */
let dragging = false;   /* mass being moved? */
let offset = -1;      /* distance between mouse and mass */

function setup()
{
    createCanvas(windowWidth, windowHeight);

    vertical = createCheckbox("Vertical");
    vertical.position(20, 20);

    pause = createButton("Pause");
    pause.position(105, 20);
    pause.mousePressed(() => {
	paused = !paused;
	pause.html(paused ? "Unpause" : "Pause");
    });

    step = createButton("Step forward");
    step.position(180, 20);
    step.mousePressed(() => { if (paused) draw(true); });

    reset = createButton("Reset");
    reset.position(280, 20);
    reset.mousePressed(() => {
	displacement = equilibrium();
	velocity = acceleration = 0
    });

    k = 2;
    length = 100;

    mass = 100;
    displacement = velocity = acceleration = 0
    max_d = max_v = max_a = 0;

    // k, (m, d, v, a), e
    total_energy = E_el(k, displacement);
}

function draw(force = false)
{
    if (dragging) {
	displacement = offset + (vertical.checked() ? mouseY : mouseX);
	acceleration = velocity = 0;
	total_energy = E_el(k, displacement);
    } else if (!paused || force) {
	/* simulation code. all calculation is done here */
	net_force = F_spring(k, -displacement);
	net_force += vertical.checked() ? F_g(mass, G) : 0;
	acceleration = net_force / mass;
	velocity += acceleration;
	displacement += velocity;

	max_d = max(max_d, displacement);
	max_v = max(max_v, velocity);
	max_a = max(max_a, acceleration);
    }

    background(200);
    p_eel = min(E_el(k, displacement) / total_energy, 1);
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

    if (vertical.checked())
	vertical_spring(0, length + displacement, 400, 25, 10);
    else
	horizontal_spring(0, length + displacement, 100, 25, 10);
}
