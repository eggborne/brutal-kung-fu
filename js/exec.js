let startedZoom = -99;
function update() {
  if (gameInitiated && gameMode === 'horde' && counter > 0 && counter % 1200 === 0) {
    if (counter % 2400 === 0 && gripperLimit < 15) {
      gripperLimit++;
      console.error('UP --------------> gripperLimit', gripperLimit)
    }
    if (counter % 3600 === 0 && tomtomLimit < 10) {
      tomtomLimit++;
      console.error('UP --------------> tomtomLimit', tomtomLimit)
    }
    if (enemyFrequency > 5) {
      enemyFrequency--;
      console.error('UP --------------> enemyFrequency', enemyFrequency)
    }
    if (eggFrequency > 10) {
      eggFrequency--;
      console.error('UP --------------> eggFrequency', eggFrequency)
    }
  }
  if (counter === 60) {
    console.error('gripperLimit', gripperLimit)

    console.error('tomtomLimit', tomtomLimit)

    console.error('enemyFrequency', enemyFrequency)

    console.error('eggFrequency', eggFrequency)

  }
  if (gameInitiated && !dragonScreen.container.visible && !enterNameScreen.container.visible && counter < introTime) {
  } else if (gameInitiated && counter < introTime + walkupTime) {
    let since = counter - introTime;
    if (player.level.direction === 'left') {
      var walkDir = -player.walkSpeed;
      var offCenter = player.sprite.x > gameWidth / 2;
    } else {
      var walkDir = player.walkSpeed;
      var offCenter = player.sprite.x < gameWidth / 2;
    }
    if (since === 0) {        
      floorDisplay.bg.visible = true;
      floorDisplay.legend.visible = true;
    }
    if (since === 54) {
      floorDisplay.readyBg.visible = true;
      floorDisplay.readyLegend.visible = true;
    }
    if (offCenter) {
      if (gameMode !== 'horde') {
        player.walk(walkDir, true);
        if (since % 6 === 0) {
          playSound(stepSound);
        }
      }
    } else {
      if (gameMode !== 'horde') { player.sprite.x = gameWidth / 2; }
      setTimeout(function() {
        floorDisplay.container.visible = false;
        floorDisplay.readyBg.visible = false;
        floorDisplay.readyLegend.visible = false;
        floorDisplay.bg.visible = false;
        floorDisplay.legend.visible = false;
        floorDisplay.bg.width = tileSize * 3.5;
      }, 2000);
    }
  }
  if (gameInitiated && counter === introTime + walkupTime) {
    playSound(bgMusic);
  }
  // scoreDisplay.topText.text = "G-" + grippers.length + " T-" + tomtoms.length + " K-" + knifethrowers.length + " P-" + powerups.length
  if (gameInitiated 
    && !wonRound 
    && !arrow.sprite.visible 
    && !player.fightingBoss 
    && counter > introTime + walkupTime 
    && counter % enemyFrequency === 0) {
    if (randomInt(0, 2)) {
      spawnRandomEnemy();
    } else if (counter - lastKT > 120 && 
      knifethrowers.length < player.levelData.limits.knifethrowers) {      
      let randSide = (randomInt(0,1) || wonRound) ? 'right' : 'left';

      // why this bit?
      if (Math.abs(player.sprite.x - player.level.playerStartX) < gameWidth * 1.5) {
        randSide = player.level.direction;
      }

      if (randomInt(0, 1)) {
        new Knifethrower(randSide);
      } else if (knifethrowers.length === 0) {
        new Knifethrower(randSide, gameWidth / 2);
        new Knifethrower(randSide);
      }
    } else {
      if (gameMode === 'horde') {
        spawnRandomEnemy()
      }
    }
  }
  if (gameInitiated 
    && !wonRound 
    && !player.fightingBoss 
    && eggFrequency 
    && counter % eggFrequency === 0) {
    var eggSpot = player.sprite.x + tileSize * 8; // right side only
    if (Math.abs(lastEggX - eggSpot) > gameWidth / 2) {
      var newEggType = eggTypes[randomInt(0, 2)];
      new Egg(newEggType, eggSpot);
      console.warn('------- EGG --------')
    }
  }
  if (!landscape && !endSequenceStarted && !player.dead && touchingDPad) {
    nesPanel.monitorDPad();
  }
  if (gameInitiated) {
    if (arrow.sprite.visible) {
      arrow.flash();
    }
    for (var g = 0; g < grippers.length; g++) {
      var gripper = grippers[g];
      if (!gripper.dead) {
        if (!gripper.gripping) {
          gripper.walk(gripper.walkSpeed);
          gripper.checkForProjectiles();
        } else {
          gripper.gripTime++;
          if (counter % gripper.drainRate === 0 && player.hp - 1 >= 0) {
            player.damage(1, gripper.gripTime > 50);
          }
          if (counter === player.landedAt + 1 || counter === player.diedAt + 1) {
            gripper.gripping = false;
            player.grippers.splice(player.grippers.indexOf(gripper), 1);
          }
        }
        gripper.checkForPlayer();
        // gripper.applyGravity()
        gripper.applyVelocity();
      } else {
        gripper.die();
      }
      if (!gripper.sprite.visible) {
        grippers.splice(grippers.indexOf(gripper), 1);
        g--;
      }
    }
    for (var t = 0; t < tomtoms.length; t++) {
      var tomtom = tomtoms[t];
      if (!tomtom.dead) {
        if (!tomtom.gripping) {
          tomtom.walk(tomtom.walkSpeed);
          tomtom.checkForProjectiles();
        } else {
          tomtom.gripTime++;
          if (counter % tomtom.drainRate === 0 && player.hp - 1 >= 0) {
            player.damage(1, tomtom.gripTime < 50);
          }
          if (counter === player.landedAt + 1 || counter === player.diedAt + 1) {
            tomtom.gripping = false;
            player.grippers.splice(player.grippers.indexOf(tomtom), 1);
          }
        }
        if (tomtom.leapt && !tomtom.landed) {
          tomtom.leap();
        }
        tomtom.checkForPlayer();
        tomtom.applyGravity();
        tomtom.applyVelocity();
      } else {
        tomtom.die();
      }
      if (!tomtom.sprite.visible) {
        tomtoms.splice(tomtoms.indexOf(tomtom), 1);
        t--;
      }
    }
    for (var p = 0; p < powerups.length; p++) {
      var powerup = powerups[p];
      if (powerup.sprite.y < powerup.yLimit) {
        if (powerup.dropped) {
          // powerup.sprite.y += newPixelSize*4
        } else {
          powerup.sprite.y += newPixelSize * 3;
        }

        if (powerup.dropped) {
          powerup.sprite.rotation -= degToRad(12);
          powerup.sprite.scale.x *= 1.01;
          powerup.sprite.scale.y *= 1.01;
          powerup.sprite.y -= newPixelSize;
          powerup.sprite.alpha -= 0.03;
        }
        if (powerup.sprite.y > powerup.yLimit) {
          powerup.sprite.y = powerup.yLimit;
        }
      } else {
        powerup.pulse();
        powerup.checkForPlayer();
      }
      if (powerup.sprite.alpha < 0 || Math.abs(powerup.sprite.x - player.sprite.x) > gameWidth) {
        powerups.splice(powerups.indexOf(powerup), 1);
        gameContainer.removeChild(powerup.sprite);
        p--;
      }
    }
    for (var k = 0; k < knifethrowers.length; k++) {
      var kt = knifethrowers[k];
      if (!kt.dead) {
        if (true) {
          kt.checkForProjectiles();
          if (kt.reeling) {
            kt.reel();
          } else {
            if (counter - kt.damagedAt > player.kickSpeed) {
              if (kt.throwing) {
                kt.throw(kt.throwType);
              } else {
                if (!kt.paused) {
                  kt.walk(kt.walkSpeed);
                } else {
                  if (counter === kt.nextThrow) {
                    kt.paused = false;
                    kt.throwKnife('random', [0, 2]);
                  }
                }
              }
            }
            kt.checkForPlayer();
          }
        }
        // kt.applyGravity()
        kt.applyVelocity();
      } else {
        kt.die();
        if (!kt.sprite.visible) {
          knifethrowers.splice(knifethrowers.indexOf(kt), 1);
          k--;
          if (knifethrowers.length === 1) {
            lastKT = counter;
          }
        }
      }
    }
  }
  for (var b = 0; b < scoreBlips.length; b++) {
    var blip = scoreBlips[b];
    blip.fade();
  }
  if (gameInitiated) {
    for (var s = 0; s < snakes.length; s++) {
      var snake = snakes[s];
      if (snake.sprite.visible) {
        if (!snake.diedAt) {
          snake.walk();
          snake.checkForPlayer();
        } else {
          snake.die();
        }
      } else {
        gameContainer.removeChild(snake.sprite);
        snakes.splice(snakes.indexOf(snake), 1);
        s--;
      }
    }
    for (var e = 0; e < eggs.length; e++) {
      var egg = eggs[e];
      if (egg.sprite.visible) {
        if (egg.timer > 0) {
          egg.timer--;
        } else {
          if (!egg.landedAt) {
            egg.fall();
            egg.checkForPlayer();
          } else {
            if (counter - egg.landedAt < egg.delay) {
              if ((counter - egg.landedAt) % 6 < 3) {
                egg.sprite.y += newPixelSize;
              } else {
                egg.sprite.y -= newPixelSize;
              }
            } else {
              egg.hatch();
            }
          }
        }
      } else {
        gameContainer.removeChild(egg.sprite);
        eggs.splice(eggs.indexOf(egg), 1);
        e--;
      }
    }
    for (var c = 0; c < confettiBalls.length; c++) {
      var ball = confettiBalls[c];
      ball.burst();
      ball.checkForPlayer();
      if (ball.shards.length === 0) {
        confettiBalls.splice(confettiBalls.indexOf(ball), 1);
        c--;
      }
    }
  }
  for (var d = 0; d < dragons.length; d++) {
    var dragon = dragons[d];
    if (!dragon.hatched) {
      dragon.hatch();
    }
    if (!dragon.dead) {
      if (counter - dragon.bornAt === 90) {
        dragon.spew();
      }
      if (counter - dragon.spewedAt === 45) {
        dragon.flame.visible = false;
      }
      if (counter - dragon.bornAt >= dragon.longevity) {
        dragon.vanish();
      }
      dragon.checkForPlayer();
    } else {
      dragon.vanish();
    }
  }
  for (var v = 0; v < knives.length; v++) {
    var knife = knives[v];
    if (knife.visible) {
      if (knife.scale.x > 0) {
        knife.x += fighterScale * newPixelSize * 3;
      } else {
        knife.x -= fighterScale * newPixelSize * 3;
      }
      if (true) {
        if (knife.hit || Math.abs(knife.x - player.sprite.x) >= (gameWidth / 2)) {
          // knife.visible = false
          knives.splice(knives.indexOf(knife), 1);
          gameContainer.removeChild(knife);
          v--;
        }
      } else {
      }
    }
  }
  for (var b = 0; b < boomerangs.length; b++) {
    var boomerang = boomerangs[b];
    if (boomerang.sprite.visible) {
      boomerang.fly();
      if (boomerang.flipping) {
        boomerang.flip();
      }
    } else {
      boomerangs.splice(boomerangs.indexOf(boomerang), 1);
      gameContainer.removeChild(boomerang.sprite);
      b--;
    }
  }
  for (var f = 0; f < fireballs.length; f++) {
    var fireball = fireballs[f];
    if (fireball.sprite.visible) {
      fireball.fly();
    } else {
      fireballs.splice(fireballs.indexOf(fireball), 1);
      gameContainer.removeChild(fireball.sprite);
      f--;
    }
  }
  for (var p = 0; p < smokePillars.length; p++) {
    var pillar = smokePillars[p];
    if (pillar.sprite.visible) {
      pillar.animate();
    } else {
      smokePillars.splice(smokePillars.indexOf(pillar), 1);
      gameContainer.removeChild(pillar.sprite);
      p--;
    }
  }
  for (var s = 0; s < squibs.length; s++) {
    var squib = squibs[s];

    if (counter === squib.bornAt + squib.keepDroplets) {
      squib.clearDroplets();
      squibs.splice(squibs.indexOf(squib), 1);
      gameContainer.removeChild(squib.container);
      s--;
    } else {
      squib.animate();
      if (counter === squib.bornAt + 15) {
        squib.layDroplets(randomInt(8, 12));
      }
    }
  }
  // if (player.attackHitting) {
  //     player.sprite.tint = 0x00ff00

  // } else {
  //     player.sprite.tint = 0xffffff
  // }
  if (player.fightingBoss) {
    var boss = player.level.boss;
    if (!boss.dead) {
      if (!player.dead) {
        if (!boss.lostHead) {
          // if (boss.punching) {
          //     boss.punch()
          // }
          boss.checkForPlayer();
          boss.checkForProjectiles();
          if (boss.ducking) {
            if (counter - boss.beganDuck === 20) {
              var standText = boss.walkFrames[boss.walkFrame];
              boss.changeTexture(standText);
              boss.endedDuck = counter;
              boss.ducking = false;
            }
          } else if (!boss.stunned) {
            if (boss.dodging) {
              boss.dodge();
            } else {
              if (!boss.punching && !boss.kicking) {
                boss.dance();
              }
            }
          }
          if (boss.punching) {
            boss.punch();
          }
          if (boss.kicking) {
            boss.kick();
          }
          if (boss.windingUp) {
            boss.windUp();
          }
          boss.applyGravity();
          boss.applyVelocity();
          if (boss.sprite.x < -player.level.levelWidth + player.level.scrollLimitX + newPixelSize * 6) {
            boss.sprite.x = -player.level.levelWidth + player.level.scrollLimitX + newPixelSize * 7;
          }
        } else {
          boss.head.rotation += degToRad(15);
          boss.head.x -= newPixelSize * 3;
          boss.head.y -= newPixelSize * 2;
          if (counter - boss.lostHead === 20) {
            new SmokePillar(boss.sprite.x);
          }
          if (counter - boss.lostHead === 60) {
            boss.changeTexture(boss.character + 'walk0');
            boss.lostHead = 0;
          }
        }
      }
    } else {
      boss.die();
    }
  }
  if (gameInitiated && !player.dead) {
    player.checkForProjectiles();
    // if (player.beganJump >= counter-30) {
    if (counter > introTime + walkupTime && player.beganJump >= counter - 20) {
      player.leap();
    }
    if (player.beganDuck === counter) {
      if (player.character === 'thomas') {
        if (player.stance) {
          var duckText = 'duckpunchstance';
        } else {
          var duckText = 'duckkickstance';
        }
      }
      if (player.character === 'stickman') {
        var duckText = 'stickmanduckpunch0';
      }
      player.sprite.texture = PIXI.utils.TextureCache[player.character + duckText + player.weapon];
    }
    if (player.endedDuck === counter) {
      if (player.character === 'thomas') {
        if (player.stance) {
          var standText = 'stance';
        } else {
          var standText = 'walk1';
        }
      }
      if (player.character === 'stickman') {
        var standText = 'stickmanwalk1';
      }
      player.sprite.texture = PIXI.utils.TextureCache[player.character + standText + player.weapon];
    }
    if (counter > introTime + walkupTime) {
      if (player.punching) {
        player.punch();
      }
      if (player.kicking) {
        player.kick();
      }
    }
    if (!endSequenceStarted && counter > introTime + walkupTime && !player.stunned) {
      if ((!player.grippers.length && !player.ducking && !player.punching && !player.kicking) || player.sprite.y < player.level.groundY) {
        if (pressingRight) {
          player.walk(player.walkSpeed);
        }
        if (pressingLeft) {
          player.walk(-player.walkSpeed);
        }
      }
    }
  } else if (gameInitiated) {
    player.sprite.texture = PIXI.utils.TextureCache[player.character + 'dead'];
    if (lives === 0 && counter - player.diedAt === 5) {
      floorDisplay.container.visible = true;
      floorDisplay.container.x = player.sprite.x;
      floorDisplay.bg.visible = true;
      floorDisplay.legend.visible = true;
      floorDisplay.bg.width = tileSize * 4.5;
      floorDisplay.legend.text = 'GAME OVER';
    }
    if (counter - player.diedAt === 110 && player.sprite.y > gameHeight + player.sprite.height) {
      if (lives === 0) {
        getScoresFromDatabase(gameName, true, true);
      } else {
        setTimeout(function() {
          resetGame();
        }, 1000);
      }
    } else {
      player.sprite.y += newPixelSize * 3.3;
    }
  }
  if (gameInitiated) {
    scoreDisplay.blinkCurrentFloor();
    if (!endSequenceStarted) {
      player.applyGravity();
      player.applyVelocity();
      if (!floorDisplay.container.visible && counter % 60 === 0) {
        if (levelTime - 1 > 0) {
          levelTime--;
          scoreDisplay.timeText.text = '0'.repeat(4 - levelTime.toString().length) + levelTime;
        } else if (!player.dead) {
          levelTime--;
          scoreDisplay.timeText.text = '0'.repeat(4 - levelTime.toString().length) + levelTime;
          player.kill();
          floorDisplay.container.visible = true;
          floorDisplay.timeUpBg.visible = true;
          floorDisplay.timeUpLegend.visible = true;
          floorDisplay.timeUpBg.x = floorDisplay.timeUpLegend.x = player.sprite.x - gameWidth / 2;
        }
      }
    } else {
      playEndSequence();
      // end level sequence
    }
    counter++;
    // player.sprite.y = player.level.groundY
  } else {
    precounter++;
    selector.highlightSelection();
  }
}
