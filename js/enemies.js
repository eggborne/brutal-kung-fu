class Enemy {
  constructor(side, scale) {
    this.worth = {
      punch: 0,
      kick: 0,
      jumpkick: 0,
      knife: 0
    };
    this.scale = scale;
    this.sprite = new PIXI.Sprite();    
    this.walkFrame = 0;
    this.bornAt = counter;
    this.gravityForce = (newPixelSize / 3) * scale;
    this.velocity = { x: 0, y: 0 };

    this.dead = false;
    this.diedAt = -99;
    this.causeOfDeath = undefined;    

    this.sprite.anchor.x = 0.5;
    this.sprite.anchor.y = 1;
    this.sprite.y = player.level.groundY;

    console.error('new', side, 'Enemy. Total gameContainer children:', gameContainer.children.length)

  }
  playerFacing() {
    return (this.sprite.x > player.sprite.x 
      && this.sprite.scale.x < 0 
      && player.sprite.scale.x > 0) 
      || (this.sprite.x < player.sprite.x 
        && this.sprite.scale.x > 0 
        && player.sprite.scale.x < 0);
  };
  // playerFacing() {
  //   return (this.sprite.x > player.sprite.x && this.sprite.scale.x < 0 && player.sprite.scale.x > 0) || (this.sprite.x < player.sprite.x && this.sprite.scale.x > 0 && player.sprite.scale.x < 0);
  // };
  facingPlayer() {
    return (this.sprite.x < player.sprite.x && this.sprite.scale.x > 0) || (this.sprite.x > player.sprite.x && this.sprite.scale.x < 0);
  };
  flip() {
    this.sprite.scale.x *= -1;
    if (this.type !== 'knifethrower') {
      this.walkSpeed *= -1;
    }
  }
  applyVelocity() {
    this.sprite.y -= this.velocity.y;
    this.sprite.x += this.velocity.x;
    this.velocity.x *= 0.96;
    if (Math.abs(this.velocity.x) < newPixelSize / 2) {
      this.velocity.x = 0;
    }
    if (this.type === 'tomtom' && !this.dead && this.velocity.y !== 0 && this.sprite.y >= player.level.groundY) {
      this.velocity.y = 0;
      this.sprite.y = player.level.groundY;
      this.sprite.texture = PIXI.utils.TextureCache[this.walkFrames[this.walkFrame]];
      this.landed = true;
    }
  }
  applyGravity() {
    if (this.leaping || this.dead || this.sprite.y < player.level.groundY) {
      this.velocity.y -= this.gravityForce;
    }
  }
  checkForProjectiles() {
    var knifeRange = (tileSize / 2) * fighterScale;
    for (var v = 0; v < knives.length; v++) {
      var knife = knives[v];
      // if (!knife.enemy && knife.visible) {spawnrandomasdasdasdasdasdasdasd
      if (knife.type !== 'air' && knife.visible) {
        if (knife.scale.x > 0) {
          if (this.sprite.x > knife.x && this.sprite.x - knife.x < knifeRange) {
            // this.die()
            this.dead = true;
            this.diedAt = counter;
            var squib = new Squib(this, this.sprite.x, this.faceY, 64, 'knife', 'left');
            knife.hit = true;
            if (!knife.enemy) {
              this.causeOfDeath = 'knife';
            }
            playSound(shortHitSound);
          }
        } else {
          if (this.sprite.x < knife.x && knife.x - this.sprite.x < knifeRange) {
            // this.die()
            this.dead = true;
            this.diedAt = counter;
            var squib = new Squib(this, this.sprite.x, this.faceY, 64, 'knife', 'right');
            knife.hit = true;
            if (!knife.enemy) {
              this.causeOfDeath = 'knife';
            }
            playSound(shortHitSound);
          }
        }
      }
    }
  }
	die() {
		console.error('calling DIE for', this.type);
		if (this.diedAt === counter - 1) {
			this.sprite.texture = PIXI.utils.TextureCache[`${this.type}dead`];
			// this.sprite.y -= newPixelSize * 8;
			if (this.type === 'gripper' || this.type === 'knifethrower') {
				console.error('is GRIPPER@ygfhgfh')
				this.sprite.y -= newPixelSize * 8;
				if (this.sprite.scale.x > 0) {
					this.sprite.x += newPixelSize * 4;
				} else {
					this.sprite.x -= newPixelSize * 4;
				}
			} else if (this.type === 'tomtom') {
				console.error('is TOMTMO@ygfhgfh')
				this.sprite.y -= newPixelSize * 2;
				if (this.sprite.scale.x > 0) {
					this.sprite.x += newPixelSize * 4;
				} else {
					this.sprite.x -= newPixelSize * 4;
				}
			}
			if (this.causeOfDeath) {
				var award = this.worth[this.causeOfDeath] * player.killed;
				player.score += award;
				new scoreBlip(award, this);
			}
			scoreDisplay.updateScore(player.score);
		}
		this.applyGravity();
		this.applyVelocity();
		if (this.sprite.y > gameHeight + this.sprite.height) {
			this.sprite.visible = false;
		}
	}
  cycleLegs() {
    var sinceBegan = counter - this.bornAt;
    if (sinceBegan % this.walkCycleSpeed === 0) {
      if (this.walkFrame + 1 < this.currentFrames.length) {
        this.walkFrame++;
      } else {
        this.walkFrame = 0;
      }
      this.sprite.texture = PIXI.utils.TextureCache[this.currentFrames[this.walkFrame]];
    }
  }
}

