
let gamepadButtonMap = {
  0: { buttonName: 'b', gameFunction: 'kick' },
  1: { buttonName: 'a', gameFunction: 'throw' },
  2: { buttonName: 'y', gameFunction: 'punch' },
  3: { buttonName: 'x', gameFunction: 'throw' },
  4: { buttonName: 'l', gameFunction: 'L' },
  5: { buttonName: 'r', gameFunction: 'R' },
  8: { buttonName: 'select', gameFunction: 'select' },
  9: { buttonName: 'start', gameFunction: 'start' },
  12: { buttonName: 'up', gameFunction: 'jump' },
  13: { buttonName: 'down', gameFunction: 'crouch' },
  14: { buttonName: 'left', gameFunction: 'left' },
  15: { buttonName: 'right', gameFunction: 'right' },
};

currentlyPressedButtons = [];

window.addEventListener("gamepaddisconnected", (e) => {
	console.error("Gamepad " + e.gamepad.index + " disconnected!");
});

gamepadPollingInterval = null;
userGamepad = null;

if (!('ongamepadconnected' in window)) {
	gamepadPollingInterval = setInterval(checkForNewGamepads, 250);
}

function buttonDown(b) {
	if (typeof (b) == "object") {
		return b.pressed;
	}
	return b == 1.0;
}
function monitorUserGamepad() {
	let gamepads = navigator.getGamepads ? navigator.getGamepads() : (navigator.webkitGetGamepads ? navigator.webkitGetGamepads : []);
	if (!gamepads) {
		return;
	}
	var gp = gamepads[0];
	gp && gp.buttons.map((button, i) => {
		let type = gamepadButtonMap[i] ? gamepadButtonMap[i].gameFunction : null;
		if (buttonDown(button)) {
			if (!currentlyPressedButtons.includes(i)) {
				currentlyPressedButtons.push(i);
				console.log(currentlyPressedButtons);
				if (type === 'jump') { pressUp() };
				if (type === 'crouch') { pressDown() };
				if (type === 'left') { pressLeft() };
				if (type === 'right') { pressRight() };
				if (type === 'punch') { pressPunch() };
				if (type === 'kick') { pressKick() };
				if (type === 'throw') { 
					if (player.weapon === 'knife') {
						player.throw('knife');
						if (nesPanel) {
							nesPanel.throwKnob.tint = 0x009900;
						}
						player.weapon = '';
						if (player.ducking) {
							player.sprite.texture = PIXI.utils.TextureCache[player.character + 'duckpunch'];
						} else {
							player.sprite.texture = PIXI.utils.TextureCache[player.character + 'punch'];
						}
						setTimeout(function() {
							if (nesPanel) {
								nesPanel.toggleThrow('off');
							}
			
							if (player.ducking) {
								player.sprite.texture = PIXI.utils.TextureCache[player.character + 'duckpunchstance'];
							} else {
								player.sprite.texture = PIXI.utils.TextureCache[player.character + 'stance'];
							}
						}, 100);
					}
				};
				if (type === 'start') { pressPunch() };
			}
		} else {
			if (currentlyPressedButtons.includes(i)) {
				if (type === 'jump') { releaseUp() };
				if (type === 'crouch') { releaseDown() };
				if (type === 'left') { releaseLeft() };
				if (type === 'right') { releaseRight() };
				if (type === 'punch' || type === 'start') { releasePunch() };
				if (type === 'kick') { releaseKick() };
				currentlyPressedButtons.splice(currentlyPressedButtons.indexOf(i), 1);
				console.log(currentlyPressedButtons);
			}
		}
	});
}

function checkForNewGamepads() {
	var gamepads = navigator.getGamepads ? navigator.getGamepads() : (navigator.webkitGetGamepads ? navigator.webkitGetGamepads : []);
	for (var i = 0; i < gamepads.length; i++) {
		var gp = gamepads[i];
		if (gp) {
			console.log("Gamepad connected at index " + gp.index + ": " + gp.id +
				". It has " + gp.buttons.length + " buttons and " + gp.axes.length + " axes.");
			userGamepad = gp;
			clearInterval(gamepadPollingInterval);
		}
	}
}