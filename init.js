let viewWidth = window.screen.width;
let viewHeight = window.innerHeight;
const isTouchDevice = 'ontouchstart' in document.documentElement;
const isWebApp = (window.navigator.standalone === true) || (window.matchMedia('(display-mode: standalone)').matches);
let landscape = viewWidth > viewHeight;
const gameName = 'kungfu';
let kungFuSounds;
window.addEventListener('load', function () {
  document.documentElement.style.setProperty('--screen-height', window.innerHeight + 'px');
  PIXI.loader
  .add('assets/nessprites.json')
  .add('assets/kfsprites.json')
  .load(function() {
    init();
    document.body.className = 'loaded';
    document.getElementById('credit').style.opacity = 0.4;
  });  
  soundsLoaded = 0;
  document.getElementById('name-entry').onkeyup = function() {
    if (this.value !== '' && this.value.trim().length) {
      document.getElementById('name-submit').disabled = false;
    } else {
      document.getElementById('name-submit').disabled = true;
    }
  }
  // setTimeout(() => {
  //   toggleNameEntry();
  // }, 1000);

  // document.getElementById('kung-fu-logo').classList.add('landed');
    
  
  document.getElementById('options-screen').classList.add('hidden');
  document.getElementById('top-fighters-screen').classList.add('hidden');
  
  
  let userCookie = getCookie('brutalkungfu');
  if (userCookie) {
    console.warn('gameOpt now', gameOptions);
    applyUserOptions(userCookie);
    gameOptions = {...userCookie};
    console.warn('options set to user')
  } else {    
    console.warn('options left at default')
  }

});
// document.body.onload = () => {
//   document.getElementById('kung-fu-logo').classList.add('landed');
//   document.getElementById('brutal-logo').classList.add('landed');
//   let userCookie = getCookie('brutalkungfu');
//   if (userCookie) {
//     console.warn('gameOpt now', gameOptions);
//     applyUserOptions(userCookie);
//     gameOptions = {...userCookie};
//     console.warn('options set to user')
//   } else {    
//     console.warn('options left at default')
//   }
// }

function findRank(score) {
  score = parseInt(score);
  let rank;
  let properArray = scoreArray.filter(entry => entry.gameMode === gameMode)
  properArray.map((entry, i) => {
    let entryName  = entry.name;
    let entryScore = parseInt(entry.score);
    console.log('comparing', score, 'to', entryScore);

    let scoreMatches = score === entryScore;
    let scoreBeats = score > entryScore;
    if (!rank && (scoreMatches || scoreBeats)) {
      console.log(score, 'matched or beat', entryScore);
      rank = i + 1;
    } else {
      console.log(score, 'did not match or beat', entryScore);
    }
  });
  if (!rank && properArray.length < scoresToDisplay) {
    rank = properArray.length;
  }
  console.error(score, 'is rank', rank)
  return rank;
}

let gameMode = 'story';

const defaultOptions = {
  soundOn: false,
  musicOn: false,
  bloodOn: true,
  scanLines: false,
  actionKeys: {
    'WALK LEFT': 'a',
    'WALK RIGHT': 'd',
    'JUMP': 'w',
    'CROUCH': 's',
    'PUNCH/WEAPON': 'j',
    'KICK': 'k',
    'THROW WEAPON': 'l'
  },
  showInstructions: landscape,
  addedToHomeScreen: isWebApp,
  playerName: ''
}
let gameOptions = {...defaultOptions};

let assigningAction = undefined;
let lastEnteredName = '';

let gripperLimit = 3;
let tomtomLimit = 0;

let selectedStage = 1;

