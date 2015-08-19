var GRAVITY_POWER = 2,
    RADIUS_CAP    = 1;

var Body = function (opts) {
  this.mass         = opts.mass         || 1;
  this.position     = opts.position     || new Vector(0, 0);
  this.velocity     = opts.velocity     || new Vector(0, 0);
  this.acceleration = opts.acceleration || new Vector(0, 0);

  this.type         = opts.type         || 'planet';
  this.isFixed      = !!opts.isFixed;

  this.$el      = this.toSVG();
};

Body.prototype.toSVG = function () {
  var cx = GRIDSIZE * (this.position.x + 0.5),
      cy = GRIDSIZE * (this.position.y + 0.5);

  if (this.type === 'ship') {
    var r  = GRIDSIZE / 5;
  } else {
    var r  = GRIDSIZE * (4 + Math.log(this.mass, 2)) / 8;
  };

  var body = document.createElementNS('http://www.w3.org/2000/svg', 'circle');

  if (this.isFixed) {
    body.classList.add('fixed');
  }

  body.classList.add("body", this.type);

  var $body = $(body).attr("cx", cx)
                     .attr("cy", cy)
                     .attr("r",  r);

  return $body;
};

Body.prototype.updateSVG = function () {
  var cx = GRIDSIZE * (this.position.x + 0.5),
      cy = GRIDSIZE * (this.position.y + 0.5);

  if (this.type !== 'ship') {
    var r  = GRIDSIZE * (4 + Math.log(this.mass, 2)) / 8;
  };

  this.$el.attr("cx", cx)
          .attr("cy", cy)
          .attr("r",  r);

  if (this.isFixed) {
    this.$el[0].classList.add('fixed')
  } else {
    this.$el[0].classList.remove('fixed');
  };
};


Body.prototype.calculateNextAcceleration = function (bodies) {
  if (this.isFixed) {
    this.velocity = new Vector(0, 0);
    this.acceleration = new Vector(0, 0);
    return;
  }

  var thisBody = this;

  for (var i = 0; i < bodies.length; i++) {
    var body      = bodies[i];

    if (thisBody !== body && body.type === 'planet') {
      var radius    = Math.max(RADIUS_CAP, Vector.distance(thisBody.position, body.position)),
          gravity   = body.mass / (Math.pow(radius, GRAVITY_POWER)),
          direction = Vector.subtract(body.position, thisBody.position);

      var force = direction.normalize().multiply(gravity);

      thisBody.acceleration.add(force);
    }
  };
}

Body.prototype.calculateNextVelocity = function () {
  this.velocity.add(this.acceleration.multiply(1 / TICKCOUNT));
};

Body.prototype.calculateNextPosition = function () {
  this.position.add(this.velocity);
};

Body.updateSystem = function (bodies) {
  for (var i = 0; i < bodies.length; i++) {
    bodies[i].calculateNextAcceleration(bodies);
    bodies[i].calculateNextVelocity();
  };

  for (var i = 0; i < bodies.length; i++) {
    bodies[i].calculateNextPosition();
  };
};