class Gripper extends Enemy {
  constructor(side, scale=fighterScale) {
    super(side, scale);
    this.type = 'gripper';
    lastGripper = counter;
    if (gameMode !== 'horde') {
      this.worth = {
        punch: 200,
        kick: 100,
        jumpkick: 300,
        knife: 300
      };
    }
    this.drainRate = 15;
    if (!randomInt(0,500)) {
      this.drainRate = 2;
      Object.values(this.worth).map((prize, i) => {
        let newPrize = prize * 3;
        this.worth[Object.keys(this.worth)[i]] = newPrize;
      })
      scale = fighterScale * 1.2;
      this.sprite.tint = 0xffdddd;
    }
    this.sprite.width = newPixelSize * 24 * scale;
    this.sprite.height = newPixelSize * 40 * scale;
    this.headHeight = this.sprite.height;
    this.walkFrames = ['gripperwalk1', 'gripperwalk2'];
    this.attackFrames = ['gripperattack1', 'gripperattack2'];
    this.currentFrames = this.walkFrames;
    this.gripping = false;
    this.gripTime = 0;
    this.faceY = this.sprite.y - this.sprite.height * 0.8;
    this.bodyY = this.sprite.y - this.sprite.height * 0.4;
    this.walkCycleSpeed = 9;

    let offDistance = (gameMode === 'story' ? gameWidth / 2 : gameWidth);
    if (side === 'left') {
      this.sprite.x = player.sprite.x - offDistance;
      this.walkSpeed = (player.walkSpeed * 1.1) * scale;
      if (Math.abs(lastGripperX - this.sprite.x) < tileSize * 2) {
        this.sprite.x = lastGripperX - tileSize * 2;
        // this.sprite.tint = 0xff0000
      }
      lastGripperX = this.sprite.x;
    } else {
      this.sprite.x = player.sprite.x + offDistance;
      this.sprite.scale.x *= -1;
      this.walkSpeed = (-player.walkSpeed * 1.1) * scale;
      if (Math.abs(lastGripperX - this.sprite.x) < tileSize * 2) {
        this.sprite.x = lastGripperX + tileSize * 2;
        // this.sprite.tint = 0xff0000
      }
      lastGripperX = this.sprite.x;
    }

    gameContainer.addChild(this.sprite);
    grippers.push(this);
  }
  // flip() {
  //   this.sprite.scale.x *= -1;
  //   this.walkSpeed *= -1;
  // };
  checkForPlayer() {
    var distance = Math.abs(this.sprite.x - player.sprite.x);
    if (this.gripping) {
      if (!player.dealtBlow && (player.kicking || player.punching) && this.playerFacing()) {
        this.dead = true;
        this.diedAt = counter;
        player.grippers.splice(player.grippers.indexOf(this), 1);
        this.gripping = false;
        player.dealtBlow = true;
        player.killed++;
        if (this.sprite.scale.x < 0) {
          this.velocity.x = newPixelSize;
        } else {
          this.velocity.x = -newPixelSize;
        }
      }
    } else {
      if (!player.dealtBlow && player.attackHitting && player.kicking && this.playerFacing() && distance <= tileSize * 1.6) {
        if (player.sprite.y === player.level.groundY) {
          this.dead = true;
          this.diedAt = counter;
          this.causeOfDeath = 'kick';
          if (!player.ducking) {
            var squib = new Squib(this, this.sprite.x, this.faceY, 64, 'kick');
            var throwX = newPixelSize * (4 + randomInt(0, 10) * (newPixelSize / 10));
            // new Squib()
          } else {
            var throwX = newPixelSize * (2 + randomInt(0, 10) * (newPixelSize / 10));
          }
          player.dealtBlow = true;
          player.killed++;
          playSound(longHitSound);
          if (this.sprite.scale.x < 0) {
            this.velocity.x = throwX;
          } else {
            this.velocity.x = -throwX;
          }
          this.velocity.y += newPixelSize;
        } else {
          if (true) {
            this.dead = true;
            this.diedAt = counter;
            this.causeOfDeath = 'jumpkick';
            var squib = new Squib(this, this.sprite.x, this.faceY, 64, 'jumpkick');
            // player.dealtBlow = true
            player.killed++;
            if (this.sprite.scale.x < 0) {
              this.velocity.x = newPixelSize * (5 + randomInt(0, 10) * (newPixelSize / 10));
            } else {
              this.velocity.x = -newPixelSize * (5 + randomInt(0, 10) * (newPixelSize / 10));
            }
            if (player.sprite.y < player.level.groundY - player.sprite.height * 0.3) {
              this.velocity.y = newPixelSize * (3 + randomInt(0, 10) * (newPixelSize / 10));
            } else {
              this.velocity.y = newPixelSize;
            }
          }
          playSound(longHitSound);
        }
      }
      if (player.weapon === 'knife') {
        var punchRange = tileSize * 2 * fighterScale;
      } else {
        var punchRange = player.punchRange;
      }
      if (!player.dealtBlow && player.punching && this.playerFacing() && distance <= punchRange) {
        if (player.sprite.y === player.level.groundY) {
          this.dead = true;
          this.diedAt = counter;
          if (player.weapon === 'knife') {
            this.causeOfDeath = 'knife';
            playSound(shortHitSound);
            if (player.sprite.scale.x > 0) {
              var dir = 'left';
            } else {
              var dir = 'right';
            }
            if (this.sprite.scale.x < 0) {
              // this.velocity.x = newPixelSize
            } else {
              // this.velocity.x = -newPixelSize
            }
            if (player.ducking) {
              new Squib(this, this.sprite.x, this.bodyY, 64, 'knife', dir);
            } else {
              new Squib(this, this.sprite.x, this.faceY, 64, 'knife', dir);
            }
          } else {
            this.causeOfDeath = 'punch';
            playSound(longHitSound);
            if (this.sprite.scale.x < 0) {
              this.velocity.x = newPixelSize * 3;
            } else {
              this.velocity.x = -newPixelSize * 3;
            }
            if (!player.ducking) {
              new Squib(this, this.sprite.x, this.faceY, 64, 'punch');
            }
          }
          player.dealtBlow = true;
          player.killed++;
        } else {
        }
      }
    }
  };
  walk(amount) {
    this.sprite.x += amount;
    this.cycleLegs();
    var distance = Math.abs(this.sprite.x - player.sprite.x);
    var playerHeight = player.level.groundY - player.sprite.y;
    if (this.facingPlayer() && !playerHeight && distance < newPixelSize * 3) {
      this.gripping = true;
      player.grippers.push(this);
      this.sprite.texture = PIXI.utils.TextureCache['grippergrabbing'];
      if (this.sprite.scale.x > 0) {
        this.sprite.x = player.sprite.x - tileSize / 3 - randomInt(-1, 3) * newPixelSize;
      } else {
        this.sprite.x = player.sprite.x + tileSize / 3 + randomInt(-1, 3) * newPixelSize;
      }
      return;
    }
    if (distance < tileSize * 5) {
      this.currentFrames = this.attackFrames;
    } else {
      this.currentFrames = this.walkFrames;
    }
    if (player.level.boss && Math.abs(player.level.boss.sprite.x - player.sprite.x) < gameWidth / 2) {
      if (this.sprite.scale.x < 0) {
        this.flip();
      }
    }
    if (distance > gameWidth + tileSize * 3) {
      this.sprite.visible = false;
    }
  };
}

class Tomtom extends Enemy {
  constructor(side, scale=fighterScale) {
    super(side, scale);    
    this.type = 'tomtom';
    if (gameMode !== 'horde') {
      this.worth = {
        punch: 500,
        kick: 200,
        jumpkick: 1000,
        knife: 600
      }
    }
    this.drainRate = 10;
    if (!randomInt(0,1000)) {
      this.drainRate = 2;
      Object.values(this.worth).map((prize, i) => {
        let newPrize = prize * 3;
        this.worth[Object.keys(this.worth)[i]] = newPrize;
      })
      scale = fighterScale * 1.5;
      this.sprite.tint = 0xffdddd;
    }
    this.sprite.width = newPixelSize * 16 * scale;
    this.sprite.height = newPixelSize * 24 * scale;
    this.faceY = this.sprite.y - this.sprite.height * 0.9;
    this.walkFrames = ['tomtomwalk0', 'tomtomwalk1'];
    this.jumpFrames = ['tomtomjump0', 'tomtomjump1', 'tomtomjump2', 'tomtomjump3'];
    this.currentFrames = this.walkFrames;
    this.gripping = false;
    this.beganJump = -99;
    this.leapForce = (tileSize / 3.4) * scale;
    this.leapt = false;
    this.landed = false;
    this.dealtBlow = false;
    this.jumper = false;
    this.headHeight = (newPixelSize * 30) * scale;
    this.gripTime = 0;
    this.walkCycleSpeed = 5;

    if (!randomInt(0, 2)) {
      this.jumper = true;
    }
    let offDistance = (gameMode === 'story' ? gameWidth / 2 : gameWidth);
    if (side === 'left') {
      this.sprite.x = player.sprite.x - offDistance;
      this.walkSpeed = (player.walkSpeed * 1.4) * scale;
    } else {
      this.sprite.x = player.sprite.x + offDistance;
      this.sprite.scale.x *= -1;
      this.walkSpeed = (-player.walkSpeed * 1.4) * scale;
    }
    gameContainer.addChild(this.sprite);
    tomtoms.push(this);
  }

