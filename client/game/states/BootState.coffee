class @BootState extends Phaser.State
  constructor: -> super

  preload: ->
    @game.load.image("preloader", "loader.png")

  create: ->
    # Put any game/screen configuration logic here
    switch
      when @game.device.desktop
        ;
      when @game.device.android
        ;
      when @game.device.iOS
        ;
      when @game.device.linux
        ;
      when @game.device.macOS
        ;

    @game.state.start "Preloader", true, false
