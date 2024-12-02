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
    offset = springs[0].weight.displacement - mouseX;
    moving = true;
}

function mouseReleased(event)
{
    moving = false;
}

class Weight {
    constructor(mass, displacement = 0, velocity = 0, acceleration = 0) {
	this.mass = mass;                 /* g(?) */
	this.displacement = displacement; /* meters */
	this.velocity = velocity;         /* m/s */
	this.acceleration = acceleration; /* m/s^2 */

	this.max_d = this.max_v = this.max_a = 0;
    }
}

class Spring {
    constructor(stiffness, weight, length) {
	this.weight = weight;
	this.stiffness = stiffness; /* N/m */
	this.equilibrium = length;  /* meters */
    }
}

const G = 9.8;

moving = false;
offset = -1;

function setup()
{
    createCanvas(windowWidth, windowHeight);
    springs = [new Spring(2, new Weight(100, 50), 300)];
    total_energy = E_el(2, 50);

    // k, (m, d, v, a), e
//    springs = [new Spring(2, new Weight(100, 30), 100)];
}

function draw()
{
    for (s of springs) {
	net_force = F_spring(s.stiffness, s.weight.displacement);
	s.weight.acceleration = net_force / s.weight.mass;
	s.weight.velocity += s.weight.acceleration;
	s.weight.displacement += s.weight.velocity;

	s.weight.max_d = max(s.weight.max_d, s.weight.displacement);
	s.weight.max_v = max(s.weight.max_v, s.weight.velocity);
	s.weight.max_a = max(s.weight.max_a, s.weight.acceleration);

	if (moving) {
	    s.weight.displacement = offset + mouseX;
	    s.weight.acceleration = s.weight.velocity = 0;
	}

	background(200);

	p_eel = min(E_el(s.stiffness, s.weight.displacement) / total_energy, 1);
	p_ek = min(E_k(s.weight.mass, s.weight.velocity) / total_energy, 1);

	arc(500, 500, 100, 100, 0, 2 * PI * p_eel);
	arc(650, 500, 100, 100, 0, 2 * PI * p_ek);

	text("(" + s.weight.max_d + ") d = " + s.weight.displacement, 200, 200);
	text("(" + s.weight.max_v + ") v = " + s.weight.velocity, 200, 250);
	text("(" + s.weight.max_a + ") a = " + s.weight.acceleration, 200, 225);

	horizontal_spring(0, s.equilibrium + s.weight.displacement, 100, 20, 10, s.equilibrium);
	//    vertical_spring(0, equilibrium + displacement, 100, 20, 10, equilibrium);
    }
}
