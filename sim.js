/*
 * TODO:
 * - Total energy is not preserved in system as time moves forward
 * - Somehow, horizontal energy pies seem to work just fine
 * - Vertical energy pies do not work
 */

function clamp(n, lower, upper) { return max(lower, min(n, upper)); }
function F_g(m, g) { return m * g; }
function F_spring(k, d) { return -k * d; }
function E_g(m, g, h) { return m * g * h; }
function E_k(m, v) { return 0.5 * m * v * v; }
function E_el(k, d) { return 0.5 * k * d * d; }

const SCALE = 10;

h = 60;

function equilibrium() {
    if (vertical.checked())
	return (mass * g) / k;
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
    line((springLength + equilibrium()) * SCALE, y - 50, (springLength + equilibrium()) * SCALE, y + 50);
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

//    stroke("green");
//    line(x - 50, h * SCALE, x + 50, h * SCALE);
    stroke("red");
    line(x - 50, (springLength + equilibrium()) * SCALE, x + 50, (springLength + equilibrium()) * SCALE);
    stroke("black");
    circle(x, end, 50);
}

function mousePressed(event)
{
    if (mouseY <= 250 && mouseX <= 400) /* control area */
	return;

    offset = displacement * SCALE - (vertical.checked() ? mouseY : mouseX);
    dragging = true;
}

function mouseReleased(event) { dragging = false; }

let paused = false;   /* simulation paused? */
let dragging = false; /* mass being moved? */
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

    reset = createButton("Reset to equilibrium");
    reset.position(280, 20);

    g = 9.8;

    k = 2;
    springLength = 100 / SCALE;
    stretch = equilibrium();

    mass = 100;
    displacement = equilibrium() + springLength;
    velocity = acceleration = 0
    max_d = max_v = max_a = 0;

    total_energy = 0; /* does not cause divide by zero error (wat) */

    reset.mousePressed(() => {
	stretch = equilibrium();
	displacement = springLength + stretch;
	velocity = acceleration = 0
	total_energy = 0;
	max_d = max_v = max_a = 0;
    });

    gInput = createInput(g);
    gInput.position(128, 50);

    kInput = createInput(k);
    kInput.position(128, 50 + 22);

    springLengthInput = createInput(springLength);
    springLengthInput.position(128, 50 + (22 * 2));

    stretchInput = createInput(stretch);
    stretchInput.position(128, 50 + (22 * 3));

    massInput = createInput(mass);
    massInput.position(128, 50 + (22 * 4));

    velocityInput = createInput(velocity);
    velocityInput.position(128, 50 + (22 * 5));

    accelerationInput = createInput(acceleration);
    accelerationInput.position(128, 50 + (22 * 6));

    bake = createButton("Set");
    bake.position(20, 60 + (22 * 7));
    bake.mousePressed(() => { reset_and_read_controls(); });

    watching = createCheckbox("Sync fields with simulation");
    watching.position(60, 60 + (22 * 7));
}

function reset_and_read_controls()
{
    g = parseInt(gInput.value());
    k = parseInt(kInput.value());
    springLength = parseInt(springLengthInput.value());
    stretch = parseInt(stretchInput.value());
    mass = parseInt(massInput.value());
    velocity = parseInt(velocityInput.value());
    acceleration = parseInt(accelerationInput.value());
}

function write_controls()
{
    gInput.value(g);
    kInput.value(k);
    springLengthInput.value(springLength);
    stretchInput.value(stretch);
    massInput.value(mass);
    velocityInput.value(velocity);
    accelerationInput.value(acceleration);
}

function draw_controls()
{
    text("g", 20, 60 + (22 * 0));
    text("k", 20, 60 + (22 * 1));
    text("Spring length", 20, 60 + (22 * 2));
    text("Stretch/d", 20, 60 + (22 * 3));
    text("Mass", 20, 60 + (22 * 4));
    text("Velocity", 20, 60 + (22 * 5));
    text("Acceleration", 20, 60 + (22 * 6));

    text("Current values:", 325, 60 + (22 * 2));
//    text("d = " + displacement, 325, 60 + (22 * 4));
// lying for demo
    text("d = " + (stretch - equilibrium()), 325, 60 + (22 * 3));
    text("v = " + velocity, 325, 60 + (22 * 5));
    text("a = " + acceleration, 325, 60 + (22 * 6));
    text("(max: " + max_d + ")", 500, 60 + (22 * 3));
    text("(max: " + max_v + ")", 500, 60 + (22 * 5));
    text("(max: " + max_a + ")", 500, 60 + (22 * 6));
}

function draw(force = false)
{
    if (dragging) {
	mousecoord = (vertical.checked() ? mouseY : mouseX);
	displacement = (offset + mousecoord) / SCALE;
	stretch = displacement - springLength;

	acceleration = velocity = 0;
	total_energy = E_el(k, stretch);
	total_energy += (vertical.checked() ? E_g(mass, g, h - displacement) : 0);
    } else if (!paused || force) {
	/* simulation code. all calculation is done here */
	net_force = F_spring(k, stretch);
	net_force += vertical.checked() ? F_g(mass, g) : 0;
	acceleration = net_force / mass;
	velocity += acceleration;
	displacement += velocity;
	stretch += velocity;

	max_d = max(max_d, (stretch - equilibrium()));
	max_v = max(max_v, velocity);
	max_a = max(max_a, acceleration);
    }

    background(200);

    if (vertical.checked())
	vertical_spring(0, (springLength + stretch) * SCALE, 800, 25, 10);
    else
	horizontal_spring(0, (springLength + stretch) * SCALE, 400, 25, 10);

    draw_controls();

    if (watching.checked() && !paused)
	write_controls();

    eel = E_el(k, stretch);
    ek = E_k(mass, velocity);
    eg = vertical.checked() ? E_g(mass, g, h - displacement) : 0;

    if (! vertical.checked()) {
	p_eel = clamp(eel / total_energy, 0.00001, 1);
	p_ek = clamp(ek / total_energy, 0.00001, 1);
//    p_g = clamp(eg / total_energy, 0.00001, 1);

	text("Elastic energy", 450, 400);
	text("Kinetic energy", 600, 400);
//    text("gravitational energy", 750, 400);
	arc(500, 500, 100, 100, 0, 2 * PI * p_eel);
	arc(650, 500, 100, 100, 0, 2 * PI * p_ek);
//    arc(800, 500, 100, 100, 0, 2 * PI * p_g);
    }

    if (!paused || force || dragging) {
	console.log(`displacement, stretch: ${displacement}, ${stretch}`);
	console.log("E_el(k, stretch): " + eel);
	console.log("E_k(mass, velocity): " + ek);
	console.log("E_g(mass, g): " + eg);
	console.log("Initial energy: " + total_energy);
	console.log("Current energy: " + (eel + ek + eg));
	console.log("current/initial: " + (eel + ek + eg) / total_energy);
	console.log("     ");
    }
}
