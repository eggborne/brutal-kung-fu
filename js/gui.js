let controlScreenOn = optionsScreenOn = false;
let controlTabSelected = 'keyboard';
let editingKeyForAction = false;
let scoresToDisplay = 12;
// if (landscape) {
//   scoresToDisplay = 12;
// }
let actionKeys = {
  'WALK LEFT': 'a',
  'WALK RIGHT': 'd',
  'JUMP': 'w',
  'CROUCH': 's',
  'PUNCH/WEAPON': 'j',
  'KICK': 'k',
  'THROW WEAPON': 'l'
}
function suffixedNumber(num) {
  if (num === 1) {
    return num + 'ST';
  }
  if (num === 2) {
    return num + 'ND';
  }
  if (num === 3) {
    return num + 'RD';
  }
  return num + 'TH';
}
function checkIfPressing(spr) {
  let pressing = false;
  let pressSpot = touches[0].pos;
  if (pressSpot.x > spr.x + newPixelSize && pressSpot.x < spr.x + spr.width - newPixelSize && pressSpot.y > spr.y + newPixelSize && pressSpot.y < spr.y + spr.height - newPixelSize) {
    pressing = true;
  }
  if (pressing) {
    spr.tint = 0x00ff00;
  } else {
    spr.tint = 0xff0000;
  }
  return pressing;
}
function toggleControlScreen() {
  controlScreenOn = !controlScreenOn;
  if (controlScreenOn) {
    document.getElementById('controls-screen').classList.add('showing');    
  } else {
    document.getElementById('controls-screen').classList.remove('showing');
  }
}
function toggleOptionsScreen() {
  optionsScreenOn = !optionsScreenOn;
  if (optionsScreenOn) {
    console.warn('toggleOptionsScreen hiding logos');
    document.getElementById('brutal-logo').classList.add('hidden');
    document.getElementById('kung-fu-logo').classList.add('hidden');
    document.getElementById('options-screen').classList.add('showing');    
  } else {
    console.warn('toggleOptionsScreen showing logos');
    document.getElementById('brutal-logo').classList.remove('hidden');
    document.getElementById('kung-fu-logo').classList.remove('hidden');
    document.getElementById('options-screen').classList.remove('showing');
    document.getElementById('hard-reload').classList.add('hidden');
  }
}
function callKeyEditModal(action) {
  console.log('calling callKeyEditModal with', action);
  document.getElementById('turn-phone-shade').style.display = 'flex';
  document.getElementById('key-edit-modal').innerHTML = `
    <div>
      Press the new key for<div id='modal-action-display'>${displayAction}</div>
    </div>
    <div id='modal-cancel-message'>or press ESC to cancel.</div>
  `;
  document.getElementById('key-edit-modal').classList.add('showing');
  editingKeyForAction = action;
}
function dismissKeyEditModal(action) {
  document.getElementById('turn-phone-shade').style.display = 'none';
  document.getElementById('key-edit-modal').classList.remove('showing');
  editingKeyForAction = undefined;
}
function refreshKeyDisplay() {
  console.log('refrehsing keys while editingkeysforatonhkgn', editingKeyForAction)
  let newlyAssignedKey = actionKeys[editingKeyForAction];
  Array.from(document.querySelectorAll('.key-row')).map((row, i) => {
    let action = row.children[0].innerHTML;
    let key = row.children[1].innerHTML;
    console.log('checking', action, 'found set to', key)
    if (action === editingKeyForAction) {
      if (newlyAssignedKey === ' ') {
        newlyAssignedKey = 'SPACE';
      }
      if (newlyAssignedKey.length > 1) {
        row.classList.add('long-name');
      } else {
        row.classList.remove('long-name');
        newlyAssignedKey = newlyAssignedKey.toUpperCase();

      }
      console.error('fir action', action)
      console.error('about to replace', key)
      row.children[1].innerHTML = newlyAssignedKey;
      console.error('putting a', newlyAssignedKey)
    }
  });

}
// function refreshKeyDisplay() {
//   let rowRelevant = false;
//   [...document.getElementById('keyboard-controls-grid').children].map((typeArea, t) => {
//     [...typeArea.children].map((rowMember, r) => {
//       if (rowMember.classList.contains('action-listing')) {
//         if (rowMember.innerHTML === editingKeyForAction) {
//           rowRelevant = true;
//         }
//       };
//       if (rowMember.classList.contains('key-listing')) {
//         if (rowRelevant) {
//           let displayKey = actionKeys[editingKeyForAction];
//           if (displayKey === ' ') {
//             displayKey = 'SPACE';
//           }
//           if (displayKey.length > 1) {
//             rowMember.classList.add('long-name');
//           } else {
//             rowMember.classList.remove('long-name');
//             displayKey = displayKey.toUpperCase();       
//           }
//           rowMember.innerHTML = displayKey;
//           rowMember.classList.add('just-changed');
//           setTimeout(() => {
//             rowMember.classList.remove('just-changed');
//           }, 400)
//           rowRelevant = false;
//         }
//       };      
//     })
//   })
// }
function ScoreDisplay() {
  this.lineHeight = tileSize / 2.5;
  this.xPadding = tileSize / 1.5;
  this.floorKnobs = [];
  this.container = new PIXI.Container();
  this.bg = new PIXI.Sprite(PIXI.utils.TextureCache['pixel']);
  this.bg.width = gameWidth;
  this.bg.height = level1.topEdge;
  // this.bg.tint = 0x111111;
  this.bg.tint = 0x000000;
  this.container.addChild(this.bg);
  this.scoreText = new PIXI.Text('SCORE-000000', scoreStyle);
  this.topText = new PIXI.Text('TOP-000000', scoreStyle);
  this.topText.tint = 0xb63120;
  this.scoreText.x = this.xPadding;
  this.scoreText.y = tileSize / 2;
  this.topText.x = this.bg.width - this.topText.width - this.xPadding;
  this.topText.y = tileSize / 2;
  this.playerText = new PIXI.Text('PLAYER', scoreStyle);
  this.playerText.tint = 0xb63120;
  this.playerText.x = this.xPadding;
  this.playerText.y = this.scoreText.y + this.scoreText.height + this.lineHeight;
  this.enemyText = new PIXI.Text('ENEMY', scoreStyle);
  this.enemyText.tint = 0xea9f22;
  this.enemyText.x = this.playerText.x + this.playerText.width - this.enemyText.width;
  this.enemyText.y = this.playerText.y + this.playerText.height + this.lineHeight;

  this.playerBar = new PIXI.Sprite(PIXI.utils.TextureCache['pixel']);
  this.playerBar.tint = 0xb63120;
  this.playerBar.width = this.playerBarMax = tileSize * 3;
  this.playerBar.height = this.playerText.height;
  this.playerBar.x = this.playerText.x + this.playerText.width + tileSize / 4;
  this.playerBar.y = this.playerText.y;
  this.playerBarBack = new PIXI.Sprite(PIXI.utils.TextureCache['pixel']);
  this.playerBarBack.tint = 0x9290ff;
  this.playerBarBack.width = this.playerBarMax;
  this.playerBarBack.height = this.playerBar.height;
  this.playerBarBack.x = this.playerBar.x;
  this.playerBarBack.y = this.playerBar.y;

  this.enemyBar = new PIXI.Sprite(PIXI.utils.TextureCache['pixel']);
  this.enemyBar.tint = 0xea9f22;
  this.enemyBar.width = this.enemyBarMax = this.playerBar.width;
  this.enemyBar.height = this.enemyText.height;
  this.enemyBar.x = this.enemyText.x + this.enemyText.width + tileSize / 4;
  this.enemyBar.y = this.enemyText.y;
  this.enemyBarBack = new PIXI.Sprite(PIXI.utils.TextureCache['pixel']);
  this.enemyBarBack.tint = 0x9290ff;
  this.enemyBarBack.width = this.enemyBar.width;
  this.enemyBarBack.height = this.enemyBar.height;
  this.enemyBarBack.x = this.enemyBar.x;
  this.enemyBarBack.y = this.enemyBar.y;

  this.livesIcon = new PIXI.Sprite(PIXI.utils.TextureCache['thomashead']);
  this.livesText = new PIXI.Text('-' + lives, scoreStyle);
  this.livesIcon.width = this.livesIcon.height = this.enemyBar.height;
  this.livesIcon.x = this.enemyBar.x + this.enemyBar.width + newPixelSize * 9;
  for (let f = 0; f < 5; f++) {
    let knob = new PIXI.Sprite(PIXI.utils.TextureCache['pixel']);
    knob.width = knob.height = this.playerBar.height;
    knob.tint = 0x9290ff;
    knob.x = this.livesIcon.x + f * (knob.width + this.lineHeight * 1.4);
    knob.y = this.playerBar.y;
    this.container.addChild(knob);
    if (f < 4) {
      let dash = new PIXI.Sprite(PIXI.utils.TextureCache['pixel']);
      dash.width = knob.width * 0.8;
      dash.height = knob.height / 4;
      dash.tint = 0xea9f22;
      dash.anchor.y = 0.5;
      dash.x = knob.x + knob.width + knob.width * 0.2;
      dash.y = knob.y + knob.height / 2;
      this.container.addChild(dash);
    }
    this.floorKnobs.push(knob);
  }

  this.livesText.x = this.livesIcon.x + this.livesIcon.width + newPixelSize;
  this.livesIcon.y = this.livesText.y = this.enemyBar.y;
  this.dragonIcon = new PIXI.Sprite(PIXI.utils.TextureCache['dragonhead']);
  this.dragonText = new PIXI.Text('-0', scoreStyle);
  this.dragonIcon.width = this.enemyBar.height * 2;
  this.dragonIcon.height = this.enemyBar.height;
  let lastKnob = this.floorKnobs[this.floorKnobs.length - 1];
  this.dragonText.x = lastKnob.x + lastKnob.width - this.dragonText.width;
  this.dragonIcon.x = this.dragonText.x - this.dragonIcon.width - newPixelSize;
  this.dragonIcon.y = this.dragonText.y = this.enemyBar.y;

  this.timeLabel = new PIXI.Text('TIME', scoreStyle);
  this.timeText = new PIXI.Text(levelTime, scoreStyle);
  this.timeLabel.tint = 0xb63120;
  this.timeLabel.x = this.timeText.x = gameWidth - this.timeLabel.width - this.xPadding;
  this.timeLabel.y = this.playerBar.y + newPixelSize;
  this.timeText.y = this.enemyBar.y - newPixelSize;

  this.updateScore = function(newScore) {
    let newStr = newScore.toString();
    let scoreString = '0'.repeat(6 - newStr.length) + newStr;
    this.scoreText.text = 'SCORE-' + scoreString;
    if (topScore < player.score) {
      this.topText.text = 'TOP-' + scoreString;
      topScore = player.score;
    }
    if (newScore > (livesAwarded + 1) * newLifeScore) {
      if (newScore < (livesAwarded + 2) * newLifeScore) {
        lives++;
        this.updateLives(lives);
        livesAwarded++;
      }
    }
  };
  this.updateLives = function(newAmount) {
    this.livesText.text = '-' + newAmount;
  };
  this.blinkCurrentFloor = function() {
    let box = this.floorKnobs[player.level.floor - 1];
    if (counter % 40 === 0) {
      if (box.tint === 0xea9f22) {
        box.tint = 0x9290ff;
      } else {
        box.tint = 0xea9f22;
      }
    }
  };
  this.topText.text = 'TOP-' + ('0'.repeat(6 - topScore.toString().length) + topScore);
  this.container.addChild(this.scoreText);
  this.container.addChild(this.topText);
  this.container.addChild(this.playerText);
  this.container.addChild(this.enemyText);
  this.container.addChild(this.playerBarBack);
  this.container.addChild(this.playerBar);
  this.container.addChild(this.enemyBarBack);
  this.container.addChild(this.enemyBar);
  this.container.addChild(this.livesIcon);
  this.container.addChild(this.livesText);
  this.container.addChild(this.dragonIcon);
  this.container.addChild(this.dragonText);
  this.container.addChild(this.timeLabel);
  this.container.addChild(this.timeText);
  nesContainer.addChild(this.container);
}
const nesGreen = 0x788368;
function NESPanel() {
  this.container = new PIXI.Container();
  this.controls = new PIXI.Container();
  this.bg = new PIXI.Sprite(PIXI.utils.TextureCache['pixel']);
  this.backing = new PIXI.Sprite(PIXI.utils.TextureCache['pixel']);
  this.bg.width = gameWidth;
  this.bg.height = window.innerHeight - gameHeight;
  this.bg.y = gameHeight;
  if (landscape) {
    this.bg.alpha = 0;
  } else {
    this.controls.addChild(this.backing);
  }
  this.dPad = new PIXI.Container();
  let pieceSize;
  if (!landscape) {
    pieceSize = tileSize * 2.2;
    this.pieceSize = tileSize * 2.2;
  } else {
    pieceSize = tileSize * 2;
    this.pieceSize = tileSize * 2;
  }
  this.dPadBg = new PIXI.Sprite(PIXI.utils.TextureCache['nespadbacking']);
  this.upButton = new PIXI.Sprite(PIXI.utils.TextureCache['nesup']);
  this.leftButton = new PIXI.Sprite(PIXI.utils.TextureCache['nesleft']);
  this.rightButton = new PIXI.Sprite(PIXI.utils.TextureCache['nesright']);
  this.downButton = new PIXI.Sprite(PIXI.utils.TextureCache['nesdown']);
  this.upLeftButton = new PIXI.Sprite(PIXI.utils.TextureCache['pixel']);
  this.upRightButton = new PIXI.Sprite(PIXI.utils.TextureCache['pixel']);
  this.downLeftButton = new PIXI.Sprite(PIXI.utils.TextureCache['pixel']);
  this.downRightButton = new PIXI.Sprite(PIXI.utils.TextureCache['pixel']);
  this.centerPiece = new PIXI.Sprite(PIXI.utils.TextureCache['nescenter']);
  this.dButtons = [this.upButton, this.leftButton, this.rightButton, this.downButton, this.centerPiece, this.upLeftButton, this.upRightButton, this.downLeftButton, this.downRightButton];

  for (let b = 0; b < this.dButtons.length; b++) {
    let button = this.dButtons[b];
    button.width = button.height = pieceSize;
    if (b > 4) {
      button.alpha = 0;
    } else {
      button.tint = button.origTint = 0x777777;
    }
    // button.interactive = true;
    this.dPad.addChild(button);
  }
  this.kickButton = new PIXI.Sprite(PIXI.utils.TextureCache['nesbutton']);
  this.punchButton = new PIXI.Sprite(PIXI.utils.TextureCache['nesbutton']);
  this.punchButton.width = this.punchButton.height = this.kickButton.width = this.kickButton.height = pieceSize * 1.75;
  this.punchButton.interactive = this.kickButton.interactive = true;

  this.bottomSpace = viewHeight - gameHeight;
  if (!landscape) {
    this.controls.y = gameHeight + this.bottomSpace - pieceSize * 3 - pieceSize / 2;
    this.controls.y = gameHeight + pieceSize / 2;
  }
  this.bottomMargin = pieceSize / 2;

  this.punchButton.on('pointerdown', pressPunch);
  this.kickButton.on('pointerdown', pressKick);
  this.punchButton.on('pointerup', releasePunch);
  this.punchButton.on('pointerupoutside', releasePunch);
  this.kickButton.on('pointerup', releaseKick);
  this.kickButton.on('pointerupoutside', releaseKick);

  this.controls.addChild(this.dPad);

  this.leftButton.x = 0;
  this.centerPiece.x = pieceSize;
  this.centerPiece.y = pieceSize;
  this.upButton.x = pieceSize;
  this.leftButton.y = pieceSize;
  this.rightButton.x = pieceSize * 2;
  this.rightButton.y = pieceSize;
  this.downButton.x = pieceSize;
  this.downButton.y = pieceSize * 2;

  this.upRightButton.anchor.x = this.downRightButton.anchor.x = this.downRightButton.anchor.y = this.downLeftButton.anchor.y = 1;
  this.upRightButton.x = this.downRightButton.x = this.dPad.width - this.upRightButton.width;
  this.downRightButton.y = this.downLeftButton.y = this.dPad.height - this.downRightButton.height;

  this.backing.width = this.kickButton.width * 2 + newPixelSize * 6;
  this.backing.height = this.dPad.height;
  this.backing.x = gameWidth - this.backing.width - newPixelSize * 6;
  this.backing.y = this.dPad.y;
  this.backing.tint = 0x999999;
  this.kickButton.x = this.backing.x + newPixelSize * 2;
  this.punchButton.x = this.kickButton.x + this.kickButton.width;
  this.punchButton.y = this.kickButton.y = this.backing.height - this.kickButton.height - newPixelSize;
  this.throwButton = new PIXI.Container();
  this.throwButton.interactive = true;

  this.throwBG = new PIXI.Sprite(PIXI.utils.TextureCache['whitebutton']);
  this.throwBG.tint = 0x77aa77;
  this.throwBG.anchor.x = 0.5;

  this.throwText = new PIXI.Text('THROW', scoreStyle);
  this.throwText.anchor.x = 0.5;
  this.throwText.tint = 0x0000000;

  this.throwIcon = new PIXI.Sprite(PIXI.utils.TextureCache['knife']);

  this.blockButton = new PIXI.Container();
  this.blockButton.interactive = true;

  this.blockBG = new PIXI.Sprite(PIXI.utils.TextureCache['whitebutton']);
  this.blockBG.tint = 0xaaaaaa;
  this.blockBG.anchor.x = 0.5;
  this.blockBG.width = pieceSize * 1.6;
  this.blockBG.height = pieceSize * 1.25;

  this.blockBG.x = this.kickButton.x + this.kickButton.width / 2;
  this.blockBG.y = this.backing.y - newPixelSize * 3;

  this.blockKnob = new PIXI.Sprite(PIXI.utils.TextureCache['whitebutton']);
  this.blockKnob.tint = 0xaaffaa;
  this.blockKnob.anchor.x = 0.5;
  this.blockKnob.width = pieceSize * 1.3;
  this.blockKnob.height = pieceSize;

  this.blockKnob.x = this.blockBG.x;
  this.blockKnob.y = this.blockBG.y + pieceSize * 0.1;

  this.blockText = new PIXI.Text('JUMP', scoreStyle);
  this.blockText.anchor.x = 0.5;
  this.blockText.tint = 0x0000000;
  this.blockText.x = this.blockBG.x;
  this.blockText.y = this.blockBG.y + this.blockText.height / 2 + newPixelSize * 3;
  this.blockIcon = new PIXI.Sprite(PIXI.utils.TextureCache['arrow']);
  this.blockIcon.width = newPixelSize * 16;
  this.blockIcon.height = newPixelSize * 16;
  this.blockIcon.anchor.set(0.5);
  this.blockIcon.rotation += degToRad(90);
  this.blockIcon.x = this.blockBG.x;
  this.blockIcon.y = this.blockBG.y + this.blockBG.height / 1.7 + newPixelSize;

  this.throwBG.width = this.blockBG.width;
  this.throwBG.height = this.blockBG.height;
  this.throwBG.x = this.punchButton.x + this.punchButton.width / 2;
  this.throwBG.y = this.blockBG.y;
  this.throwText.x = this.throwBG.x;
  this.throwText.y = this.blockText.y;
  this.throwIcon.width = newPixelSize * 16;
  this.throwIcon.height = newPixelSize * 8;
  this.throwIcon.anchor.x = 0.5;
  this.throwIcon.x = this.throwBG.x;
  this.throwIcon.y = this.throwBG.y + this.throwBG.height / 2 + newPixelSize;

  this.throwKnob = new PIXI.Sprite(PIXI.utils.TextureCache['whitebutton']);
  this.throwKnob.tint = 0xbbbbbb;
  this.throwKnob.anchor.x = 0.5;
  this.throwKnob.width = pieceSize * 1.3;
  this.throwKnob.height = pieceSize;
  this.throwKnob.x = this.throwBG.x;
  this.throwKnob.y = this.throwBG.y + pieceSize * 0.1;

  this.weaponIcon = new PIXI.Sprite(PIXI.utils.TextureCache['knife']);
  this.weaponIcon.width = newPixelSize * 20;
  this.weaponIcon.height = newPixelSize * 10;
  this.weaponIcon.anchor.set(0.5);
  this.weaponIcon.x = this.punchButton.x + this.punchButton.width / 2;
  this.weaponIcon.y = this.punchButton.y + this.punchButton.height / 2;
  this.upButton.type = 'up';
  this.downButton.type = 'down';
  this.leftButton.type = 'left';
  this.rightButton.type = 'right';
  this.punchButton.type = 'punch';
  this.kickButton.type = 'kick';
  // this.dPad.setChildIndex(this.centerPiece,8)
  this.controls.addChild(this.punchButton);
  this.controls.addChild(this.kickButton);
  this.throwButton.addChild(this.throwBG);
  this.throwButton.addChild(this.throwKnob);
  this.throwButton.addChild(this.throwText);
  this.throwButton.addChild(this.throwIcon);
  this.controls.addChild(this.throwButton);
  this.blockButton.addChild(this.blockBG);
  this.blockButton.addChild(this.blockKnob);
  this.blockButton.addChild(this.blockText);
  this.blockButton.addChild(this.blockIcon);
  this.controls.addChild(this.blockButton);
  this.controls.addChild(this.weaponIcon);
  this.controls.interactive = true;
  this.container.addChild(this.controls);

  if (!landscape) {
    nesContainer.addChild(this.container);
  } else {
    // controlsContainer.addChild(this.container)
  }

  this.throwButton.interactive = false;
  this.throwIcon.visible = false;
  this.throwText.visible = false;
  this.weaponIcon.visible = false;
  this.throwBG.tint = 0x999999;
  this.dPadBg.width = this.dPad.width + newPixelSize * 8;
  this.dPadBg.height = this.dPad.height + newPixelSize * 8;
  this.dPadBg.x -= newPixelSize * 4;
  this.dPadBg.y -= newPixelSize * 4;
  this.dPadBg.tint = 0x999999;

  let dPadXSpace = gameWidth / 2 + newPixelSize * 3;
  this.dPad.x = (dPadXSpace - this.dPad.width) / 2;

  this.punchLabel = new PIXI.Sprite(PIXI.utils.TextureCache[player.character + 'punch']);
  this.kickLabel = new PIXI.Sprite(PIXI.utils.TextureCache[player.character + 'kick1']);
  this.punchLabel.anchor.set(0.5);
  this.kickLabel.anchor.set(0.5);
  this.punchLabel.width = this.punchLabel.height = this.kickLabel.width = this.kickLabel.height = this.punchButton.width / 2;
  this.punchLabel.x = this.punchButton.x + this.punchButton.width / 2.1;
  this.punchLabel.y = this.punchButton.y + this.punchButton.height / 2.1;
  this.kickLabel.x = this.kickButton.x + this.kickButton.width / 2.1;
  this.kickLabel.y = this.kickButton.y + this.kickButton.height / 2.1;
  this.punchLabel.origScale = { x: 0, y: 0 };
  this.kickLabel.origScale = { x: 0, y: 0 };
  this.punchLabel.origScale.x = this.punchLabel.scale.x;
  this.punchLabel.origScale.y = this.punchLabel.scale.y;
  this.kickLabel.origScale.x = this.kickLabel.scale.x;
  this.kickLabel.origScale.y = this.kickLabel.scale.y;

  this.controls.addChild(this.punchLabel);
  this.controls.addChild(this.kickLabel);

  // this.container.alpha = 0

  this.throwButton.on('pointerdown', function() {
    player.throw('knife');
    nesPanel.throwKnob.tint = 0x009900;
    player.weapon = '';
    if (player.ducking) {
      player.sprite.texture = PIXI.utils.TextureCache[player.character + 'duckpunch'];
    } else {
      player.sprite.texture = PIXI.utils.TextureCache[player.character + 'punch'];
    }
    setTimeout(function() {
      nesPanel.toggleThrow('off');
      if (player.ducking) {
        player.sprite.texture = PIXI.utils.TextureCache[player.character + 'duckpunchstance'];
      } else {
        player.sprite.texture = PIXI.utils.TextureCache[player.character + 'stance'];
      }
    }, 100);
  });
  this.blockButton.on('pointerdown', function() {
    if (counter > 0) {
      pressUp();
    }
    // player.walkSpeed = newPixelSize*10
    nesPanel.blockKnob.tint = 0x009900;
  });
  this.blockButton.on('pointerup', function() {
    if (counter > 0) {
      releaseUp();
    }
    // player.walkSpeed = playerSpeed
    nesPanel.blockKnob.tint = 0xaaffaa;
  });
  this.blockButton.on('pointerupoutside', function() {
    releaseUp();
    // player.walkSpeed = newPixelSize*1.5
    // nesPanel.blockBG.tint = 0x77aa77
  });

  this.depressButton = function(button) {
    if (button.type === 'punch') {
      let since = counter - player.beganPunch;
    } else {
      let since = counter - player.beganKick;
    }
    if (since === 0) {
      button.texture = PIXI.utils.TextureCache('nes' + button.type + 'pressed1');
    }
    if (since === 5) {
      button.texture = PIXI.utils.TextureCache('nes' + button.type + 'pressed2');
    }
  };
  this.liftButton = function(button) {
    button.texture = PIXI.utils.TextureCache('nes' + button.type);
  };
  this.toggleThrow = function(pos) {
    if (pos === 'off') {
      nesPanel.throwButton.interactive = false;
      nesPanel.throwIcon.visible = false;
      nesPanel.throwText.visible = false;
      nesPanel.throwBG.tint = 0x999999;
      nesPanel.weaponIcon.visible = false;
      nesPanel.punchLabel.visible = true;
      nesPanel.throwKnob.tint = 0xaaaaaa;
    } else {
      nesPanel.throwButton.interactive = true;
      nesPanel.throwIcon.visible = true;
      nesPanel.throwText.visible = true;

      // nesPanel.throwBG.tint = 0x77aa77
      nesPanel.weaponIcon.visible = true;
      nesPanel.punchLabel.visible = false;
      nesPanel.throwKnob.tint = 0xaaffaa;
    }
  };
  this.monitorDPad = function() {
    let touch = touches[0].pos;
    if (this.upButton.containsPoint(touch)) {
      if (!pressingUp) {
        pressUp();
      }
    } else {
      if (!this.upLeftButton.containsPoint(touch) && !this.upRightButton.containsPoint(touch) && pressingUp) {
        releaseUp();
      }
    }
    if (this.downButton.containsPoint(touch)) {
      if (!pressingDown) {
        pressDown();
      }
      nesPanel.leftButton.tint = nesPanel.leftButton.origTint;
      nesPanel.rightButton.tint = nesPanel.rightButton.origTint;
    } else {
      if (!this.downLeftButton.containsPoint(touch) && !this.downRightButton.containsPoint(touch) && pressingDown) {
        releaseDown();
      }
    }
    if (this.leftButton.containsPoint(touch)) {
      if (!pressingLeft) {
        pressLeft();
      }
    } else {
      if (!this.upLeftButton.containsPoint(touch) && pressingLeft) {
        releaseLeft();
      }
    }
    if (this.rightButton.containsPoint(touch)) {
      if (!pressingRight) {
        pressRight();
      }
    } else {
      if (!this.upRightButton.containsPoint(touch) && pressingRight) {
        releaseRight();
      }
    }
    if (this.upLeftButton.containsPoint(touch)) {
      if (!pressingUp) {
        pressUp();
      }
      if (!pressingLeft) {
        pressLeft();
      }
    } else {
      if (!this.upButton.containsPoint(touch) && !this.upRightButton.containsPoint(touch) && pressingUp) {
        releaseUp();
      }
      if (!this.leftButton.containsPoint(touch) && !this.upLeftButton.containsPoint(touch) && pressingLeft) {
        releaseLeft();
      }
    }
    if (this.upRightButton.containsPoint(touch)) {
      if (!pressingUp) {
        pressUp();
      }
      if (!pressingRight) {
        pressRight();
      }
    } else {
      if (!this.upButton.containsPoint(touch) && !this.upLeftButton.containsPoint(touch) && pressingUp) {
        releaseUp();
      }
      if (!this.rightButton.containsPoint(touch) && !this.upRightButton.containsPoint(touch) && pressingRight) {
        releaseRight();
      }
    }
    if (this.downLeftButton.containsPoint(touch)) {
      if (!pressingDown) {
        pressDown();
      }
      if (counter > introTime + walkupTime && player.sprite.scale.x > 0) {
        player.sprite.scale.x *= -1;
      }
      nesPanel.leftButton.tint = 0xaaffaa;
    } else {
      if (!this.downButton.containsPoint(touch) && !this.downRightButton.containsPoint(touch) && pressingDown) {
        releaseDown();
      }
      if (!this.leftButton.containsPoint(touch) && !this.upLeftButton.containsPoint(touch) && pressingLeft) {
        releaseLeft();
      }
    }
    if (this.downRightButton.containsPoint(touch)) {
      if (!pressingDown) {
        pressDown();
      }
      if (counter > introTime + walkupTime && player.sprite.scale.x < 0) {
        player.sprite.scale.x *= -1;
      }
      nesPanel.rightButton.tint = 0xaaffaa;
    } else {
      if (!this.downButton.containsPoint(touch) && !this.downLeftButton.containsPoint(touch) && pressingDown) {
        releaseDown();
      }
      if (!this.rightButton.containsPoint(touch) && !this.upRightButton.containsPoint(touch) && pressingRight) {
        releaseRight();
      }
    }
  };
  // this.dPad.width -= newPixelSize*5
  // this.dPad.height -= newPixelSize*8
  // this.dPad.x += (newPixelSize*2.5)
  // this.dPad.y += (newPixelSize*4)

  this.panelBg = new PIXI.Sprite(PIXI.utils.TextureCache['pixel']);
  // this.panelBg.width = (gameWidth-(newPixelSize*8))
  this.panelBg.width = gameWidth;
  this.panelBg.height = this.bottomSpace - newPixelSize * 8;
  // this.panelBg.x = (newPixelSize*4)
  this.panelBg.y = gameHeight + newPixelSize * 4;
  this.panelBg.tint = 0xaaaaaa;
  this.backing.alpha = 0;
  this.dPadBg.tint = 0xaaaaaa;
  this.dPad.addChildAt(this.dPadBg, 0);

  this.dPad.scale.x *= 0.95;
  this.dPad.scale.y *= 0.95;
  // this.container.addChildAt(this.panelBg,1)

  this.upButton.texture.baseTexture.scaleMode = PIXI.SCALE_MODES.LINEAR;
  // this.controls.y = gameHeight+(newPixelSize*16)

  this.sizeElements = function() {
      document.getElementById('d-pad').style.width = this.dPad.width + 'px',
      document.getElementById('d-pad').style.height = this.dPad.height + 'px',
      document.getElementById('d-pad').style.top = this.controls.y + this.dPad.y + 'px',
      document.getElementById('d-pad').style.left = this.controls.x + this.dPad.x + 'px'
      document.getElementById('nes-panel-bg').style.width = gameWidth - newPixelSize * 4 + 'px',
      document.getElementById('nes-panel-bg').style.height = this.dPadBg.height + newPixelSize * 20 + 'px',
      document.getElementById('nes-panel-bg').style.top = this.controls.y + this.dPadBg.y - newPixelSize * 10 + 'px',
      document.getElementById('nes-panel-bg').style.left = newPixelSize * 2 + 'px';
    
    Array.from(document.querySelectorAll('.button-back')).map(bback => {
      bback.style.width = pieceSize * 1.75 - newPixelSize * 6 + 'px';
      bback.style.height = pieceSize * 1.75 - newPixelSize * 6 + 'px';
      bback.style.top = this.controls.y + this.punchButton.y + newPixelSize * 3 + 'px';
    });
    document.getElementById('b-back').style.left = this.punchButton.x + newPixelSize * 3 + 'px';
    document.getElementById('a-back').style.left = this.kickButton.x + newPixelSize * 3 + 'px';
    document.getElementById('nes-border').style.height = this.dPadBg.height + newPixelSize * 30 + 'px';
    document.getElementById('nes-border').style.top = this.controls.y + this.dPadBg.y - newPixelSize * 15 + 'px';
  };
  this.hideDecor = function() {
    document.getElementById('nes-panel-bg').style.display = 'none';
    Array.from(document.getElementsByClassName('button-back')).map(bback => {bback.style.display = 'none' });
  };
  this.sizeElements();
}
function FloorDisplay() {
  this.container = new PIXI.Container();
  this.bg = new PIXI.Sprite(PIXI.utils.TextureCache['pixel']);
  this.bg.width = tileSize * 4.5;
  this.bg.height = tileSize * 0.9;
  this.bg.anchor.set(0.5);
  this.container.x = gameWidth / 2;
  // this.container.y = player.level.groundY-(player.sprite.height*1.725)
  this.container.y = player.level.topEdge + tileSize * 3;
  this.bg.tint = 0x000000;

  this.legend = new PIXI.Text('LEVEL 1', scoreStyle);
  this.legend.tint = 0xffffff;
  this.legend.anchor.set(0.5);
  this.legend.x = this.bg.x;
  this.legend.y = this.bg.y;
  this.readyBg = new PIXI.Sprite(PIXI.utils.TextureCache['pixel']);
  this.readyBg.width = tileSize * 3.5;
  this.readyBg.height = this.bg.height;
  this.readyBg.anchor.set(0.5);
  this.readyBg.tint = 0x000000;
  this.readyBg.x = this.bg.x;
  this.readyBg.y = this.bg.y + this.bg.height + newPixelSize;
  this.readyLegend = new PIXI.Text('READY', scoreStyle);
  this.readyLegend.tint = 0xffffff;
  this.readyLegend.anchor.set(0.5);
  this.readyLegend.x = this.readyBg.x;
  this.readyLegend.y = this.readyBg.y;
  this.timeUpBg = new PIXI.Sprite(PIXI.utils.TextureCache['pixel']);
  this.timeUpBg.width = tileSize * 4.5;
  this.timeUpBg.height = tileSize * 0.9;
  this.timeUpBg.anchor.set(0.5);
  this.timeUpBg.tint = 0x000000;
  this.timeUpBg.x = this.bg.x;
  this.timeUpBg.y = this.bg.y;
  this.timeUpLegend = new PIXI.Text('TIME UP', scoreStyle);
  this.timeUpLegend.tint = 0xffffff;
  this.timeUpLegend.anchor.set(0.5);
  this.timeUpLegend.x = this.bg.x;
  this.timeUpLegend.y = this.bg.y;

  this.container.addChild(this.bg);
  this.container.addChild(this.legend);
  this.container.addChild(this.readyBg);
  this.container.addChild(this.readyLegend);
  this.container.addChild(this.timeUpBg);
  this.container.addChild(this.timeUpLegend);
  this.readyBg.visible = false;
  this.readyLegend.visible = false;
  this.timeUpBg.visible = false;
  this.timeUpLegend.visible = false;
  gameContainer.addChild(this.container);
}
function Arrow() {
  this.sprite = new PIXI.Sprite(PIXI.utils.TextureCache['arrow']);
  this.sprite.height = this.sprite.width = tileSize * 2;
  this.sprite.anchor.set = 0.5;
  this.sprite.x = this.sprite.width / 2;
  this.sprite.y = gameHeight / 2;
  this.bornAt = -99;
  gameContainer.addChild(this.sprite);
  this.sprite.visible = false;
  this.sprite.alpha = 0.5;
  this.flash = function() {
    if ((counter - this.bornAt) % 5 === 0) {
      if (this.sprite.alpha === 0.5) {
        this.sprite.alpha = 0;
      } else {
        this.sprite.alpha = 0.5;
      }
    }
    if (counter - this.bornAt === 40) {
      this.sprite.alpha = 0.5;
      this.sprite.visible = false;
    }
  };
}
function scoreBlip(amount, victim) {
  this.legend = new PIXI.Text(amount, blipStyle);
  this.legend.anchor.set(0.5);
  if (victim.sprite.scale.x > 0) {
    this.legend.x = victim.sprite.x - newPixelSize * 2;
  } else {
    this.legend.x = victim.sprite.x + newPixelSize * 2;
  }
  this.legend.scale.x *= 0.9;
  this.legend.width *= fighterScale;
  this.legend.height *= fighterScale;
  this.legend.y = victim.sprite.y - victim.headHeight;
  this.bornAt = counter;
  if (amount) {
    gameContainer.addChild(this.legend);
  }
  scoreBlips.push(this);

  this.fade = function() {
    let sinceBorn = counter - this.bornAt;
    if (sinceBorn > 5) {
      this.legend.y -= (sinceBorn / 10) * newPixelSize;
      this.legend.alpha -= 0.075;
    }
    if (this.legend.alpha < 0) {
      gameContainer.removeChild(this.legend);
    }
  };
}
function callModeSelectScreen() {
  document.getElementById('mode-select-screen').classList.add('showing');
}
function TitleScreen() {
  this.container = new PIXI.Container();
  this.titleCard = new PIXI.Sprite(PIXI.utils.TextureCache['titlescreen']);
  this.startButton = new PIXI.Container();
  this.startButton.buttonMode = true;
  this.highScoresButton = new PIXI.Container();
  this.highScoresButton.buttonMode = true;
  this.optionsButton = new PIXI.Container();
  this.optionsButton.buttonMode = true;
  this.fullScreenButton = new PIXI.Container();
  this.kungFuLogo = new PIXI.Sprite()
  this.highScoresBg = new PIXI.Sprite(PIXI.utils.TextureCache['pixel']);
  this.optionsBg = new PIXI.Sprite(PIXI.utils.TextureCache['pixel']);
  this.startBg = new PIXI.Sprite(PIXI.utils.TextureCache['pixel']);
  this.soundButton = new PIXI.Container();
  this.soundBg = new PIXI.Sprite(PIXI.utils.TextureCache['pixel']);
  this.soundText = new PIXI.Text('SOUND: OFF', buttonStyle);
  this.fullScreenBg = new PIXI.Sprite(PIXI.utils.TextureCache['pixel']);
  this.fullScreenText = new PIXI.Text('FULL SCREEN: OFF', buttonStyle);
  this.controlsButton = new PIXI.Container();
  this.controlsBg = new PIXI.Sprite(PIXI.utils.TextureCache['pixel']);
  this.controlsText = new PIXI.Text('CUSTOMIZE CONTROLS', buttonStyle);
  this.startText = new PIXI.Text('START!', titleStyle);
  this.highScoresText = new PIXI.Text('HIGH SCORES', titleStyle2);
  this.optionsText = new PIXI.Text('OPTIONS', titleStyle);
  this.startBg.anchor.x = this.startText.anchor.x = this.controlsBg.anchor.x = this.controlsText.anchor.x = this.soundBg.anchor.x = this.soundText.anchor.x = this.fullScreenBg.anchor.x = this.fullScreenText.anchor.x = this.optionsBg.anchor.x = this.optionsText.anchor.x = this.highScoresBg.anchor.x = this.highScoresText.anchor.x = 0.5;
  this.startText.anchor.y = this.highScoresText.anchor.y = this.fullScreenText.anchor.y = this.optionsText.anchor.y = 0.5;
  this.soundText.anchor.y = 0.5;
  this.controlsText.anchor.y = 0.5;
  this.startButton.x = this.highScoresButton.x = this.soundButton.x = this.fullScreenButton.x = this.controlsButton.x = gameWidth / 2;
  this.optionsButton.x = gameWidth / 2;
  this.startBg.tint = 0x333333;
  this.highScoresBg.tint = 0x333333;
  this.optionsBg.tint = 0x333333;
  this.soundBg.tint = this.fullScreenBg.tint = 0x444444;
  this.controlsBg.tint = 0x446666;
  this.startBg.width = tileSize * 7;
  this.startBg.height = tileSize * 1.65;  
  this.highScoresBg.width = this.optionsBg.width = this.startBg.width;
  this.highScoresBg.height = this.optionsBg.height = this.startBg.height;
  this.soundBg.width = tileSize * 5;
  this.soundBg.height = this.startBg.height * 0.8;
  this.fullScreenBg.width = this.startBg.width;
  this.fullScreenBg.height = this.soundBg.height;
  this.controlsBg.width = this.startBg.width * 1.15;
  this.controlsBg.height = this.soundBg.height;
  this.fullScreenText.y = this.controlsText.y = this.fullScreenBg.y + this.fullScreenBg.height / 2;
  this.startBg.y = newPixelSize * 90 + tileSize;
  this.highScoresBg.y = this.startBg.y + this.startBg.height + newPixelSize * 12;
  this.startText.y = this.startBg.y + this.startBg.height / 2;
  this.highScoresText.y = this.highScoresBg.y + this.highScoresBg.height / 2;
  this.optionsButton.y = this.highScoresBg.y + this.highScoresBg.height + this.highScoresBg.height / 2;
  this.soundButton.y = this.highScoresBg.y + this.highScoresBg.height + this.highScoresBg.height / 2;
  this.soundText.y = this.soundBg.y + this.soundBg.height / 2;
  this.optionsText.y = this.optionsBg.y + this.optionsBg.height / 2;
  this.fullScreenButton.y = this.controlsButton.y = this.soundButton.y + this.soundBg.height + newPixelSize * 12;
  this.controlsButton.y = this.soundButton.y + this.soundBg.height + newPixelSize * 12;
  this.soundText.tint = this.fullScreenText.tint = 0x777777;
  this.startButton.addChild(this.startBg);
  this.startButton.addChild(this.startText);
  this.highScoresButton.addChild(this.highScoresBg);
  this.highScoresButton.addChild(this.highScoresText);
  this.optionsButton.addChild(this.optionsBg);
  this.optionsButton.addChild(this.optionsText);
  this.titleCard.anchor.x = 0.5;
  this.titleCard.x = gameWidth / 2;
  this.titleCard.width = gameWidth;
  this.titleCard.height = gameHeight;
  console.warn('sized title at', gameWidth, gameHeight)
  this.startButton.interactive = this.highScoresButton.interactive = this.optionsButton.interactive = true;
  this.startButton.on('pointerdown', function() {
    selector.move(0, 0);
  });
  this.startButton.on('pointerup', function() {
    callModeSelectScreen()
    clearTitle();
  });
  this.highScoresButton.on('pointerdown', function() {
    selector.move(0, 1);
  });
  this.highScoresButton.on('pointerup', function() {
    toggleHighScores();
  });
  this.optionsButton.on('pointerdown', function() {
    selector.move(0, 2);
  });
  this.optionsButton.on('pointerup', function() {
    toggleOptionsScreen();
  });
  this.container.addChild(this.titleCard);
  this.container.addChild(this.startButton);
  this.container.addChild(this.highScoresButton);
  this.container.addChild(this.optionsButton);
}
function DragonSelector() {
  this.container = new PIXI.Container();
  this.leftDragon = new PIXI.Sprite(PIXI.utils.TextureCache['fulldragon']);
  this.rightDragon = new PIXI.Sprite(PIXI.utils.TextureCache['fulldragon']);
  this.leftDragon.width = this.rightDragon.width = newPixelSize * 21;
  this.leftDragon.height = this.rightDragon.height = newPixelSize * 28;
  this.leftDragon.anchor.x = this.rightDragon.anchor.x = 0.5;
  this.leftDragon.anchor.y = this.rightDragon.anchor.y = 0.5;
  this.leftDragon.x = gameWidth / 2 - titleScreen.startBg.width / 2 - tileSize;
  this.rightDragon.x = gameWidth / 2 + titleScreen.startBg.width / 2 + tileSize;
  this.rightDragon.scale.x *= -1;
  this.container.y = titleScreen.startText.y;
  this.container.addChild(this.leftDragon);
  this.container.addChild(this.rightDragon);
  this.selections = ['start', 'highscores', 'options'];
  this.selected = 0;
  this.highlight = new PIXI.Sprite(PIXI.utils.TextureCache['pixel']);
  this.highlight.tint = 0xe05000;
  this.highlight.anchor.set(0.5);
  this.highlight.borderSize = newPixelSize * 4;
  this.highlight.width = titleScreen.startBg.width + this.highlight.borderSize;
  this.highlight.height = titleScreen.startBg.height + this.highlight.borderSize;
  this.highlight.x = gameWidth / 2;
  this.container.addChild(this.highlight);
  titleScreen.container.addChildAt(this.container, 1);
  titleScreen.startBg.alpha = 1;
  titleScreen.highScoresBg.alpha = 0.5;
  titleScreen.optionsBg.alpha = 0.5;
  this.move = function(direction, moveTo) {
    if (!direction) {
      this.selected = moveTo;
    } else {
      if (this.selected + direction >= 0 && this.selected + direction < this.selections.length) {
        this.selected += direction;
      }
    }

    let selected = this.selections[this.selected];
    if (selected === 'start') {
      this.container.y = titleScreen.startText.y;
      this.leftDragon.x = gameWidth / 2 - titleScreen.startBg.width / 2 - tileSize;
      this.rightDragon.x = gameWidth / 2 + titleScreen.startBg.width / 2 + tileSize;
      titleScreen.startBg.alpha = 1;
      titleScreen.highScoresBg.alpha = 0.5;
      titleScreen.optionsBg.alpha = 0.5;
      this.highlight.width = titleScreen.startBg.width + this.highlight.borderSize;
      this.highlight.height = titleScreen.startBg.height + this.highlight.borderSize;
    }
    if (selected === 'highscores') {
      this.container.y = titleScreen.highScoresText.y;
      this.leftDragon.x = gameWidth / 2 - titleScreen.highScoresBg.width / 2 - tileSize;
      this.rightDragon.x = gameWidth / 2 + titleScreen.highScoresBg.width / 2 + tileSize;
      titleScreen.highScoresBg.alpha = 1;
      titleScreen.startBg.alpha = 0.5;
      titleScreen.optionsBg.alpha = 0.5;
      this.highlight.width = titleScreen.highScoresBg.width + this.highlight.borderSize;
      this.highlight.height = titleScreen.highScoresBg.height + this.highlight.borderSize;
    }
    if (selected === 'options') {
      this.container.y = titleScreen.optionsButton.y + titleScreen.optionsText.y;
      this.leftDragon.x = gameWidth / 2 - titleScreen.optionsBg.width / 2 - tileSize;
      this.rightDragon.x = gameWidth / 2 + titleScreen.optionsBg.width / 2 + tileSize;
      titleScreen.optionsBg.alpha = 1;
      titleScreen.startBg.alpha = 0.5;
      titleScreen.highScoresBg.alpha = 0.5;
      this.highlight.width = titleScreen.optionsBg.width + this.highlight.borderSize;
      this.highlight.height = titleScreen.optionsBg.height + this.highlight.borderSize;
    }
  };
  this.chooseSelection = function() {
    let selected = this.selections[this.selected];
    if (selected === 'start') {
      callModeSelectScreen();
      clearTitle();
    }
    if (selected === 'highscores') {
      toggleHighScores();
    }
    if (selected === 'options') {
      toggleOptionsScreen();
    }
  };
  this.highlightSelection = function() {
    if (precounter % 4 < 2) {
      this.highlight.tint = 0xffa000;
    } else {
      this.highlight.tint = 0xe05000;
    }
  };
}
function HighScoresScreen() {
  this.container = new PIXI.Container();
  this.container.interactive = true;
  this.bg = new PIXI.Sprite(PIXI.utils.TextureCache['pixel']);
  this.bg.width = gameWidth;
  this.bg.height = viewHeight;
  this.bg.tint = 0x000000;
  this.header = new PIXI.Sprite(PIXI.utils.TextureCache['highscoresheader']);
  this.header.width = gameWidth;
  this.marginX = tileSize * 2.25;
  if (landscape) {
    this.header.width = gameWidth * 0.75;
    this.header.anchor.x = 0.5;
    this.header.x = gameWidth / 2;
    this.marginX = tileSize * 3.8;
  }
  this.header.height = this.header.width / 4;
  this.startY = tileSize + newPixelSize * 64;
  if (landscape) {
    this.startY *= 0.75;
  }
  let dragonsNeeded = Math.ceil((viewHeight - (this.header.height + tileSize)) / (tileSize + newPixelSize * 32));
  this.container.addChild(this.bg);
  this.container.addChild(this.header);
  this.entries = new PIXI.Container();
  this.container.addChild(this.entries);
  for (let d = 0; d < dragonsNeeded; d++) {
    let dragon1 = new PIXI.Sprite(PIXI.utils.TextureCache['fulldragon']);
    let dragon2 = new PIXI.Sprite(PIXI.utils.TextureCache['fulldragon']);
    dragon1.anchor.x = dragon2.anchor.x = 0.5;
    dragon1.width = dragon2.width = newPixelSize * 24;
    dragon1.height = dragon2.height = newPixelSize * 32;
    dragon1.x = tileSize;
    dragon2.x = gameWidth - tileSize;
    dragon1.y = dragon2.y = this.startY + (tileSize + dragon1.height) * d;
    if (landscape) {
      dragon1.width = dragon2.width = newPixelSize * 18;
      dragon1.height = dragon2.height = newPixelSize * 24;
      dragon1.x = tileSize * 3;
      dragon2.x = gameWidth - (tileSize * 3);
      dragon1.y = dragon2.y = this.startY + (tileSize + dragon1.height) * d;
    }
    dragon2.scale.x *= -1;
    this.container.addChild(dragon1);
    this.container.addChild(dragon2);
  }
  this.populateEntries = function() {
    this.entries.removeChildren();
    let newEntries = scoreArray.length;
    if (scoreArray.length > scoresToDisplay) {
      newEntries = scoresToDisplay;
    }
    for (let e = 0; e < newEntries; e++) {
      let rankNumber = new PIXI.Text((e + 1), highScoreStyle);
      if (!landscape) {
        rankNumber.style.fontSize = tileSize / 2;
      }
      rankNumber.style.fill = '#8f8';
      rankNumber.anchor.x = 1;
      let newPlayerText = new PIXI.Text(scoreArray[e][0], highScoreStyle);
      if (!landscape) {
        newPlayerText.style.fontSize = tileSize / 1.6;
      }
      let sixDigit = '0'.repeat(6 - scoreArray[e][1].length) + scoreArray[e][1];
      let newScoreText = new PIXI.Text(sixDigit, highScoreStyle);
      if (landscape) {
        newScoreText.style.fontSize = newPlayerText.style.fontSize = tileSize / 3;
      }
      rankNumber.x = this.marginX + (tileSize * 0.75);
      newPlayerText.x = rankNumber.x + (tileSize / 1.5);
      newScoreText.x = gameWidth - newScoreText.width - this.marginX;
      rankNumber.y = newPlayerText.y = newScoreText.y = this.startY + newPlayerText.height * 2 * e;
      this.entries.addChild(rankNumber);
      this.entries.addChild(newPlayerText);
      this.entries.addChild(newScoreText);
      if (scoreArray[e][0] == currentRecord.player && scoreArray[e][1] == currentRecord.score) {
        newPlayerText.tint = 0x00ff00;
        newScoreText.tint = 0x00ff00;
      }
    }
  };
  this.container.visible = false;
}
function EnterNameScreen() {
  this.container = new PIXI.Container();
  this.container.interactive = true;
  this.container.zIndex = 30;
  this.bg = new PIXI.Sprite(PIXI.utils.TextureCache['pixel']);
  this.bg.width = gameWidth;
  this.bg.height = viewHeight;
  this.bg.tint = 0x000000;
  this.header = new PIXI.Sprite(PIXI.utils.TextureCache['emptyheader']);
  this.header.width = gameWidth;
  this.header.height = this.header.width / 4;
  this.marginX = newPixelSize * 30 + tileSize;
  this.startY = gameHeight / 2.25;
  let dragonsNeeded = Math.ceil((viewHeight - (this.header.height + tileSize)) / (tileSize + newPixelSize * 32));
  this.container.addChild(this.bg);
  this.container.addChild(this.header);
  this.entries = new PIXI.Container();
  this.legendTitle = new PIXI.Text('HIGH SCORE!', blockStyle);
  this.rankDisplay = new PIXI.Text('5TH PLACE', blockStyle);
  this.legendTitle.style.fill = 0x44ff44;
  this.rankDisplay.style.fill = 0xffff00;
  largeFontSize = gameWidth / 12;
  this.legendTitle.style.fontSize = largeFontSize;
  this.rankDisplay.style.fontSize = largeFontSize;
  this.rankDisplay.style.lineHeight = '5';
  if (landscape) {
    this.rankDisplay.style.fontSize = largeFontSize / 1.5;
    this.rankDisplay.style.lineHeight = '8';
  }
  this.legendTitle.style.wordWrapWidth = gameWidth;
  this.legend = new PIXI.Text('ENTER YOUR NAME TO CLAIM YOUR PLACE AMONG THE WORLD\'S TOP FIGHTERS.', blockStyle);
  this.legend.anchor.x = this.legendTitle.anchor.x = this.rankDisplay.anchor.x = 0.5;
  this.legend.x = this.legendTitle.x = this.rankDisplay.x = gameWidth / 2;
  this.legendTitle.y = this.startY - (this.legendTitle.height * 1.5);
  this.rankDisplay.y = this.startY + tileSize;
  this.legend.y = viewHeight * 0.5;
  if (landscape) {
    this.legend.y = gameHeight * 0.65;
  }
  
  this.container.addChild(this.legendTitle);  
  this.container.addChild(this.rankDisplay);  
  this.container.addChild(this.legend);  
  
  for (let d = 0; d < dragonsNeeded; d++) {
    let dragon1 = new PIXI.Sprite(PIXI.utils.TextureCache['fulldragon']);
    let dragon2 = new PIXI.Sprite(PIXI.utils.TextureCache['fulldragon']);
    dragon1.width = dragon2.width = newPixelSize * 24;
    dragon1.height = dragon2.height = newPixelSize * 32;
    dragon1.anchor.x = dragon2.anchor.x = 0.5;
    dragon1.x = tileSize;
    dragon2.x = gameWidth - tileSize;
    dragon1.y = dragon2.y = this.startY + (tileSize + dragon1.height) * d;
    dragon2.scale.x *= -1;
    this.container.addChild(dragon1);
    this.container.addChild(dragon2);
  }
  this.container.visible = false;
}
function submitHighScore() {
  lastEnteredName = document.getElementById('name-entry').value.toUpperCase();
  console.info('player', player)
  saveScoreToDatabase(gameName, lastEnteredName, currentRecord.score);
}
function toggleNameEntry(rankAchieved) {
  if (enterNameScreen.container.visible) {
    enterNameScreen.container.visible = false;
    document.getElementById('brutal-logo').classList.remove('hidden');
    document.getElementById('kung-fu-logo').classList.remove('hidden');
    document.getElementById('skip-name-entry-button').classList.remove('showing');
    document.getElementById('name-entry').classList.remove('showing');
    document.getElementById('name-submit').classList.remove('showing');
    document.body.classList.remove('scored');    
  } else {
    document.getElementById('brutal-logo').classList.add('hidden');
    document.getElementById('kung-fu-logo').classList.add('hidden');
    document.getElementById('skip-name-entry-button').classList.add('showing');
    document.getElementById('name-entry').classList.add('showing');
    document.getElementById('name-submit').classList.add('showing');
    enterNameScreen.rankDisplay.text = `${rankAchieved} PLACE`;
    enterNameScreen.container.visible = true;
    document.body.classList.add('scored')
  }
}
function toggleHighScores() {
  if (!highScoresScreen.container.visible) {
    highScoresScreen.container.visible = true;
    document.getElementById('brutal-logo').classList.add('hidden');
    document.getElementById('kung-fu-logo').classList.add('hidden');
    document.getElementById('close-high-scores-button').classList.add('showing');
    document.getElementById('hard-reload').classList.add('hidden');
    getScoresFromDatabase(gameName, true);
    // highScoresScreen.populateEntries()
  } else {
    document.getElementById('brutal-logo').classList.remove('hidden');
    document.getElementById('kung-fu-logo').classList.remove('hidden');
    document.getElementById('close-high-scores-button').classList.remove('showing');
    highScoresScreen.container.visible = false;
    
  }
}
function getScoresFromDatabase(gameName, populate, check) {
  console.log('CALLING FOR SCORES ----------------');
  axios({
    method: 'get',
    url: 'https://www.eggborne.com/scripts/getscores.php',
    headers: {
      'Content-type': 'application/x-www-form-urlencoded'
    },
    params: {
      game: gameName
    }
  }).then((response) => {
    if (response.data) {
      let text = response.data;
      scoreArray.length = 0;
      pairArray = response.data.split(' - ');
      for (item in pairArray) {
        let scoreEntry = pairArray[item].split(' ');
        if (scoreEntry.length > 2) {
          let fixedEntry = [];
          fixedEntry[1] = scoreEntry.pop();
          fixedEntry[0] = scoreEntry.join(' ');
          scoreArray.push(fixedEntry);
        } else if (scoreEntry.length === 2) {
          scoreArray.push(scoreEntry);
        }
      }
      if (!populate) {
      } else {
        highScoresScreen.populateEntries();
      }
      let lowestIndex = scoresToDisplay - 1;
      if (scoreArray.length < scoresToDisplay) {
        lowestIndex = scoreArray.length - 1;
        lowScore = 0;
      } else {
        lowScore = scoreArray[lowestIndex][1];
      }
      topScore = scoreArray[0][1];
      if (scoreDisplay) {
        scoreDisplay.topText.text = 'TOP-' + ('0'.repeat(6 - topScore.toString().length) + topScore);
      }
      if (check) {
        if (gameMode !== 'horde') {
          console.warn('checking! player.score', player.score, 'against lowest of top', scoresToDisplay, '-', lowScore);
          if (player.score > lowScore) {
            currentRecord.score = player.score;
            let playerRank = findRank(player.score);
            console.error('-------------------')
            console.error('playerRank ------------------', playerRank)
            console.error('-------------------')
            toggleNameEntry(playerRank);
          }
        }
        resetGame();
      }
    } else {
      console.log('getScoresFromDatabase could not connect :(');
      scoreArray = [['void', 1212]];
    }
  });
}
function saveScoreToDatabase(gameName, playerName, playerScore) {
  console.log('currrec', currentRecord)
  console.log('passing', gameName, playerName, playerScore)
  currentRecord.player = playerName;
  axios({
    method: 'post',
    url: 'https://www.eggborne.com/scripts/savescores.php',
    headers: {
      'Content-type': 'application/x-www-form-urlencoded'
    },
    data: {
      game: gameName,
      name: playerName,
      score: playerScore
    }
  }).then(response => {
    if (response.data) {
      toggleNameEntry();
      toggleHighScores();
      getScoresFromDatabase(gameName, true);
    } else {
      console.log('Could not connect to post score!');
    }
  });
}
