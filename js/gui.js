function checkIfPressing(spr) {
  var pressing = false;
  var pressSpot = touches[0].pos;
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
function ScoreDisplay() {
  this.lineHeight = tileSize / 2.5;
  this.xPadding = tileSize / 1.5;
  this.floorKnobs = [];
  this.container = new PIXI.Container();
  this.bg = new PIXI.Sprite(PIXI.utils.TextureCache['pixel']);
  this.bg.width = gameWidth;
  this.bg.height = level1.topEdge;
  this.bg.tint = 0x111111;
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
  for (var f = 0; f < 5; f++) {
    var knob = new PIXI.Sprite(PIXI.utils.TextureCache['pixel']);
    knob.width = knob.height = this.playerBar.height;
    knob.tint = 0x9290ff;
    knob.x = this.livesIcon.x + f * (knob.width + this.lineHeight * 1.4);
    knob.y = this.playerBar.y;
    this.container.addChild(knob);
    if (f < 4) {
      var dash = new PIXI.Sprite(PIXI.utils.TextureCache['pixel']);
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
  var lastKnob = this.floorKnobs[this.floorKnobs.length - 1];
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
    var newStr = newScore.toString();
    var scoreString = '0'.repeat(6 - newStr.length) + newStr;
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
    var box = this.floorKnobs[player.level.floor - 1];
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
nesGreen = 0x788368;
function NESPanel() {
  this.container = new PIXI.Container();
  this.controls = new PIXI.Container();
  this.bg = new PIXI.Sprite(PIXI.utils.TextureCache['pixel']);
  this.backing = new PIXI.Sprite(PIXI.utils.TextureCache['pixel']);
  // if (landscape) {
  //     this.bg.width = gameWidth
  //     this.bg.height = gameHeight
  // } else {
  this.bg.width = gameWidth;
  this.bg.height = window.innerHeight - gameHeight;
  this.bg.y = gameHeight;

  // }
  // this.bg.tint = 0xaaaaaa
  // this.container.addChild(this.bg)
  if (landscape) {
    this.bg.alpha = 0;
  } else {
    this.controls.addChild(this.backing);
  }
  this.dPad = new PIXI.Container();
  if (!landscape) {
    var pieceSize = tileSize * 2.2;
    this.pieceSize = tileSize * 2.2;
  } else {
    var pieceSize = tileSize * 2;
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

  for (var b = 0; b < this.dButtons.length; b++) {
    var button = this.dButtons[b];
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

  // this.controls.addChild(this.dPadBg)

  // this.leftButton.y -= pieceSize*0.08
  // this.rightButton.y -= pieceSize*0.08
  // this.upButton.width = this.downButton.width = pieceSize*this.pieceRatio
  // this.upButton.height = this.downButton.height = pieceSize

  // this.leftButton.width = this.rightButton.width = this.upButton.height
  // this.leftButton.height = this.rightButton.height = this.upButton.width

  // this.centerPiece.x += this.leftButton.width
  // this.centerPiece.y += this.upButton.height

  // this.upButton.x = this.downButton.x = this.leftButton.width*0.9
  // this.downButton.y = this.leftButton.y+this.leftButton.height+(this.leftButton.height*0.665)
  // this.leftButton.y = this.rightButton.y = this.leftButton.width*0.9
  // this.rightButton.x = this.upButton.x+this.upButton.width*0.91

  // this.centerPiece.x -= this.upButton.width*0.075
  // this.centerPiece.y -= this.upButton.width*0.0875

  this.upRightButton.anchor.x = this.downRightButton.anchor.x = this.downRightButton.anchor.y = this.downLeftButton.anchor.y = 1;
  this.upRightButton.x = this.downRightButton.x = this.dPad.width - this.upRightButton.width;
  this.downRightButton.y = this.downLeftButton.y = this.dPad.height - this.downRightButton.height;

  // this.dPadBg.anchor.set(0.5)
  // this.dPadBg.x = this.centerPiece.x+(this.centerPiece.width/2)
  // this.dPadBg.y = this.centerPiece.y+(this.centerPiece.height/2)

  // if (!landscape) {
  this.backing.width = this.kickButton.width * 2 + newPixelSize * 6;
  this.backing.height = this.dPad.height;
  // this.backing.x = this.kickButton.x-(newPixelSize*3)
  // this.backing.y = this.dPad.y
  this.backing.x = gameWidth - this.backing.width - newPixelSize * 6;
  this.backing.y = this.dPad.y;
  this.backing.tint = 0x999999;
  this.kickButton.x = this.backing.x + newPixelSize * 2;
  this.punchButton.x = this.kickButton.x + this.kickButton.width;
  this.punchButton.y = this.kickButton.y = this.backing.height - this.kickButton.height - newPixelSize;
  // } else {
  //     this.punchButton.x = gameWidth-(this.kickButton.width*1.1)
  //     this.kickButton.x = this.punchButton.x-(this.punchButton.width)
  //     this.punchButton.y = this.kickButton.y = gameHeight-(this.kickButton.width*1.1)

  // }
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

  var dPadXSpace = gameWidth / 2 + newPixelSize * 3;
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
      var since = counter - player.beganPunch;
    } else {
      var since = counter - player.beganKick;
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
    var touch = touches[0].pos;
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
    $('#d-pad').css({
      width: this.dPad.width,
      height: this.dPad.height,
      top: this.controls.y + this.dPad.y,
      left: this.controls.x + this.dPad.x
    });
    $('#nes-panel-bg').css({
      width: gameWidth - newPixelSize * 4,
      height: this.dPadBg.height + newPixelSize * 20,
      top: this.controls.y + this.dPadBg.y - newPixelSize * 10,
      left: newPixelSize * 2
    });
    $('.button-back').css({
      width: pieceSize * 1.75 - newPixelSize * 6,
      height: pieceSize * 1.75 - newPixelSize * 6,
      top: this.controls.y + this.punchButton.y + newPixelSize * 3
    });
    $('#b-back').css({
      left: this.punchButton.x + newPixelSize * 3
    });
    $('#a-back').css({
      left: this.kickButton.x + newPixelSize * 3
    });
    $('#nes-border').css({
      height: this.dPadBg.height + newPixelSize * 30,
      top: this.controls.y + this.dPadBg.y - newPixelSize * 15
    });
  };
  this.hideDecor = function() {
    $('#nes-panel-bg').css({ display: 'none' });
    $('.button-back').css({ display: 'none' });
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
    var sinceBorn = counter - this.bornAt;
    if (sinceBorn > 5) {
      this.legend.y -= (sinceBorn / 10) * newPixelSize;
      this.legend.alpha -= 0.075;
    }
    if (this.legend.alpha < 0) {
      gameContainer.removeChild(this.legend);
    }
  };
}
function TitleScreen() {
  this.container = new PIXI.Container();
  this.titleCard = new PIXI.Sprite(PIXI.utils.TextureCache['titlescreen']);
  this.startButton = new PIXI.Container();
  this.highScoresButton = new PIXI.Container();
  this.fullScreenButton = new PIXI.Container();
  this.highScoresBg = new PIXI.Sprite(PIXI.utils.TextureCache['pixel']);
  this.startBg = new PIXI.Sprite(PIXI.utils.TextureCache['pixel']);
  this.soundButton = new PIXI.Container();
  this.soundBg = new PIXI.Sprite(PIXI.utils.TextureCache['pixel']);
  this.soundText = new PIXI.Text('SOUND: OFF', buttonStyle);
  this.fullScreenBg = new PIXI.Sprite(PIXI.utils.TextureCache['pixel']);
  this.fullScreenText = new PIXI.Text('FULL SCREEN: OFF', buttonStyle);
  this.startText = new PIXI.Text('START!', titleStyle);
  this.highScoresText = new PIXI.Text('HIGH SCORES', titleStyle2);
  this.startBg.anchor.x = this.startText.anchor.x = this.soundBg.anchor.x = this.soundText.anchor.x = this.fullScreenBg.anchor.x = this.fullScreenText.anchor.x = this.highScoresBg.anchor.x = this.highScoresText.anchor.x = 0.5;
  this.startText.anchor.y = this.highScoresText.anchor.y = this.fullScreenText.anchor.y = 0.5;
  this.soundText.anchor.y = 0.5;
  this.startButton.x = this.highScoresButton.x = this.soundButton.x = this.fullScreenButton.x = gameWidth / 2;
  this.startBg.tint = 0x333333;
  this.highScoresBg.tint = 0x333333;
  this.soundBg.tint = this.fullScreenBg.tint = 0x444444;
  this.startBg.width = tileSize * 7;
  this.startBg.height = tileSize * 1.5;
  this.highScoresBg.width = this.startBg.width;
  this.highScoresBg.height = this.startBg.height;
  this.soundBg.width = tileSize * 5;
  this.soundBg.height = this.startBg.height * 0.8;
  this.fullScreenBg.width = this.startBg.width;
  this.fullScreenBg.height = this.soundBg.height;
  this.fullScreenText.y = this.fullScreenBg.y + this.fullScreenBg.height / 2;

  this.startBg.y = newPixelSize * 73 + tileSize;
  this.highScoresBg.y = this.startBg.y + this.startBg.height + newPixelSize * 12;
  this.startText.y = this.startBg.y + this.startBg.height / 2;
  this.highScoresText.y = this.highScoresBg.y + this.highScoresBg.height / 2;
  // this.soundBg.y = this.startBg.y+this.startBg.height+(this.soundBg.height/2)
  this.soundButton.y = this.highScoresBg.y + this.highScoresBg.height + this.highScoresBg.height / 2;
  this.soundText.y = this.soundBg.y + this.soundBg.height / 2;
  this.fullScreenButton.y = this.soundButton.y + this.soundBg.height + newPixelSize * 12;
  this.soundText.tint = this.fullScreenText.tint = 0x777777;
  this.startButton.addChild(this.startBg);
  this.startButton.addChild(this.startText);
  this.highScoresButton.addChild(this.highScoresBg);
  this.highScoresButton.addChild(this.highScoresText);
  this.soundButton.addChild(this.soundBg);
  this.soundButton.addChild(this.soundText);
  this.fullScreenButton.addChild(this.fullScreenBg);
  this.fullScreenButton.addChild(this.fullScreenText);
  loadMessage = new PIXI.Text('SOUNDS LOADED: 0/13', scoreStyle);
  loadMessage.anchor.x = 0.5;
  loadMessage.x = this.startBg.x;
  loadMessage.y = gameHeight - (this.startBg.height / 2);
  loadMessage.visible = false;
  this.startButton.addChild(loadMessage);
  this.titleCard.anchor.x = 0.5;
  this.titleCard.x = gameWidth / 2;
  this.titleCard.width = gameWidth;
  this.titleCard.height = gameHeight;
  this.startButton.interactive = this.highScoresButton.interactive = true;
  this.startButton.on('pointerdown', function() {
    selector.move(0, 0);
  });
  this.startButton.on('pointerup', function() {
    // if (!created) { createGame() }
    // stage.setChildIndex(gameContainer,stage.children.length-1)
    clearTitle();
  });
  this.highScoresButton.on('pointerdown', function() {
    selector.move(0, 1);
  });
  this.highScoresButton.on('pointerup', function() {
    toggleHighScores();
  });
  this.soundButton.interactive = true;
  this.soundButton.on('pointerdown', function() {
    selector.move(0, 2);
    toggleSound();
  });
  this.soundButton.on('pointerup', function() {
    // toggleSound()
  });
  this.fullScreenButton.interactive = true;
  this.fullScreenButton.on('pointerdown', function() {
    selector.move(0, 3);
    // toggleFullScreen()
  });
  this.fullScreenButton.on('pointerup', function() {
    toggleFullScreen();
    // toggleSound()
  });
  this.container.addChild(this.titleCard);
  this.container.addChild(this.startButton);
  this.container.addChild(this.highScoresButton);
  this.container.addChild(this.soundButton);
  this.container.addChild(this.fullScreenButton);
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
  // this.leftDragon.y = this.rightDragon.y = titleScreen.startText.y
  this.container.y = titleScreen.startText.y;
  this.container.addChild(this.leftDragon);
  this.container.addChild(this.rightDragon);
  this.selections = ['start', 'highscores', 'sound', 'fullscreen'];
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
  // soundBg.alpha = 0.5
  this.move = function(direction, moveTo) {
    if (!direction) {
      this.selected = moveTo;
    } else {
      if (this.selected + direction >= 0 && this.selected + direction < this.selections.length) {
        this.selected += direction;
      }
    }

    var selected = this.selections[this.selected];
    if (selected === 'start') {
      this.container.y = titleScreen.startText.y;
      this.leftDragon.x = gameWidth / 2 - titleScreen.startBg.width / 2 - tileSize;
      this.rightDragon.x = gameWidth / 2 + titleScreen.startBg.width / 2 + tileSize;
      titleScreen.startBg.alpha = 1;
      titleScreen.highScoresBg.alpha = 0.5;
      // titleScreen.soundBg.alpha = 0.5
      this.highlight.width = titleScreen.startBg.width + this.highlight.borderSize;
      this.highlight.height = titleScreen.startBg.height + this.highlight.borderSize;
    }
    if (selected === 'highscores') {
      this.container.y = titleScreen.highScoresText.y;
      this.leftDragon.x = gameWidth / 2 - titleScreen.highScoresBg.width / 2 - tileSize;
      this.rightDragon.x = gameWidth / 2 + titleScreen.highScoresBg.width / 2 + tileSize;
      titleScreen.highScoresBg.alpha = 1;
      titleScreen.startBg.alpha = 0.5;
      // titleScreen.soundBg.alpha = 0.5
      this.highlight.width = titleScreen.highScoresBg.width + this.highlight.borderSize;
      this.highlight.height = titleScreen.highScoresBg.height + this.highlight.borderSize;
    }
    if (selected === 'sound') {
      this.container.y = titleScreen.soundButton.y + titleScreen.soundText.y;
      this.leftDragon.x = gameWidth / 2 - titleScreen.soundBg.width / 2 - tileSize;
      this.rightDragon.x = gameWidth / 2 + titleScreen.soundBg.width / 2 + tileSize;
      // titleScreen.soundBg.alpha = 1
      titleScreen.startBg.alpha = 0.5;
      titleScreen.highScoresBg.alpha = 0.5;
      this.highlight.width = titleScreen.soundBg.width + this.highlight.borderSize;
      this.highlight.height = titleScreen.soundBg.height + this.highlight.borderSize;
    }
    if (selected === 'fullscreen') {
      this.container.y = titleScreen.fullScreenButton.y + titleScreen.fullScreenText.y;
      this.leftDragon.x = gameWidth / 2 - titleScreen.fullScreenBg.width / 2 - tileSize;
      this.rightDragon.x = gameWidth / 2 + titleScreen.fullScreenBg.width / 2 + tileSize;
      // titleScreen.fullScreenBg.alpha = 1
      titleScreen.startBg.alpha = 0.5;
      titleScreen.highScoresBg.alpha = 0.5;
      this.highlight.width = titleScreen.fullScreenBg.width + this.highlight.borderSize;
      this.highlight.height = titleScreen.fullScreenBg.height + this.highlight.borderSize;
    }
  };
  this.adjust = function(direction) {
    var selected = this.selections[this.selected];
    if (selected === 'sound') {
      toggleSound();
    }
    if (selected === 'fullscreen') {
      toggleFullScreen();
    }
  };
  this.chooseSelection = function() {
    var selected = this.selections[this.selected];
    if (selected === 'start') {
      // if (!created) { createGame() }
      clearTitle();
    }
    if (selected === 'highscores') {
      toggleHighScores();
    }
    if (selected === 'sound') {
      toggleSound();
    }
    if (selected === 'fullscreen') {
      toggleFullScreen();
    }
  };

  this.highlightSelection = function() {
    if (precounter % 4 < 2) {
      this.highlight.tint = 0xffa000;
    } else {
      this.highlight.tint = 0xe05000;
    }
    // var selected = this.selections[this.selected]
    // if (selected==="start") {
    //     if (precounter%4<2) {
    //         // startBg.tint = 0x83d313
    //         startBg.tint = 0x006600
    //     } else {
    //         startBg.tint = 0x005500
    //     }
    // }
    // if (selected==="highscores") {
    //     if (precounter%4<2) {
    //         highScoresBg.tint = 0x000066
    //     } else {
    //         highScoresBg.tint = 0x000044
    //     }
    // }
    // if (selected==="sound") {
    //     if (precounter%4<2) {
    //         soundBg.tint = 0x555555
    //     } else {
    //         soundBg.tint = 0x444444
    //     }
    // }
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
  this.header.height = this.header.width / 4;
  this.marginX = newPixelSize * 30 + tileSize;
  this.startY = tileSize + newPixelSize * 64;
  var dragonsNeeded = Math.ceil((viewHeight - (this.header.height + tileSize)) / (tileSize + newPixelSize * 32));
  this.container.addChild(this.bg);
  this.container.addChild(this.header);
  this.backButton = new PIXI.Container();
  this.backBg = new PIXI.Sprite(PIXI.utils.TextureCache['pixel']);
  this.backBg.width = tileSize * 8;
  this.backBg.height = tileSize * 3;
  this.backBg.anchor.x = 0.5;
  this.backBg.tint = 0x444444;
  this.backBg.x = gameWidth / 2;
  this.backBg.y = viewHeight - (this.backBg.height + tileSize * 2);
  this.backText = new PIXI.Text('BACK', titleStyle);
  this.backText.anchor.set(0.5);
  this.backText.x = this.backBg.x;
  this.backText.y = this.backBg.y + this.backBg.height / 2;
  this.backButton.addChild(this.backBg);
  this.backButton.addChild(this.backText);
  this.container.addChild(this.backButton);
  this.backButton.interactive = true;
  this.backButton.on('pointerdown', function() {
    toggleHighScores();
    startDisabled = true;
    setTimeout(function() {
      startDisabled = false;
    }, 500);
  });
  this.entries = new PIXI.Container();
  this.container.addChild(this.entries);
  for (var d = 0; d < dragonsNeeded; d++) {
    var dragon1 = new PIXI.Sprite(PIXI.utils.TextureCache['fulldragon']);
    var dragon2 = new PIXI.Sprite(PIXI.utils.TextureCache['fulldragon']);
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
  this.populateEntries = function() {
    this.entries.removeChildren();
    var newEntries = scoreArray.length;
    if (scoreArray.length > 10) {
      newEntries = 10;
    }
    for (var e = 0; e < newEntries; e++) {
      var newPlayerText = new PIXI.Text(scoreArray[e][0], highScoreStyle);
      var sixDigit = '0'.repeat(6 - scoreArray[e][1].length) + scoreArray[e][1];
      var newScoreText = new PIXI.Text(sixDigit, highScoreStyle);
      newPlayerText.x = this.marginX;
      newScoreText.x = gameWidth - newScoreText.width - this.marginX;
      newPlayerText.y = newScoreText.y = this.startY + newPlayerText.height * 2 * e;
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
  this.bg = new PIXI.Sprite(PIXI.utils.TextureCache['pixel']);
  this.bg.width = gameWidth;
  this.bg.height = viewHeight;
  this.bg.tint = 0x000000;
  this.header = new PIXI.Sprite(PIXI.utils.TextureCache['emptyheader']);
  this.header.width = gameWidth;
  this.header.height = this.header.width / 4;

  this.marginX = newPixelSize * 30 + tileSize;
  this.startY = tileSize + newPixelSize * 64;
  var dragonsNeeded = Math.ceil((viewHeight - (this.header.height + tileSize)) / (tileSize + newPixelSize * 32));
  this.container.addChild(this.bg);
  this.container.addChild(this.header);
  this.backButton = new PIXI.Container();
  this.backBg = new PIXI.Sprite(PIXI.utils.TextureCache['pixel']);
  this.backBg.width = tileSize * 8;
  this.backBg.height = tileSize * 3;
  this.backBg.anchor.x = 0.5;
  this.backBg.tint = 0x444444;
  this.backBg.x = gameWidth / 2;
  this.backBg.y = viewHeight - (this.backBg.height + tileSize * 2);
  this.backText = new PIXI.Text('BACK', titleStyle);
  this.backText.anchor.set(0.5);
  this.backText.x = this.backBg.x;
  this.backText.y = this.backBg.y + this.backBg.height / 2;
  this.backButton.addChild(this.backBg);
  this.backButton.addChild(this.backText);
  this.container.addChild(this.backButton);
  this.backButton.interactive = true;
  this.backButton.on('pointerdown', function() {
    toggleNameEntry();
    startDisabled = true;
    setTimeout(function() {
      startDisabled = false;
    }, 500);
  });
  this.entries = new PIXI.Container();
  this.legend = new PIXI.Text('CONGRATULATIONS.\nYOU ARE A TRUE KUNG FU MASTER.\n \nENTER YOUR NAME TO TAKE YOUR PLACE AMONG THE OTHER TOP FIGHTERS.', blockStyle);
  this.legend.anchor.x = 0.5;
  this.legend.x = gameWidth / 2;
  this.legend.y = this.header.y + this.header.height + tileSize * 1.5;

  this.container.addChild(this.legend);

  $('#name-entry').css({
    fontSize: tileSize * 0.95
  });
  $('#name-submit').css({
    fontSize: tileSize * 0.8
  });

  for (var d = 0; d < dragonsNeeded; d++) {
    var dragon1 = new PIXI.Sprite(PIXI.utils.TextureCache['fulldragon']);
    var dragon2 = new PIXI.Sprite(PIXI.utils.TextureCache['fulldragon']);
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
  this.pulseButton = function() {
    if (precounter % 24 === 0) {
      $('#name-submit').css({
        'background-color': '#565',
        transform: 'scale(1.025)'
      });
    } else {
      $('#name-submit').css({
        'background-color': '#464',
        transform: 'scale(0.975)'
      });
    }
  };
  this.pulseEntry = function() {
    if (precounter % 24 === 0) {
      $('#name-entry').css({
        'background-color': '#afa'
      });
    } else {
      $('#name-entry').css({
        'background-color': '#fff'
      });
    }
  };

  this.container.visible = false;
}
function submitHighScore() {
  saveScoreToDatabase(gameName, document.getElementById('name-entry').value, currentRecord.score);
}
function toggleNameEntry() {
  if (enterNameScreen.container.visible) {
    enterNameScreen.container.visible = false;
    $('#name-entry').css({
      display: 'none'
    });
    $('#name-submit').css({
      display: 'none'
    });
  } else {
    enterNameScreen.container.visible = true;
    $('#name-entry').css({
      display: 'block'
    });
    $('#name-submit').css({
      display: 'block'
    });
  }
}
function toggleHighScores() {
  if (!highScoresScreen.container.visible) {
    highScoresScreen.container.visible = true;
    getScoresFromDatabase(gameName, true);
    // highScoresScreen.populateEntries()
  } else {
    highScoresScreen.container.visible = false;
  }
}
function getScoresFromDatabase(gameName, populate, check) {
  console.log('CALLING FOR SCORES ----------------');
  $.ajax({
    type: 'get',
    url: 'https://www.eggborne.com/scripts/getscores.php',
    data: { game: gameName },

    success: function(text) {
      scoreArray.length = 0;
      pairArray = text.split(' - ');
      for (item in pairArray) {
        var scoreEntry = pairArray[item].split(' ');
        var literalName = scoreEntry[0];
        if (scoreEntry.length > 2) {
          var fixedEntry = [];
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
      var lowestIndex = 9;
      if (scoreArray.length < 10) {
        lowestIndex = scoreArray.length - 1;
        lowScore = 0;
      } else {
        lowScore = scoreArray[lowestIndex][1];
      }
      topScore = scoreArray[0][1];

      console.warn('topScore', topScore, 'lowScore', lowScore);
      if (scoreDisplay) {
        scoreDisplay.topText.text = 'TOP-' + ('0'.repeat(6 - topScore.toString().length) + topScore);
      }
      if (check) {
        console.warn('checking! playerscore', player.score, 'low', lowScore);
        if (player.score > lowScore) {
          currentRecord.score = player.score;
          toggleNameEntry();
        } else {
        }
        resetGame();
        player.score = 0;
      }
    },
    error: function() {
      console.log('Could not connect to get!');
      scoreArray = [['void', 1212]];
    }
  });
}
function saveScoreToDatabase(gameName, playerName, playerScore) {
  playerName = playerName.toUpperCase();
  currentRecord.player = playerName;
  $.ajax({
    type: 'post',
    url: 'https://www.eggborne.com/scripts/savescores.php',
    data: { game: gameName, name: playerName, score: playerScore },
    success: function(data) {
      toggleNameEntry();
      toggleHighScores();
      getScoresFromDatabase(gameName, true);
    },
    error: function() {
      console.log('Could not connect to post!');
    }
  });
}
