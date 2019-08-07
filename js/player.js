
let godMode = false;

function Fighter(character, scale) {
  if (!scale) {
    scale = fighterScale;
  }
  this.character = 'thomas';
  this.sprite = new PIXI.Sprite(PIXI.utils.TextureCache[this.character + 'walk1']);
  this.sprite.width = this.sprite.height = tileSize * 3 * scale;
  this.sprite.anchor.x = 0.5;
  this.sprite.anchor.y = 1;
  gameContainer.addChild(this.sprite);
  this.beganMove = this.beganJump = this.beganPunch = this.beganKick = this.beganDuck = this.endedDuck = this.droppedAt = -99;
  this.walkFrames = ['walk1', 'walk2'];
  this.jumpFrames = ['jump0', 'jump1', 'jump2'];
  this.kickFrames = ['kick0', 'kick1'];
  this.stance = false;
  this.walkFrame = 0;
  this.jumpFrame = 0;
  this.kickFrame = 0;
  this.velocity = { x: 0, y: 0 };
  this.level = undefined;
  this.punchSpeed = 3;
  this.kickSpeed = 15;
  this.walkSpeed = fighterScale * playerSpeed * (godMode ? 3 : 1.1);
  this.punching = this.kicking = this.ducking = false;
  this.currentMoveDuration = 0;
  this.dealtBlow = false;
  this.jumping = false;
  this.landedAt = -99;
  // this.leapForce = tileSize/2.8
  this.leapForce = tileSize / 3.3;
  this.gravityForce = newPixelSize / 3;
  this.grippers = [];
  this.hp = this.maxHP = godMode ? 300 : 100;
  this.dead = false;
  this.diedAt = -99;
  this.score = 0;
  this.weapon = '';
  this.damagedAt = -99;
  this.stunned = false;
  this.punchRange = tileSize * 1.1 * fighterScale;
  this.kickRange = tileSize * 1.6 * fighterScale;
  this.previousTexture = this.sprite.texture;
  this.nextTexture = this.sprite.texture;
  this.killed = 0;
  this.attackHitting = false;

  this.headHeight = this.sprite.height;
  this.fightingBoss = false;
  this.footContact = function(victim) {
    if (this.sprite.scale.x < 0) {
      return { x: this.sprite.x - tileSize * 2, y: this.sprite.y - tileSize * 2 };
    } else {
      return { x: this.sprite.x + tileSize * 2, y: this.sprite.y - tileSize * 2 };
    }
  };
  this.changeTexture = function(newText) {
    this.sprite.texture = PIXI.utils.TextureCache[this.character + newText + this.weapon];
  };
  this.checkForProjectiles = function() {
    for (var v = 0; v < knives.length; v++) {
      var knife = knives[v];
      if (Math.abs(knife.x - this.sprite.x) < tileSize / 2) {
        if (this.ducking && knife.type === 'high') {
        } else if (this.sprite.y < this.level.groundY && knife.type === 'low') {
        } else {
          knife.hit = true;
          if (!this.stunned) {
            if (knife.scale.x > 0) {
              var hitFrom = 'left';
            } else {
              var hitFrom = 'right';
            }
            this.flinch(knife.type, true, hitFrom);
            playSound(shortHitSound);
          }
          this.damage(20);
        }
      }
    }
  };
  this.throw = function(weapon) {
    if (weapon === 'knife') {
      var knife = new PIXI.Sprite(PIXI.utils.TextureCache['knife']);
      if (this.ducking) {
        knife.type = 'low';
        var knifeY = this.sprite.y - tileSize;
      } else if (this.sprite.y < this.level.groundY) {
        knife.type = 'air';
        var knifeY = this.sprite.y - tileSize * 2;
      } else {
        knife.type = 'high';
        var knifeY = this.sprite.y - tileSize * 2;
      }
      knife.width = newPixelSize * 9 * fighterScale;
      knife.height = newPixelSize * 4.5 * fighterScale;
      knife.enemy = false;
      knife.anchor.set(0.5);
      if (this.sprite.scale.x > 0) {
        var knifeX = this.sprite.x + tileSize;
      } else {
        knife.scale.x *= -1;
        var knifeX = this.sprite.x - tileSize;
      }
      knife.x = knifeX;
      knife.y = knifeY;
      gameContainer.addChild(knife);
      knives.push(knife);
    }
  };
  this.flinch = function(pos, knife, hitFrom) {
    this.stunned = true;
    this.previousTexture = this.sprite.texture;
    if (!this.ducking) {
      this.sprite.texture = PIXI.utils.TextureCache[this.character + 'injured'];
    } else {
      this.sprite.texture = PIXI.utils.TextureCache[this.character + 'duckinginjured'];
    }
    if (pos === 'low') {
      // new Squib(this,this.sprite.x,this.sprite.y-(this.sprite.height*0.2))
      if (knife) {
        new Squib(this, this.sprite.x, this.sprite.y - this.sprite.height * 0.2, 64, 'knife', hitFrom);
      } else {
        new Squib(this, this.sprite.x, this.sprite.y - this.sprite.height * 0.2, 64, 'punch');
      }
    } else {
      if (knife) {
        new Squib(this, this.sprite.x, this.sprite.y - this.sprite.height * 0.7, 64, 'knife', hitFrom);
      } else {
        new Squib(this, this.sprite.x, this.sprite.y - this.sprite.height * 0.7, 64, 'punch');
      }
    }

    setTimeout(function() {
      player.stunned = false;
      player.sprite.texture = player.previousTexture;
    }, 250);
  };
  this.dropWeapon = function() {
    this.droppedAt = counter;
    var dropped = new Powerup(this.sprite.x, this.weapon, true);
    this.weapon = '';
    nesPanel.throwBG.tint = 0x990000;
    if (player.ducking) {
      player.sprite.texture = PIXI.utils.TextureCache[this.character + 'duckpunchstance'];
    } else {
      player.sprite.texture = PIXI.utils.TextureCache[this.character + 'stance'];
    }
    setTimeout(function() {
      nesPanel.throwBG.tint = 0x009900;
      setTimeout(function() {
        nesPanel.throwBG.tint = 0x990000;
        setTimeout(function() {
          nesPanel.toggleThrow('off');
        }, 30);
      }, 30);
    }, 30);
  };
  this.damage = function(amount, keepWeapon) {
    if (!keepWeapon && this.weapon) {
      this.dropWeapon();
    }
    this.damagedAt = counter;
    this.hp -= amount;
    if (this.hp <= 0) {
      this.hp = 0;
    }
    scoreDisplay.playerBar.width = scoreDisplay.playerBarMax / (player.maxHP / this.hp);
    if (!this.dead && this.hp === 0) {
      this.kill();

      // this.sprite.tint = 0xffaaaa
    }
  };
  this.kill = function() {
    playSound(deathSound);
    this.punching = this.kicking = false;
    this.killed = 0;
    this.dead = true;
    this.diedAt = counter;
    this.sprite.texture = PIXI.utils.TextureCache[this.character + 'dead'];
    if (musicOn) {
      bgMusic.stop();
    }
    setTimeout(function() {
      playSound(lowLaugh);
    }, 1200);
    if (lives > 0) {
      scoreDisplay.updateLives(lives - 1);
    }
    releaseUp();
    releaseDown();
    releaseLeft();
    releaseRight();
    releasePunch();
    releaseKick();
  };
  this.leap = function() {
    var sinceBegan = counter - this.beganJump;
    if (sinceBegan === 0) {
      this.velocity.y = this.leapForce;
      this.jumpFrame = 0;
      this.jumping = true;
      // this.sprite.texture = PIXI.utils.TextureCache[this.jumpFrames[this.jumpFrame]]
    }
    if (sinceBegan === 10) {
      this.jumpFrame = 1;
    }

    if (sinceBegan === 20) {
      this.jumpFrame = 1;
    }
    if (sinceBegan === 25) {
      this.jumpFrame = 0;
    }
    if (!this.punching && !this.kicking) {
      this.sprite.texture = PIXI.utils.TextureCache[this.character + this.jumpFrames[this.jumpFrame] + this.weapon];
    }
  };

  this.punch = function() {
    var sinceBegan = counter - this.beganPunch;
    if (this.sprite.y < this.level.groundY) {
      var punchText = 'jumppunch';
      var stanceText = this.jumpFrames[0];
    } else {
      if (!player.ducking) {
        var punchText = 'punch';
        var stanceText = 'stance';
      } else {
        var punchText = 'duckpunch';
        var stanceText = 'duckpunchstance';
      }
    }
    if (sinceBegan === 0) {
      this.attackHitting = true;
      if (this.weapon === 'knife') {
        playSound(punchSound);
      } else {
        playSound(punchSound);
      }
      if (this.sprite.y < this.level.groundY) {
        this.currentMoveDuration = this.punchSpeed;
      } else {
        this.currentMoveDuration = this.punchSpeed;
      }
      if (punchText === 'duckpunch' || punchText === 'jumppunch') {
        this.sprite.texture = PIXI.utils.TextureCache[this.character + punchText + this.weapon];
      } else {
        if (this.weapon === 'knife') {
          // throw a knife low
        }
        this.sprite.texture = PIXI.utils.TextureCache[this.character + punchText + this.weapon];
      }
    }
    if (sinceBegan >= this.currentMoveDuration) {
      this.attackHitting = false;
      this.punching = false;
      this.stance = true;
      this.sprite.texture = PIXI.utils.TextureCache[this.character + stanceText + this.weapon];
      this.dealtBlow = false;
      this.killed = 0;
    }
    // if (pressingPunch && sinceBegan < 12) {
    //     this.currentMoveDuration++
    // }
  };
  this.kick = function() {
    var sinceBegan = counter - this.beganKick;
    if (sinceBegan === 0) {
      if (this.sprite.y < this.level.groundY) {
        playSound(jumpkickSound);
        var kickText = 'jumpkick';
        var stanceText = this.jumpFrames[this.jumpFrame];
        this.attackHitting = true;
        this.currentMoveDuration = Math.round(this.kickSpeed * 1.3);
      } else {
        playSound(kickSound);
        if (!player.ducking) {
          this.kickFrame = 0;
          var kickText = this.kickFrames[this.kickFrame];
          var stanceText = 'stance';
          this.currentMoveDuration = this.kickSpeed;
        } else {
          var kickText = 'duckkick';
          var stanceText = 'duckkickstance';
          this.currentMoveDuration = Math.round(this.kickSpeed / 4);
        }
      }
      this.sprite.texture = PIXI.utils.TextureCache[this.character + kickText + this.weapon];
    }
    if (sinceBegan === 3) {
      this.attackHitting = true;
    }
    if (sinceBegan === this.currentMoveDuration - 10) {
      this.attackHitting = false;
    }
    if (!this.ducking && this.sprite.y === this.level.groundY) {
      if (sinceBegan === 3) {
        if (this.kickFrame === 0) {
          this.kickFrame = 1;
          this.sprite.texture = PIXI.utils.TextureCache[this.character + this.kickFrames[this.kickFrame] + this.weapon];
        }
      }
      if (sinceBegan === this.currentMoveDuration - 8) {
        if (this.kickFrame === 1) {
          this.kickFrame = 0;
          this.sprite.texture = PIXI.utils.TextureCache[this.character + this.kickFrames[this.kickFrame] + this.weapon];
        }
        this.attackHitting = false;
        this.dealtBlow = false;
        this.killed = 0;
        this.kicking = false;
        setTimeout(function() {
          player.sprite.texture = PIXI.utils.TextureCache[player.character + 'stance' + player.weapon];
        }, 200);
      }
    }
    if (sinceBegan >= this.currentMoveDuration) {
      if (this.sprite.y < this.level.groundY) {
        var stanceText = this.jumpFrames[this.jumpFrame];
      } else {
        if (!player.ducking) {
          var stanceText = 'stance';
        } else {
          var stanceText = 'duckkickstance';
        }
      }
      this.dealtBlow = false;
      this.killed = 0;
      this.kicking = false;
      this.stance = true;
      this.sprite.texture = PIXI.utils.TextureCache[this.character + stanceText + this.weapon];
    }
    // if (pressingKick && sinceBegan < 12) {
    //     this.currentMoveDuration++
    // }
  };
  this.applyVelocity = function() {
    // this.sprite.x += this.velocity.x
    if (this.velocity.x) {
      this.walk(this.velocity.x);
    }

    this.sprite.y -= this.velocity.y;
    // this.velocity.y *= 0.5
    if (this.velocity.y !== 0 && this.sprite.y >= this.level.groundY) {
      this.velocity.y = 0;
      this.sprite.y = this.level.groundY;
      this.sprite.texture = PIXI.utils.TextureCache[this.character + this.walkFrames[this.walkFrame] + this.weapon];
      this.jumping = false;
      this.landedAt = counter;
    }
    this.velocity.x *= 0.9;
    if (this.velocity.x < newPixelSize / 2) {
      this.velocity.x = 0;
    }
  };
  this.applyGravity = function() {
    if (this.sprite.y < this.level.groundY) {
      this.velocity.y -= this.gravityForce;
    }
  };
  this.walk = function(amount, noScroll) {
    if (endSequenceStarted) {
      var limitX = gameWidth;
    } else {
      var limitX = this.level.scrollLimitX;
    }
    let withinLimit, atEnd, arrowScale, walkAwayPostWin, withinScrollLimit, onLevelPostWin;
    if (player.level.direction === 'left') {
      withinLimit = gameContainer.x - amount > 0;
      atEnd = this.sprite.x - -gameContainer.x < gameWidth / 2;
      arrowScale = 1;
      walkAwayPostWin = wonRound && amount > 0;
      withinScrollLimit = gameContainer.x - amount < this.level.levelWidth - limitX;
      onLevelPostWin = this.sprite.x + amount > -this.level.levelWidth + limitX;
    } else {
      // limitX = gameWidth*2
      withinLimit = gameContainer.x - amount < 0;
      atEnd = this.sprite.x - -gameContainer.x < gameWidth / 2;
      arrowScale = -1;
      walkAwayPostWin = wonRound && amount < 0;
      withinScrollLimit = gameContainer.x - amount > -(this.level.levelWidth - limitX);
      onLevelPostWin = this.sprite.x + amount < this.level.levelWidth - this.level.stairs.width;
    }
    if (gameMode === 'horde') {
      withinScrollLimit = true;
    }
    if ((!wonRound && atEnd) || !withinScrollLimit || walkAwayPostWin) {
      noScroll = true;
    }
    if (!noScroll) {
      if (withinLimit) {
        gameContainer.x -= amount;
        this.sprite.x += amount;
        if (this.sprite.y === this.level.groundY) {
          this.cycleLegs();
        }
      } else {
        gameContainer.x = 0;
        this.sprite.x = gameWidth / 2;
        if (!arrow.sprite.visible) {
          arrow.sprite.visible = true;
          arrow.bornAt = counter;
          if (arrowScale < 0) {
            if (arrow.sprite.scale.x > 0) {
              arrow.sprite.scale.x *= -1;
            }
            arrow.sprite.x = gameWidth - arrow.sprite.width / 2;
          } else {
            if (arrow.sprite.scale.x < 0) {
              arrow.sprite.scale.x *= -1;
            }
            arrow.sprite.x = arrow.sprite.width / 2;
          }
        }
      }
    } else {
      if (onLevelPostWin) {
        this.sprite.x += amount;
        if (this.sprite.y === this.level.groundY) {
          this.cycleLegs(4);
        }
      } else {
        if (gameMode !== 'horde' && wonRound && !endSequenceStarted) {
          endSequenceStarted = true;
          wonAt = counter;          
        }
      }
      
    }
    // if (reachedHordeBarrier) {
    //   console.error('reached...');
    //   arrow.sprite.visible = true;
    //   if (arrow.sprite.scale.x > 0) {
    //     arrow.sprite.scale.x *= -1;
    //   }
    //   arrow.bornAt = counter;
    //   arrow.sprite.x = player.sprite.x + (gameWidth);
    // }
    if (gameMode !== 'horde' && !wonRound && !this.fightingBoss && Math.abs(this.sprite.x - this.level.boss.sprite.x) < gameWidth / 2) {
      this.fightingBoss = true;
      // if (this.weapon) {
      //     this.dropWeapon()
      // }
    }
  };
  this.cycleLegs = function(rate) {
    var sinceBegan = counter - this.beganMove;
    if (!rate) {
      rate = 6;
    }
    if (sinceBegan % rate === 0) {
      if (this.walkFrame + 1 < this.walkFrames.length) {
        this.walkFrame++;
      } else {
        this.walkFrame = 0;
      }
      this.sprite.texture = PIXI.utils.TextureCache[this.character + this.walkFrames[this.walkFrame] + this.weapon];
    }
  };
}
function StickMan(scale, level=1) {
  levelData[(level-1)].boss = this;
  this.dark = false;
  if (!scale) {
    scale = fighterScale;
  } else {
    this.dark = true;
  }
  this.worth = 2000;
  this.character = 'stickman';
  this.sprite = new PIXI.Sprite(PIXI.utils.TextureCache['stickmanwalk0']);
  this.sprite.width = this.sprite.height = tileSize * 3 * scale;
  this.sprite.anchor.x = 0.5;
  this.sprite.anchor.y = 1;
  gameContainer.addChild(this.sprite);
  this.beganMove = this.beganJump = this.beganPunch = this.beganKick = this.beganDuck = this.endedDuck = -99;
  this.walkFrames = ['stickmanwalk0', 'stickmanwalk1'];
  this.jumpFrames = ['jump0', 'jump1', 'jump2'];
  this.kickFrames = ['kick0', 'kick1'];
  this.stance = false;
  this.walkFrame = 0;
  this.jumpFrame = 0;
  this.kickFrame = 0;
  this.velocity = { x: 0, y: 0 };
  this.level = undefined;
  this.punchSpeed = 8;
  this.kickSpeed = 10;
  this.walkSpeed = fighterScale * newPixelSize * 1.25;
  this.punching = this.kicking = this.ducking = false;
  this.currentMoveDuration = 0;
  this.dealtBlow = false;
  this.killed = 0;
  // this.leapForce = tileSize/2.8
  this.leapForce = tileSize / 3.4;
  this.hopForce = newPixelSize * 3.5;
  this.gravityForce = newPixelSize / 2;
  this.grippers = [];
  this.hp = this.maxHP = 100;
  this.dead = false;
  this.diedAt = -99;
  this.score = 0;
  this.weapon = '';
  this.damagedAt = -99;
  this.stunned = false;
  this.punchRange = tileSize * 2 * fighterScale;
  this.headHeight = this.sprite.height;
  this.homeX = player.level.bossSpotX;
  this.dodging = false;
  this.blocking = false;
  this.dodgedAt = this.blockedAt = -99;
  this.walkDirection = 1;
  this.faceY = function() {
    return this.sprite.y - this.sprite.height * 0.8;
  };
  this.changeTexture = function(newText) {
    this.sprite.texture = PIXI.utils.TextureCache[newText];
    if (this.dark) {
      this.sprite.tint = 0x000000;
    }
  };
  this.checkForPlayer = function() {
    var distance = Math.abs(this.sprite.x - player.sprite.x);
    if ((distance < player.kickRange && player.kicking) || (distance < player.punchRange && player.punching)) {
      if (!randomInt(0, 3)) {
        if (player.kicking && !player.dealtBlow) {
          if (player.sprite.y < player.level.groundY) {
            // jump kick
            this.damage(20);
            this.flinch(true, 'high');
          } else {
            this.damage(10);
            this.flinch();
          }
          player.dealtBlow = true;
        }
        if (player.punching && !player.dealtBlow) {
          var knife = player.weapon === 'knife';
          if (player.sprite.y < player.level.groundY) {
            // jump punch
            if (player.sprite.y > player.level.groundY - newPixelSize * 10) {
              if (knife) {
                if (this.sprite.x < player.sprite.x) {
                  var hitFrom = 'right';
                } else {
                  var hitFrom = 'left';
                }
                this.damage(30);
                this.flinch(true, 'high', true, hitFrom);
              } else {
                this.damage(20);
                this.flinch(true, 'high');
              }
            }
          } else {
            if (knife) {
              if (this.sprite.x < player.sprite.x) {
                var hitFrom = 'right';
              } else {
                var hitFrom = 'left';
              }
              this.damage(30);
              this.flinch(true, 'high', true, hitFrom);
            } else {
              this.damage(20);
              this.flinch();
            }
          }
          player.dealtBlow = true;
        }
      } else {
        if (counter - this.dodgedAt > 10 && !this.dodging && this.sprite.y === player.level.groundY && this.sprite.scale.x > 0 && player.sprite.scale.x < 0 && this.sprite.x < player.sprite.x) {
          if (!this.ducking && player.sprite.y === player.level.groundY) {
            this.dodgedAt = counter;
            if (player.ducking) {
              if (player.kicking) {
                this.dodging = 'up';
              } else {
                this.dodging = 'slide';
              }
            } else {
              if (player.kicking) {
                this.dodging = 'back';
              } else {
                this.dodging = 'slide';
              }
            }
          } else {
            if (player.kicking && !this.ducking) {
              this.changeTexture('stickmanduckpunch0');
              this.ducking = true;
              this.beganDuck = counter;
            }
          }
        }
      }
    }
    if (!this.dodging && distance < tileSize) {
      if (!this.punching && counter - this.beganJump > 30 && randomInt(0, 1)) {
        this.beganPunch = counter;
        this.punching = true;
        this.dodgedAt = counter + 5;
      } else {
        this.dodgedAt = counter;
      }
      this.dodging = 'slide';
    }
    if (this.punching && !this.dealtBlow && distance < this.punchRange) {
      player.damage(10);
      player.flinch();
      this.dealtBlow = true;
      player.velocity.x = newPixelSize * randomInt(2, 4);
    }
    // this.dead = true
    // this.diedAt = counter
    // this.sprite.texture = PIXI.utils.TextureCache["dead"]
    // wonRound = true
  };
  this.dodge = function() {
    var since = counter - this.dodgedAt;
    if (since === 0) {
      this.changeTexture('stickmanwalk0');
      if (this.dodging === 'back') {
        this.velocity.y = this.hopForce;
      } else if (this.dodging === 'up') {
        this.velocity.y = this.hopForce;
      }
      if (this.dodging === 'back' && Math.abs(this.sprite.x - player.sprite.x) < tileSize) {
        this.sprite.x -= Math.abs(this.sprite.x - player.sprite.x) / 2;
      }
    }
    if (since < 10) {
      if (this.dodging === 'back' || this.dodging === 'slide') {
        if (since < 3) {
          this.sprite.x -= this.walkSpeed * 2;
          // this.walk(-this.walkSpeed*2)
        } else {
          this.sprite.x -= this.walkSpeed * 1.5;
          // this.walk(this.walkSpeed*1.5)
        }
      } else {
      }
    } else {
      this.changeTexture('stickmanwalk0');
      this.dodging = false;
      if (randomInt(0, 1)) {
        this.beganPunch = counter + 10;
        this.punching = true;
      }
    }
  };
  this.dance = function() {
    var distance = Math.abs(this.sprite.x - player.sprite.x);
    if (this.walkDirection > 0) {
      var walkSpeed = fighterScale * this.walkSpeed;
      this.walk(walkSpeed * this.walkDirection);
    } else {
      var walkSpeed = fighterScale * this.walkSpeed / 2;
      if (Math.abs(this.sprite.x - walkSpeed - this.homeX) < gameWidth / 2) {
        this.walk(walkSpeed * this.walkDirection);
      }
    }

    if (counter % 30 === 0) {
      if (this.walkDirection > 0) {
        if (randomInt(!0, 2)) {
          this.walkDirection *= -1;
        }
      } else if (distance > player.sprite.width) {
        if (randomInt(0, 1)) {
          this.walkDirection *= -1;
        }
      }
    }
    if (this.walkDirection > 0 && distance < player.sprite.width / 3) {
      this.walkDirection *= -1;
      this.beganPunch = counter;
      this.punching = true;
    }
    if (!this.punching && counter % 90 === 0 && randomInt(0, 1)) {
      this.beganPunch = counter;
      this.punching = true;
    }
  };
  this.checkForProjectiles = function() {
    for (var v = 0; v < knives.length; v++) {
      var knife = knives[v];
      if (Math.abs(knife.x - this.sprite.x) < tileSize / 2) {
        if (this.ducking && knife.type === 'high') {
        } else if (this.sprite.y < this.level.groundY && knife.type === 'low') {
        } else {
          knife.hit = true;
          if (!this.stunned) {
            if (knife.scale.x > 0) {
              var hitFrom = 'left';
            } else {
              var hitFrom = 'right';
            }
            this.flinch(knife.type, true, hitFrom);
            playSound(shortHitSound);
          }
          this.damage(20);
        }
      }
    }
  };
  this.throw = function(weapon) {
    if (weapon === 'knife') {
      var knife = new PIXI.Sprite(PIXI.utils.TextureCache['knife']);
      if (this.ducking) {
        knife.type = 'low';
        var knifeY = this.sprite.y - tileSize;
      } else {
        knife.type = 'high';
        var knifeY = this.sprite.y - tileSize * 2;
      }
      knife.width = newPixelSize * 8 * fighterScale;
      knife.height = newPixelSize * 4 * fighterScale;
      knife.enemy = false;
      knife.anchor.set(0.5);
      if (this.sprite.scale.x > 0) {
        var knifeX = this.sprite.x + tileSize;
      } else {
        knife.scale.x *= -1;
        var knifeX = this.sprite.x - tileSize;
      }
      knife.x = knifeX;
      knife.y = knifeY;
      gameContainer.addChild(knife);
      knives.push(knife);
    }
  };
  this.flinch = function(squib, pos, knife, hitFrom) {
    this.stunned = true;
    this.sprite.tint = 0xff0000;
    // this.changeTexture("stickmanwalk0")
    if (squib) {
      if (pos === 'low') {
        if (knife) {
          new Squib(this, this.sprite.x, this.sprite.y - this.sprite.height * 0.2, 64, 'knife', hitFrom);
        } else {
          new Squib(this, this.sprite.x, this.sprite.y - this.sprite.height * 0.2, 64, 'punch');
        }
      } else {
        if (knife) {
          new Squib(this, this.sprite.x, this.faceY(), 64, 'knife', hitFrom);
        } else {
          new Squib(this, this.sprite.x, this.faceY(), 64, 'punch');
        }
      }
    }
    setTimeout(function() {
      player.level.boss.sprite.tint = 0xffffff;
    }, 25);
    setTimeout(function() {
      player.level.boss.sprite.tint = 0xff0000;
    }, 50);
    setTimeout(function() {
      player.level.boss.sprite.tint = 0xffffff;
    }, 75);
    setTimeout(function() {
      player.level.boss.sprite.tint = 0xff0000;
    }, 100);
    setTimeout(function() {
      player.level.boss.sprite.tint = 0xffffff;
      player.level.boss.stunned = false;
    }, 125);
    // setTimeout(function(){
    //     player.level.boss.sprite.tint = 0xff0000
    // },150)
    // setTimeout(function(){
    //     player.level.boss.sprite.tint = 0xffffff
    // },200)
    // setTimeout(function(){
    //     player.level.boss.stunned = false
    //     player.level.boss.sprite.tint = 0xffffff
    // },250)
  };
  this.damage = function(amount) {
    this.damagedAt = counter;
    this.hp -= amount;
    if (this.hp <= 0) {
      this.hp = 0;
    }
    scoreDisplay.enemyBar.width = scoreDisplay.enemyBarMax / (this.maxHP / this.hp);
    if (this.hp === 0) {
      this.dead = true;
      this.diedAt = counter;
      this.stunned = false;
      this.dodging = false;
      this.changeTexture('stickmandead');
      wonRound = true;
      player.score += this.worth;
      new scoreBlip(this.worth, this);
      scoreDisplay.updateScore(player.score);
      // this.sprite.tint = 0xffaaaa
    }
  };
  this.die = function() {
    this.changeTexture('stickmandead');
    if (this.sprite.y < gameHeight + this.sprite.height) {
      this.sprite.y += newPixelSize * 3.3;
    } else {
      player.fightingBoss = false;
    }
  };
  this.leap = function() {
    var sinceBegan = counter - this.beganJump;
    if (sinceBegan === 0) {
      this.velocity.y = this.leapForce;
      this.jumpFrame = 0;
      // this.sprite.texture = PIXI.utils.TextureCache[this.jumpFrames[this.jumpFrame]]
    }
    if (sinceBegan === 10) {
      this.jumpFrame = 1;
    }

    if (sinceBegan === 20) {
      this.jumpFrame = 1;
    }
    if (sinceBegan === 25) {
      this.jumpFrame = 0;
    }
    if (!this.punching && !this.kicking) {
      this.sprite.texture = PIXI.utils.TextureCache[this.jumpFrames[this.jumpFrame] + this.weapon];
    }
  };

  this.punch = function() {
    var sinceBegan = counter - this.beganPunch;
    if (this.sprite.y < this.level.groundY) {
      var punchText = 'stickmanpunch0';
      var stanceText = 'stickmanwalk0';
    } else {
      if (!this.ducking) {
        var punchText = 'stickmanpunch0';
        var stanceText = 'stickmanwalk0';
      } else {
        var punchText = 'stickmanduckpunch1';
        var stanceText = 'stickmanduckpunch0';
      }
    }
    if (sinceBegan === 0) {
      if (this.sprite.y < this.level.groundY) {
        this.currentMoveDuration = this.punchSpeed;
      } else {
        this.currentMoveDuration = this.punchSpeed;
      }
      if (punchText === 'stickmanduckpunch1' || punchText === 'jumppunch') {
        this.changeTexture(punchText);
      } else {
        setTimeout(function() {
          player.level.boss.sprite.texture = PIXI.utils.TextureCache['stickmanpunch1'];
        }, 60);
        this.changeTexture(punchText);
      }
    }
    if (sinceBegan >= this.currentMoveDuration) {
      this.punching = false;
      this.stance = true;
      this.changeTexture(stanceText);
      this.dealtBlow = false;
      this.killed = 0;
    }
    // if (pressingPunch && sinceBegan < 12) {
    //     this.currentMoveDuration++
    // }
  };
  this.kick = function() {
    var sinceBegan = counter - this.beganKick;
    if (sinceBegan === 0) {
      if (this.sprite.y < this.level.groundY) {
        var kickText = 'jumpkick';
        var stanceText = this.jumpFrames[this.jumpFrame];
        this.currentMoveDuration = this.kickSpeed * 2;
      } else {
        if (!this.ducking) {
          this.kickFrame = 0;
          var kickText = this.kickFrames[this.kickFrame];
          var stanceText = 'stance';
          this.currentMoveDuration = this.kickSpeed;
        } else {
          var kickText = 'duckkick';
          var stanceText = 'duckkickstance';
          this.currentMoveDuration = this.kickSpeed;
        }
      }
      this.sprite.texture = PIXI.utils.TextureCache[kickText + this.weapon];
    }
    if (!this.ducking && this.sprite.y === this.level.groundY) {
      if (sinceBegan === 3) {
        if (this.kickFrame === 0) {
          this.kickFrame = 1;
          this.sprite.texture = PIXI.utils.TextureCache[this.kickFrames[this.kickFrame] + this.weapon];
        }
      }
      if (sinceBegan === this.currentMoveDuration - 4) {
        if (this.kickFrame === 1) {
          this.kickFrame = 0;
          this.sprite.texture = PIXI.utils.TextureCache[this.kickFrames[this.kickFrame] + this.weapon];
        }
        this.dealtBlow = false;
        this.killed = 0;
      }
    }
    if (sinceBegan >= this.currentMoveDuration) {
      if (this.sprite.y < this.level.groundY) {
        var stanceText = this.jumpFrames[this.jumpFrame];
      } else {
        if (!this.ducking) {
          var stanceText = 'stance';
        } else {
          var stanceText = 'duckkickstance';
        }
      }
      this.dealtBlow = false;
      this.killed = 0;
      this.kicking = false;
      this.stance = true;
      this.sprite.texture = PIXI.utils.TextureCache[stanceText + this.weapon];
    }
    // if (pressingKick && sinceBegan < 12) {
    //     this.currentMoveDuration++
    // }
  };
  this.applyVelocity = function() {
    this.sprite.y -= this.velocity.y;
    // this.velocity.y *= 0.5
    if (this.velocity.y !== 0 && this.sprite.y >= this.level.groundY) {
      this.velocity.y = 0;
      this.sprite.y = this.level.groundY;
      this.changeTexture(this.walkFrames[this.walkFrame]);
      // this.sprite.texture = PIXI.utils.TextureCache[this.walkFrames[this.walkFrame]+this.weapon]
    }
  };
  this.applyGravity = function() {
    if (this.sprite.y < this.level.groundY) {
      this.velocity.y -= this.gravityForce;
    }
  };
  this.walk = function(amount) {
    // gameContainer.x -= amount
    if (player.level.direction === 'left') {
      var withinLimit = this.sprite.x + amount > -player.level.levelWidth + player.level.scrollLimitX + newPixelSize * 3;
    } else {
      var withinLimit = this.sprite.x + amount > -player.level.levelWidth + player.level.scrollLimitX + newPixelSize * 3;
    }
    if (!withinLimit) {
    }
    if (withinLimit && Math.abs(this.sprite.x + amount - player.sprite.x) > tileSize) {
      this.sprite.x += amount;
      if (this.sprite.y === this.level.groundY) {
        this.cycleLegs();
      }
    }
  };
  this.cycleLegs = function() {
    var sinceBegan = counter - this.beganMove;
    if (sinceBegan % 8 === 0) {
      if (this.walkFrame + 1 < this.walkFrames.length) {
        this.walkFrame++;
      } else {
        this.walkFrame = 0;
      }
      this.changeTexture(this.walkFrames[this.walkFrame]);
      // this.sprite.texture = PIXI.utils.TextureCache[this.walkFrames[this.walkFrame]+this.weapon]
    }
  };
}
function BoomerangMan(scale) {
  levelData[1].boss = this;
  if (!scale) {
    scale = fighterScale;
  }
  this.worth = 2000;
  this.character = 'stickman';
  this.sprite = new PIXI.Sprite(PIXI.utils.TextureCache['boomerangmanwalk0']);
  this.sprite.width = this.sprite.height = tileSize * 3 * scale;
  this.sprite.anchor.x = 0.5;
  this.sprite.anchor.y = 1;
  gameContainer.addChild(this.sprite);
  this.beganMove = this.beganJump = this.beganPunch = this.beganKick = this.beganDuck = this.endedDuck = -99;
  this.walkFrames = ['boomerangmanwalk0', 'boomerangmanwalk1'];
  this.jumpFrames = ['jump0', 'jump1', 'jump2'];
  this.kickFrames = ['kick0', 'kick1'];
  this.stance = false;
  this.walkFrame = 0;
  this.jumpFrame = 0;
  this.kickFrame = 0;
  this.velocity = { x: 0, y: 0 };
  this.level = undefined;
  this.punchSpeed = 8;
  this.kickSpeed = 10;
  this.walkSpeed = fighterScale * newPixelSize * 1.25;
  this.punching = this.kicking = this.ducking = false;
  this.currentMoveDuration = 0;
  this.dealtBlow = false;
  this.killed = 0;
  // this.leapForce = tileSize/2.8
  this.leapForce = tileSize / 3.4;
  this.hopForce = newPixelSize * 3.5;
  this.gravityForce = newPixelSize / 2;
  this.grippers = [];
  this.hp = this.maxHP = 100;
  this.dead = false;
  this.diedAt = -99;
  this.score = 0;
  this.weapon = '';
  this.damagedAt = -99;
  this.stunned = false;
  this.punchRange = tileSize * 2 * fighterScale;
  this.headHeight = this.sprite.height;
  this.homeX = player.level.bossSpotX;
  this.dodging = false;
  this.blocking = false;
  this.dodgedAt = this.blockedAt = -99;
  this.walkDirection = 1;
  this.beganThrow = -99;
  this.windingUp = false;
  this.windUpTime = 20;
  this.faceY = function() {
    return this.sprite.y - this.sprite.height * 0.8;
  };
  this.changeTexture = function(newText) {
    this.sprite.texture = PIXI.utils.TextureCache[newText];
  };
  this.checkForPlayer = function() {
    var distance = Math.abs(this.sprite.x - player.sprite.x);
    if ((distance < player.kickRange && player.kicking) || (distance < player.punchRange && player.punching)) {
      if (!randomInt(0, 3)) {
        if (player.kicking && !player.dealtBlow) {
          if (player.sprite.y < player.level.groundY) {
            // jump kick
            this.damage(20);
            this.flinch(true, 'high');
          } else {
            this.damage(10);
            this.flinch();
          }
          player.dealtBlow = true;
        }
        if (player.punching && !player.dealtBlow) {
          var knife = player.weapon === 'knife';
          if (player.sprite.y < player.level.groundY) {
            // jump punch
            if (player.sprite.y > player.level.groundY - newPixelSize * 10) {
              if (knife) {
                if (this.sprite.x < player.sprite.x) {
                  var hitFrom = 'right';
                } else {
                  var hitFrom = 'left';
                }
                this.damage(30);
                this.flinch(true, 'high', true, hitFrom);
              } else {
                this.damage(20);
                this.flinch(true, 'high');
              }
            }
          } else {
            if (knife) {
              if (this.sprite.x < player.sprite.x) {
                var hitFrom = 'right';
              } else {
                var hitFrom = 'left';
              }
              this.damage(30);
              this.flinch(true, 'high', true, hitFrom);
            } else {
              this.damage(20);
              this.flinch();
            }
          }
          player.dealtBlow = true;
        }
      } else {
        if (counter - this.dodgedAt > 10 && !this.dodging && this.sprite.y === player.level.groundY && this.sprite.scale.x > 0 && player.sprite.scale.x < 0 && this.sprite.x < player.sprite.x) {
          if (!this.ducking && player.sprite.y === player.level.groundY) {
            this.dodgedAt = counter;
            if (player.ducking) {
              if (player.kicking) {
                this.dodging = 'up';
              } else {
                this.dodging = 'slide';
              }
            } else {
              if (player.kicking) {
                this.dodging = 'back';
              } else {
                this.dodging = 'slide';
              }
            }
          }
        }
      }
    }
    if (!this.dodging && distance < tileSize) {
      this.dodgedAt = counter;
      this.dodging = 'slide';
    }
  };
  this.dodge = function() {
    var since = counter - this.dodgedAt;
    if (since === 0) {
      this.changeTexture('boomerangmanwalk0');
      if (this.dodging === 'back') {
        this.velocity.y = this.hopForce;
      } else if (this.dodging === 'up') {
        this.velocity.y = this.hopForce;
      }
      if (this.dodging === 'back' && Math.abs(this.sprite.x - player.sprite.x) < tileSize) {
        this.sprite.x += Math.abs(this.sprite.x - player.sprite.x) / 2;
      }
    }
    if (since < 10) {
      if (this.dodging === 'back' || this.dodging === 'slide') {
        if (since < 3) {
          this.sprite.x += this.walkSpeed * 2;
          // this.walk(-this.walkSpeed*2)
        } else {
          this.sprite.x += this.walkSpeed * 1.5;
          // this.walk(this.walkSpeed*1.5)
        }
      } else {
      }
    } else {
      this.changeTexture('boomerangmanwalk0');
      this.dodging = false;
    }
  };
  this.dance = function() {
    if (!this.windingUp) {
      var distance = Math.abs(this.sprite.x - player.sprite.x);

      if (this.walkDirection < 0) {
        var walkSpeed = fighterScale * this.walkSpeed;
        // this.walk(walkSpeed*this.walkDirection)
        if (Math.abs(this.sprite.x - walkSpeed - this.homeX) < gameWidth / 2) {
          this.walk(walkSpeed * this.walkDirection);
        }
      } else {
        var walkSpeed = fighterScale * this.walkSpeed / 2;
        this.walk(walkSpeed * this.walkDirection);
      }
      if (counter % 30 === 0) {
        if (this.walkDirection > 0) {
          if (randomInt(0, 2)) {
            this.walkDirection *= -1;
          }
        } else if (distance > player.sprite.width) {
          if (randomInt(0, 1)) {
            this.walkDirection *= -1;
          }
        }
      }
      if (randomInt(0, 1) && counter % 60 === 0) {
        if (randomInt(0, 1)) {
          type = 'high';
        } else {
          type = 'low';
        }
        this.beganThrow = counter;
        this.windingUp = type;
      }
    }
  };
  this.windUp = function() {
    var since = counter - this.beganThrow;
    if (since === 0) {
      this.changeTexture('boomerangmanwindup' + this.windingUp + '0');
    }
    if (since === this.windUpTime) {
      this.changeTexture('boomerangmanthrow' + this.windingUp);
      new Boomerang(this.windingUp, this);
    }
    if (since === this.windUpTime + 30) {
      this.windingUp = false;
    }
  };
  this.checkForProjectiles = function() {
    for (var v = 0; v < knives.length; v++) {
      var knife = knives[v];
      if (Math.abs(knife.x - this.sprite.x) < tileSize / 2) {
        if (this.ducking && knife.type === 'high') {
        } else if (this.sprite.y < this.level.groundY && knife.type === 'low') {
        } else {
          knife.hit = true;
          if (!this.stunned) {
            if (knife.scale.x > 0) {
              var hitFrom = 'left';
            } else {
              var hitFrom = 'right';
            }
            this.flinch(knife.type, true, hitFrom);
            playSound(shortHitSound);
          }
          this.damage(20);
        }
      }
    }
  };
  this.throw = function(weapon) {
    if (weapon === 'knife') {
      var knife = new PIXI.Sprite(PIXI.utils.TextureCache['knife']);
      if (this.ducking) {
        knife.type = 'low';
        var knifeY = this.sprite.y - tileSize;
      } else {
        knife.type = 'high';
        var knifeY = this.sprite.y - tileSize * 2;
      }
      knife.width = newPixelSize * 8 * fighterScale;
      knife.height = newPixelSize * 4 * fighterScale;
      knife.enemy = false;
      knife.anchor.set(0.5);
      if (this.sprite.scale.x > 0) {
        var knifeX = this.sprite.x + tileSize;
      } else {
        knife.scale.x *= -1;
        var knifeX = this.sprite.x - tileSize;
      }
      knife.x = knifeX;
      knife.y = knifeY;
      gameContainer.addChild(knife);
      knives.push(knife);
    }
  };
  this.flinch = function(squib, pos, knife, hitFrom) {
    this.stunned = true;
    this.sprite.tint = 0xff0000;
    // this.changeTexture("stickmanwalk0")
    if (squib) {
      if (pos === 'low') {
        if (knife) {
          new Squib(this, this.sprite.x, this.sprite.y - this.sprite.height * 0.2, 64, 'knife', hitFrom);
        } else {
          new Squib(this, this.sprite.x, this.sprite.y - this.sprite.height * 0.2, 64, 'punch');
        }
      } else {
        if (knife) {
          new Squib(this, this.sprite.x, this.faceY(), 64, 'knife', hitFrom);
        } else {
          new Squib(this, this.sprite.x, this.faceY(), 64, 'punch');
        }
      }
    }
    setTimeout(function() {
      player.level.boss.sprite.tint = 0xffffff;
    }, 25);
    setTimeout(function() {
      player.level.boss.sprite.tint = 0xff0000;
    }, 50);
    setTimeout(function() {
      player.level.boss.sprite.tint = 0xffffff;
    }, 75);
    setTimeout(function() {
      player.level.boss.sprite.tint = 0xff0000;
    }, 100);
    setTimeout(function() {
      player.level.boss.sprite.tint = 0xffffff;
      player.level.boss.stunned = false;
    }, 125);
    // setTimeout(function(){
    //     player.level.boss.sprite.tint = 0xff0000
    // },150)
    // setTimeout(function(){
    //     player.level.boss.sprite.tint = 0xffffff
    // },200)
    // setTimeout(function(){
    //     player.level.boss.stunned = false
    //     player.level.boss.sprite.tint = 0xffffff
    // },250)
  };
  this.damage = function(amount) {
    this.damagedAt = counter;
    this.hp -= amount;
    if (this.hp <= 0) {
      this.hp = 0;
    }
    scoreDisplay.enemyBar.width = scoreDisplay.enemyBarMax / (this.maxHP / this.hp);
    if (this.hp === 0) {
      this.dead = true;
      this.diedAt = counter;
      this.stunned = false;
      this.dodging = false;
      this.changeTexture('boomerangmandead');
      wonRound = true;
      player.score += this.worth;
      new scoreBlip(this.worth, this);
      scoreDisplay.updateScore(player.score);
      // this.sprite.tint = 0xffaaaa
    }
  };
  this.die = function() {
    this.changeTexture('boomerangmandead');
    if (this.sprite.y < gameHeight + this.sprite.height) {
      this.sprite.y += newPixelSize * 3.3;
    } else {
      player.fightingBoss = false;
    }
  };
  this.leap = function() {
    var sinceBegan = counter - this.beganJump;
    if (sinceBegan === 0) {
      this.velocity.y = this.leapForce;
      this.jumpFrame = 0;
      // this.sprite.texture = PIXI.utils.TextureCache[this.jumpFrames[this.jumpFrame]]
    }
    if (sinceBegan === 10) {
      this.jumpFrame = 1;
    }

    if (sinceBegan === 20) {
      this.jumpFrame = 1;
    }
    if (sinceBegan === 25) {
      this.jumpFrame = 0;
    }
    if (!this.punching && !this.kicking) {
      this.sprite.texture = PIXI.utils.TextureCache[this.jumpFrames[this.jumpFrame] + this.weapon];
    }
  };
  this.applyVelocity = function() {
    this.sprite.y -= this.velocity.y;
    // this.velocity.y *= 0.5
    if (this.velocity.y !== 0 && this.sprite.y >= this.level.groundY) {
      this.velocity.y = 0;
      this.sprite.y = this.level.groundY;
      this.changeTexture(this.walkFrames[this.walkFrame]);
      // this.sprite.texture = PIXI.utils.TextureCache[this.walkFrames[this.walkFrame]+this.weapon]
    }
  };
  this.applyGravity = function() {
    if (this.sprite.y < this.level.groundY) {
      this.velocity.y -= this.gravityForce;
    }
  };
  this.walk = function(amount) {
    // gameContainer.x -= amount
    if (player.level.direction === 'left') {
      var withinLimit = this.sprite.x + amount > -player.level.levelWidth + player.level.scrollLimitX + newPixelSize * 3;
    } else {
      var withinLimit = this.sprite.x + amount > -player.level.levelWidth + player.level.scrollLimitX + newPixelSize * 3;
    }
    if (withinLimit && Math.abs(this.sprite.x + amount - player.sprite.x) > tileSize) {
      this.sprite.x += amount;
      if (this.sprite.y === this.level.groundY) {
        this.cycleLegs();
      }
    }
  };
  this.cycleLegs = function() {
    var sinceBegan = counter - this.beganMove;
    if (sinceBegan % 8 === 0) {
      if (this.walkFrame + 1 < this.walkFrames.length) {
        this.walkFrame++;
      } else {
        this.walkFrame = 0;
      }
      this.changeTexture(this.walkFrames[this.walkFrame]);
      // this.sprite.texture = PIXI.utils.TextureCache[this.walkFrames[this.walkFrame]+this.weapon]
    }
  };
}
function clearBoard(enemiesOnly) {
  for (var g = 0; g < grippers.length; g++) {
    gameContainer.removeChild(grippers[g].sprite);
  }
  for (var t = 0; t < tomtoms.length; t++) {
    gameContainer.removeChild(tomtoms[t].sprite);
  }
  for (var k = 0; k < knifethrowers.length; k++) {
    gameContainer.removeChild(knifethrowers[k].sprite);
  }
  for (var p = 0; p < powerups.length; p++) {
    gameContainer.removeChild(powerups[p].sprite);
  }
  for (var b = 0; b < scoreBlips.length; b++) {
    gameContainer.removeChild(scoreBlips[b]);
  }
  for (var v = 0; v < knives.length; v++) {
    gameContainer.removeChild(knives[v]);
  }
  for (var s = 0; s < squibs.length; s++) {
    squibs[s].clearDroplets();
    gameContainer.removeChild(squibs[s]);
  }
  // for (var d=0;d<droplets.length;d++) {
  //     gameContainer.removeChild(droplets[d])
  // }
  grippers.length = tomtoms.length = knifethrowers.length = powerups.length = scoreBlips.length = knives.length = squibs.length = 0;
}
function resetGame() {
  gameInitiated = false;
  if (player.level.boss.hp < player.level.boss.maxHP) {
    player.level.boss.hp = player.level.boss.maxHP;
    scoreDisplay.enemyBar.width = scoreDisplay.enemyBarMax;
  }
  if (!levelTime) {
    floorDisplay.container.visible = false;
    floorDisplay.timeUpBg.visible = false;
    floorDisplay.timeUpLegend.visible = false;
  }
  levelTime = 2000;
  clearBoard();
  setVariables();
  gameContainer.x = 0;
  gameContainer.removeChild(player.sprite);
  currentLevel = player.level;
  currentScore = player.score;
  player = undefined;
  player = new Fighter('thomas');
  nesPanel.toggleThrow('off');
  player.level = currentLevel;
  player.score = currentScore;
  player.sprite.x = player.level.playerStartX;
  player.sprite.y = player.level.groundY;
  if (player.level.direction === 'left') {
    player.sprite.scale.x *= -1;
  }
  if (lives > 0) {
    lives--;
    gameInitiated = true;
    clearTitle();

    // enemyFrequency = player.level.enemyFrequency;
    // eggFrequency = player.level.eggFrequency;
    // gripperLimit = player.level.limits.grippers;
    // tomtomLimit = player.level.limits.tomtoms;

  } else {
    console.warn('resetGame removing logos at lives === 0');
    document.getElementById('brutal-logo').classList.remove('hidden');
    document.getElementById('kung-fu-logo').classList.remove('hidden');
    titleScreen.container.visible = true;
    lives = startingLives;
    currentLevel = undefined;
    levelReached = 1;
    dragonLevel = 0;
    livesAwarded = 0;
    player.level = level1;
    player.score = 0;
    floorDisplay.legend.text = 'LEVEL ' + levelReached;
    floorDisplay.container.x = gameWidth / 2;
  }
  player.level.boss.sprite.x = player.level.bossSpotX;
  player.level.boss.sprite.y = player.level.groundY;
  player.level.boss.punching = player.level.boss.kicking = false;
  player.level.boss.attackHitting = false;
  player.level.boss.changeTexture(player.level.boss.character + 'walk0' + player.level.boss.weapon);
  scoreDisplay.playerBar.width = scoreDisplay.playerBarMax;
  scoreDisplay.enemyBar.width = scoreDisplay.enemyBarMax;
  scoreDisplay.updateScore(player.score);
  scoreDisplay.updateLives(lives);
  scoreDisplay.timeText.text = '0'.repeat(4 - levelTime.toString().length) + levelTime;
}
function Giant(scale) {
  levelData[2].boss = this;
  if (!scale) {
    scale = fighterScale;
  }
  this.worth = 3000;
  this.character = 'giant';
  this.sprite = new PIXI.Sprite(PIXI.utils.TextureCache[this.character + 'walk0']);
  this.sprite.width = this.sprite.height = tileSize * 3 * scale;
  this.sprite.anchor.x = 0.5;
  this.sprite.anchor.y = 1;
  gameContainer.addChild(this.sprite);
  this.beganMove = this.beganJump = this.beganPunch = this.beganKick = this.beganDuck = this.endedDuck = -99;
  this.walkFrames = [this.character + 'walk0', this.character + 'walk1'];
  this.kickFrames = [this.character + 'kick0', this.character + 'kick1'];
  this.stance = false;
  this.walkFrame = 0;
  this.jumpFrame = 0;
  this.punchFrame = 0;
  this.kickFrame = 0;
  this.velocity = { x: 0, y: 0 };
  this.level = undefined;
  this.punchSpeed = 20;
  this.kickSpeed = 30;
  this.telegraphTime = 60;
  this.walkSpeed = fighterScale * newPixelSize * 1.25;
  this.punching = this.kicking = this.ducking = false;
  this.currentMoveDuration = 0;
  this.dealtBlow = false;
  this.killed = 0;
  // this.leapForce = tileSize/2.8
  this.leapForce = tileSize / 3.4;
  this.hopForce = newPixelSize * 3.5;
  this.gravityForce = newPixelSize / 2;
  this.grippers = [];
  this.hp = this.maxHP = 150;
  this.dead = false;
  this.diedAt = -99;
  this.score = 0;
  this.weapon = '';
  this.damagedAt = -99;
  this.stunned = false;
  this.punchRange = tileSize * 2 * fighterScale;
  this.kickRange = tileSize * 2 * fighterScale;
  this.headHeight = this.sprite.height;
  this.homeX = player.level.bossSpotX;
  this.dodging = false;
  this.blocking = false;
  this.dodgedAt = this.blockedAt = -99;
  this.walkDirection = 1;
  this.attackHitting = false;
  this.faceY = function() {
    return this.sprite.y - this.sprite.height;
  };

  this.changeTexture = function(newText) {
    this.sprite.texture = PIXI.utils.TextureCache[newText];
  };
  this.checkForPlayer = function() {
    var distance = Math.abs(this.sprite.x - player.sprite.x);
    if ((distance < player.kickRange && player.kicking) || (distance < player.punchRange && player.punching)) {
      if (!randomInt(0, 3)) {
        if (player.kicking && !player.dealtBlow) {
          if (player.sprite.y < player.level.groundY) {
            // jump kick
            this.damage(20);
            this.flinch(true, 'high');
          } else {
            this.damage(10);
            this.flinch();
          }
          player.dealtBlow = true;
        }
        if (player.punching && !player.dealtBlow) {
          var knife = player.weapon === 'knife';
          if (player.sprite.y < player.level.groundY) {
            // jump punch
            if (player.sprite.y > player.level.groundY - newPixelSize * 10) {
              if (knife) {
                if (this.sprite.x < player.sprite.x) {
                  var hitFrom = 'right';
                } else {
                  var hitFrom = 'left';
                }
                this.damage(30);
                this.flinch(true, 'high', true, hitFrom);
              } else {
                this.damage(20);
                this.flinch(true, 'high');
              }
            }
          } else {
            if (knife) {
              if (this.sprite.x < player.sprite.x) {
                var hitFrom = 'right';
              } else {
                var hitFrom = 'left';
              }
              this.damage(30);
              this.flinch(true, 'high', true, hitFrom);
            } else {
              this.damage(20);
              this.flinch();
            }
          }
          player.dealtBlow = true;
        }

        // if (!player.dealtBlow) {
        //     this.flinch("high",player.weapon==="knife",)
        //     player.dealtBlow = true
        // }
      } else {
        if (counter - this.dodgedAt > 10 && !this.dodging && this.sprite.y === player.level.groundY && this.sprite.scale.x > 0 && player.sprite.scale.x < 0 && this.sprite.x < player.sprite.x) {
          if (!this.ducking && player.sprite.y === player.level.groundY) {
            this.dodgedAt = counter;
            if (player.ducking) {
              // if (player.kicking) {
              //     this.dodging = "up"
              // } else {
              //     this.dodging = "slide"
              // }
            } else {
              if (player.kicking) {
                this.dodging = 'back';
              } else {
                this.dodging = 'slide';
              }
            }
          } else {
          }
        }
      }
    }
    if (false && !this.dodging && distance < tileSize) {
      if (!this.punching && randomInt(0, 1)) {
        this.beganPunch = counter;
        this.punching = true;
        this.dodgedAt = counter + 5;
      } else {
        this.dodgedAt = counter;
      }
      this.dodging = 'slide';
    }
    if (!player.ducking && this.punching && this.attackHitting && !this.dealtBlow && distance < this.punchRange) {
      player.damage(25);
      player.flinch();
      this.dealtBlow = true;
      player.velocity.x = newPixelSize * randomInt(4, 6);
    }
    if (player.sprite.y === player.level.groundY && this.kicking && this.attackHitting && !this.dealtBlow && distance < this.kickRange) {
      player.damage(50);
      player.flinch('low');
      this.dealtBlow = true;
      player.velocity.x = newPixelSize * randomInt(6, 10);
    }
    // this.dead = true
    // this.diedAt = counter
    // this.sprite.texture = PIXI.utils.TextureCache["dead"]
    // wonRound = true
  };
  this.dodge = function() {
    var since = counter - this.dodgedAt;
    if (since === 0) {
      this.changeTexture(this.character + 'walk0');
      if (this.dodging === 'back') {
        this.velocity.y = this.hopForce;
      } else if (this.dodging === 'up') {
        this.velocity.y = this.hopForce;
      }
      if (this.dodging === 'back' && Math.abs(this.sprite.x - player.sprite.x) < tileSize) {
        this.sprite.x -= Math.abs(this.sprite.x - player.sprite.x) / 2;
      }
    }
    if (since < 10) {
      if (this.dodging === 'back' || this.dodging === 'slide') {
        if (since < 3) {
          this.sprite.x -= this.walkSpeed * 2;
          // this.walk(-this.walkSpeed*2)
        } else {
          this.sprite.x -= this.walkSpeed * 1.5;
          // this.walk(this.walkSpeed*1.5)
        }
      } else {
      }
    } else {
      this.changeTexture(this.character + 'walk0');
      this.dodging = false;
      if (randomInt(0, 1)) {
        this.beganPunch = counter + 10;
        this.punching = true;
      }
    }
  };
  this.dance = function() {
    var distance = Math.abs(this.sprite.x - player.sprite.x);
    if (this.walkDirection > 0) {
      var walkSpeed = fighterScale * this.walkSpeed;
      this.walk(walkSpeed * this.walkDirection);
    } else {
      var walkSpeed = fighterScale * this.walkSpeed / 2;
      if (Math.abs(this.sprite.x - walkSpeed - this.homeX) < gameWidth / 2) {
        this.walk(walkSpeed * this.walkDirection);
      }
    }

    if (counter % 30 === 0) {
      if (this.walkDirection > 0) {
        if (randomInt(0, 3)) {
          this.walkDirection *= -1;
        }
      } else if (distance > player.sprite.width) {
        if (randomInt(0, 1)) {
          this.walkDirection *= -1;
        }
      }
    }
    if (this.walkDirection > 0 && distance < player.sprite.width / 3) {
      this.walkDirection *= -1;
      this.beganPunch = counter;
      this.punching = true;
    }
    if (randomInt(0, 1) && !this.punching && counter % 30 === 0) {
      if (randomInt(0, 1)) {
        this.beganPunch = counter;
        this.punching = true;
      } else {
        this.beganKick = counter;
        this.kicking = true;
      }
    }
  };
  this.checkForProjectiles = function() {
    for (var v = 0; v < knives.length; v++) {
      var knife = knives[v];
      if (Math.abs(knife.x - this.sprite.x) < tileSize / 2) {
        if (this.ducking && knife.type === 'high') {
        } else if (this.sprite.y < this.level.groundY && knife.type === 'low') {
        } else {
          knife.hit = true;
          if (!this.stunned) {
            if (knife.scale.x > 0) {
              var hitFrom = 'left';
            } else {
              var hitFrom = 'right';
            }
            this.flinch(true, knife.type, true, hitFrom);
            playSound(shortHitSound);
          }
          this.damage(20);
        }
      }
    }
  };
  this.flinch = function(squib, pos, knife, hitFrom) {
    this.stunned = true;
    this.sprite.tint = 0xff0000;
    // this.changeTexture("stickmanwalk0")
    if (squib) {
      if (pos === 'low') {
        if (knife) {
          new Squib(this, this.sprite.x, this.sprite.y - this.sprite.height * 0.2, 64, 'knife', hitFrom);
        } else {
          new Squib(this, this.sprite.x, this.sprite.y - this.sprite.height * 0.2, 64, 'punch');
        }
      } else {
        if (knife) {
          new Squib(this, this.sprite.x, this.faceY(), 64, 'knife', hitFrom);
        } else {
          new Squib(this, this.sprite.x, this.faceY(), 64, 'punch');
        }
      }
    }
    setTimeout(function() {
      player.level.boss.sprite.tint = 0xffffff;
    }, 25);
    setTimeout(function() {
      player.level.boss.sprite.tint = 0xff0000;
    }, 50);
    setTimeout(function() {
      player.level.boss.sprite.tint = 0xffffff;
    }, 75);
    setTimeout(function() {
      player.level.boss.sprite.tint = 0xff0000;
    }, 100);
    setTimeout(function() {
      player.level.boss.sprite.tint = 0xffffff;
      player.level.boss.stunned = false;
    }, 125);
    // setTimeout(function(){
    //     player.level.boss.sprite.tint = 0xff0000
    // },150)
    // setTimeout(function(){
    //     player.level.boss.sprite.tint = 0xffffff
    // },200)
    // setTimeout(function(){
    //     player.level.boss.stunned = false
    //     player.level.boss.sprite.tint = 0xffffff
    // },250)
  };
  this.damage = function(amount) {
    this.damagedAt = counter;
    this.hp -= amount;
    if (this.hp <= 0) {
      this.hp = 0;
    }
    scoreDisplay.enemyBar.width = scoreDisplay.enemyBarMax / (this.maxHP / this.hp);
    if (this.hp === 0) {
      this.dead = true;
      this.diedAt = counter;
      this.stunned = false;
      this.dodging = false;
      this.changeTexture(this.character + 'dead');
      wonRound = true;
      player.score += this.worth;
      new scoreBlip(this.worth, this);
      scoreDisplay.updateScore(player.score);
      // this.sprite.tint = 0xffaaaa
    }
  };
  this.die = function() {
    this.changeTexture(this.character + 'dead');
    if (this.sprite.y < gameHeight + this.sprite.height) {
      this.sprite.y += newPixelSize * 3.3;
    } else {
      player.fightingBoss = false;
    }
  };
  this.punch = function() {
    var sinceBegan = counter - this.beganPunch;
    var punchText = this.character + 'punch0';
    var stanceText = this.character + 'walk0';
    if (sinceBegan === 0) {
      this.punchFrame = 0;
      this.changeTexture(this.character + 'punch' + this.punchFrame + this.weapon);
      this.currentMoveDuration = this.punchSpeed;
      this.telegraphTime = this.punchSpeed / 2 + randomInt(-5, -5);
    }
    if (sinceBegan === this.telegraphTime) {
      this.attackHitting = true;
      this.punchFrame = 1;
      this.changeTexture(this.character + 'punch' + this.punchFrame + this.weapon);
    }
    if (sinceBegan === this.telegraphTime + 10) {
      this.attackHitting = false;
    }
    if (sinceBegan === this.currentMoveDuration) {
      this.punchFrame = 0;
      this.punching = false;
      this.stance = true;
      this.changeTexture(stanceText);
      this.dealtBlow = false;
      this.killed = 0;
    }
  };
  this.kick = function() {
    var sinceBegan = counter - this.beganKick;
    if (sinceBegan === 0) {
      this.kickFrame = 0;
      var kickText = this.character + 'kick' + this.kickFrame + this.weapon;
      this.currentMoveDuration = this.kickSpeed;
      this.telegraphTime = this.kickSpeed / 2;
      this.changeTexture(kickText);
    }

    if (sinceBegan === this.telegraphTime) {
      this.kickFrame = 1;
      var kickText = this.character + 'kick' + this.kickFrame + this.weapon;
      this.changeTexture(kickText);
      this.attackHitting = true;
    }
    if (sinceBegan === this.telegraphTime + 10) {
      this.attackHitting = false;
    }
    if (sinceBegan === this.currentMoveDuration) {
      var stanceText = this.character + 'walk' + this.walkFrame + this.weapon;
      this.kickFrame = 0;
      this.dealtBlow = false;
      this.killed = 0;
      this.kicking = false;
      this.stance = true;
      this.changeTexture(stanceText);
    }
  };
  this.applyVelocity = function() {
    this.sprite.y -= this.velocity.y;
    // this.velocity.y *= 0.5
    if (this.velocity.y !== 0 && this.sprite.y >= this.level.groundY) {
      this.velocity.y = 0;
      this.sprite.y = this.level.groundY;
      this.changeTexture(this.walkFrames[this.walkFrame]);
      // this.sprite.texture = PIXI.utils.TextureCache[this.walkFrames[this.walkFrame]+this.weapon]
    }
  };
  this.applyGravity = function() {
    if (this.sprite.y < this.level.groundY) {
      this.velocity.y -= this.gravityForce;
    }
  };
  this.walk = function(amount) {
    // gameContainer.x -= amount
    if (player.level.direction === 'left') {
      var withinLimit = this.sprite.x + amount > -player.level.levelWidth + player.level.scrollLimitX + newPixelSize * 3;
    } else {
      var withinLimit = this.sprite.x + amount > -player.level.levelWidth + player.level.scrollLimitX + newPixelSize * 3;
    }
    if (withinLimit && Math.abs(this.sprite.x + amount - player.sprite.x) > tileSize) {
      this.sprite.x += amount;
      if (this.sprite.y === this.level.groundY) {
        this.cycleLegs();
      }
    }
  };
  this.cycleLegs = function() {
    var sinceBegan = counter - this.beganMove;
    if (sinceBegan % 8 === 0) {
      if (this.walkFrame + 1 < this.walkFrames.length) {
        this.walkFrame++;
      } else {
        this.walkFrame = 0;
      }
      this.changeTexture(this.walkFrames[this.walkFrame]);
      // this.sprite.texture = PIXI.utils.TextureCache[this.walkFrames[this.walkFrame]+this.weapon]
    }
  };
}
function BlackMagician(scale) {
  levelData[3].boss = this;
  if (!scale) {
    scale = fighterScale;
  }
  this.worth = 2000;
  this.character = 'blackmagician';
  this.sprite = new PIXI.Sprite(PIXI.utils.TextureCache[this.character + 'walk0']);
  this.sprite.width = this.sprite.height = tileSize * 3 * scale;
  this.sprite.anchor.x = 0.5;
  this.sprite.anchor.y = 1;
  gameContainer.addChild(this.sprite);
  this.beganMove = this.beganJump = this.beganPunch = this.beganKick = this.beganDuck = this.endedDuck = -99;
  this.walkFrames = [this.character + 'walk0', this.character + 'walk1'];
  this.jumpFrames = ['jump0', 'jump1', 'jump2'];
  this.kickFrames = ['kick0', 'kick1'];
  this.stance = false;
  this.walkFrame = 0;
  this.jumpFrame = 0;
  this.kickFrame = 0;
  this.velocity = { x: 0, y: 0 };
  this.level = undefined;
  this.punchSpeed = 8;
  this.kickSpeed = 10;
  this.walkSpeed = fighterScale * newPixelSize * 1.25;
  this.punching = this.kicking = this.ducking = false;
  this.currentMoveDuration = 0;
  this.dealtBlow = false;
  this.killed = 0;
  // this.leapForce = tileSize/2.8
  this.leapForce = tileSize / 3.4;
  this.hopForce = newPixelSize * 3.5;
  this.gravityForce = newPixelSize / 2;
  this.grippers = [];
  this.hp = this.maxHP = 100;
  this.dead = false;
  this.diedAt = -99;
  this.score = 0;
  this.weapon = '';
  this.damagedAt = -99;
  this.stunned = false;
  this.punchRange = tileSize * 2 * fighterScale;
  this.headHeight = this.sprite.height;
  this.homeX = player.level.bossSpotX;
  this.dodging = false;
  this.blocking = false;
  this.dodgedAt = this.blockedAt = -99;
  this.walkDirection = 1;
  this.beganThrow = -99;
  this.windingUp = false;
  this.windUpTime = 20;
  this.lostHead = 0;
  this.head = new PIXI.Sprite(PIXI.utils.TextureCache[this.character + 'head']);
  this.head.width = this.head.height = newPixelSize * 8;
  this.head.anchor.set(0.5);
  this.head.visible = false;
  gameContainer.addChild(this.head);

  this.faceY = function() {
    return this.sprite.y - this.sprite.height * 0.8;
  };
  this.changeTexture = function(newText) {
    this.sprite.texture = PIXI.utils.TextureCache[newText];
  };
  this.checkForPlayer = function() {
    var distance = Math.abs(this.sprite.x - player.sprite.x);
    if ((distance < player.kickRange && player.kicking) || (distance < player.punchRange && player.punching)) {
      if (!randomInt(0, 3)) {
        if (player.kicking && !player.dealtBlow) {
          if (player.sprite.y < player.level.groundY) {
            // jump kick
            // this.damage(20)
            // this.flinch(true,"high")
            this.changeTexture(this.character + 'headless');
            this.lostHead = counter;
            this.head.visible = true;
            this.head.x = this.sprite.x;
            this.head.y = this.sprite.y - this.sprite.height * 0.7;
          } else {
            this.damage(10);
            this.flinch();
          }
          player.dealtBlow = true;
        }
        if (player.punching && !player.dealtBlow) {
          var knife = player.weapon === 'knife';
          if (player.sprite.y < player.level.groundY) {
            // jump punch
            if (player.sprite.y > player.level.groundY - newPixelSize * 10) {
              if (knife) {
                if (this.sprite.x < player.sprite.x) {
                  var hitFrom = 'right';
                } else {
                  var hitFrom = 'left';
                }
                this.damage(30);
                this.flinch(true, 'high', true, hitFrom);
              } else {
                this.damage(20);
                this.flinch(true, 'high');
              }
            }
          } else {
            if (knife) {
              if (this.sprite.x < player.sprite.x) {
                var hitFrom = 'right';
              } else {
                var hitFrom = 'left';
              }
              this.damage(30);
              this.flinch(true, 'high', true, hitFrom);
            } else {
              this.damage(20);
              this.flinch();
            }
          }
          player.dealtBlow = true;
        }
      } else {
        if (counter - this.dodgedAt > 10 && !this.dodging && this.sprite.y === player.level.groundY && this.sprite.scale.x > 0 && player.sprite.scale.x < 0 && this.sprite.x < player.sprite.x) {
          if (!this.ducking && player.sprite.y === player.level.groundY) {
            this.dodgedAt = counter;
            if (player.ducking) {
              if (player.kicking) {
                this.dodging = 'up';
              } else {
                this.dodging = 'slide';
              }
            } else {
              if (player.kicking) {
                this.dodging = 'back';
              } else {
                this.dodging = 'slide';
              }
            }
          }
        }
      }
    }
    if (!this.dodging && distance < tileSize) {
      this.dodgedAt = counter;
      this.dodging = 'slide';
    }
  };
  this.dodge = function() {
    var since = counter - this.dodgedAt;
    if (since === 0) {
      this.changeTexture(this.character + 'walk0');
      if (this.dodging === 'back') {
        this.velocity.y = this.hopForce;
      } else if (this.dodging === 'up') {
        this.velocity.y = this.hopForce;
      }
      if (this.dodging === 'back' && Math.abs(this.sprite.x - player.sprite.x) < tileSize) {
        this.sprite.x += Math.abs(this.sprite.x - player.sprite.x) / 2;
      }
    }
    if (since < 10) {
      if (this.dodging === 'back' || this.dodging === 'slide') {
        if (since < 3) {
          this.sprite.x += this.walkSpeed * 2;
          // this.walk(-this.walkSpeed*2)
        } else {
          this.sprite.x += this.walkSpeed * 1.5;
          // this.walk(this.walkSpeed*1.5)
        }
      } else {
      }
    } else {
      this.changeTexture(this.character + 'walk0');
      this.dodging = false;
    }
  };
  this.dance = function() {
    if (!this.windingUp) {
      var distance = Math.abs(this.sprite.x - player.sprite.x);

      if (this.walkDirection < 0) {
        var walkSpeed = fighterScale * this.walkSpeed;
        // this.walk(walkSpeed*this.walkDirection)
        if (Math.abs(this.sprite.x - walkSpeed - this.homeX) < gameWidth / 2) {
          this.walk(walkSpeed * this.walkDirection);
        }
      } else {
        var walkSpeed = fighterScale * this.walkSpeed / 2;
        this.walk(walkSpeed * this.walkDirection);
      }
      if (counter % 30 === 0) {
        if (this.walkDirection > 0) {
          if (randomInt(0, 2)) {
            this.walkDirection *= -1;
          }
        } else if (distance > player.sprite.width) {
          if (randomInt(0, 1)) {
            this.walkDirection *= -1;
          }
        }
      }
      if (randomInt(0, 1) && counter % 60 === 0) {
        if (randomInt(0, 1)) {
          type = 'high';
        } else {
          type = 'low';
        }
        this.beganThrow = counter;
        this.windingUp = type;
      }
    }
  };
  this.windUp = function() {
    var since = counter - this.beganThrow;
    if (since === 0) {
      this.changeTexture(this.character + 'windup');
    }
    if (since === this.windUpTime) {
      this.changeTexture(this.character + 'throw' + this.windingUp);
      new Fireball(this.windingUp, this);
    }
    if (since === this.windUpTime + 30) {
      this.windingUp = false;
    }
  };
  this.checkForProjectiles = function() {
    for (var v = 0; v < knives.length; v++) {
      var knife = knives[v];
      if (Math.abs(knife.x - this.sprite.x) < tileSize / 2) {
        if (this.ducking && knife.type === 'high') {
        } else if (this.sprite.y < this.level.groundY && knife.type === 'low') {
        } else {
          knife.hit = true;
          if (!this.stunned) {
            if (knife.scale.x > 0) {
              var hitFrom = 'left';
            } else {
              var hitFrom = 'right';
            }
            this.flinch(knife.type, true, hitFrom);
            playSound(shortHitSound);
          }
          this.damage(20);
        }
      }
    }
  };
  this.throw = function(weapon) {
    if (weapon === 'knife') {
      var knife = new PIXI.Sprite(PIXI.utils.TextureCache['knife']);
      if (this.ducking) {
        knife.type = 'low';
        var knifeY = this.sprite.y - tileSize;
      } else {
        knife.type = 'high';
        var knifeY = this.sprite.y - tileSize * 2;
      }
      knife.width = newPixelSize * 8 * fighterScale;
      knife.height = newPixelSize * 4 * fighterScale;
      knife.enemy = false;
      knife.anchor.set(0.5);
      if (this.sprite.scale.x > 0) {
        var knifeX = this.sprite.x + tileSize;
      } else {
        knife.scale.x *= -1;
        var knifeX = this.sprite.x - tileSize;
      }
      knife.x = knifeX;
      knife.y = knifeY;
      gameContainer.addChild(knife);
      knives.push(knife);
    }
  };
  this.flinch = function(squib, pos, knife, hitFrom) {
    this.stunned = true;
    this.sprite.tint = 0xff0000;
    // this.changeTexture("stickmanwalk0")
    if (squib) {
      if (pos === 'low') {
        if (knife) {
          new Squib(this, this.sprite.x, this.sprite.y - this.sprite.height * 0.2, 64, 'knife', hitFrom);
        } else {
          new Squib(this, this.sprite.x, this.sprite.y - this.sprite.height * 0.2, 64, 'punch');
        }
      } else {
        if (knife) {
          new Squib(this, this.sprite.x, this.faceY(), 64, 'knife', hitFrom);
        } else {
          new Squib(this, this.sprite.x, this.faceY(), 64, 'punch');
        }
      }
    }
    setTimeout(function() {
      player.level.boss.sprite.tint = 0xffffff;
    }, 25);
    setTimeout(function() {
      player.level.boss.sprite.tint = 0xff0000;
    }, 50);
    setTimeout(function() {
      player.level.boss.sprite.tint = 0xffffff;
    }, 75);
    setTimeout(function() {
      player.level.boss.sprite.tint = 0xff0000;
    }, 100);
    setTimeout(function() {
      player.level.boss.sprite.tint = 0xffffff;
      player.level.boss.stunned = false;
    }, 125);
    // setTimeout(function(){
    //     player.level.boss.sprite.tint = 0xff0000
    // },150)
    // setTimeout(function(){
    //     player.level.boss.sprite.tint = 0xffffff
    // },200)
    // setTimeout(function(){
    //     player.level.boss.stunned = false
    //     player.level.boss.sprite.tint = 0xffffff
    // },250)
  };
  this.damage = function(amount) {
    this.damagedAt = counter;
    this.hp -= amount;
    if (this.hp <= 0) {
      this.hp = 0;
    }
    scoreDisplay.enemyBar.width = scoreDisplay.enemyBarMax / (this.maxHP / this.hp);
    if (this.hp === 0) {
      this.dead = true;
      this.diedAt = counter;
      this.stunned = false;
      this.dodging = false;
      this.changeTexture(this.character + 'dead');
      wonRound = true;
      player.score += this.worth;
      new scoreBlip(this.worth, this);
      scoreDisplay.updateScore(player.score);
      // this.sprite.tint = 0xffaaaa
    }
  };
  this.die = function() {
    this.changeTexture(this.character + 'dead');
    if (this.sprite.y < gameHeight + this.sprite.height) {
      this.sprite.y += newPixelSize * 3.3;
    } else {
      player.fightingBoss = false;
    }
  };
  this.leap = function() {
    var sinceBegan = counter - this.beganJump;
    if (sinceBegan === 0) {
      this.velocity.y = this.leapForce;
      this.jumpFrame = 0;
      // this.sprite.texture = PIXI.utils.TextureCache[this.jumpFrames[this.jumpFrame]]
    }
    if (sinceBegan === 10) {
      this.jumpFrame = 1;
    }

    if (sinceBegan === 20) {
      this.jumpFrame = 1;
    }
    if (sinceBegan === 25) {
      this.jumpFrame = 0;
    }
    if (!this.punching && !this.kicking) {
      this.sprite.texture = PIXI.utils.TextureCache[this.jumpFrames[this.jumpFrame] + this.weapon];
    }
  };
  this.applyVelocity = function() {
    this.sprite.y -= this.velocity.y;
    // this.velocity.y *= 0.5
    if (this.velocity.y !== 0 && this.sprite.y >= this.level.groundY) {
      this.velocity.y = 0;
      this.sprite.y = this.level.groundY;
      this.changeTexture(this.walkFrames[this.walkFrame]);
      // this.sprite.texture = PIXI.utils.TextureCache[this.walkFrames[this.walkFrame]+this.weapon]
    }
  };
  this.applyGravity = function() {
    if (this.sprite.y < this.level.groundY) {
      this.velocity.y -= this.gravityForce;
    }
  };
  this.walk = function(amount) {
    // gameContainer.x -= amount
    if (player.level.direction === 'left') {
      var withinLimit = this.sprite.x + amount > -player.level.levelWidth + player.level.scrollLimitX + newPixelSize * 3;
    } else {
      var withinLimit = this.sprite.x + amount > -player.level.levelWidth + player.level.scrollLimitX + newPixelSize * 3;
    }
    if (withinLimit && Math.abs(this.sprite.x + amount - player.sprite.x) > tileSize) {
      this.sprite.x += amount;
      if (this.sprite.y === this.level.groundY) {
        this.cycleLegs();
      }
    }
  };
  this.cycleLegs = function() {
    var sinceBegan = counter - this.beganMove;
    if (sinceBegan % 8 === 0) {
      if (this.walkFrame + 1 < this.walkFrames.length) {
        this.walkFrame++;
      } else {
        this.walkFrame = 0;
      }
      this.changeTexture(this.walkFrames[this.walkFrame]);
      // this.sprite.texture = PIXI.utils.TextureCache[this.walkFrames[this.walkFrame]+this.weapon]
    }
  };
  this.teleport = function() {
    var since = counter - this.lostHead;
    if (since === 0) {
    }
  };
}
function SmokePillar(posX) {
  this.sprite = new PIXI.Sprite(PIXI.utils.TextureCache['smoke0']);
  this.sprite.width = newPixelSize * 24;
  this.sprite.height = this.sprite.width * 2;
  this.sprite.anchor.x = 0.5;
  this.sprite.anchor.y = 1;
  this.sprite.x = posX;
  this.sprite.y = player.level.groundY;
  this.bornAt = counter;

  this.animate = function() {
    var since = counter - this.bornAt;
    if (since === 5) {
      this.sprite.texture = PIXI.utils.TextureCache['smoke1'];
    }
    if (since === 10) {
      this.sprite.texture = PIXI.utils.TextureCache['smoke2'];
    }
    if (since === 15) {
      this.sprite.texture = PIXI.utils.TextureCache['smoke3'];
    }
    if (since === 20) {
      this.sprite.texture = PIXI.utils.TextureCache['smoke2'];
    }
    if (since === 25) {
      this.sprite.texture = PIXI.utils.TextureCache['smoke1'];
    }
    if (since === 30) {
      this.sprite.texture = PIXI.utils.TextureCache['smoke0'];
    }
    if (since === 40) {
      this.sprite.visible = false;
    }
  };

  smokePillars.push(this);
  gameContainer.addChild(this.sprite);
}