let gameStartMusic = undefined;
let bgMusic = undefined;
let stepSound = undefined;
let punchSound = 'thomaspunch';
let kickSound = 'thomaskick';
let jumpkickSound = 'thomasjumpkick';
let knifeSound = undefined;
let shortHitSound = undefined;
let longHitSound = undefined;
let highLaugh = undefined;
let midLaugh = undefined;
let lowLaugh = undefined;
let deathSound = undefined;
let gameStart = undefined;
let loadSounds = function() {
  Howler.autoSuspend = true;
  // gameOverMusic = new Howl({
  //     src: ['assets/sounds/gameover.mp3'],
  //     volume:1,
  //     playing: false,
  //     preload:true,
  // });
  // completeFloorMusic = new Howl({
  //     src: ['assets/sounds/completefloor.mp3'],
  //     volume:1,
  //     playing: false,
  //     preload:true,
  // });
  // winGameMusic = new Howl({
  //     src: ['assets/sounds/wingame.mp3'],
  //     volume:1,
  //     playing: false,
  //     preload:true,
  // });
  stepSound = new Howl({
    src: ['assets/sounds/step.mp3', 'assets/sounds/step.ogg'],
    html: true,
    onload: function() {
      soundsLoaded++;
      // loadMessage.text = 'SOUNDS LOADED: ' + soundsLoaded + '/13';
    }
  });

  punchSound = new Howl({
    src: ['assets/sounds/thomaspunch.mp3'],
    html: true,
    onload: function() {
      soundsLoaded++;
    }
  });
  kickSound = new Howl({
    src: ['assets/sounds/thomaskick.mp3', 'assets/sounds/thomaskick.ogg'],
    html: true,
    onload: function() {
      soundsLoaded++;
    }
  });
  jumpkickSound = new Howl({
    src: ['assets/sounds/thomasjumpkick.mp3', 'assets/sounds/thomasjumpkick.ogg'],
    html: true,
    onload: function() {
      soundsLoaded++;
    }
  });
  knifeSound = new Howl({
    src: ['assets/sounds/thomasknife.mp3', 'assets/sounds/thomasknife.ogg'],
    html: true,
    onload: function() {
      soundsLoaded++;
    }
  });
  shortHitSound = new Howl({
    src: ['assets/sounds/shorthit.mp3', 'assets/sounds/shorthit.ogg'],
    html: true,
    onload: function() {
      soundsLoaded++;
    }
  });
  longHitSound = new Howl({
    src: ['assets/sounds/longhit.mp3', 'assets/sounds/longhit.ogg'],
    volume: 0.8,
    html: true,
    onload: function() {
      soundsLoaded++;
    }
  });
  highLaugh = new Howl({
    src: ['assets/sounds/highlaugh.mp3', 'assets/sounds/highlaugh.ogg'],
    volume: 1,
    html: true,
    onload: function() {
      soundsLoaded++;
    }
  });
  midLaugh = new Howl({
    src: ['assets/sounds/midlaugh.mp3', 'assets/sounds/midlaugh.ogg'],
    html: true,
    onload: function() {
      soundsLoaded++;
    }
  });
  lowLaugh = new Howl({
    src: ['assets/sounds/lowlaugh.mp3', 'assets/sounds/lowlaugh.ogg'],
    html: true,
    onload: function() {
      soundsLoaded++;
    }
  });
  deathSound = new Howl({
    src: ['assets/sounds/thomasdeath.mp3', 'assets/sounds/thomasdeath.ogg'],
    html: true,
    onload: function() {
      soundsLoaded++;
    }
  });
  gameStartMusic = new Howl({
    src: ['assets/sounds/gamestart.mp3', 'assets/sounds/gamestart.ogg'],
    volume: 0.5,
    html: true,
    onload: function() {
      soundsLoaded++;
    }
  });
  bgMusic = new Howl({
    src: ['assets/sounds/bgmusiclow.mp3', 'assets/sounds/bgmusiclow.ogg'],
    volume: 0.6,
    html: true,
    loop: true,
    onload: function() {
      soundsLoaded++;
    }
  });
};
function playSound(sound) {
  if (sound === gameStartMusic || sound === bgMusic) {
    if (gameOptions.musicOn) {
      sound.play();
    }
  } else {
    if (gameOptions.soundOn) {
      sound.play();
    }
  }
}
PIXI.settings.SCALE_MODE = PIXI.SCALE_MODES.NEAREST;
PIXI.settings.RESOLUTION = window.devicePixelRatio;
const renderer = PIXI.autoDetectRenderer({
  // width: viewWidth,
  width: viewHeight / (15 / 16),
  height: viewHeight,
  autoResize: true,
  powerPreference: 'high-performance',
  // roundPixels: true,
  // backgroundColor:bgColor,
  transparent: true
});
if (!isTouchDevice && landscape) {
  renderer.roundPixels = true;
}