  leap() {
    var sinceBegan = counter - this.beganJump;
    if (sinceBegan === 0) {
      this.leapt = true;
      this.velocity.y = this.leapForce;
      this.jumpFrame = 0;
      this.sprite.texture = PIXI.utils.TextureCache[this.jumpFrames[this.jumpFrame]];
    }
    if (sinceBegan > 0 && sinceBegan % 10 === 0) {
      if (this.jumpFrame + 1 < this.jumpFrames.length) {
        this.jumpFrame++;
      } else {
        this.jumpFrame = 0;
      }
      this.sprite.texture = PIXI.utils.TextureCache[this.jumpFrames[this.jumpFrame]];
    }
  };
  checkForPlayer() {
    var distance = Math.abs(this.sprite.x - player.sprite.x);
    if (this.gripping) {
      if (!player.dealtBlow && player.ducking && (player.kicking || player.punching) && this.playerFacing()) {
        this.dead = true;
        this.diedAt = counter;
        player.grippers.splice(player.grippers.indexOf(this), 1);
        this.gripping = false;
        player.dealtBlow = true;
        player.killed++;
        if (this.sprite.scale.x < 0) {
          this.velocity.x = newPixelSize;
        } else {
          this.velocity.x = -newPixelSize;
        }
      }
    } else {
      if (this.leapt && !this.landed) {
        // tomtom off ground
        if (player.sprite.y < player.level.groundY) {
          // player off ground
          if (distance < (tileSize / 2) * this.scale) {
            this.dead = true;
            this.diedAt = counter;
          } else if (player.attackHitting && player.kicking && distance < player.kickRange && player.sprite.y - this.sprite.y > 0 && player.sprite.y - this.sprite.y < (tileSize * this.scale)) {
            this.dead = true;
            this.diedAt = counter;
            this.causeOfDeath = 'jumpkick';
            playSound(longHitSound);
            if (this.sprite.scale.x < 0) {
              this.velocity.x = newPixelSize * 8;
            } else {
              this.velocity.x = -newPixelSize * 8;
            }
            this.velocity.y += newPixelSize * 3;
            var squib = new Squib(this, this.sprite.x, this.faceY, 64, 'jumpkick');
            // player.dealtBlow = true
            player.killed++;
          }
        } else {
          // player on ground, tomtom off ground
          if (distance > tileSize && player.attackHitting && distance < player.kickRange && !player.ducking && player.kicking && this.sprite.y < player.level.groundY - (tileSize * 1.5 * this.scale) && this.sprite.y > player.level.groundY -(tileSize * 2 * this.scale)) {
            this.dead = true;
            this.diedAt = counter;
            this.causeOfDeath = 'kick';
            var squib = new Squib(this, this.sprite.x, this.faceY, 64, 'kick');
            if (this.sprite.scale.x < 0) {
              this.velocity.x = newPixelSize * 5;
            } else {
              this.velocity.x = -newPixelSize * 5;
            }
            this.velocity.y += newPixelSize;
          } else if (distance < player.punchRange && player.attackHitting && player.punching) {
            if (player.ducking && this.sprite.y > player.level.groundY - newPixelSize) {
              // player ducking
              this.dead = true;
              this.diedAt = counter;
              if (player.weapon === 'knife') {
                this.causeOfDeath = 'knife';
                playSound(shortHitSound);
                if (this.sprite.scale.x < 0) {
                  this.velocity.x = newPixelSize;
                } else {
                  this.velocity.x = -newPixelSize;
                }
              } else {
                this.causeOfDeath = 'punch';
                playSound(longHitSound);
                if (this.sprite.scale.x < 0) {
                  this.velocity.x = newPixelSize;
                } else {
                  this.velocity.x = -newPixelSize;
                }
              }
            } else if (!player.ducking && player.attackHitting && this.sprite.y > player.level.groundY - tileSize / 4) {
              // player standing
              this.dead = true;
              this.diedAt = counter;
              if (player.weapon === 'knife') {
                this.causeOfDeath = 'knife';
                playSound(shortHitSound);
              } else {
                this.causeOfDeath = 'punch';
                playSound(longHitSound);
              }
            }
          } else if (!this.dealtBlow && player.sprite.y - this.sprite.y < player.sprite.height && distance < tileSize / 2) {
            // hit player
            player.damage(10);
            this.dealtBlow = true;
            playSound(longHitSound);
            if (!player.stunned) {
              player.flinch('high');
            }
            this.velocity.y = this.leapForce;
          }
        }
      }
      if (!this.leapt && !player.dealtBlow && player.kicking && this.playerFacing() && distance <= tileSize * 1.6) {
        if ((player.ducking || this.sprite.y < player.level.groundY) && player.sprite.y === player.level.groundY) {
          this.dead = true;
          this.diedAt = counter;
          this.causeOfDeath = 'kick';
          if (!player.ducking) {
            var squib = new Squib(this, this.sprite.x, this.faceY, 64, 'kick');
          }
          player.dealtBlow = true;
          player.killed++;
          playSound(longHitSound);
          if (this.sprite.scale.x < 0) {
            this.velocity.x = newPixelSize * 2;
          } else {
            this.velocity.x = -newPixelSize * 2;
          }
        } else {
          if (this.sprite.y < player.level.groundY) {
            this.dead = true;
            this.diedAt = counter;
            this.causeOfDeath = 'jumpkick';
            var squib = new Squib(this, this.sprite.x, this.faceY, 64, 'jumpkick');
            // player.dealtBlow = true
            player.killed++;
          }
          playSound(longHitSound);
        }
      }
      if (player.weapon === 'knife') {
        var punchRange = tileSize * 2 * fighterScale;
      } else {
        var punchRange = player.punchRange;
      }

      if ((player.ducking || (this.sprite.y < player.level.groundY && this.sprite.y > player.level.groundY - tileSize * 2)) && !player.dealtBlow && player.punching && this.playerFacing() && distance <= punchRange) {
        if (player.sprite.y === player.level.groundY) {
          this.dead = true;
          this.diedAt = counter;
          if (player.weapon === 'knife') {
            this.causeOfDeath = 'knife';
            playSound(shortHitSound);
            if (player.sprite.scale.x > 0) {
              var dir = 'left';
            } else {
              var dir = 'right';
            }
            if (this.sprite.scale.x < 0) {
              // this.velocity.x = newPixelSize
            } else {
              // this.velocity.x = -newPixelSize
            }
            var squib = new Squib(this, this.sprite.x, this.faceY, 64, this.causeOfDeath, dir);
          } else {
            this.causeOfDeath = 'punch';
            playSound(longHitSound);
            if (this.sprite.scale.x < 0) {
              this.velocity.x = newPixelSize * 3;
            } else {
              this.velocity.x = -newPixelSize * 3;
            }
            var squib = new Squib(this, this.sprite.x, this.faceY, 64, this.causeOfDeath);
          }

          player.dealtBlow = true;
          player.killed++;
        } else {
        }
      }
    }
  };
  walk(amount) {
    this.sprite.x += amount;
    if (this.sprite.y === player.level.groundY) {
      this.cycleLegs();
    }
    var distance = Math.abs(this.sprite.x - player.sprite.x);
    var playerHeight = player.level.groundY - player.sprite.y;
    if (!this.leapt && this.facingPlayer() && !playerHeight && distance < newPixelSize * 3) {
      this.gripping = true;
      player.grippers.push(this);
      this.sprite.texture = PIXI.utils.TextureCache['tomtomgrabbing'];
      if (this.sprite.scale.x > 0) {
        this.sprite.x = player.sprite.x - tileSize / 3 - randomInt(-1, 3) * newPixelSize;
      } else {
        this.sprite.x = player.sprite.x + tileSize / 3 + randomInt(-1, 3) * newPixelSize;
      }
      return;
    }
    if (this.jumper && randomInt(0, 1) && !this.leapt && distance < gameWidth / 5) {
      this.beganJump = counter;
      this.leapt = true;
    }

    // if (distance < tileSize*5) {
    // this.currentFrames = this.attackFrames
    // } else {
    this.currentFrames = this.walkFrames;
    // }
    if (player.level.boss && Math.abs(player.level.boss.sprite.x - player.sprite.x) < gameWidth / 2) {
      if (this.sprite.scale.x < 0) {
        this.flip();
      }
    }
    if (distance > gameWidth + tileSize * 3) {
      this.sprite.visible = false;
    }
  };
}

