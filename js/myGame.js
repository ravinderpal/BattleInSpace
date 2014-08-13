
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
    game.add.tileSprite(0, 0, game.width, game.height, 'space');

    //the three sprites of asteroids
    asteroidsSprites = game.add.group();
    asteroidsSprites.create(-100,-100,'asteroid1'); // Group.create( x, y, key)
    asteroidsSprites.create(-100,-100,'asteroid2');
    asteroidsSprites.create(-100,-100,'asteroid3');

    // Asteroids
    asteroids = game.add.group();
    asteroids.enableBody = true;
    asteroids.physicsBodyType = Phaser.Physics.ARCADE;
    for(i=0; i<20; i++)
      asteroids.create(i*50,100,asteroidsSprites.getRandom().key);
    asteroids.setAll('health', 3);



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
    spaceship.body.maxVelocity.set(150);

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

    screenWrap(spaceship);

    bullets.forEachExists(screenWrap, this);

    game.physics.arcade.overlap(asteroids, bullets, asteroidHit, null, this);

}

function asteroidHit(asteroid, bullet){
  bullet.kill();
  asteroid.damage(1);
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
            bulletTime = game.time.now + 50;
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
  game.debug.spriteCoords(spaceship, 32, 32);
}