renderer.plugins.interaction.interactionFrequency = 1;
// renderer.x = 0
const stage = new PIXI.Container();
const gameContainer = new PIXI.Container();
const nesContainer = new PIXI.Container();
stage.addChild(gameContainer);
stage.addChild(nesContainer);

document.getElementById('game-canvas').appendChild(renderer.view);

// let gameWidth = document.getElementById("game-canvas").offsetWidth
let gameWidth = document.getElementById('game-canvas').offsetWidth;
let gameHeight = document.getElementById('game-canvas').offsetHeight;
document.documentElement.style.setProperty('--game-x', document.getElementById('game-canvas').offsetLeft + 'px')
document.documentElement.style.setProperty('--game-width', gameWidth + 'px')
document.documentElement.style.setProperty('--game-height', gameHeight + 'px')
actualHeight = parseInt(gameHeight);
let tilesPerHeight = 15;
let tilesPerWidth = 16;
let currentLevel = undefined;
let currentScore = 0;
lastEggX = undefined;

// if (!landscape) {
tileSize = Math.round(gameWidth / tilesPerWidth);
document.documentElement.style.setProperty('--tile-size', tileSize + 'px')
// } else {
//     tileSize = Math.round(gameHeight/tilesPerHeight)
// }
let newPixelSize = tileSize / tilesPerWidth;
document.documentElement.style.setProperty('--pixel-size', newPixelSize + 'px');

let introTime = 30;
let walkupTime = 120;
let topScores = {
  story: 0,
  horde: 0
};
let lowScore = 0;
let currentRecord = { player: undefined, score: undefined };
let scoreArray = [];
let fighterScale = 1;
let levelReached = 1;
let dragonLevel = 0;
let livesAwarded = 0;
let newLifeScore = 50000;

let gameInitiated = false; 

function setVariables() {
  gameInitiated = false; 
  counter = 0;
  precounter = 0;
  grippers = [];
  tomtoms = [];
  knifethrowers = [];
  knives = [];
  boomerangs = [];
  fireballs = [];
  smokePillars = [];
  powerups = [];
  squibs = [];
  scoreBlips = [];
  eggs = [];
  snakes = [];
  dragons = [];
  confettiBalls = [];
  levelTime = 2000;
  enemiesSpawned = 0;
  wonRound = false;
  endSequenceStarted = false;
  scoreSequenceStarted = false;
  wonAt = -99;
  lastKT = lastKnife = -99;
  // knifeFrequency = 60;
  knifeFrequency = 30;
  startDisabled = false;
  lastGripper = -99;
  lastGripperX = 0;
  playerSpeed = newPixelSize * 1.25;
}
let eggTypes = ['snake', 'dragon', 'confetti'];

function randomInt(min, max) {
  return Math.floor(Math.random() * (max - min + 1) + min);
}

