
var game = new Phaser.Game(800, 600, Phaser.CANVAS, 'phaser-example', { preload: preload, create: create, update: update, render: render });

function preload() {

    game.load.image('space', 'assets/deep-space.jpg');
    game.load.image('bullet', 'assets/bullets.png');
    game.load.image('ship', 'assets/ship.png');
    game.load.image('asteroid1', 'assets/asteroid1.png');
    game.load.image('asteroid2', 'assets/asteroid2.png');
    game.load.image('asteroid3', 'assets/asteroid3.png');

}

var spaceship;
var cursors;
var scoreText, healthText;
var score=0, spaceshipHealth=100;
var aMaxSize=2;

var bullet;
var bullets;
var bulletTime = 0;
var asteroids;
var asteroidsSprites;

function create() {

    game.scale.fullScreenScaleMode = Phaser.ScaleManager.NO_SCALE;
    game.input.onDown.add(gofull, this);
    //  This will run in Canvas mode, so let's gain a little speed and display
    game.renderer.clearBeforeRender = false;
    game.renderer.roundPixels = true;

    //  We need arcade physics
    game.physics.startSystem(Phaser.Physics.ARCADE);

    //  A spacey background
    bg = game.add.tileSprite(0, 0, game.width, game.height, 'space');

    //the three sprites of asteroids
    asteroidsSprites = game.add.group();
    asteroidsSprites.create(-100,-100,'asteroid1'); // Group.create( x, y, key)
    asteroidsSprites.create(-100,-100,'asteroid2');
    asteroidsSprites.create(-100,-100,'asteroid3');

    // Asteroids
    asteroids = game.add.group();
    asteroids.enableBody = true;
    var a; var dim;
    for(i=0; i<10; i++){
      a = asteroids.create(game.world.randomX, game.world.randomY, asteroidsSprites.getRandom().key);
      a.body.bounce.set(1);
      a.body.collideWorldBounds = true;
      a.body.velocity.setTo(Math.random() * 300, Math.random() * 300);
      dim=(Math.random()*aMaxSize).toFixed(0); //asteroid's dimension
      a.scale.setTo(dim,dim);
      a.health = dim*2;
    }

    //  Our ships bullets
    bullets = game.add.group();
    bullets.enableBody = true;
    bullets.physicsBodyType = Phaser.Physics.ARCADE;

    //  All 40 of them
    bullets.createMultiple(40, 'bullet');
    bullets.setAll('anchor.x', 0.5);
    bullets.setAll('anchor.y', 0.5);

    //  Our player ship
    spaceship = game.add.sprite(300, 300, 'ship');
    spaceship.anchor.set(0.5);

    //  and its physics settings
    game.physics.enable(spaceship, Phaser.Physics.ARCADE);

    spaceship.body.drag.set(10);
    spaceship.body.maxVelocity.set(200);
    spaceship.health = 100;

    scoreText = game.add.text(600, 16, 'score: 0', { fontSize: '32px', fill: '#d8137e' });
    healthText = game.add.text(100, 16, 'health: 100', { fontSize: '32px', fill: '#8d3'});

    //  Game input
    cursors = game.input.keyboard.createCursorKeys();
    game.input.keyboard.addKeyCapture([ Phaser.Keyboard.SPACEBAR ]);

}

function update() {

    if (cursors.up.isDown)
    {
        game.physics.arcade.accelerationFromRotation(spaceship.rotation, 200, spaceship.body.acceleration);
    }
    else
    {
        spaceship.body.acceleration.set(0);
    }

    if (cursors.left.isDown)
    {
        spaceship.body.angularVelocity = -300;
    }
    else if (cursors.right.isDown)
    {
        spaceship.body.angularVelocity = 300;
    }
    else
    {
        spaceship.body.angularVelocity = 0;
    }

    if (game.input.keyboard.isDown(Phaser.Keyboard.SPACEBAR))
    {
        fireBullet();
    }

    //overlap(object1, object2, overlapCallback, processCallback, callbackContext) → {boolean}
    game.physics.arcade.overlap(asteroids, bullets, asteroidHit, null, this);
    game.physics.arcade.collide(asteroids, spaceship, spaceshipHit, null, this);
    game.physics.arcade.collide(asteroids, asteroids);

    screenWrap(spaceship);
    bullets.forEachExists(screenWrap, this);

}

function asteroidHit(asteroid, bullet){
  bullet.kill();
  asteroid.damage(1);
  if(asteroid.health <= 0){
    score += 10;
    scoreText.text = 'Score: '+ score;
  }
}

function spaceshipHit(spaceship, asteroid){
  //if(spaceship.health >0){
    spaceship.damage(asteroid.health * 5);
    asteroid.damage(1);
    healthText.text = 'health: ' + spaceship.health;
  //}
}

function fireBullet () {

    if (game.time.now > bulletTime)
    {
        bullet = bullets.getFirstExists(false);

        if (bullet)
        {
            bullet.reset(spaceship.body.x + 16, spaceship.body.y + 16);
            bullet.lifespan = 1500;
            bullet.rotation = spaceship.rotation;
            game.physics.arcade.velocityFromRotation(spaceship.rotation, 400, bullet.body.velocity);
            bulletTime = game.time.now + 200;
        }
    }

}

function screenWrap (sprite) {

    if (sprite.x < 0)
    {
        sprite.x = game.width;
    }
    else if (sprite.x > game.width)
    {
        sprite.x = 0;
    }

    if (sprite.y < 0)
    {
        sprite.y = game.height;
    }
    else if (sprite.y > game.height)
    {
        sprite.y = 0;
    }

}

function gofull() {

    if (game.scale.isFullScreen)
    {
        game.scale.stopFullScreen();
    }
    else
    {
        game.scale.startFullScreen();
    }

}

function render() {
  //game.debug.bodyInfo(spaceship, 32, 32);
  //game.debug.quadTree(game.physics.arcade.quadTree);
  //game.debug.cameraInfo(game.camera, 32, 500);
}
