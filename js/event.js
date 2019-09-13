var pressingUp, pressingDown, pressingLeft, pressingRight, pressingPunch, pressingJump, pressingKick;
var touches = [];
var touchingDPad = false;

const moveSelector = (direction) => {
  let currentSelectedIndex = 0;
  let newIndex = 0;
  let buttonArray = Array.from(document.getElementsByClassName('title-button'));
  buttonArray.map((but, i, arr) => {
    if (but.classList.contains('selected')) {
      currentSelectedIndex = i;
    }
  });
  if (direction > 0) {
    newIndex = currentSelectedIndex + 1 < buttonArray.length ? currentSelectedIndex + 1 : 0
  } else {
    newIndex = currentSelectedIndex - 1 >= 0 ? currentSelectedIndex - 1 : buttonArray.length - 1
  }
  buttonArray.map((but, i, arr) => {
    if (i === newIndex) {
      but.classList.add('selected')
    } else {
      but.classList.remove('selected');
    }
  });
}
const chooseTitleSelection = () => {
  let selected = document.querySelector('.title-button.selected').innerText.toLowerCase();
  if (selected === 'start!') {
    callModeSelectScreen();
    clearTitle();
  }
  if (selected === 'top fighters') {
    toggleHighScores();
  }
  if (selected === 'options') {
    toggleOptionsScreen();
  }
}
touchStart = function(event) {
  // event.preventDefault();
  touchingDPad = true;
  var touch = {
    id: event.changedTouches[0].identifier || 0,
    pos: { x: event.changedTouches[0].clientX, y: event.changedTouches[0].clientY }
  };
  // if (touch.pos.x < gameWidth/2 && touch.pos.y > gameHeight && !touches.length) {
  if (!touches.length) {
    touches.push(touch);
  }
};
touchMove = function(event) {
  // event.preventDefault();
  if (touches.length) {
    touches[0].pos = { x: event.changedTouches[0].clientX, y: event.changedTouches[0].clientY };
  }
};
touchEnd = function(event) {
  // event.preventDefault();
  var touch = { x: event.changedTouches[0].clientX, y: event.changedTouches[0].clientY };
  if (nesPanel.upButton.containsPoint(touch)) {
    releaseUp();
  }
  if (nesPanel.downButton.containsPoint(touch)) {
    releaseDown();
  }
  if (nesPanel.leftButton.containsPoint(touch)) {
    releaseLeft();
  }
  if (nesPanel.rightButton.containsPoint(touch)) {
    releaseRight();
  }
  if (nesPanel.upLeftButton.containsPoint(touch)) {
    releaseUp();
    releaseLeft();
  }
  if (nesPanel.upRightButton.containsPoint(touch)) {
    releaseUp();
    releaseRight();
  }
  if (nesPanel.downLeftButton.containsPoint(touch)) {
    releaseDown();
    releaseLeft();
  }
  if (nesPanel.downRightButton.containsPoint(touch)) {
    releaseDown();
    releaseRight();
  }
  touchingDPad = false;
  touches.length = 0;
};

let dPadArea = document.getElementById('d-pad-touch-area');
dPadArea.addEventListener('touchstart', touchStart, { passive: true });
dPadArea.addEventListener('touchmove', touchMove, { passive: true });
dPadArea.addEventListener('touchend', touchEnd, { passive: true });