let titleStyle = {
  fontFamily: 'Press Start 2P',
  fontSize: tileSize * 0.7 + 'px',
  fill: '#ddd',
};
let titleStyle2 = {
  fontFamily: 'Press Start 2P',
  fontSize: tileSize * 0.5 + 'px',
  fill: '#ddd',
};
let highScoreStyle = {
  fontFamily: 'Press Start 2P',
  fontSize: tileSize / 1.75 + 'px',
  fill: '#ddd'
};
if (landscape) {
  highScoreStyle.fontSize = Math.round(tileSize / 2.85) + 'px';
}
let scoreStyle = {
  fontFamily: 'Press Start 2P',
  fontSize: tileSize / 2.25 + 'px',
  fill: '#ddd'
};
let blockFontSize = viewHeight / 40;
if (blockFontSize > (viewWidth / 24)) {
  blockFontSize = viewWidth / 24;
}
let blockStyle = {
  fontFamily: 'Press Start 2P',
  fontSize: Math.round(blockFontSize) + 'px',
  fill: '#ddd',
  wordWrap: true,
  wordWrapWidth: gameWidth - tileSize * 5,
  align: 'center',
  lineHeight: blockFontSize * 2
};
if (landscape) {
  blockStyle.wordWrapWidth = gameWidth - tileSize * 6;
}
let buttonStyle = {
  fontFamily: 'Press Start 2P',
  fontSize: tileSize / 2.5 + 'px',
  fill: '#ddd'
};
let blipStyle = {
  fontFamily: 'Press Start 2P',
  fontSize: tileSize / 3 + 'px',
  fill: '#ddd'
};
let created = false;
function clearTitle() {
  if (!startDisabled) {
    titleScreen.container.visible = false;
    if (!floorDisplay.container.visible) {
      floorDisplay.container.visible = true;
    }
    console.warn('clearTitle hiding logos');
    document.getElementById('title-items').classList.add('hidden');
    document.getElementById('hard-reload').classList.add('hidden');
    playSound(gameStartMusic);
  }
}

function toggleSound() {
  !soundsLoaded ? loadSounds() : null;
  document.getElementById('sound-toggle').classList.toggle('on'); 
  gameOptions.soundOn = !gameOptions.soundOn;
}
function toggleMusic() {
  !soundsLoaded ? loadSounds() : null;
  introTime = gameOptions.musicOn ? 300 : 30;
  document.getElementById('music-toggle').classList.toggle('on');
  gameOptions.musicOn = !gameOptions.musicOn;
}
function toggleBlood() {
  
  document.getElementById('blood-toggle').classList.toggle('on');
  gameOptions.bloodOn = !gameOptions.bloodOn;
}
function toggleScanLines() {
  console.log('gameopt.scanLines', gameOptions.scanLines)
  document.getElementById('scan-lines-toggle').classList.toggle('on');
  document.getElementById('scan-lines').classList.toggle('showing');
  gameOptions.scanLines = !gameOptions.scanLines;
}

const startingLives = 0;
let lives = startingLives;
let bottomSpace = viewHeight - gameHeight;
let topEdge = gameHeight - tileSize * (tilesPerHeight - 3.5);
let groundY = gameHeight - newPixelSize * 20 - tileSize * 2;

let level1, level2, level3, level4, level5, level6;
let arrow, stickMan, boomerangMan, giant, blackMagician, misterX;

let bosses = [];

levelData = [
  {
    direction: 'left',
    enemyFrequency: 50,
    eggFrequency: 0,
    limits: {
      grippers: 4,
      tomtoms: 0,
      knifethrowers: 2
    },
    boss: stickMan,
    water: 'waterbg'
  },
  {
    direction: 'right',
    enemyFrequency: 40,
    eggFrequency: 60,
    limits: {
      grippers: 5,
      tomtoms: 2,
      knifethrowers: 2
    },
    boss: boomerangMan,
    water: 'spinebg'
  },
  {
    direction: 'left',
    enemyFrequency: 30,
    eggFrequency: 300,
    limits: {
      grippers: 6,
      tomtoms: 4,
      knifethrowers: 2
    },
    boss: giant,
    water: 'spinebg'
  },
  {
    direction: 'right',
    enemyFrequency: 15,
    eggFrequency: 10,
    limits: {
      grippers: 8,
      tomtoms: 1,
      knifethrowers: 2
    },
    boss: blackMagician,
    water: 'spinebg'
  },
  {
    direction: 'left',
    enemyFrequency: 10,
    eggFrequency: 0,
    limits: {
      grippers: 12,
      tomtoms: 8,
      knifethrowers: 2
    },
    boss: misterX,
    water: 'spinebg'
  },
  {
    direction: 'left',
    enemyFrequency: 10,
    eggFrequency: 0,
    limits: {
      grippers: 15,
      tomtoms: 15,
      knifeTtrowers: 2
    },
    boss: stickMan,
    water: 'waterbg'
  },
];

