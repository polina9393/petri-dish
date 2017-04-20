var cells = [];
var arrayVirus = [];

function setup() {
    canvas = createCanvas(windowWidth, windowHeight);


    //ADDING 10 PARTICLES
    for (var i = 0; i < 10; i++) {
        cells.push(new Cell(random(1, 3)));
    }

    blueCol = color(0, 255, 255);

    canvas.mousePressed(function() {
        mouse = new p5.Vector(mouseX, mouseY);
        console.log(mouse);
        arrayVirus.push(new Cell(
            3,
            mouse,
            blueCol
        ));
    });

}

function draw() {

    background(0);

    //WIND FORCE
    for (var i = 0; i < cells.length; i++) {
        if (mouseIsPressed) {

            var mouse = createVector(mouseX, mouseY);
            //FORCE BETWEEN MOUSE AND CELLS
            var dir = p5.Vector.sub(cells[i].loc, mouse);
            dir.normalize();
            dir.setMag(0.08);
            cells[i].applyForce(dir);

        }

        var friction = cells[i].speed.copy();
        friction.mult(-1);
        friction.normalize();
        friction.mult(0.01);
        cells[i].applyForce(friction);
        cells[i].run();
    }

    arrayVirus.forEach(function(v) {
        v.draw();
        v.move();
        v.checkCollisions();
    });

}

function Cell(_m, _loc, _col) {

    //VARIBLES
    this.speed = createVector(random(-1, 1), random(-1, 1));
    this.loc = _loc || createVector(random(width), height / 2);
    this.acceleration = createVector(0, 0);
    this.mass = _m || 4;
    this.diam = this.mass * 10;
    this.intersects = false;
    this.intersectsvirus = false;
    this.maxMass = 6;
    this.agingRate = random(0.003, 0.015);
    this.col = _col || color(125);

    this.run = function() {

        this.draw();
        this.move();
        this.borders();
        this.checkCollisions();
        this.aging();
        this.mitosis();
        this.virus();
    }


    this.draw = function() {

        this.diam = this.mass * 10;
        noStroke();
        //FILL GRAY COLOUR BEFORE COLLISION
        fill(this.col);
        ellipse(this.loc.x, this.loc.y, this.diam, this.diam);

    }

    this.move = function() {

        this.speed.add(this.acceleration);
        this.loc.add(this.speed);
        this.acceleration.mult(0);
    }

    this.borders = function() {

        if (this.loc.x > width - this.diam / 2) {
            this.loc.x = width - this.diam / 2;
            this.speed.x *= -1;
        } else if (this.loc.x < this.diam / 2) {
            this.speed.x *= -1;
            this.loc.x = this.diam / 2;
        }
        if (this.loc.y > height - this.diam / 2) {
            this.speed.y *= -1;
            this.loc.y = height - this.diam / 2;
        } else if (this.loc.y < this.diam / 2) {
            this.speed.y *= -1;
            this.loc.y = this.diam / 2;
        }
    }

    this.applyForce = function(f) {
        var adjustedForce = f.copy();
        adjustedForce.div(this.mass);
        this.acceleration.add(adjustedForce);
    }

    //COLLISION FUNCTION
    this.checkCollisions = function() {

        for (var i = 0; i < cells.length; i++) {


            //DISTANCE BETWEEN THIS CELL AND CELLS
            var d = dist(this.loc.x, this.loc.y, cells[i].loc.x, cells[i].loc.y);

            //ADDING DIAMETER
            var sumr = cells[i].mass * 5 + this.mass * 5;
            if (d < sumr) {
                if (d === 0) {} else {

                    this.intersects = true;

                    //CHANGE COLOUR ON RED JUST WHEN THEY INTERSECT
                    noStroke();
                    fill(255, 0, 0);
                    ellipse(this.loc.x, this.loc.y, this.diam, this.diam);

                    //BOUNCE FORCE
                    var bounceforce = p5.Vector.sub(cells[i].loc, this.loc);
                    bounceforce.normalize();
                    //MAKE FORCE OPPOSITE
                    bounceforce.mult(-1);
                    bounceforce.setMag(0.8);
                    this.applyForce(bounceforce);
                }

            }

        }
    }

    //AGING FUNCTION
    this.aging = function() {

        //CHANCE OF PUSHING NEW CELL
        var chance = random(1) * 100;
        this.mass = this.mass + this.agingRate;

        //SPLICE FUNCTION WHEN CELLS REACHED maxMass
        if (this.mass > this.maxMass) {
            cells.splice(cells.indexOf(this), 1);

            //MAKING 55% OF CHANCE TO PUSH NEW CELLS
            if (chance < 55) {
                cells.push(this.mitosis());
                cells.push(this.mitosis());

            }
        }
    }

    // DIVISION OF CELLS
    this.mitosis = function() {

        //SETUP TEMP CELL'S LOCATION
        var newLoc = this.loc.copy();
        //CREATING NEW TEMP CELL
        var tempCell = new Cell(this.mass / 3, newLoc);
        return tempCell;
    }

    this.virus = function() {

        this.intersectsvirus = false;
        for (var i = 0; i < arrayVirus.length; i++) {

            var d = this.loc.dist(arrayVirus[i].loc);

            if (d < this.diam / 2 + arrayVirus[i].diam / 2) {

                cells.splice(cells.indexOf(this), 1);
                arrayVirus.splice(arrayVirus[i], 1);

            }

        }

    }
}
