// Singh Ravinder Pal


var game = new Phaser.Game(1300, 700, Phaser.CANVAS, 'phaser-example', { preload: preload, create: create, update: update, render: render });

function preload() {

  game.load.image('space', 'assets/campo.jpg');
  game.load.image('bullet', 'assets/ball.png');
  game.load.image('ship', 'assets/coach.png');
  game.load.image('asteroid1', 'assets/davide.png');
  game.load.image('asteroid2', 'assets/marta.png');
  game.load.image('asteroid3', 'assets/diego.png');
  game.load.spritesheet('explosion', 'assets/explode.png', 128, 128, 10);
  game.load.image('fullscreen', 'assets/fsIcon.jpg');
  game.load.image('restart', 'assets/restart.png');

  //gamepad buttons
  game.load.spritesheet('buttonhorizontal', 'assets/buttons-big/button-horizontal.png',96,64);
  game.load.spritesheet('buttonvertical', 'assets/buttons-big/button-vertical.png',64,64)
  game.load.spritesheet('buttonfire', 'assets/buttons-big/button-round-a.png',96,96);

  // AUDIO SYSTEM
  game.load.audio('spaceMusic', 'assets/spaceMusic.mp3');
  game.load.audio('shipExplosion', 'assets/explode1.wav');
  game.load.audio('shot', 'assets/shotgun.wav');

  //SCREEN SETTINGS
  game.scale.scaleMode = Phaser.ScaleManager.SHOW_ALL;
  game.scale.pageAlignHorizontally = true;
  game.scale.pageAlignVertically = true;
  game.scale.setScreenSize(true);
  game.scale.fullScreenScaleMode = Phaser.ScaleManager.SHOW_ALL;

}

var score=0, spaceshipHealth = totHealth = 100;
var aMaxSize=0.5, nAsteroids=30, aSpeed=300;
var spaceHeight = 1424, spaceWidth = 852;
var bulletTime = 0;
var left=false, right=false, up=false, fire=false;

function create() {

  background = game.add.tileSprite(0, 0, spaceHeight, spaceWidth, 'space');
  game.world.setBounds(0, 0, spaceHeight, spaceWidth);
  game.physics.startSystem(Phaser.Physics.ARCADE);
  //  This will run in Canvas mode, so let's gain a little speed and display
  game.renderer.clearBeforeRender = false;
  game.renderer.roundPixels = true;

  //  PLAYER'S SHIP
  generateSpaceship();

  //  SHIP BULLETS
  bullets = game.add.group();
  bullets.enableBody = true;
  bullets.physicsBodyType = Phaser.Physics.ARCADE;
  bullets.createMultiple(40, 'bullet');
  bullets.setAll('anchor.x', 0);
  bullets.setAll('anchor.y', 0);

  // ASTEROIDS
  generateAsteroids();

  // SCORE, HEALTH, AND ASTEROIDS-ALIVE TEXTS
  scoreText = game.add.text(100, 60, 'Score: 0', { fontSize: '32px', fill: '#fd0' });
  scoreText.fixedToCamera = true;
  healthText = game.add.text(100, 20, 'Health: ' + spaceshipHealth, { fontSize: '32px', fill: '#fd0'});
  healthText.fixedToCamera = true;
  aAlive = game.add.text(100, 100, 'Students alive: ', { fontSize: '32px', fill: '#fd0'});
  aAlive.fixedToCamera = true;

  //  GAME INPUT
  cursors = game.input.keyboard.createCursorKeys();
  game.input.keyboard.addKeyCapture([ Phaser.Keyboard.SPACEBAR ]);

  // AUDIO SYSTEM
  shipExplosion = game.add.audio('shipExplosion', 1);
  shipShot = game.add.audio('shot', 1);
  music = game.add.audio('spaceMusic', 1, true);
  music.play('', 0, 1, true);
  music.loop = true;

  // BUTTONS
  btFullscreen = game.add.button(20, 20, 'fullscreen', actionOnClick);
  btFullscreen.fixedToCamera = true;
  btRestart = game.add.button(1100, 20, 'restart', restartGame);
  btRestart.fixedToCamera = true;
  if(!game.device.desktop){
    game.scale.scaleMode = Phaser.ScaleManager.EXACT_FIT;
  game.input.onDown.add(gofull, this);
  // create our virtual GAME CONTROL BUTTONS

  }
}


