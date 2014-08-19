// Singh Ravinder Pal
// Battle In Space

var game = new Phaser.Game(1200, 700, Phaser.CANVAS, 'phaser-example', { preload: preload, create: create, update: update, render: render });

function preload() {

  game.load.image('space', 'assets/deep-space.jpg');
  game.load.image('bullet', 'assets/bullets.png');
  game.load.image('ship', 'assets/ship.png');
  game.load.image('asteroid1', 'assets/asteroid1.png');
  game.load.image('asteroid2', 'assets/asteroid2.png');
  game.load.image('asteroid3', 'assets/asteroid3.png');
  game.load.spritesheet('explosion', 'assets/explode.png', 128, 128, 10);
  game.load.image('fullscreen', 'assets/fsIcon.jpg');

  game.load.audio('spaceMusic', 'assets/spaceMusic.mp3');
  game.load.audio('shipExplosion', 'assets/explode1.wav');
  game.load.audio('shot', 'assets/pistol.wav');

}

var spaceship;
var cursors;
var scoreText, healthText;
var score=0, spaceshipHealth=100;
var aMaxSize=1;
var nAsteroids=50;
var aSpeed=300;
var spaceHeight = 1500, spaceWidth = 1500;
var shipExplosion, shipShot;

var bullet;
var bullets;
var bulletTime = 0;
var asteroids;
var asteroidsSprites;
var aAlive;
function create() {

  //SCREEN SETTINGS
  game.scale.scaleMode = Phaser.ScaleManager.SHOW_ALL;
  game.scale.pageAlignHorizontally = true;
  game.scale.pageAlignVertically = true;
  game.scale.setScreenSize(true);
  game.scale.fullScreenScaleMode = Phaser.ScaleManager.SHOW_ALL;

  bg = game.add.tileSprite(0, 0, spaceHeight, spaceWidth, 'space');
  game.world.setBounds(0, 0, spaceHeight, spaceWidth);
  game.physics.startSystem(Phaser.Physics.ARCADE);
  //  This will run in Canvas mode, so let's gain a little speed and display
  game.renderer.clearBeforeRender = false;
  game.renderer.roundPixels = true;

  //the three sprites of asteroids
  asteroidsSprites = game.add.group();
  asteroidsSprites.create(-100,-100,'asteroid1'); // Group.create( x, y, key)
  asteroidsSprites.create(-100,-100,'asteroid2');
  asteroidsSprites.create(-100,-100,'asteroid3');

  //  Player's ship
  spaceship = game.add.sprite(game.world.centerX, game.world.centerY, 'ship');
  spaceship.anchor.set(0.5);
  game.physics.enable(spaceship, Phaser.Physics.ARCADE);
  spaceship.body.collideWorldBounds = true;
  spaceship.body.bounce.set(1);
  spaceship.body.drag.set(100);
  spaceship.body.maxVelocity.set(200);
  game.camera.follow(spaceship);
  //game.camera.deadzone = new Phaser.Rectangle(200, 200, 500, 300);

  //  Ship's bullets
  bullets = game.add.group();
  bullets.enableBody = true;
  bullets.physicsBodyType = Phaser.Physics.ARCADE;
  bullets.createMultiple(40, 'bullet');
  bullets.setAll('anchor.x', 0.5);
  bullets.setAll('anchor.y', 0.5);

  // ASTEROIDS
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

  // SCORE, HEALTH, AND ASTEROIDS LEFT TEXTS
  scoreText = game.add.text(600, 16, 'Score: 0', { fontSize: '32px', fill: '#d8137e' });
  scoreText.fixedToCamera = true;
  healthText = game.add.text(100, 16, 'Health: '+spaceshipHealth, { fontSize: '32px', fill: '#a7369e'});
  healthText.fixedToCamera = true;
  aAlive = game.add.text(100, 50, 'Asteroids left: ', { fontSize: '32px', fill: '#c6338d'});
  aAlive.fixedToCamera = true;

  //  Game input
  cursors = game.input.keyboard.createCursorKeys();
  game.input.keyboard.addKeyCapture([ Phaser.Keyboard.SPACEBAR ]);

  // AUDIO SYSTEM
  shipExplosion = game.add.audio('shipExplosion', 1);
  shipShot = game.add.audio('shot', 1);
  music = game.add.audio('spaceMusic', 1, true);
  music.play('', 0, 1, true);
  music.loop = true;

  fsButton = game.add.button(20, 20, 'fullscreen', actionOnClick);
  fsButton.fixedToCamera = true;
  fsButton.visible=true;
}

function update() {
  aAlive.text = "Asteroids left: "+asteroids.total;
  if(spaceship.alive === true){
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
      if(!shipShot.isPlaying)
        shipShot.play('', 0, 0.1);
    }
    if (game.input.keyboard.justReleased(Phaser.Keyboard.SPACEBAR))
    {
      shipShot.stop();
    }
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
    scoreText.text = 'Score: '+ score.toFixed(0);
  }
}

function spaceshipHit(spaceship, asteroid){
  spaceshipHealth -= asteroid.health * 5;
  score -= asteroid.health * 2;
  asteroid.damage(1);
  if(spaceshipHealth <=0){
    spaceshipHealth=0;
    spaceship.loadTexture('explosion', 0);
    spaceship.animations.add('explode');
    //                   play(name, frameRate, loop, killOnComplete)
    spaceship.animations.play('explode', 20, false, true);
    shipShot.loop=false;
    shipExplosion.play('', 0, 1, false);
  }
  healthText.text = 'Health: ' + spaceshipHealth.toFixed(0);
  scoreText.text = 'Score: ' + score.toFixed(0);
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

function actionOnClick() {
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
  //game.debug.text('Click / Tap to go fullscreen', 270, 16);
}