document.onkeydown = function(event) {
  let letter = event.key;
  if (!pressingUp && letter === gameOptions.actionKeys['JUMP']) {
    pressUp();
  }
  if (!pressingDown && letter === gameOptions.actionKeys['CROUCH']) {
    pressDown();
  }
  if (!pressingLeft && letter === gameOptions.actionKeys['WALK LEFT']) {
    pressLeft();
  }
  if (!pressingRight && letter === gameOptions.actionKeys['WALK RIGHT']) {
    pressRight();
  }
  if (letter === gameOptions.actionKeys['THROW WEAPON']) {
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
  }
  if (!pressingPunch && letter === gameOptions.actionKeys['PUNCH/WEAPON']) {
    pressPunch();
  }
  if (!pressingKick && letter === gameOptions.actionKeys['KICK']) {
    pressKick();
  }
  if (editingKeyForAction) {
    if (letter.toUpperCase() === 'ESCAPE') {
      dismissKeyEditModal();
    } else {
      gameOptions.actionKeys[editingKeyForAction] = letter;
      refreshKeyDisplay();
      dismissKeyEditModal();
    }
  } else {
    // if (!gameInitiaed && !document.getElementById('cinematic').classList.contains('hidden')) {
    //   document.getElementById('cinematic').classList.add('hidden');
    //   gameInitiated = true;
    // }
  }
};

document.onkeyup = function(event) {
  let letter = event.key;
  if (letter === gameOptions.actionKeys['JUMP']) {
    releaseUp();
  }
  if (letter === gameOptions.actionKeys['CROUCH']) {
    releaseDown();
  }
  if (letter === gameOptions.actionKeys['WALK LEFT']) {
    releaseLeft();
  }
  if (letter === gameOptions.actionKeys['WALK RIGHT']) {
    releaseRight();
  }
  if (letter === gameOptions.actionKeys['PUNCH/WEAPON']) {
    releasePunch();
  }
  if (letter === gameOptions.actionKeys['KICK']) {
    releaseKick();
  }
};