// let enemyFrequency, eggFrequency;

function createGame() {
  created = true;
  console.log(levelData)
  // level1 = new Level(1, 'left', gameHeight, 'waterbg', topEdge, groundY);
  let firstLevel = levelData[0];
  level1 = new Level(1, firstLevel.direction, gameHeight, firstLevel.water, topEdge, groundY);
  gameContainer.setChildIndex(player.sprite, gameContainer.children.length - 1);

  player.level = level1;
  player.levelData = firstLevel;

  enemyFrequency = player.levelData.enemyFrequency;
  eggFrequency = player.levelData.eggFrequency;
  gripperLimit = player.levelData.limits.grippers;
  tomtomLimit = player.levelData.limits.tomtoms;
  
  player.sprite.x = player.level.playerStartX;
  lastEggX = player.level.playerStartX;
  player.sprite.y = player.level.groundY;

  arrow = new Arrow();
  stickMan = new StickMan();
  boomerangMan = new BoomerangMan();
  giant = new Giant();
  blackMagician = new BlackMagician();
  misterX = new StickMan(1.5, 5);
  misterX.sprite.tint = 0x000000;
  misterX.hp = 200;
  misterX.worth = 10000;
  bosses = [stickMan, boomerangMan, giant, blackMagician, misterX];
  levelData.map((level, i) => {
    level.boss = bosses[i]
  });
  let lvlData = levelData[levelReached - 1];
  player.level.boss = lvlData.boss;
  player.level.boss.level = player.level;
  player.level.boss.sprite.x = player.level.boss.homeX = player.level.bossSpotX;
  player.level.boss.sprite.y = player.level.groundY;
  if (player.level.direction === 'left') {
    player.sprite.scale.x *= -1;
  } else {
    player.level.boss.sprite.scale.x *= -1;
  }

  enemyFrequency = lvlData.enemyFrequency;
  eggFrequency = lvlData.eggFrequency;

  floorDisplay = new FloorDisplay();
  scoreDisplay = new ScoreDisplay();

  if (!isTouchDevice) {
    nesPanel.container.visible = false;
  } else if (!landscape) {
    let bottomSpace = viewHeight - gameHeight;
    let nesPanelHeight = document.getElementById('nes-panel-bg').offsetHeight;
    if (bottomSpace < nesPanel.controls.height) {
      nesPanel.controls.height = bottomSpace - newPixelSize * 6;
      nesPanel.hideDecor();
      nesPanel.controls.y = gameHeight + newPixelSize * 6;
    } else if (bottomSpace < nesPanelHeight + newPixelSize * 4) {
      nesPanel.controls.y = gameHeight + newPixelSize * 6;
      nesPanel.hideDecor();
    } else {
    }
  }
  if (!landscape) {
    gameContainer.mask = new PIXI.Sprite(PIXI.utils.TextureCache['pixel']);
    gameContainer.mask.width = gameWidth;
    gameContainer.mask.height = gameHeight;
    gameContainer.mask.x = 0;
    gameContainer.mask.y = 0;
    stage.addChild(gameContainer.mask);
  }
}
document.getElementById('controls-button').onclick = () => {
  // toggleControlScreen();
  document.getElementById('controls-hint').classList.add('showing');
}
if (landscape && !isTouchDevice) {
  
  // document.getElementById('close-controls-button').onclick = () => {
  //   toggleControlScreen();
  // }
//   document.getElementById('keyboard-controls-tab').onclick = function() {
//     controlTabSelected = 'keyboard';
//     this.classList.add('selected');
//     document.getElementById('gamepad-controls-tab').classList.remove('selected');
//     document.getElementById('gamepad-controls-grid').classList.add('hidden');
//     document.getElementById('keyboard-controls-grid').classList.remove('hidden');
//   }
//   document.getElementById('gamepad-controls-tab').onclick = function() {
//     controlTabSelected = 'gamepad';
//     this.classList.add('selected');
//     document.getElementById('keyboard-controls-tab').classList.remove('selected');
//     document.getElementById('keyboard-controls-grid').classList.add('hidden');
//     document.getElementById('gamepad-controls-grid').classList.remove('hidden');
//   }
}
[...document.querySelectorAll('.key-row')].map((but, i) => {
  but.onpointerdown = function(e) {
    let action = Object.keys(gameOptions.actionKeys)[i];
    this.classList.add('depressed');
    callKeyEditModal(action);
  }
});
document.getElementById('sound-toggle').onpointerdown = () => {
  toggleSound();
};
document.getElementById('music-toggle').onpointerdown = () => {
  toggleMusic();
};
document.getElementById('blood-toggle').onpointerdown = () => {    
  console.log('clicked while gameOptions.bloodOn', gameOptions.bloodOn)
  toggleBlood();
  console.log('after toggleScanLines gameOptions.bloodOn is', gameOptions.bloodOn)
};
document.getElementById('scan-lines-toggle').onpointerdown = () => {
  console.log('clicked while gameOptions.scanLines', gameOptions.scanLines)
  toggleScanLines();
  console.log('after toggleScanLines gameOptions.scanLines is', gameOptions.scanLines)
};
document.getElementById('full-screen-toggle').onclick = () => {
  if (isFullScreen()) {
    document.getElementById('full-screen-toggle').classList.remove('on');
  } else {
    document.getElementById('full-screen-toggle').classList.add('on');
  }
  toggleFullScreen();
};
// document.getElementById('gamepad-high-button').onclick = function() {
//   if (!this.classList.contains('on')) {
//     this.classList.add('on')
//   }
//   document.documentElement.style.setProperty('--gamepad-y', actualHeight + 'px');
//   document.getElementById('gamepad-mid-button').classList.remove('on');
//   document.getElementById('gamepad-low-button').classList.remove('on');
// }
// document.getElementById('gamepad-mid-button').onclick = function() {
//   if (!this.classList.contains('on')) {
//     this.classList.add('on')
//   }
//   document.getElementById('gamepad-low-button').classList.remove('on');
//   document.getElementById('gamepad-high-button').classList.remove('on');
//   document.documentElement.style.setProperty('--gamepad-y', (actualHeight + ((window.innerHeight - actualHeight) / 2)) + 'px');
//   nesPanel.controls.y = (actualHeight + ((window.innerHeight - actualHeight) / 2));
//   nesPanel.panelBg.y = (actualHeight + ((window.innerHeight - actualHeight) / 2));
// }
// document.getElementById('gamepad-low-button').onclick = function() {
//   if (!this.classList.contains('on')) {
//     this.classList.add('on')
//   }
//   document.getElementById('gamepad-mid-button').classList.remove('on');
//   document.getElementById('gamepad-high-button').classList.remove('on');
//   document.documentElement.style.setProperty('--gamepad-y', (window.innerHeight - (window.innerHeight - actualHeight)) + 'px');
//   nesPanel.bg.y = (window.innerHeight - (window.innerHeight - actualHeight));
// }
document.getElementById('close-options-button').onclick = function() {
  toggleOptionsScreen();
}
document.getElementById('close-high-scores-button').onclick = function() {
  toggleHighScores();
}
document.getElementById('story-mode-panel').onclick = function() {
  this.classList.add('selected');
  document.getElementById('horde-mode-panel').classList.remove('selected');
  // document.getElementById('stage-select-mode-panel').classList.remove('selected');
  // document.getElementById('stage-select-mode-panel').classList.remove('expanded');
  document.getElementById('game-canvas').style.backgroundColor = 'var(--original-bg-color)';
  document.getElementById('story-mode-panel').classList.remove('truncated');
  document.getElementById('horde-mode-panel').classList.remove('truncated');
  gameMode = 'story';
  
}
document.getElementById('horde-mode-panel').onclick = function() {
  this.classList.add('selected');
  document.getElementById('story-mode-panel').classList.remove('selected');
  // document.getElementById('stage-select-mode-panel').classList.remove('selected');
  // document.getElementById('stage-select-mode-panel').classList.remove('expanded');
  document.getElementById('game-canvas').style.backgroundColor = 'var(--horde-bg-color)';
  document.getElementById('story-mode-panel').classList.remove('truncated');
  document.getElementById('horde-mode-panel').classList.remove('truncated');
  gameMode = 'horde';  
}
// document.getElementById('stage-select-mode-panel').onclick = function() {
//   this.classList.add('selected');
//   this.classList.add('expanded');
//   document.getElementById('story-mode-panel').classList.remove('selected');
//   document.getElementById('horde-mode-panel').classList.remove('selected');
//   document.getElementById('story-mode-panel').classList.add('truncated');
//   document.getElementById('horde-mode-panel').classList.add('truncated');
//   gameMode = 'story';
// }
document.getElementById('hint-close-button').onclick = function() {
  this.parentElement.parentElement.classList.remove('showing');
  if (document.getElementById('options-screen').classList.contains('hidden')) {
    gameInitiated = true;
  }
}
document.getElementById('cinematic').onclick = function() {
  this.classList.add('hidden');
  if (landscape && gameOptions.showInstructions) {
    document.getElementById('controls-hint').classList.add('showing');
    gameOptions.showInstructions = false;
  } else {
    gameInitiated = true;
  }
}
Array.from(document.querySelectorAll('#top-fighters-screen .tab-area > .tab')).map((tab, i, arr) => {
  tab.onpointerdown = function() {
  let selectingTab = this.innerText.split(' ')[0];
  document.getElementById('top-fighters-screen').classList.remove(highScoreTabSelected.toLowerCase() + '-mode');
  document.getElementById('top-fighters-screen').classList.add(selectingTab.toLowerCase() + '-mode');
  highScoreTabSelected = selectingTab.toLowerCase();
  console.log(highScoreTabSelected);
  };
});
document.getElementById('confirm-mode-button').onclick = function() {
  if (gameMode === 'horde') {
    floorDisplay.legend.text = 'HORDE MODE';
    floorDisplay.bg.width = tileSize * 5;
    lives = 0;
    scoreDisplay.updateLives(0);
    gameContainer.x += level1.levelWidth / 2;
    floorDisplay.container.x -= level1.levelWidth / 2;
    player.sprite.x = (gameWidth / 2) - (level1.levelWidth / 2);
    tomtomLimit = 2;
    level1.boss.sprite.alpha = 0;
    level1.container.alpha = 0;
    gameInitiated = true;
    gameContainer.removeChild(player.container);
    fighterScale = 1.5;
    player.setAttributesToScale(fighterScale);
  } else if (gameMode === 'story') {
    floorDisplay.legend.text = 'LEVEL 1';
    floorDisplay.bg.width = tileSize * 3.5;
    level1.boss.sprite.alpha = 1;
    level1.container.alpha = 1;
    if (selectedStage) {
      levelUp(selectedStage - 1);
      selectedStage = 0;
    }
    document.getElementById('cinematic').classList.remove('hidden');
    setTimeout(() => {
      document.getElementById('cinema-scene').classList.add('full-opacity');
      document.getElementById('cinema-cover').classList.add('full-opacity');
    });
    setTimeout(() => {
      playStory();
    }, 1000);

  }
  document.getElementById('mode-select-screen').classList.remove('showing');
}
async function playStory() {
  await typeCaption(storySlides[0].caption);
  document.getElementById('cinema-scene').src = storySlides[1].imagePath;
  await typeCaption(storySlides[1].caption);
  document.getElementById('cinema-scene').src = storySlides[2].imagePath;
  await typeCaption(storySlides[2].caption);
  document.getElementById('cinema-scene').src = storySlides[3].imagePath;
  await typeCaption(storySlides[3].caption);
  document.getElementById('cinema-scene').src = storySlides[4].imagePath;
  await typeCaption(storySlides[4].caption);
  document.getElementById('cinema-scene').src = storySlides[5].imagePath;
  await typeCaption(storySlides[5].caption);
}
document.getElementById('skip-name-entry-button').onclick = function() {
  toggleNameEntry();
  startDisabled = true;
  setTimeout(function() {
    startDisabled = false;
  }, 500);
}
Array.from(document.querySelectorAll('.stage-knob')).map((knob, i) => {
  knob.onpointerdown = function() {
    Array.from(this.parentElement.children).map(sibling => {
      sibling.classList.remove('selected');
    });
    this.classList.add('selected');
    selectedStage = this.innerHTML;
  }
});
document.getElementById('mode-back-button').onclick = function() {
  document.getElementById('mode-select-screen').classList.remove('showing');
  console.warn('mode-back-button click showing logos')
  document.getElementById('title-items').classList.remove('hidden');
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
scoreDisplay = undefined;
useCookie = true;
const setCookie = (value) => {
  let date = new Date();
  date.setTime(date.getTime() + 365 * 24 * 60 * 60 * 1000);
  let expires = 'expires=' + date.toUTCString();
  document.cookie = 'brutalkungfu' + '=' + value + ';' + expires + ';path=/';
  console.warn('SET COOKIE!', document.cookie);
};
const getCookie = cookieName => {
  console.info('document.cookie is', document.cookie)
  let cookieObj;
  let decodedCookie = decodeURIComponent(document.cookie).split('; ');
  cookieObj = decodedCookie.filter(str => str.split('=')[0] === cookieName);
  console.warn('cookieObj?', cookieObj)
  if (cookieObj.length) {
    console.warn('cookie is good')
    cookieObj = JSON.parse(cookieObj[0].split('=')[1]);
    // document.getElementById('cookie-checkbox').checked = true;
    // document.getElementById('credit').className = 'remembered'
    // document.getElementById('credit').innerText = '* REMEMBERED *'
  } else {
    cookieObj = undefined;
  }
  return cookieObj;
};
const destroyCookie = () => {
  console.error('DESTROYING COOKIE ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~');
  var d = new Date();
  d.setTime(d.getTime() + 0 * 24 * 60 * 60 * 1000);
  var expires = 'expires=' + d.toUTCString();
  document.cookie = 'brutalkungfu' + '=' + null + ';' + expires + ';path=/';
}
function init() {
  setVariables();
  player = new Fighter('thomas');
  nesPanel = new NESPanel();
  titleScreen = new TitleScreen();
  selector = new DragonSelector();
  stage.addChild(titleScreen.container);
  // createGame();
  // titleScreen = new TitleScreen();
  // stage.addChild(titleScreen.container);
  createGame();
  getScoresFromDatabase(gameName, true);
  enterNameScreen = new EnterNameScreen();
  dragonScreen = new DragonScreen();
  stage.addChild(enterNameScreen.container);
  stage.addChild(dragonScreen.container);
  if (!landscape) {
    // gameContainer.mask.width = gameContainer.width;
    // gameContainer.mask.height = gameHeight;
    // gameContainer.mask.x = gameContainer.x;
    // gameContainer.mask.y = gameContainer.y;
  }
  
  PIXI.ticker.shared.add(function(time) {
    renderer.render(stage);
    update();
  });
}