class Knifethrower extends Enemy {
  constructor(side, delayDistance=0, scale=fighterScale) {
    super(side, scale);
    if (knifethrowers.length === 1) {
      lastKT = counter;
    }
    this.type = 'knifethrower';
    this.sprite.width = tileSize * 2 * scale;
    this.sprite.height = tileSize * 3 * scale;
    this.faceY = this.sprite.y - this.sprite.height * 0.7;
    this.walkFrames = ['knifethrowerwalk1', 'knifethrowerwalk2'];
    this.currentFrames = this.walkFrames;
    this.damagedAt = -99;
    this.stunTime = 2;
    this.reeling = false;
    this.hp = this.maxHP = 2;
    this.causeOfDeath = undefined;
    this.approaching = true;
    this.throwing = false;
    this.throwType = undefined;
    this.beganThrowAt = -99;
    this.headHeight = (newPixelSize * 40) * scale;
    this.paused = false;
    this.nextThrow = -99;
    this.throwDelay = randomInt(30, 40);
    
    if (gameMode !== 'horde') {
      this.worth = {
        punch: 800,
        kick: 500,
        jumpkick: 1000,
        knife: 500
      }
    }
    this.walkCycleSpeed = 8;
    this.walkSpeed = playerSpeed * 0.7 * scale;
    gameContainer.addChildAt(this.sprite, gameContainer.children.indexOf(player.sprite));
    knifethrowers.push(this);
    let offDistance = (gameMode === 'story' ? gameWidth / 2 : gameWidth);
    if (side === 'left') {
      this.sprite.x = player.sprite.x - offDistance - delayDistance;
    } else {
      this.sprite.x = player.sprite.x + offDistance + delayDistance;
      this.sprite.scale.x *= -1;
    }
  }

  reel() {
    var sinceDamaged = counter - this.damagedAt;
    if (sinceDamaged === 1) {
      if (this.walkFrame === 0) {
        this.walkFrame = 1;
      } else {
        this.walkFrame = 0;
      }
      this.sprite.texture = PIXI.utils.TextureCache['knifethrowerwalk1'];
    }
    if (this.sprite.scale.x > 0) {
      var reelAmount = -newPixelSize * 2;
    } else {
      var reelAmount = newPixelSize * 2;
    }
    // this.sprite.x += reelAmount
    if (sinceDamaged === this.stunTime) {
      this.reeling = false;
    }
  };
  die(cause) {
    if (this.diedAt === counter - 1) {
      if (powerups.length < 100 && player.character === 'thomas') {
      // if (powerups.length < 1 && player.character === 'thomas' && player.weapon !== 'knife') {
        new Powerup(this.sprite.x, 'knife');
      }
      if (player.weapon !== 'knife') {
        if (!this.playerFacing()) {
          this.sprite.scale.x *= -1;
        }
      }
      this.sprite.texture = PIXI.utils.TextureCache['knifethrowerdead'];
      this.sprite.y -= newPixelSize * 8;
      if (this.sprite.scale.x > 0) {
        this.sprite.x += newPixelSize * 4;
      } else {
        this.sprite.x -= newPixelSize * 4;
      }
      if (this.causeOfDeath) {
        var award = this.worth[this.causeOfDeath] * player.killed;
        player.score += award;
        new scoreBlip(award, this);
      }
      scoreDisplay.updateScore(player.score);
    }
    this.applyGravity();
    this.applyVelocity();
    if (this.sprite.y > gameHeight + this.sprite.height) {
      this.sprite.visible = false;
    }
  };
  damage(amount, cause) {
    this.hp -= amount;
    this.damagedAt = counter;
    if (this.hp <= 0) {
      this.dead = true;
      this.diedAt = counter;
      this.causeOfDeath = cause;
    } else {
      // this.reeling = true
    }
    if (!this.playerFacing()) {
      this.flip();
    }
  };
  checkForPlayer() {
    var distance = Math.abs(this.sprite.x - player.sprite.x);
    if (!player.dealtBlow && player.kicking && distance <= player.kickRange) {
      if (player.sprite.y === player.level.groundY) {
        if (!this.playerFacing()) {
          this.flip();
        }
        this.damage(1, 'kick');
        if (this.hp === 0) {
          player.killed++;
          if (!player.ducking) {
            var throwX = newPixelSize * (4 + randomInt(0, 10) * (newPixelSize / 10));
          } else {
            var throwX = newPixelSize * (2 + randomInt(0, 10) * (newPixelSize / 10));
          }
          if (this.sprite.scale.x < 0) {
            this.velocity.x = throwX;
          } else {
            this.velocity.x = -throwX;
          }
          this.velocity.y += newPixelSize;
          this.causeOfDeath = 'kick';
        }
        if (!player.ducking) {
          var squib = new Squib(this, this.sprite.x, this.faceY, 64, 'kick');
        }
        player.dealtBlow = true;

        playSound(longHitSound);
      } else {
        // if (player.level.groundY-player.sprite.y < player.sprite.height*0.9) {
        if (true) {
          if (!this.playerFacing()) {
            this.flip();
          }
          this.damage(1, 'jumpkick');
          var squib = new Squib(this, this.sprite.x, this.faceY, 64, 'jumpkick');
          // player.dealtBlow = true
          player.killed++;
          player.dealtBlow = true;
          playSound(longHitSound);
          if (this.hp === 0) {
            this.causeOfDeath = 'kick';
            if (this.sprite.scale.x < 0) {
              this.velocity.x = newPixelSize * (5 + randomInt(0, 10) * (newPixelSize / 10));
            } else {
              this.velocity.x = -newPixelSize * (5 + randomInt(0, 10) * (newPixelSize / 10));
            }
            if (player.sprite.y < player.level.groundY - player.sprite.height * 0.3) {
              this.velocity.y = newPixelSize * (3 + randomInt(0, 10) * (newPixelSize / 10));
            } else {
              this.velocity.y = newPixelSize;
            }
          }
        }
      }
    }
    if (player.weapon === 'knife') {
      var punchRange = tileSize * 2 * fighterScale;
      var punchDamage = 2;
    } else {
      var punchRange = player.punchRange;
      var punchDamage = 1;
    }
    if (godMode) {
      punchDamage = 75;
    }
    if (!player.dealtBlow && player.punching && distance <= punchRange) {
      if (player.sprite.y === player.level.groundY) {
        if (player.weapon !== 'knife') {
          this.damage(punchDamage, 'punch');
          playSound(longHitSound);
          var squib = new Squib(this, this.sprite.x, this.faceY, 64, 'punch');
          if (this.hp === 0) {
            if (this.sprite.scale.x < 0) {
              this.velocity.x = newPixelSize * 3;
            } else {
              this.velocity.x = -newPixelSize * 3;
            }
          }
        } else {
          this.damage(punchDamage, 'knife');
          playSound(shortHitSound);
          if (player.sprite.scale.x > 0) {
            var dir = 'left';
          } else {
            var dir = 'right';
          }
          var squib = new Squib(this, this.sprite.x, this.faceY, 64, 'knife', dir);
          if (this.sprite.scale.x < 0) {
            // this.velocity.x = newPixelSize
          } else {
            // this.velocity.x = -newPixelSize
          }
        }
        if (this.hp === 0) {
          player.killed++;
        }

        player.dealtBlow = true;
      } else {
      }
    }
    if (distance < tileSize && this.playerFacing()) {
      this.flip();
    }
  };
  walk(amount) {
    if (randomInt(0, 1) && !this.approaching) {
      amount *= 1.3;
    }
    if (this.sprite.scale.x > 0) {
      this.sprite.x += amount;
    } else {
      this.sprite.x -= amount;
    }
    this.cycleLegs();
    var distance = Math.abs(this.sprite.x - player.sprite.x);
    var playerHeight = player.level.groundY - player.sprite.y;
    if (this.approaching) {
      if (distance < player.sprite.width / 2) {
        this.flip();
        this.approaching = false;
      } else {
        if (counter - lastKnife > knifeFrequency && distance < gameWidth * 0.4 && randomInt(0, 1) && counter % randomInt(20, 60) === 0) {
          this.throwKnife('random', [0, 2]);
        }
      }
    } else {
      if ((counter % randomInt(15, 45) === 0 && distance > player.sprite.width) || distance >= gameWidth * 0.3) {
        this.flip();
        this.approaching = true;
        this.throwKnife('random', [0, 2]);
      }
    }
    if (distance > gameWidth + tileSize * 3) {
      if (this.sprite.x > player.sprite.x) {
        this.sprite.x = player.sprite.x + gameWidth;
      } else {
        this.sprite.x = player.sprite.x - gameWidth;
      }
    }
  };
  throwKnife(type, doubleChance) {
    this.beganThrowAt = counter;
    this.throwing = true;
    if (type === 'random') {
      if (randomInt(0, 1)) {
        this.throwType = 'low';
      } else {
        this.throwType = 'high';
      }
    } else {
      this.throwType = type;
    }
    this.sprite.texture = PIXI.utils.TextureCache['knifethrowerdrawn' + this.throwType];
    if (!randomInt(doubleChance[0], doubleChance[1])) {
      this.paused = true;
      // this.nextThrow = counter + randomInt(90, 100);
      this.nextThrow = counter + randomInt(60, 100);
    }
    lastKnife = counter;
  };
  throw(type) {
    if (type === 'low') {
      var thrownText = PIXI.utils.TextureCache['knifethrowerthrownlow'];
      var knifeY = this.sprite.y - newPixelSize * 12;
      var knifeXDist = tileSize * 1.1;
    } else {
      var thrownText = PIXI.utils.TextureCache['knifethrowerthrownhigh'];
      var knifeY = this.sprite.y - tileSize * 2.1;
      var knifeXDist = tileSize * 1.3;
    }

    var sinceDrawn = counter - this.beganThrowAt;
    if (sinceDrawn === this.throwDelay) {
      this.sprite.texture = thrownText;
      var knife = new PIXI.Sprite(PIXI.utils.TextureCache['knife']);
      knife.type = this.throwType;
      knife.width = newPixelSize * 9 * fighterScale;
      knife.height = newPixelSize * 4.5 * fighterScale;
      knife.enemy = true;
      knife.anchor.set(0.5);
      if (this.sprite.scale.x > 0) {
        var knifeX = this.sprite.x + knifeXDist;
      } else {
        knife.scale.x *= -1;
        var knifeX = this.sprite.x - knifeXDist;
      }
      knife.x = knifeX;
      knife.y = knifeY;
      gameContainer.addChild(knife);
      knives.push(knife);
    }
    if (sinceDrawn === this.throwDelay + 10) {
      this.sprite.texture = PIXI.utils.TextureCache[this.walkFrames[this.walkFrame]];
      this.throwing = false;
    }
  };
}

