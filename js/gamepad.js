class UserGamepad {
	constructor(gamepadObj, mappings) {
		console.log('New UserGamepad received', gamepadObj);
		this.buttons = gamepadObj.buttons;
		this.index = gamepadObj.index;
		this.buttonMappings = new Array(gamepadObj.buttons.length);
		console.warn('but', this.buttons)
		this.currentlyPressedButtons = [];

		for (let index in mappings) {
			console.log('doing', index)
			this.buttonMappings[index] = mappings[index];
		}
	}
	currentData() {
		let gamepads = navigator.getGamepads ? navigator.getGamepads() : navigator.webkitGetGamepads ? navigator.webkitGetGamepads : [];
		return gamepads[this.index];
	}
	buttonDown(b) {
		return typeof (b) == 'object' ? b.pressed : b == 1.0; 
	}
	monitorForPresses() {
		this.currentData().buttons.map((button, i) => {
			if (this.buttonDown(button)) {
				if (!this.currentlyPressedButtons.includes(i)) {
					this.currentlyPressedButtons.push(i);
					pressButton(this.buttonMappings[i].action, i);
				}
			} else {
				if (this.currentlyPressedButtons.includes(i)) {
					releaseButton(this.buttonMappings[i].action);
					this.currentlyPressedButtons.splice(this.currentlyPressedButtons.indexOf(i), 1);
				}
			}
		});
	}
}

window.addEventListener("gamepaddisconnected", (e) => {
	console.error("Gamepad " + e.gamepad.index + " disconnected!");
	userGamepad = undefined;
	gamepadPollingInterval = setInterval(checkForNewGamepads, 1000);
	document.body.classList.remove('gamepad-connected');
});

gamepadPollingInterval = ('ongamepadconnected' in window) ? null : setInterval(checkForNewGamepads, 1000);

function checkForNewGamepads() {
	let gamepadAtIndex0 = navigator.getGamepads ? navigator.getGamepads()[0] : (navigator.webkitGetGamepads ? navigator.webkitGetGamepads[0] : [])[0];
	if (gamepadAtIndex0) {
		console.error('Gamepad connected at index', gamepadAtIndex0.index);
		document.getElementById('button-assigning').style.color = 'var(--kf-green)';
		document.getElementById('button-assigning').innerText = 'OK!';
		setTimeout(() => {
			document.getElementById('press-instructions').innerText = 'PRESS THE DESIRED BUTTON FOR';
        document.getElementById('button-assigning').style.color = 'var(--kf-light-orange';
        document.getElementById('button-assigning').innerText = assignableActions[assigningButton];
      }, 320);
		requestAnimationFrame(() => {
			userGamepad = new UserGamepad(gamepadAtIndex0, gameOptions.buttonMappings)
		});
		clearInterval(gamepadPollingInterval);
		document.body.classList.add('gamepad-connected');
	}
}