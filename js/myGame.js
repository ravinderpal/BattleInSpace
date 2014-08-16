// Singh Ravinder Pal
//
var game = new Phaser.Game(800, 600, Phaser.CANVAS, 'phaser-example', { preload: preload, create: create, update: update, render: render });

function preload() {

    game.load.image('space', 'assets/deep-space.jpg');
    game.load.image('bullet', 'assets/bullets.png');
    game.load.image('ship', 'assets/ship.png');
    game.load.image('asteroid1', 'assets/asteroid1.png');
    game.load.image('asteroid2', 'assets/asteroid2.png');
    game.load.image('asteroid3', 'assets/asteroid3.png');
    game.load.spritesheet('explosion', 'assets/explode.png', 128, 128, 10);

}

var spaceship;
var cursors;
var scoreText, healthText;
var score=0, spaceshipHealth=50;
var aMaxSize=2;
var nAsteroids=10;
var aSpeed=200;
var spaceHeight = 1000, spaceWidth = 800;

var bullet;
var bullets;
var bulletTime = 0;
var asteroids;
var asteroidsSprites;
var aAlive;
function create() {

    game.scale.fullScreenScaleMode = Phaser.ScaleManager.NO_SCALE;
    game.input.onDown.add(gofull, this);
    //  This will run in Canvas mode, so let's gain a little speed and display
    game.renderer.clearBeforeRender = false;
    game.renderer.roundPixels = true;


    bg = game.add.tileSprite(0, 0, spaceHeight, spaceWidth, 'space');
    game.world.setBounds(0, 0, spaceHeight, spaceWidth);
    //  We need arcade physics
    game.physics.startSystem(Phaser.Physics.ARCADE);

    //  A spacey background

    //the three sprites of asteroids
    asteroidsSprites = game.add.group();
    asteroidsSprites.create(-100,-100,'asteroid1'); // Group.create( x, y, key)
    asteroidsSprites.create(-100,-100,'asteroid2');
    asteroidsSprites.create(-100,-100,'asteroid3');

    // Asteroids
    asteroids = game.add.group();
    asteroids.enableBody = true;
    for(i=0; i<nAsteroids; i++){
      a = asteroids.create(game.world.randomX, game.world.randomY, asteroidsSprites.getRandom().key);
      a.body.bounce.set(1);
      a.body.collideWorldBounds = true;
      a.body.velocity.setTo(Math.random() * aSpeed, Math.random() * aSpeed);
      dim=(Math.random() * aMaxSize) + 0.5; //asteroid's dimension
      a.scale.setTo(dim, dim);
      a.health = dim * 2;
    }

    //  Ship's bullets
    bullets = game.add.group();
    bullets.enableBody = true;
    bullets.physicsBodyType = Phaser.Physics.ARCADE;
    bullets.createMultiple(40, 'bullet');
    bullets.setAll('anchor.x', 0.5);
    bullets.setAll('anchor.y', 0.5);

    //  Player's ship
    spaceship = game.add.sprite(game.world.centerX, game.world.centerY, 'ship');
    spaceship.anchor.set(0.5);
    game.physics.enable(spaceship, Phaser.Physics.ARCADE);
    spaceship.body.collideWorldBounds = true;
    spaceship.body.bounce.set(1);
    //  and its physics settings
    spaceship.body.drag.set(100);
    spaceship.body.maxVelocity.set(200);
    //spaceship.health = spaceshipHealth;
    game.camera.follow(spaceship);
    //game.camera.deadzone = new Phaser.Rectangle(200, 200, 500, 300);
    scoreText = game.add.text(600, 16, 'score: 0', { fontSize: '32px', fill: '#d8137e' });
    healthText = game.add.text(100, 16, 'health: '+spaceshipHealth, { fontSize: '32px', fill: '#8d3'});
    aAlive = game.add.text(100, 50, 'Asteroids left: ', { fontSize: '32px', fill: '#8d3'});

    //  Game input
    cursors = game.input.keyboard.createCursorKeys();
    game.input.keyboard.addKeyCapture([ Phaser.Keyboard.SPACEBAR ]);

}

function update() {
    aAlive.text = "Asteroids left: "+asteroids.total;
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
        spaceship.body.angularVelocity = -200;
    }
    else if (cursors.right.isDown)
    {
        spaceship.body.angularVelocity = 200;
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

    //screenWrap(spaceship);
    //bullets.forEachExists(screenWrap, this);

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
    spaceshipHealth -= asteroid.health * 5;
    asteroid.damage(1);
    if(spaceshipHealth <=0){
      spaceshipHealth=0;
      spaceship.loadTexture('explosion', 0);
      spaceship.animations.add('explode');
      spaceship.animations.play('explode', 25, false, true);
    }
    healthText.text = 'health: ' + spaceshipHealth.toFixed(0);
}

function fireBullet () {

    if (game.time.now > bulletTime)
    {
        bullet = bullets.getFirstExists(false);

        if (bullet)
        {
            bullet.reset(spaceship.body.x + 16, spaceship.body.y + 16);
            bullet.lifespan = 2000;
            bullet.rotation = spaceship.rotation;
            game.physics.arcade.velocityFromRotation(spaceship.rotation, 400, bullet.body.velocity);
            bulletTime = game.time.now + 120;
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
  //game.debug.bodyInfo(asteroids, 32, 32);
  //game.debug.quadTree(game.physics.arcade.quadTree);
  //game.debug.cameraInfo(game.camera, 32, 500);
}