class Squib {
  constructor(victim, posX, posY, size, cause, hitFrom) {
    if (!gameOptions.bloodOn) {
      return;
    } else {
      this.hitFrom = hitFrom;
      this.bornAt = counter;
      this.terminus = { x: posX, y: posY };
      this.spread = 10;
      this.victimScale = victim.sprite.scale.x;
      this.droplets = [];
      // this.keepDroplets = 600;
      this.keepDroplets = 1440;
      this.fromStab = false;
      if (cause === 'knife' || (cause === 'punch' && player.weapon === 'knife')) {
        this.fromStab = true;
        size = randomInt(24, 36);
        // posY += newPixelSize*6

        if (player.ducking) {
          // posY += tileSize/2
        }
      } else if (cause === 'punch') {
        size = randomInt(10, 18);
      } else if (cause === 'kick' || cause === 'jumpkick') {
        size = randomInt(15, 24);
      }
      if (victim.type === 'tomtom') {
        if (victim.sprite.y === player.level.groundY) {
          posY = victim.sprite.y - victim.sprite.height * 0.8;
        } else {
          posY = victim.sprite.y - victim.sprite.height * 0.5;
        }
      }
      if (cause === 'knife') {
        if (hitFrom === 'left') {
          this.terminus.x = victim.sprite.x - tileSize * 3;
        } else {
          this.terminus.x = victim.sprite.x + tileSize * 3;
        }
        this.spread = 30;
      }
      this.container = new PIXI.Container();
      for (var p = 0; p < size; p++) {
        var drop = new PIXI.Sprite(PIXI.utils.TextureCache['pixel']);
        drop.width = drop.height = (newPixelSize + randomInt(-1, 1) * (newPixelSize * 0.25)) * fighterScale;
        if (randomInt(0, 1)) {
          drop.tint = 0xaa0000;
        } else {
          drop.tint = 0xdd0000;
        }
        drop.flyAngle = degToRad(randomInt(0, 359));
        drop.x = pointAtAngle(posX, posY, drop.flyAngle, randomInt(1, 5) * newPixelSize * fighterScale).x;
        if (cause !== 'knife') {
          drop.y = pointAtAngle(posX, posY, drop.flyAngle, randomInt(1, 5) * newPixelSize * fighterScale).y;
          drop.fadeSpeed = 0.06 + randomInt(-10, 10) * 0.001;
        } else {
          drop.y = pointAtAngle(posX, posY, drop.flyAngle, randomInt(1, 2) * newPixelSize * fighterScale).y;
          drop.fadeSpeed = 0.04 + randomInt(-10, 10) * 0.001;
        }
        drop.flySpeed = ((randomInt(1, 3) * newPixelSize) / 4) * fighterScale;
        // drop.fadeSpeed = 0.09
        this.container.addChild(drop);
      }
      gameContainer.addChild(this.container);
      squibs.push(this);
    }
  }

  layDroplets(density) {
    gameContainer.setChildIndex(this.container, gameContainer.children.indexOf(player.sprite));
    for (var d = 0; d < density; d++) {
      var drop = new PIXI.Sprite(PIXI.utils.TextureCache['pixel']);
      drop.droplet = true;
      drop.longevity = this.keepDroplets + randomInt(-120, 120);  
      drop.width = drop.height = ((newPixelSize)+(randomInt(-1,1)*newPixelSize*0.25)) * fighterScale;
      if (randomInt(0, 1)) {
        drop.tint = 0x990000;
      } else {
        drop.tint = 0xcc0000;
      }
      drop.x = this.terminus.x + randomInt(-this.spread, this.spread) * newPixelSize;
      if (randomInt(0, 2)) {
        drop.y = player.level.groundY + randomInt(-2, 1) * newPixelSize;
      } else {
        drop.y = player.level.groundY + randomInt(-1, 3) * newPixelSize;
      }
      this.droplets.push(drop);
      this.container.addChild(drop);
      // gameContainer.addChildAt(drop,gameContainer.children.indexOf(player.level.container)+1)
    }
  };
  animate() {
    for (var p = 0; p < this.container.children.length; p++) {
      var drop = this.container.children[p];
      if (!drop.droplet) {
        drop.x = pointAtAngle(drop.x, drop.y, drop.flyAngle, drop.flySpeed / 2).x;
        drop.y = pointAtAngle(drop.y, drop.y, drop.flyAngle, drop.flySpeed).y;
        drop.alpha -= drop.fadeSpeed;
        if (drop.y > player.level.groundY) {
          drop.alpha = 0;
        }
        if (drop.alpha <= 0) {
          this.container.removeChild(drop);
        }
        if (this.fromStab) {
          if (this.hitFrom === 'right') {
            drop.x += newPixelSize * 1.75 * fighterScale;
          } else {
            drop.x -= newPixelSize * 1.75 * fighterScale;
          }
          drop.y += newPixelSize * ((counter - this.bornAt - 3) / 10);
        } else {
          drop.y += newPixelSize * ((counter - this.bornAt - 3) / 10);
        }
      } else {
      }
    }
  };
  clearDroplets() {
    for (var d = 0; d < this.droplets.length; d++) {
      this.container.removeChild(this.droplets[d]);
    }
  };

}

