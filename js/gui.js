let controlScreenOn = optionsScreenOn = false;
let controlTabSelected = 'keyboard';
let editingKeyForAction = false;
let scoresToDisplay = 30;
let textSpeed = 60;
let slideSpeed = 1500;
highScoreTabSelected = 'story';
optionSelected = 0;
assigningButton = 0;
assignableActions = ['PUNCH/WEAPON', 'KICK', 'THROW WEAPON'];
let yearsAgo = new Date().getFullYear() - 1984;
let skippingSlide = false;
optionSelections = [
  toggleSound,
  toggleMusic,
  toggleBlood,
  toggleScanLines,
  toggleFullScreen,
  callKeyControlsScreen,
  callGamepadSetupScreen,
  toggleOptionsScreen
];
const storySlides = [
  {
    imagePath: '',
    caption: `${yearsAgo} years ago...`
  },
  {
    caption: `My beloved Sylvia was kidnapped by the evil crime lord known as Mr. X.`,
    additive: true
  },
  {
    caption: `I mounted a one-man assault on his hideout, Devil's Tower, fighting my way relentlessly through each floor.`
  },
  {
    caption: `Hearing her cries far above, I could only imagine the unspeakable horrors Mr. X and his army of thugs were inflicting upon her...`
  },
  {
    caption: `...but even so, I fought with honor. My foes wielded all manner of deadly weapons, but I drew no blood and used no blade.`
  },
  {
    caption: `It was Sylvia herself - her boundless love - who taught my heart to know and to practice peace.`
  },
  {
    caption: ``
  },
  {
    caption: `Indeed, when I finally had Mr. X at my mercy, she begged me to spare his life.`
  },
  {
    caption: `This was the immensity of her compassion.`
  },
  {
    caption: `But when we returned home, she was never the same...`
  },
  {
    caption: `The endless light inside her seemed to be growing dimmer by the day. She was constantly ill and her sleep was ravaged by terrors.`
  },
  {
    caption: `Then, some months later, the unthinkable...`
  },
  {
    caption: ``
  },
  {
    caption: ``
  },
  {
    caption: ``
  },
  {
    caption: ``,
  },
  {
    caption: `She walked into the sea before the child could be born.`
  },
  {
    caption: `She didn't even say goodbye.`,
    additive: true
  },
  {
    caption: ``,
  },
  {
    caption: `That was ${yearsAgo} years ago...`
  },
  {
    caption: ``
  },
  {
    caption: ``
  },
  {
    caption: ``
  },
  {
    caption: ``
  },
  {
    caption: ``
  },
  {
    caption: ``
  },
  {
    caption: ``
  },
]
function fullScreenCall() {
  var root = document.body;
  return root.requestFullscreen || root.webkitRequestFullscreen || root.mozRequestFullScreen || root.msRequestFullscreen;
}
function exitFullScreenCall() {
  return document.exitFullscreen || document.webkitExitFullscreen || document.mozCancelFullScreen || document.msExitFullscreen;
}
function isFullScreen() {
  return document.fullscreenElement || document.webkitFullscreenElement || document.mozFullScreenElement || document.msFullscreenElement;
}
function toggleFullScreen() {
  document.body.style.opacity = 0.3;
  if (isFullScreen()) {
    document.getElementById('full-screen-toggle').classList.remove('on');
  } else {
    document.getElementById('full-screen-toggle').classList.add('on');
  }
  if (!isFullScreen()) {
    fullScreenCall().call(document.body);
  } else {
    exitFullScreenCall().call(document);
  }
}
function secondsToMinutes(seconds) {
  let wholeMinutes = Math.floor(seconds/60);
  let result = '';
  if (wholeMinutes) {
    let remainder = seconds - (wholeMinutes * 60);
    if (remainder < 10) {
      remainder = `0${remainder}`;
    }
    result = `${wholeMinutes}:${remainder}`;
  } else {
    if (seconds < 10) {
      result = `0:0${seconds}`
    } else {

      result = `0:${seconds}`
    }
  }
  return result;
}
function suffixedNumber(num) {
  let numString = num.toString();
  let lastDigit = numString[numString.length - 1];

  if (lastDigit === '1') {
    return (num === 11) ? num + 'TH' : num + 'ST';
  }
  if (lastDigit === '2') {
    return (num === 12) ? num + 'TH' : num + 'ND';
  }
  if (lastDigit === '3') {
    return  (num === 13) ? num + 'TH' : num + 'RD';
  }
  return num + 'TH';
}
function skipTextOrNextSlide() {
  if (document.getElementById('cinematic-caret').classList.contains('ready')) {
    skippingSlide = false;
    advanceSlide();
  } else {
    skippingSlide = true;
  }
}
function skipCinematic() {
  document.getElementById('cinematic').classList.add('hidden');
  if (landscape && gameOptions.showInstructions) {
    document.getElementById('controls-hint').classList.add('showing');
    gameOptions.showInstructions = false;
  } else {
    gameInitiated = true;
  }
  onStorySlide = 0;
}
function typeCaption(slideObj) {
  document.getElementById('cinematic-caret').classList.remove('ready');
  let textString = slideObj.caption;
  console.warn('TYPING CAPTION', textString);
  let maxCharsPerLine = 30;
  let promise = new Promise((resolve) => {
    let captionDiv = document.getElementById('cinematic-caption');
    let wordList = textString.split(' ');
    let charsOnLine = 0;
    let letterArray = [];
    wordList.map((word, i, arr) => {
      splitWord = word.split('');
      splitWord.map(letter => letterArray.push(letter));
      charsOnLine += splitWord.length + 1;
      if (wordList[i + 1]) {
        letterArray.push('&nbsp;');
        // line break if next word will go over maxCharsPerLine
        if (charsOnLine + wordList[i + 1].length >= maxCharsPerLine) {
          letterArray.push('<br />');
          charsOnLine = 0;
        }
      }
    });
    console.log(letterArray)
    let onLetter = 0;
    let actualTextSpeed = textSpeed;
    if (slideObj.additive) {
      captionDiv.innerHTML += '<br />';
    } else {
      captionDiv.innerHTML = '';
    }
    let typingInterval = setInterval(() => {
      if (onLetter < letterArray.length) {
        if (skippingSlide) {
          captionDiv.innerHTML = letterArray.join('');
          onLetter = letterArray.length;
        } else {
          if (letterArray[onLetter] === '<') {
            captionDiv.innerHTML += '<br />';
            onLetter += 7;
          } else {
            captionDiv.innerHTML += letterArray[onLetter];
            onLetter++;
          }
        }
      } else {        
        if (skippingSlide) {
          if (onStorySlide === 0) {
            document.querySelector('#cinematic > .caption').style.transitionDuration = '0ms';
            document.querySelector('#cinematic > .caption').style.transitionDelay = '0ms';
            document.querySelector('#cinematic > .caption').classList.add('moved-down');
            setTimeout(() => {
              document.querySelector('#cinematic > .caption').style.transition = '1500ms';
              document.querySelector('#cinematic > .caption').style.transitionDelay = '1000ms';
            }, 100);
          }          
        }
        if (onLetter >= letterArray.length) {
          clearInterval(typingInterval);
        }
        let actualSlideSpeed = 50;        
        setTimeout(() => {
          console.warn('skipping FALSE')
          skippingSlide = false;
          resolve();
        }, actualSlideSpeed);
      }
    }, actualTextSpeed);
  })
  return promise;
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



function toggleNameEntry(rankAchieved) {
  if (document.getElementById('name-entry-screen').classList.contains('hidden')) {
    document.body.classList.add('scored');
    let displayScore = player.score;
    if (gameMode === 'horde') {
      displayScore = secondsToMinutes(player.score);
    }
    document.getElementById('player-high-score').innerText = displayScore;
    document.getElementById('player-rank').innerText = `${suffixedNumber(rankAchieved)} PLACE`;
  } else {
    document.body.classList.remove('scored');
  }
  document.getElementById('name-entry-screen').classList.toggle('hidden'); 
}
function toggleHighScores() {
  if (document.getElementById('top-fighters-screen').classList.contains('hidden')) {
    getScoresFromDatabase('story', true);
    getScoresFromDatabase('horde', true);
  }
  document.getElementById('top-fighters-screen').classList.toggle('hidden');
}
function toggleControlScreen() {
  controlScreenOn = !controlScreenOn;
  document.getElementById('controls-screen').classList.toggle('showing');  
}
function applyUserOptions(options) {
  console.log('applying options', options)
  for (let option in defaultOptions) {
    console.warn('doing option', option)
    if (options[option] !== defaultOptions[option]) {
      if (option === 'bloodOn') {
        toggleBlood();
      }
      if (option === 'scanLines') {
        toggleScanLines();
      }
    }
  }
  gameOptions.actionKeys = {...options.actionKeys};
  gameOptions.buttonMappings = {...options.buttonMappings};
  refreshAllKeyDisplay(gameOptions.actionKeys);
}
function nonDefaultOptions() {
  for (let option in defaultOptions) {
    if (gameOptions[option] !== defaultOptions[option]) {
      return true;
    }
  }
  return false;
}
function toggleOptionsScreen(noCookie) {
  optionsScreenOn = !optionsScreenOn;  
  let cookieExists = getCookie('brutalkungfu') !== undefined;
  if (!optionsScreenOn) {
    useCookie = document.getElementById('cookie-checkbox').checked;
    if (useCookie) {
      setCookie(JSON.stringify(gameOptions));
    } else {
      if (cookieExists) {
        destroyCookie();
      }
    }
  } else {
    if (cookieExists) {
      document.getElementById('cookie-checkbox').checked = true;
    }
    useCookie = cookieExists;
  }
  document.getElementById('options-screen').classList.toggle('hidden');
  document.getElementById('title-screen').classList.toggle('hidden');
}
function callKeyEditModal(action) {
  document.getElementById('turn-phone-shade').style.display = 'flex';
  document.getElementById('modal-action-display').innerText = action;
  document.getElementById('key-edit-modal').classList.add('showing');
  editingKeyForAction = action;
}
function dismissKeyEditModal() {
  document.getElementById('turn-phone-shade').style.display = 'none';
  document.getElementById('key-edit-modal').classList.remove('showing');
  editingKeyForAction = undefined;
  if (useCookie) {
    setCookie(JSON.stringify(gameOptions));
  }
}

function refreshAllKeyDisplay(newKeys) {
  if ({...newKeys} === {...defaultOptions.actionKeys}) {

  } else {
      Array.from(document.querySelectorAll('.key-row')).map((row, i) => {
        let action = row.children[0].innerHTML;
        let key = row.children[1].innerHTML;
        let newlyAssignedKey = newKeys[action];
        if (newlyAssignedKey === ' ') {
          newlyAssignedKey = 'SPACE';
        }
        if (newlyAssignedKey.length > 1) {
          row.classList.add('long-name');
        } else {
          row.classList.remove('long-name');
          newlyAssignedKey = newlyAssignedKey.toUpperCase();
        }
        row.children[1].innerHTML = newlyAssignedKey;
      });
  }
}
function refreshKeyDisplay() {
  let newlyAssignedKey = gameOptions.actionKeys[editingKeyForAction];
  Array.from(document.querySelectorAll('.key-row')).map((row, i) => {
    let action = row.children[0].innerHTML;
    let key = row.children[1].innerHTML;
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
      row.children[1].innerHTML = newlyAssignedKey;
    }
  });

}
function ScoreDisplay() {
  this.lineHeight = tileSize / 2.5;
  this.xPadding = tileSize / 1.5;
  this.floorKnobs = [];
  this.container = new PIXI.Container();
  this.bg = new PIXI.Sprite(PIXI.utils.TextureCache['pixel']);
  this.bg.width = gameWidth;
  this.bg.height = level1.topEdge;
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
    if (gameMode === 'horde') {
      scoreString = secondsToMinutes(newScore)
    }
    this.scoreText.text = 'SCORE-' + scoreString;
    if (topScores.story < player.score) {
      this.topText.text = 'TOP-' + scoreString;
      topScores.story = player.score;
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
  this.topText.text = 'TOP-' + ('0'.repeat(6 - topScores.story.toString().length) + topScores.story);
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
  // nesContainer.addChild(this.container);
  UIContainer.addChild(this.container);
}
const nesGreen = 0x788368;
function NESPanel() {
  this.container = new PIXI.Container();
  this.controls = new PIXI.Container();
  this.bg = new PIXI.Sprite(PIXI.utils.TextureCache['pixel']);
  this.backing = new PIXI.Sprite(PIXI.utils.TextureCache['pixel']);
  this.bg.width = gameWidth;
  this.bg.height = window.innerHeight - gameHeight;
  this.bg.tint = 0x111111;
  // this.bg.y = gameHeight;
  // this.container.addChild(this.bg)
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

  this.punchBg = new PIXI.Sprite(PIXI.utils.TextureCache['buttonback']);
  this.kickBg = new PIXI.Sprite(PIXI.utils.TextureCache['buttonback']);

  this.punchBg.anchor.set(0.5);
  this.kickBg.anchor.set(0.5);

  this.bottomSpace = viewHeight - gameHeight;
  if (!landscape) {
    this.controls.y = gameHeight + this.bottomSpace - pieceSize * 3 - pieceSize / 2;
    this.controls.y = gameHeight + pieceSize / 2;
  } else {
    // this.controls.x = 0;
    this.controls.y = viewHeight / 2;
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
  if (landscape) {
    this.backing.x = viewWidth - this.backing.width;
  }
  this.backing.y = this.dPad.y;
  this.backing.tint = 0x999999;
  this.kickButton.x = this.backing.x + newPixelSize * 2;
  this.punchButton.x = this.kickButton.x + this.kickButton.width;
  this.punchButton.y = this.kickButton.y = this.backing.height - this.kickButton.height - newPixelSize;
  
  this.punchBg.width = this.kickBg.width = this.punchBg.height = this.kickBg.height = (pieceSize * 1.75) - (newPixelSize * 6);
  this.punchBg.x = this.punchButton.x + (this.punchButton.width/2);
  this.kickBg.x = this.kickButton.x + (this.kickButton.width/2);
  this.punchBg.y = this.kickBg.y = this.punchButton.y + (this.punchButton.height/2);
  
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
  this.controls.addChild(this.punchBg);
  this.controls.addChild(this.kickBg);
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
    // UIContainer.addChildAt(this.bg, 0);
    console.warn('add nes cont')
    nesContainer.addChild(this.container);
  } else {
    nesContainer.addChild(this.container);
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
  if (landscape) {
    this.dPad.x = newPixelSize * 8;
    // this.dPad.y = (window.innerHeight/4);
  }
  let character = 'thomas';
  this.punchLabel = new PIXI.Sprite(PIXI.utils.TextureCache[character + 'punch']);
  this.kickLabel = new PIXI.Sprite(PIXI.utils.TextureCache[character + 'kick1']);
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

  this.panelBg = new PIXI.Sprite(PIXI.utils.TextureCache['pixel']);
  this.darkPanelBg = new PIXI.Sprite(PIXI.utils.TextureCache['pixel']);
  this.darkPanelBg.width = (gameWidth)
  this.panelBg.width = (gameWidth-(newPixelSize*8))
  this.panelBg.height = this.dPadBg.height + newPixelSize * 16;
  this.darkPanelBg.height = this.panelBg.height + (newPixelSize * 8);
  this.panelBg.x = (newPixelSize*4)
  this.panelBg.y = gameHeight + newPixelSize * 4;
  this.darkPanelBg.x = 0;
  this.darkPanelBg.y = gameHeight;
  this.darkPanelBg.tint = 0xaaaaaa;
  this.panelBg.tint = 0x151515;
  this.backing.alpha = 0;
  this.dPadBg.tint = 0xaaaaaa;
  this.dPad.addChildAt(this.dPadBg, 0);

  this.dPad.scale.x *= 0.95;
  this.dPad.scale.y *= 0.95;
  if (!landscape) {
    this.container.addChildAt(this.darkPanelBg,0);
    this.container.addChildAt(this.panelBg,1);
  }

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
    nesPanel.blockKnob.tint = 0x009900;
  });
  this.blockButton.on('pointerup', function() {
    if (counter > 0) {
      releaseUp();
    }
    nesPanel.blockKnob.tint = 0xaaffaa;
  });
  this.blockButton.on('pointerupoutside', function() {
    releaseUp();
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

  this.hideDecor = function() {
    this.panelBg.visible = this.darkPanelBg.visible = false;
  };
  this.moveToYPosition = function(newPosition) {
    if (newPosition === 'HIGH') {
      nesContainer.y = 0;
    }
    if (newPosition === 'MID') {
      nesContainer.y = (bottomSpace / 2) - (nesContainer.height/2);
    }
    if (newPosition === 'LOW') {
      nesContainer.y = (bottomSpace) - (nesContainer.height);
    }
    document.getElementById(`gamepad-${newPosition.toLowerCase()}-button`).classList.add('on');
    document.getElementById(`d-pad-touch-area`).className = newPosition.toLowerCase();
  }

  document.documentElement.style.setProperty('--gamepad-height', (pieceSize * 4) - (newPixelSize * 3) + 'px');

  this.container.x = 0;
  this.moveToYPosition(gameOptions.gamepadPosition);
}
function FloorDisplay() {
  this.container = new PIXI.Container();
  this.bg = new PIXI.Sprite(PIXI.utils.TextureCache['pixel']);
  this.bg.width = tileSize * 3.5;
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
  this.readyBg.width = tileSize * 2.8;
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
  UIContainer.addChild(this.container);
}
function Arrow() {
  this.sprite = new PIXI.Sprite(PIXI.utils.TextureCache['arrow']);
  this.sprite.height = this.sprite.width = tileSize * 2;
  this.sprite.anchor.set = 0.5;
  this.sprite.x = this.sprite.width / 2;
  this.sprite.y = gameHeight / 2;
  this.bornAt = -99;
  UIContainer.addChild(this.sprite);
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
  // this.legend.scale.x *= 0.9;
  // this.legend.width *= fighterScale;
  // this.legend.height *= fighterScale;
  this.legend.y = victim.sprite.y - victim.headHeight;
  this.bornAt = counter;
  if (amount) {
    gameContainer.addChild(this.legend);
  }
  scoreBlips.push(this);

  this.fade = function() {
    let sinceBorn = counter - this.bornAt;
    if (sinceBorn > 5) {
      this.legend.y -= newPixelSize;
      this.legend.alpha -= 0.075;
    }
    if (this.legend.alpha <= 0.5) {
      gameContainer.removeChild(this.legend);
    }
  };
}
function callModeSelectScreen() {
  document.getElementById('mode-select-screen').classList.remove('hidden');
}
