class @InGameState extends Phaser.State
  constructor: -> super

  create: ->
    text = "InGame"
    style =
      font: "65px Arial"
      fill: "#ff0044"
      align: "center"

    @ingameTitle = @game.add.text(@game.world.centerX - 100,
                                  @game.world.centerY, text, style)

    @game.add.tween(@ingameTitle)
      .to(y: Math.random() * 100, Math.random() * 2000,
      Phaser.Easing.Cubic.InOut, true, 0, Number.MAX_VALUE, true)