function distanceFromABtoXY(a, b, x, y) {
  var distanceX = x - a;
  var distanceY = y - b;
  return Math.round(Math.sqrt(distanceX * distanceX + distanceY * distanceY));
}
function pointAtAngle(x, y, angle, distance) {
  return { x: x + distance * Math.cos(angle), y: y + distance * Math.sin(angle) };
}

function angleOfPointABFromXY(a, b, x, y) {
  return Math.atan2(b - y, a - x);
}
function degToRad(radians) {
  return radians * (Math.PI / 180);
};

function radToDeg(radians) {
  deg = radians * (180 / Math.PI);
  if (deg < 0) {
    deg += 360;
  } else if (deg > 359) {
    deg -= 360;
  }
  return radians * (180 / Math.PI);
};
class Powerup {
  constructor(posX, type, dropped) {
    this.sprite = new PIXI.Sprite(PIXI.utils.TextureCache['knife']);
    this.sprite.anchor.set(0.5);
    this.sprite.width = newPixelSize * 12 * fighterScale;
    this.sprite.height = newPixelSize * 6 * fighterScale;
    this.sprite.x = posX;
    this.sprite.y = player.level.groundY - player.sprite.height * 0.7;
    this.dropped = dropped;
    if (!dropped) {
      this.yLimit = player.level.groundY;
    } else {
      this.yLimit = gameHeight + this.sprite.height;
      if (player.sprite.scale.x < 0) {
        this.sprite.scale.x += -1;
      }
      this.sprite.y += newPixelSize * 2;
    }
    gameContainer.addChild(this.sprite);
    powerups.push(this);
  }

  pulse() {
    this.sprite.rotation += degToRad(10);
  };
  checkForPlayer() {
    if (player.ducking && !player.weapon && Math.abs(player.sprite.x - this.sprite.x) < tileSize) {
      this.sprite.visible = false;
      powerups.splice(powerups.indexOf(this), 1);
      player.weapon = 'knife';
      nesPanel.toggleThrow('on');
    }
  };

}

function spawnRandomEnemy() {
  enemiesSpawned++;
  if (randomInt(0, 1)) {
    var randSide = 'left';
  } else {
    var randSide = 'right';
  }
  if (gameMode !== 'horde' && Math.abs(player.sprite.x - player.level.playerStartX) < gameWidth / 2) {
    randSide = player.level.direction;
    console.error('sending from', randSide, 'because player not moved enough')
  }
  if (wonRound) {
    if (player.level.direction === 'left') {
      randSide = 'right';
    } else {
      randSide = 'left';
    }
  }

  let tomtomChance = randomInt(0, 2);

  if (grippers.length < gripperLimit && tomtomChance) {
    var newGripper = new Gripper(randSide);
    newGripper.walkSpeed += randomInt(-3,2)*(newPixelSize/16)
    if (grippers.length < gripperLimit && !randomInt(0, 2)) {
      // setTimeout(function(){
      var grp = new Gripper(randSide);
      // grp.sprite.tint = 0xff0000
      newGripper.walkSpeed += randomInt(-3,2)*(newPixelSize/16)
      // },500)
    }
  } else if (tomtomLimit && tomtoms.length < tomtomLimit) {
    var newTomtom = new Tomtom(randSide);
    // newTomtom.walkSpeed += randomInt(-2,4)*(newPixelSize/12)
  } else {
    console.error('tomtoms.length >= tomtomLimit', tomtoms.length, '--->', tomtomLimit)
    var newGripper = new Gripper(randSide)
  }
}

