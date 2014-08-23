Template.game.game = ->
	game = new Phaser.Game(800, 600, Phaser.CANVAS, "game")
	game.state.add "Boot", new BootState, false
	game.state.add "Preloader", new PreloaderState, false
	game.state.add "MainMenu", new MainMenuState, false
	game.state.add "InGame", new InGameState, false

	game.state.start "Boot"

	return