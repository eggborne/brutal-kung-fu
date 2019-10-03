segsWide = 0;
function Level(floor, direction, startY, water, topEdge, groundY, segsWide=29, single) {
  console.error('CREATING A LEVEL', floor)
  let startedTiles = window.performance.now();
  this.floor = floor;
  this.direction = direction;
  if (direction === 'left') {
    this.playerStartX = gameWidth / 2 + player.sprite.width * 1.8;
  } else {
    this.playerStartX = gameWidth / 2 - player.sprite.width * 1.8;
  }

  this.boss = undefined;
  this.container = new PIXI.Container();
  this.topY = startY - gameHeight;
  this.topEdge = topEdge;
  this.groundY = groundY;
  if (!single) {

  var segmentsNeeded = segsWide;
  if (direction === 'left') {
    var signIndex = 5;
  } else {
    var signIndex = 0;
  }
  this.signSpots = [6, 10, 14, 18, 22, 26, 28, 32, 36, 40, 46, 50];

  let totalSegmentWidth = tileSize * 4 * segmentsNeeded;


  // let groundPiece = new PIXI.TilingSprite(PIXI.utils.TextureCache['dojofloor'], totalSegmentWidth, tileSize * 2);
  // let ceilingPiece = new PIXI.TilingSprite(PIXI.utils.TextureCache['dojoceiling'], totalSegmentWidth, tileSize * 2);
  // let upper = new PIXI.TilingSprite(PIXI.utils.TextureCache['spinebg'], totalSegmentWidth, newPixelSize * 28);
  // let waterPiece = new PIXI.TilingSprite(PIXI.utils.TextureCache[water], totalSegmentWidth, newPixelSize * 28);

  // groundPiece.x = ceilingPiece.x = waterPiece.x = upper.x = 0;
  // groundPiece.y = this.groundY - newPixelSize * 8;
  // waterPiece.y = groundPiece.y + groundPiece.height;
  // ceilingPiece.y = this.topEdge + upper.height / 3;

  // groundPiece.tileScale.x = ceilingPiece.tileScale.x = upper.tileScale.x = waterPiece.tileScale.x = newPixelSize;
  // groundPiece.tileScale.y = ceilingPiece.tileScale.y = upper.tileScale.y = waterPiece.tileScale.y = newPixelSize;
  // groundPiece.tilePosition.x = ceilingPiece.tilePosition.x = upper.tilePosition.x = waterPiece.tilePosition.x = 0;
  // groundPiece.tilePosition.y = ceilingPiece.tilePosition.y = upper.tilePosition.y = waterPiece.tilePosition.y = 0;
  // this.ceilingY = ceilingPiece.y + (ceilingPiece.height - 2 * newPixelSize);
  // upper.y = ceilingPiece.y - upper.height;
  // this.container.addChild(groundPiece);
  // this.container.addChild(ceilingPiece);
  // this.container.addChild(waterPiece);
  // this.container.addChild(upper);

  for (var s = 0; s < segmentsNeeded; s++) {
    var groundPiece = new PIXI.Sprite(PIXI.utils.TextureCache['dojofloor']);
    var ceilingPiece = new PIXI.Sprite(PIXI.utils.TextureCache['dojoceiling']);
    var upper = new PIXI.Sprite(PIXI.utils.TextureCache['spinebg']);
    var waterPiece = new PIXI.Sprite(PIXI.utils.TextureCache[water]);
    // groundPiece.cacheAsBitmap = ceilingPiece.cacheAsBitmap = upper.cacheAsBitmap = waterPiece.cacheAsBitmap = true;
    groundPiece.width = ceilingPiece.width = waterPiece.width = upper.width = tileSize * 4;
    groundPiece.height = ceilingPiece.height = upper.height = tileSize * 2;
    groundPiece.y = this.groundY - newPixelSize * 8;
    waterPiece.height = newPixelSize * 28;
    waterPiece.y = groundPiece.y + groundPiece.height;
    groundPiece.x = ceilingPiece.x = waterPiece.x = upper.x = groundPiece.width * s;

    ceilingPiece.y = this.topEdge + upper.height / 3;
    this.ceilingY = ceilingPiece.y + (ceilingPiece.height - 2 * newPixelSize);
    upper.y = ceilingPiece.y - upper.height;
    this.container.addChild(groundPiece);
    this.container.addChild(ceilingPiece);
    this.container.addChild(waterPiece);
    this.container.addChild(upper);
    if (s - 1 > 0 && (s - 1) % 4 === 0) {
      if (direction === 'left') {
        var sign = new PIXI.Sprite(PIXI.utils.TextureCache['sign' + signIndex]);
        signIndex--;
      } else {
        var sign = new PIXI.Sprite(PIXI.utils.TextureCache['sign' + signIndex]);
        signIndex++;
      }
      sign.width = tileSize * 2;
      sign.height = tileSize - newPixelSize * 2;
      sign.x = (tileSize * 4 * s) - sign.width * 0.15;
      sign.y = ceilingPiece.y + newPixelSize * 7;
      this.container.addChild(sign);
    }
  }  
  this.stairs = new PIXI.Sprite(PIXI.utils.TextureCache['stairs']);
  this.stairs.width = 92 * newPixelSize;
  this.stairs.height = 92 * newPixelSize;
  this.stairs.y = this.ceilingY;

  if (direction === 'left') {
    this.stairs.x = 0;
    this.startX = this.container.x = -(this.container.width - gameWidth);
    this.startY = this.container.y = 0;
    this.bossSpotX = this.container.x + tileSize * 4 * 5 + tileSize;
    this.scrollLimitX = gameWidth + this.stairs.width;
    // this.stairs.x = this.container.x
  } else {
    this.startX = this.container.x = 0;
    this.startY = this.container.y = 0;
    this.stairs.scale.x *= -1;
    this.stairs.x = this.container.width;
    this.bossSpotX = this.container.width - tileSize * 4 * 5 + tileSize;
    this.scrollLimitX = gameWidth + this.stairs.width;
  }

    this.container.addChild(this.stairs);
    gameContainer.addChild(this.container);
  }
  this.levelWidth = this.container.width;
  console.error('MADE LEVEL IN', window.performance.now() - startedTiles);
}
function levelUp(amount) {
  console.error('levelUp called, while levelReached is', levelReached)
  levelReached += amount;
  bosses.map((boss, i) => {
    if ((i+1) < levelReached) {
      boss.sprite.alpha = 0;
    }
  });
  let nextLevel;
  let lvlData;
  if (levelReached > 1) {
    gameContainer.removeChild(player.level.container);
    lvlData = levelData[levelReached - 1];
    console.info('>>>>>>>> new lvlData', lvlData);
    nextLevel = new Level(levelReached, lvlData.direction, gameHeight, lvlData.water, topEdge, groundY);
    scoreDisplay.floorKnobs[levelReached - 1].tint = 0xea9f22;
    player.level = nextLevel;
    player.levelData = lvlData;
  
    enemyFrequency = player.levelData.enemyFrequency;
    eggFrequency = player.levelData.eggFrequency;
    gripperLimit = player.levelData.limits.grippers;
    tomtomLimit = player.levelData.limits.tomtoms;
  
    gameContainer.setChildIndex(player.sprite, gameContainer.children.indexOf(player.level.container));
  } else {
    nextLevel = level1;
    lvlData = player.levelData;
  }
  floorDisplay.legend.text = 'LEVEL ' + levelReached;
  scoreSequenceStarted = endSequenceStarted = false;
  if (player.level.direction === 'left') {
  }
  player.sprite.x = player.level.playerStartX;
  player.sprite.y = player.level.groundY;
  player.fightingBoss = false;

  floorDisplay.container.visible = true;

  gameContainer.x = 0;
  levelTime = 2000;
  player.hp = player.maxHP;
  // player.level.boss.hp = player.level.boss.maxHP
  player.beganJump = 0;
  player.beganPunch = 0;
  player.beganKick = 0;
  player.punching = player.kicking = player.ducking = false;
  counter = 0;
  lastKT = 0;
  scoreDisplay.timeText.text = '0'.repeat(4 - levelTime.toString().length) + levelTime;
  scoreDisplay.updateScore(player.score);
  scoreDisplay.playerBar.width = scoreDisplay.playerBarMax / (player.maxHP / player.hp);
  // scoreDisplay.enemyBar.width = scoreDisplay.enemyBarMax/(player.level.boss.maxHP/player.level.boss.hp)
  player.level.boss = bosses[levelReached - 1];
  var newBoss = lvlData.boss;
  newBoss.level = player.level;
  newBoss.sprite.x = newBoss.homeX = player.level.bossSpotX;
  newBoss.sprite.scale.x *= -1;
  newBoss.sprite.y = player.level.groundY;
  newBoss.hp = newBoss.maxHP;
  newBoss.dead = false;
  newBoss.changeTexture(newBoss.character + 'walk0');
  if (player.level.direction === 'left') {
    if (player.sprite.scale.x > 0) {
      player.sprite.scale.x *= -1;
    }
    if (newBoss.sprite.scale.x < 0) {
      newBoss.sprite.scale.x *= -1;
    }
  }
  if (player.level.direction === 'right') {
    if (player.sprite.scale.x < 0) {
      player.sprite.scale.x *= -1;
    }
    if (newBoss.sprite.scale.x > 0) {
      newBoss.sprite.scale.x *= -1;
    }
  }
  enemyFrequency = lvlData.enemyFrequency;
  eggFrequency = lvlData.eggFrequency;
  scoreDisplay.enemyBar.width = scoreDisplay.enemyBarMax;
}
function playEndSequence() {
  var since = counter - wonAt;
  if (since === 0) {
    player.sprite.y = player.level.groundY;
    gameContainer.setChildIndex(player.sprite, gameContainer.children.indexOf(player.level.container));
  }
  if (player.level.direction === 'left') {
    if (gameContainer.x + newPixelSize * 3 < player.level.levelWidth - gameWidth) {
      gameContainer.x += newPixelSize * 3;
    } else {
      gameContainer.x = player.level.levelWidth - gameWidth;
      if (!scoreSequenceStarted && since % 5 === 0) {
        if (since % 10 === 0) {
          player.sprite.texture = PIXI.utils.TextureCache[player.character + 'walk1'];
        } else {
          player.sprite.texture = PIXI.utils.TextureCache[player.character + 'walk2'];
        }
        if (player.sprite.y > tileSize * 3) {
          player.sprite.x -= newPixelSize * 4;
          player.sprite.y -= newPixelSize * 4.6;
        } else {
          scoreSequenceStarted = true;
          clearBoard();
        }
      }
    }
  } else {
    if (gameContainer.x - newPixelSize * 3 > -player.level.levelWidth + gameWidth) {
      gameContainer.x -= newPixelSize * 3;
    } else {
      gameContainer.x = -player.level.levelWidth + gameWidth;
      if (!scoreSequenceStarted && since % 5 === 0) {
        if (since % 10 === 0) {
          player.sprite.texture = PIXI.utils.TextureCache[player.character + 'walk1'];
        } else {
          player.sprite.texture = PIXI.utils.TextureCache[player.character + 'walk2'];
        }
        if (player.sprite.y > tileSize * 3) {
          player.sprite.x += newPixelSize * 4;
          player.sprite.y -= newPixelSize * 4.6;
        } else {
          scoreSequenceStarted = true;
          clearBoard();
        }
      }
    }
  }
  if (scoreSequenceStarted) {
    if (since % 1 === 0) {
      if (player.hp > 0) {
        player.hp--;
        player.score += 100;
        scoreDisplay.playerBar.width = scoreDisplay.playerBarMax / (player.maxHP / player.hp);
        scoreDisplay.updateScore(player.score);
      } else {
        if (levelTime - 15 >= 0) {
          levelTime -= 15;
          player.score += 150;
          scoreDisplay.timeText.text = '0'.repeat(4 - levelTime.toString().length) + levelTime;
          scoreDisplay.updateScore(player.score);
        } else {
          var remainder = levelTime;
          levelTime -= remainder;
          player.score += remainder * 10;
          scoreDisplay.timeText.text = '0'.repeat(4 - levelTime.toString().length) + levelTime;
          scoreDisplay.updateScore(player.score);
        }
        if (levelTime === 0) {
          if (levelReached === 5) {
            levelReached = 1;
            levelUp(0);
          } else {
            levelUp(1);
          }
          // levelReached++;
          // gameContainer.removeChild(player.level.container);
          // var lvlData = levelData[levelReached - 1];
          // var nextLevel = new Level(levelReached, lvlData.direction, gameHeight, lvlData.water, topEdge, groundY);
          // scoreDisplay.floorKnobs[levelReached - 1].tint = 0xea9f22;
          // player.level = nextLevel;
          // gameContainer.setChildIndex(player.sprite, gameContainer.children.indexOf(player.level.container));
          // floorDisplay.legend.text = 'LEVEL ' + levelReached;
          // scoreSequenceStarted = endSequenceStarted = false;
          // if (player.level.direction === 'left') {
          // }
          // player.sprite.x = player.level.playerStartX;
          // player.sprite.y = player.level.groundY;
          // player.fightingBoss = false;

          // floorDisplay.container.visible = true;

          // gameContainer.x = 0;
          // levelTime = 2000;
          // player.hp = player.maxHP;
          // // player.level.boss.hp = player.level.boss.maxHP
          // player.beganJump = 0;
          // player.beganPunch = 0;
          // player.beganKick = 0;
          // player.punching = player.kicking = player.ducking = false;
          // counter = 0;
          // lastKT = 0;
          // scoreDisplay.timeText.text = '0'.repeat(4 - levelTime.toString().length) + levelTime;
          // scoreDisplay.updateScore(player.score);
          // scoreDisplay.playerBar.width = scoreDisplay.playerBarMax / (player.maxHP / player.hp);
          // // scoreDisplay.enemyBar.width = scoreDisplay.enemyBarMax/(player.level.boss.maxHP/player.level.boss.hp)
          // player.level.boss = bosses[levelReached - 1];
          // var newBoss = lvlData.boss;
          // newBoss.level = player.level;
          // newBoss.sprite.x = newBoss.homeX = player.level.bossSpotX;
          // newBoss.sprite.scale.x *= -1;
          // newBoss.sprite.y = player.level.groundY;
          // newBoss.hp = newBoss.maxHP;
          // newBoss.dead = false;
          // newBoss.changeTexture(newBoss.character + 'walk0');
          // if (player.level.direction === 'left') {
          //   if (player.sprite.scale.x > 0) {
          //     player.sprite.scale.x *= -1;
          //   }
          //   if (newBoss.sprite.scale.x < 0) {
          //     newBoss.sprite.scale.x *= -1;
          //   }
          // }
          // if (player.level.direction === 'right') {
          //   if (player.sprite.scale.x < 0) {
          //     player.sprite.scale.x *= -1;
          //   }
          //   if (newBoss.sprite.scale.x > 0) {
          //     newBoss.sprite.scale.x *= -1;
          //   }
          // }
          // enemyFrequency = lvlData.enemyFrequency;
          // eggFrequency = lvlData.eggFrequency;
          // scoreDisplay.enemyBar.width = scoreDisplay.enemyBarMax;
          setTimeout(function() {
            wonRound = false;
          }, 1000);
          // gameContainer.removeChild(player.level.container)
        }
      }
    }
  }
}
window.addEventListener('fullscreenchange', () => {
  setTimeout(() => {
    document.body.style.opacity = 1;
    document.documentElement.style.setProperty('--screen-height', window.innerHeight + 'px');
    viewWidth = window.innerWidth;
    viewHeight = window.innerHeight;

    gameWidth = document.getElementById('game-canvas').offsetWidth;
    gameHeight = document.getElementById('game-canvas').offsetHeight;
    document.documentElement.style.setProperty('--game-x', document.getElementById('game-canvas').offsetLeft + 'px')
    document.documentElement.style.setProperty('--game-width', gameWidth + 'px')
    document.documentElement.style.setProperty('--game-height', gameHeight + 'px')
    actualHeight = parseInt(gameHeight);
    tileSize = Math.round(gameWidth / tilesPerWidth);
    document.documentElement.style.setProperty('--tile-size', tileSize + 'px')
    newPixelSize = tileSize / tilesPerWidth;
    document.documentElement.style.setProperty('--pixel-size', newPixelSize + 'px');
    
  }, 1250);
});