function Egg(type, posX, posY) {
  this.delay = 0;
  if (type === 'dragon') {
    var texture = 'dragonegg';
    this.burstFrames = ['burst0', 'burst1', 'burst2'];
    this.homeY = player.level.groundY;
  }
  if (type === 'snake') {
    var texture = 'snakeegg';
    this.burstFrames = ['burst0', 'burst1', 'burst2'];
    this.homeY = player.level.groundY;
  }
  if (type === 'confetti') {
    this.delay = 120;
    var texture = 'discoball';
    this.burstFrames = ['burst0', 'burst1', 'burst2'];
    this.homeY = player.level.topY + tileSize * 7.3;
  }
  this.type = type;
  this.burstFrame = 0;
  this.sprite = new PIXI.Sprite(PIXI.utils.TextureCache[texture]);
  this.sprite.width = this.sprite.height = newPixelSize * 16 * fighterScale;
  this.sprite.anchor.x = 0.5;
  this.sprite.anchor.y = 1;
  this.sprite.x = posX;
  // this.sprite.y = player.level.groundY-(tileSize*3.5)
  if (posY) {
    this.sprite.y = posY;
  } else {
    this.sprite.y = tileSize * 4;
  }
  this.landedAt = undefined;
  this.timer = randomInt(60, 120);
  this.fallSpeed = newPixelSize * 3.5;
  this.destroyed = false;

  this.playerFacing = function() {
    return (player.sprite.scale.x < 0 && player.sprite.x > this.sprite.x) || (player.sprite.scale.x > 0 && player.sprite.x < this.sprite.x);
  };
  this.fall = function() {
    if (this.sprite.y + this.fallSpeed < this.homeY) {
      this.sprite.y += this.fallSpeed;
    } else {
      this.sprite.y = this.homeY;
      this.landedAt = counter;
    }
  };
  this.hatch = function() {
    var sinceLanded = counter - this.landedAt - this.delay;
    if (sinceLanded === 0) {
      this.sprite.texture = PIXI.utils.TextureCache[this.burstFrames[0]];
    } else if (sinceLanded === 4) {
      this.sprite.texture = PIXI.utils.TextureCache[this.burstFrames[1]];
    } else if (sinceLanded === 8) {
      this.sprite.texture = PIXI.utils.TextureCache[this.burstFrames[2]];
    } else if (sinceLanded === 12) {
      this.sprite.visible = false;
      if (!this.destroyed) {
        if (this.type === 'snake') {
          new Snake(this.sprite.x);
        }
        if (this.type === 'dragon') {
          new Dragon(this.sprite.x);
        }
        if (this.type === 'confetti') {
          new Confetti(this.sprite.x, this);
        }
      }
    }
  };
  this.checkForPlayer = function() {
    var distance = Math.abs(player.sprite.x - this.sprite.x);
    if (this.playerFacing() && ((distance < player.punchRange && player.punching) || (distance < player.kickRange && player.kicking))) {
      if (player.sprite.y - this.sprite.y < tileSize * 3) {
        this.landedAt = counter;
        this.destroyed = true;
      }
    } else {
      if (!player.ducking) {
        var hitY = tileSize * 2.5;
      } else {
        var hitY = tileSize * 2;
      }
      if (distance < tileSize && player.sprite.y - this.sprite.y < hitY) {
        this.landedAt = counter;
        this.destroyed = true;
        player.damage(10);
        player.flinch();
      }
    }
  };
  this.die = function() {};
  lastEggX = posX;
  eggs.push(this);
  gameContainer.addChild(this.sprite);
}
function Snake(posX) {
  this.sprite = new PIXI.Sprite(PIXI.utils.TextureCache['snake0']);
  this.sprite.width = this.sprite.height = newPixelSize * 16 * fighterScale;
  this.walkFrame = 0;
  this.walkFrames = ['snake0', 'snake1'];
  this.sprite.anchor.x = 0.5;
  this.sprite.anchor.y = 1;
  this.sprite.x = posX;
  this.sprite.y = player.level.groundY;
  this.bornAt = counter;
  this.diedAt = undefined;

  if (this.sprite.x < player.sprite.x) {
    this.direction = 'right';
    this.walkSpeed = (newPixelSize * 2);
  } else {
    this.direction = 'left';
    this.walkSpeed = (-newPixelSize * 2);
    this.sprite.scale.x *= -1;
  }

  this.walk = function() {
    this.sprite.x += this.walkSpeed;
    var sinceBorn = counter - this.bornAt;
    if (sinceBorn % 10 === 0) {
      if (this.walkFrame === 0) {
        this.walkFrame = 1;
      } else {
        this.walkFrame = 0;
      }
      this.sprite.texture = PIXI.utils.TextureCache[this.walkFrames[this.walkFrame]];
    }
    if (Math.abs(this.sprite.x - player.sprite.x) > gameWidth / 1.5) {
      this.sprite.visible = false;
    }
  };
  this.checkForPlayer = function() {
    var distance = Math.abs(this.sprite.x - player.sprite.x);
    if (distance >= tileSize / 2 && distance < tileSize * 1.5) {
      if (player.sprite.y === player.level.groundY && player.ducking && player.kicking) {
        this.dead = true;
        this.diedAt = counter;
        this.sprite.texture = PIXI.utils.TextureCache['snakedead'];
        player.dealtBlow = true;
      }
    } else if (distance < tileSize / 2) {
      if (player.sprite.y === player.level.groundY) {
        playSound(shortHitSound);
        player.damage(10);
        if (!player.stunned) {
          player.flinch();
        }
        this.sprite.visible = false;
        var explosion = new Egg('snake', this.sprite.x, this.sprite.y);
        explosion.landedAt = counter;
        explosion.destroyed = true;
        explosion.timer = 0;
      }
    }
  };
  this.die = function() {
    var sinceDied = counter - this.diedAt;
    if (sinceDied === 30) {
      this.sprite.visible = false;
    }
  };
  snakes.push(this);
  gameContainer.addChild(this.sprite);
}
function Dragon(posX) {
  // this.egg
  this.worth = 2000;
  this.sprite = new PIXI.Sprite(PIXI.utils.TextureCache['dragonsmoked']);
  this.smoke = new PIXI.Sprite(PIXI.utils.TextureCache['smoke0']);
  this.sprite.width = this.smoke.width = newPixelSize * 24 * fighterScale;
  this.sprite.height = this.smoke.height = newPixelSize * 48 * fighterScale;
  this.sprite.anchor.x = this.smoke.anchor.x = 0.5;
  this.sprite.anchor.y = this.smoke.anchor.y = 0.95;
  this.sprite.x = this.smoke.x = posX;
  this.sprite.y = this.smoke.y = player.level.groundY;
  this.sprite.visible = false;
  this.bornAt = counter;
  this.hatched = false;
  this.flame = new PIXI.Sprite(PIXI.utils.TextureCache['dragonfire']);
  this.flame.width = newPixelSize * 32;
  this.flame.height = newPixelSize * 16;
  this.flame.y = this.sprite.y - this.sprite.height * 0.75;
  this.flame.visible = false;
  this.spewedAt = -99;
  this.dealtBlow = false;
  this.longevity = 180;
  this.active = false;
  this.dead = false;
  this.diedAt = -99;
  this.headHeight = newPixelSize * 40;
  if (player.sprite.x < this.sprite.x) {
    this.sprite.scale.x *= -1;
    this.flame.scale.x *= -1;
    this.flame.x = this.sprite.x - newPixelSize * 6;
  } else {
    this.flame.x = this.sprite.x + newPixelSize * 6;
  }
  this.changeTexture = function(spr, newText) {
    spr.texture = PIXI.utils.TextureCache[newText];
  };
  this.hatch = function() {
    var sinceBorn = counter - this.bornAt;
    if (sinceBorn === 5) {
      this.changeTexture(this.smoke, 'smoke1');
    }
    if (sinceBorn === 10) {
      this.changeTexture(this.smoke, 'smoke2');
    }
    if (sinceBorn === 15) {
      this.changeTexture(this.smoke, 'smoke3');
      this.sprite.visible = true;
      this.active = true;
    }
    if (sinceBorn === 20) {
      this.changeTexture(this.smoke, 'smoke4');
    }
    if (sinceBorn === 25) {
      this.changeTexture(this.smoke, 'smoke5');
      this.changeTexture(this.sprite, 'dragon');
    }
    if (sinceBorn === 30) {
      this.smoke.visible = false;
      this.hatched = true;
    }
  };
  this.vanish = function() {
    if (this.dead) {
      var sinceVanished = counter - this.diedAt;
    } else {
      var sinceVanished = counter - (this.bornAt + this.longevity);
    }
    if (sinceVanished === 0) {
      this.smoke.visible = true;
      this.changeTexture(this.smoke, 'smoke2');
    }
    // if (sinceVanished===5) {
    //     this.changeTexture(this.smoke,"smoke1")
    // }
    // if (sinceVanished===10) {
    //     this.changeTexture(this.smoke,"smoke2")
    // }
    if (sinceVanished === 5) {
      this.changeTexture(this.smoke, 'smoke3');
      this.sprite.visible = false;
    }
    if (sinceVanished === 12) {
      this.changeTexture(this.smoke, 'smoke4');
    }
    if (sinceVanished === 18) {
      this.changeTexture(this.smoke, 'smoke5');
    }
    if (sinceVanished === 24) {
      this.smoke.visible = false;
      this.active = false;
    }
  };
  this.spew = function() {
    this.flame.visible = true;
    this.spewedAt = counter;
  };
  this.checkForPlayer = function() {
    if (this.flame.visible) {
      if (!this.dealtBlow && ((player.sprite.x < this.sprite.x && this.sprite.x - player.sprite.x < this.flame.width) || (player.sprite.x > this.sprite.x && player.sprite.x - this.sprite.x < this.flame.width))) {
        player.damage(10);
        player.flinch();
        this.dealtBlow = true;
      }
    }
    var distance = Math.abs(player.sprite.x - this.sprite.x);
    if ((player.punching && distance < player.punchRange) || (player.kicking && distance < player.kickRange)) {
      if (!this.flame.visible && !this.dead && !player.dealtBlow) {
        this.dead = true;
        this.diedAt = counter;
        player.dealtBlow = true;
        this.smoke.visible = true;
        this.changeTexture(this.smoke, 'smoke0');
        player.score += this.worth;
        new scoreBlip(this.worth, this);
        scoreDisplay.updateScore(player.score);
      }
    }
  };
  dragons.push(this);
  gameContainer.addChild(this.sprite);
  gameContainer.addChild(this.smoke);
  gameContainer.addChild(this.flame);
}
function Confetti(posX, egg) {
  this.shards = [];
  for (var s = 0; s < 3; s++) {
    var shard = new PIXI.Sprite(PIXI.utils.TextureCache['confetti']);
    shard.width = shard.height = newPixelSize * 4;
    shard.anchor.set(0.5);
    shard.x = posX;
    shard.y = egg.sprite.y - egg.sprite.height / 2;
    shard.hit = false;
    if (s == 0) {
      // shard.x = posX-(newPixelSize*6)
      shard.flyAngle = degToRad(45);
    } else if (s === 1) {
      shard.rotation -= degToRad(45);
      shard.flyAngle = degToRad(90);
    } else {
      // shard.x = posX+(newPixelSize*6)
      shard.rotation -= degToRad(90);
      shard.flyAngle = degToRad(135);
    }
    shard.x = pointAtAngle(shard.x, shard.y, shard.flyAngle, newPixelSize * 6).x;
    shard.y = pointAtAngle(shard.x, shard.y, shard.flyAngle, newPixelSize * 6).y;
    gameContainer.addChild(shard);
    this.shards.push(shard);
  }
  this.burst = function() {
    for (var s = 0; s < this.shards.length; s++) {
      var shard = this.shards[s];
      shard.x = pointAtAngle(shard.x, shard.y, shard.flyAngle, newPixelSize * 3).x;
      shard.y = pointAtAngle(shard.x, shard.y, shard.flyAngle, newPixelSize * 3).y;
      if (shard.hit || shard.y > player.level.groundY) {
        gameContainer.removeChild(shard);
        this.shards.splice(this.shards.indexOf(shard), 1);
        s--;
      }
    }
  };
  this.checkForPlayer = function() {
    for (var s = 0; s < this.shards.length; s++) {
      var shard = this.shards[s];
      var distanceX = Math.abs(shard.x - player.sprite.x);
      var distanceY = player.sprite.y - shard.y;
      if (distanceX < tileSize && distanceY < tileSize * 2) {
        shard.hit = true;
        player.damage(20);
        player.flinch('high');
      }
    }
  };
  confettiBalls.push(this);
}
function Boomerang(type, owner) {
  this.type = type;
  this.sprite = new PIXI.Sprite(PIXI.utils.TextureCache['boomerang']);
  this.sprite.width = this.sprite.height = newPixelSize * 8;
  this.sprite.anchor.set(0.5);
  this.velocity = { x: 0, y: 0 };
  this.flySpeed = newPixelSize * 2;
  this.ySpeed = newPixelSize;
  this.flipping = false;
  this.flippedAt = -99;
  this.highY = owner.level.groundY - newPixelSize * 36;
  this.lowY = owner.level.groundY - newPixelSize * 12;
  this.startY = undefined;
  this.flipTime = Math.round((this.lowY - this.highY) / this.ySpeed);

  this.applyVelocity = function() {
    this.sprite.x += this.velocity.x;
  };

  if (owner.sprite.scale.x < 0) {
    this.sprite.scale.x *= -1;
    this.sprite.x = this.originX = owner.sprite.x - newPixelSize * 6;
    // this.flySpeed = -newPixelSize*2
    this.velocity.x = -this.flySpeed;
  } else {
    this.sprite.x = this.originX = owner.sprite.x + newPixelSize * 6;
    // this.flySpeed = newPixelSize*2
    this.velocity.x = this.flySpeed;
  }
  if (type === 'high') {
    this.sprite.y = this.startY = this.highY;
  } else {
    this.sprite.y = this.startY = this.lowY;
  }
  boomerangs.push(this);
  gameContainer.addChild(this.sprite);
  this.flip = function() {
    var since = counter - this.flippedAt;
    // if (since < (this.flipTime/2)) {
    this.velocity.x += (this.flySpeed * 2) / this.flipTime;
    // } else {
    // this.velocity.x += (this.flySpeed)/this.flipTime
    // }
    if (this.startY === this.highY) {
      if (this.sprite.y + this.ySpeed <= this.lowY) {
        this.sprite.y += this.ySpeed;
      } else {
        this.sprite.y = this.lowY;
        this.flipping = false;
        this.velocity.x = this.flySpeed;
        this.type = 'low';
      }
    } else {
      if (this.sprite.y - this.ySpeed >= this.highY) {
        this.sprite.y -= this.ySpeed;
      } else {
        this.sprite.y = this.highY;
        this.flipping = false;
        this.velocity.x = this.flySpeed;
        this.type = 'high';
      }
    }
  };
  this.fly = function() {
    this.applyVelocity();
    if (Math.abs(this.sprite.x + this.flySpeed - this.originX) < gameWidth / 2) {
      // this.sprite.x += this.flySpeed
    } else if (!this.flipping) {
      this.flipping = true;
      this.flippedAt = counter;
      // this.velocity.x = 0
    }
    this.sprite.rotation += degToRad(24);
    if (((owner.sprite.scale.x > 0 && this.flySpeed < 0) || (owner.sprite.scale.x < 0 && this.flySpeed > 0)) && Math.abs(this.sprite.x - owner.sprite.x) < tileSize / 2) {
      this.sprite.visible = false;
    }
    var distanceX = Math.abs(player.sprite.x - this.sprite.x);

    if (distanceX < tileSize / 2) {
      if (!this.flipping && this.type === 'low' && player.sprite.y < player.level.groundY) {
        // jumping over
      } else if (!this.flipping && this.type === 'high' && player.ducking) {
        // ducking under
      } else {
        player.damage(20);
        player.flinch();
        this.sprite.visible = false;
      }
    }
  };
}
function Fireball(type, owner) {
  this.type = type;
  this.sprite = new PIXI.Sprite(PIXI.utils.TextureCache['fireball0']);
  this.sprite.width = this.sprite.height = newPixelSize * 8;
  this.sprite.anchor.set(0.5);
  this.velocity = { x: 0, y: 0 };
  this.flySpeed = newPixelSize * 3;
  this.flipping = false;
  this.flippedAt = -99;
  this.highY = owner.level.groundY - newPixelSize * 36;
  this.lowY = owner.level.groundY - newPixelSize * 12;
  this.startY = undefined;
  if (owner.sprite.scale.x < 0) {
    this.sprite.scale.x *= -1;
    this.sprite.x = this.originX = owner.sprite.x - newPixelSize * 6;
    this.flySpeed = -newPixelSize * 2;
  } else {
    this.sprite.x = this.originX = owner.sprite.x + newPixelSize * 6;
    this.flySpeed = newPixelSize * 2;
  }
  if (type === 'high') {
    this.sprite.y = this.startY = this.highY;
  } else {
    this.sprite.y = this.startY = this.lowY;
  }
  fireballs.push(this);
  gameContainer.addChild(this.sprite);
  this.fly = function() {
    if (counter % 3 === 0) {
      if (this.sprite.texture === PIXI.utils.TextureCache['fireball0']) {
        this.sprite.texture = PIXI.utils.TextureCache['fireball1'];
      } else {
        this.sprite.texture = PIXI.utils.TextureCache['fireball0'];
      }
    }
    this.sprite.x += this.flySpeed;
    var distanceX = Math.abs(player.sprite.x - this.sprite.x);
    if (distanceX > gameWidth) {
      this.sprite.visible = false;
    }
    if (distanceX < tileSize / 2) {
      if (this.type === 'low' && player.sprite.y < player.level.groundY) {
        // jumping over
      } else if (this.type === 'high' && player.ducking) {
        // ducking under
      } else {
        player.damage(20);
        player.flinch();
        this.sprite.visible = false;
      }
    }
  };
}