function pressRight() {
  if (nesPanel) {
    nesPanel.rightButton.tint = 0xaaffaa;
  }
  pressingRight = true;
  if (document.getElementById('title-screen').classList.contains('hidden') && !(player.level.direction === 'left' && player.fightingBoss && Math.abs(player.sprite.x - player.level.boss.sprite.x) < tileSize * 4) && counter > introTime + walkupTime && player.sprite.scale.x < 0) {
    player.sprite.scale.x *= -1;
  }
  if (!player.ducking && !player.grippers.length) {
    player.stance = false;
    player.beganMove = counter;
  }
}
function releaseRight() {
  if (nesPanel) {
    nesPanel.rightButton.tint = nesPanel.rightButton.origTint;
  }
  pressingRight = false;
}
function pressLeft() {
  if (nesPanel) {
    nesPanel.leftButton.tint = 0xaaffaa;
  }
  pressingLeft = true;

  if (document.getElementById('title-screen').classList.contains('hidden') && !(player.level.direction === 'right' && player.fightingBoss && Math.abs(player.sprite.x - player.level.boss.sprite.x) < tileSize * 4) && counter > introTime + walkupTime && player.sprite.scale.x > 0) {
    player.sprite.scale.x *= -1;
  }
  if (!player.ducking) {
    player.stance = false;
    player.beganMove = counter;
  }
}
function releaseLeft() {
  if (nesPanel) {
    nesPanel.leftButton.tint = nesPanel.leftButton.origTint;
  }
  pressingLeft = false;
}
function pressUp() {
  if (nesPanel) {
    nesPanel.upButton.tint = 0xaaffaa;
    // nesPanel.depressButton(nesPanel.upButton)
  }
  if (document.getElementById('title-screen').classList.contains('hidden') && !player.grippers.length && !player.punching && !player.kicking && player.sprite.y === player.level.groundY) {
    player.beganJump = counter;
  }
  pressingUp = true;
  if (!document.getElementById('title-screen').classList.contains('hidden')) {
    // selector.move(-1);
    moveSelector(-1);
  }
}
function releaseUp() {
  if (nesPanel) {
    nesPanel.upButton.tint = nesPanel.upButton.origTint;
  }
  pressingUp = false;
}
function pressDown() {
  if (nesPanel) {
    nesPanel.downButton.tint = 0xaaffaa;
  }
  if (document.getElementById('title-screen').classList.contains('hidden') && player.sprite.y === player.level.groundY) {
    player.beganDuck = counter;
    player.ducking = true;
  }
  if (!document.getElementById('title-screen').classList.contains('hidden')) {
    // selector.move(1);
    moveSelector(1);
  }
  pressingDown = true;
}
function releaseDown() {
  if (nesPanel) {
    nesPanel.downButton.tint = nesPanel.downButton.origTint;
  }
  player.endedDuck = counter;
  player.ducking = false;
  pressingDown = false;
}
function pressJump() {
  if (nesPanel) {
    nesPanel.upButton.tint = 0xaaffaa;
  }
  if (!player.grippers.length && player.sprite.y === player.level.groundY) {
    player.beganJump = counter;
  }
  pressingJump = true;
}
function releaseJump() {
  if (nesPanel) {
    nesPanel.upButton.tint = nesPanel.upButton.origTint;
  }
  pressingJump = false;
}
function pressPunch() {
  if (nesPanel) {
    // nesPanel.punchButton.tint = 0xaaffaa
    nesPanel.punchButton.texture = PIXI.utils.TextureCache['nesbuttonpressed'];
    nesPanel.punchLabel.scale.x = nesPanel.punchLabel.origScale.x * 0.9;
    nesPanel.punchLabel.scale.y = nesPanel.punchLabel.origScale.y * 0.9;
  }
  player.beganPunch = counter;
  player.punching = true;
  pressingPunch = true;
  let titleShowing = !document.getElementById('title-screen').classList.contains('hidden')
  && !document.getElementById('mode-select-screen').style.display
  && document.getElementById('options-screen').classList.contains('hidden')
  && !document.getElementById('controls-hint').classList.contains('showing');
  if (titleShowing) {
    // selector.chooseSelection();
    chooseTitleSelection();
  }
  if (!gameInitiated && !document.getElementById('cinematic').classList.contains('hidden')) {
    skipTextOrNextSlide();
  }
}
function releasePunch() {
  if (nesPanel) {
    // nesPanel.punchButton.tint = 0xffffff
    nesPanel.punchButton.texture = PIXI.utils.TextureCache['nesbutton'];
    nesPanel.punchLabel.scale.x = nesPanel.punchLabel.origScale.x;
    nesPanel.punchLabel.scale.y = nesPanel.punchLabel.origScale.y;
  }
  pressingPunch = false;
}
function pressKick() {
  if (nesPanel) {
    // nesPanel.kickButton.tint = 0xaaffaa
    nesPanel.kickButton.texture = PIXI.utils.TextureCache['nesbuttonpressed'];
    nesPanel.kickLabel.scale.x = nesPanel.kickLabel.origScale.x * 0.9;
    nesPanel.kickLabel.scale.y = nesPanel.kickLabel.origScale.y * 0.9;
  }
  player.beganKick = counter;
  player.kicking = true;
  pressingKick = true;
  let titleShowing = !document.getElementById('title-screen').classList.contains('hidden')
  && !document.getElementById('mode-select-screen').style.display
  && document.getElementById('options-screen').classList.contains('hidden')
  && !document.getElementById('controls-hint').classList.contains('showing');
  if (titleShowing) {
    // selector.chooseSelection();
    chooseTitleSelection();
  }
  if (!gameInitiated && !document.getElementById('cinematic').classList.contains('hidden')) {
    skipTextOrNextSlide()
  }
}
function releaseKick() {
  if (nesPanel) {
    // nesPanel.kickButton.tint = 0xffffff
    nesPanel.kickButton.texture = PIXI.utils.TextureCache['nesbutton'];
    nesPanel.kickLabel.scale.x = nesPanel.kickLabel.origScale.x;
    nesPanel.kickLabel.scale.y = nesPanel.kickLabel.origScale.y;
  }
  pressingKick = false;
}
// document.onmousedown = function(event) {
//     if (event.button === 0) {
//         mousedown = true;
//         clicked = counter;
//     } else if (event.button === 2) {
//         RMBDown = true;
//         rightClicked = counter;
//     }
// }
// document.onmouseup = function(event) {
//     if (event.button === 0) {
//         mousedown = false;
//     } else if (event.button === 2) {
//         RMBDown = false;
//     }}