function update() {
  aAlive.text = "Students alive: "+asteroids.total;
  if(spaceship.alive === true){
    if (cursors.up.isDown || up)
    {
      game.physics.arcade.accelerationFromRotation(spaceship.rotation, 200, spaceship.body.acceleration);
    }
    else
    {
      spaceship.body.acceleration.set(0);
    }

    if (cursors.left.isDown || left)
    {
      spaceship.body.angularVelocity = -200;
    }
    else if (cursors.right.isDown || right)
    {
      spaceship.body.angularVelocity = 200;
    }
    else
    {
      spaceship.body.angularVelocity = 0;
    }

    if (game.input.keyboard.isDown(Phaser.Keyboard.SPACEBAR) || fire)
    {
      fireBullet();
      if(!shipShot.isPlaying)
        shipShot.play('', 0, 0.3);
    }
    if (game.input.keyboard.justReleased(Phaser.Keyboard.SPACEBAR))
    {
      shipShot.stop();
    }
  }

  healthText.text = 'Health: ' + spaceshipHealth.toFixed(0);
  scoreText.text = 'Score: ' + score.toFixed(0);
  //overlap(object1, object2, overlapCallback, processCallback, callbackContext) → {boolean}
  game.physics.arcade.overlap(asteroids, bullets, asteroidHit, null, this);
  game.physics.arcade.collide(asteroids, spaceship, spaceshipHit, null, this);

  /*
  screenWrap(spaceship);
  bullets.forEachExists(screenWrap, this);
  asteroids.forEachExists(screenWrap, this);
  */
}

function generateSpaceship(){
  spaceship = game.add.sprite(game.world.centerX/10, game.world.centerY, 'ship');
  //spaceship.scale.setTo(2,2);
  spaceship.anchor.set(0.5);
  game.physics.enable(spaceship, Phaser.Physics.ARCADE);
  spaceship.body.collideWorldBounds = true;
  spaceship.body.bounce.set(0.2);
  spaceship.body.maxVelocity.set(200);
  game.camera.follow(spaceship);
}

function generateAsteroids(){
  asteroids = game.add.group();
  asteroids.enableBody = true;
  for(i=0, x=0; i<nAsteroids; i++, x++){
    x%=3;
    if(x===0)a = asteroids.create(game.world.randomX, game.world.randomY, 'asteroid1');
    if(x===1)a = asteroids.create(game.world.randomX, game.world.randomY, 'asteroid2');
    if(x===2)a = asteroids.create(game.world.randomX, game.world.randomY, 'asteroid3');
    a.body.bounce.set(0.7);
    a.body.collideWorldBounds = true;
    a.body.velocity.setTo(Math.random() * aSpeed, Math.random() * aSpeed);
    dim=(Math.random() * aMaxSize) + 0.5; //asteroid's dimension
    a.scale.setTo(dim, dim);
    a.health = dim * 2;
  }
}

function asteroidHit(asteroid, bullet){
  bullet.kill();
  asteroid.damage(1);
  if(asteroid.health <= 0){
    score += 10;
  }
}

function spaceshipHit(spaceship, asteroid){
  asteroid.damage(1);
  spaceshipHealth-=5;
  if(spaceshipHealth <=0){
    spaceshipHealth=0;
    spaceship.loadTexture('explosion', 0);
    spaceship.animations.add('explode');
    //                   play(name, frameRate, loop, killOnComplete)
    spaceship.animations.play('explode', 20, false, true);
    shipShot.loop=false;
    shipExplosion.play('', 0, 1, false);
  }
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
      bulletTime = game.time.now + 250;
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

function gofull() { game.scale.startFullScreen(false);}

function restartGame(){
  score = 0;
  spaceshipHealth = totHealth;
  asteroids.destroy();
  generateAsteroids();
  spaceship.destroy();
  generateSpaceship();
}

function render() {
  //game.debug.bodyInfo(asteroids, 32, 32);
  //game.debug.quadTree(game.physics.arcade.quadTree);
  //game.debug.cameraInfo(game.camera, 32, 500);
  //game.debug.text('Click / Tap to go fullscreen', 270, 16);
}
