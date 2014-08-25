class @PreloaderState extends Phaser.State
  constructor: -> super

  preload: ->
    @createPreloader()
    @loadAssets()

  createPreloader: =>
    @preloader = @game.add.sprite(200, 250, "preloader")
    @load.setPreloadSprite(@preloader)

  loadAssets: =>
    @game.load.image("logo", "phaser.png")

  create: ->
    @startMainMenu()

  startMainMenu: ->
    @game.state.start "MainMenu", true, false
