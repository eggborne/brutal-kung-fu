const viewWidth = window.screen.width;
const viewHeight = window.innerHeight;
const isTouchDevice = 'ontouchstart' in document.documentElement;
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
    document.body.style.opacity = 1;
    document.body.style.transform = 'scaleY(1)';
  });  
  soundsLoaded = 0;
  document.getElementById('name-entry').onkeyup = function() {
    if (this.value !== '') {
      document.getElementById('name-submit').disabled = false;
    } else {
      document.getElementById('name-submit').disabled = true;
    }
  }
  // setTimeout(() => {
  //   toggleNameEntry();
  //   console.log(findRank('25100'))
  // }, 2000);
});
function findRank(score) {
  let rank;
  scoreArray.map((entry, i) => {
    console.log('comparing', score.toString(), 'to', entry[1].toString())
    if (!rank && parseInt(score) === parseInt(currentRecord.score) && currentRecord.player === entry[0] && parseInt(score) === parseInt(entry[1])) {
      rank = i + 1;
    }
  });
  return suffixedNumber(rank);
}
document.body.onload = () => {
  document.getElementById('kung-fu-logo').classList.add('landed');
  document.getElementById('brutal-logo').classList.add('landed');
}

let gameMode = 'story';
let showInstructions = landscape;
let soundOn = false;
let musicOn = false;
let bloodOn = true;

let assigningAction = undefined;
let lastEnteredName = '';

let gripperLimit = 4;
let tomtomLimit = 3;

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
    if (musicOn) {
      sound.play();
    }
  } else {
    if (soundOn) {
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
const actualHeight = parseInt(gameHeight);
let tilesPerHeight = 15;
let tilesPerWidth = 16;
let currentLevel = undefined;
let currentScore = 0;
lastEggX = undefined;

// if (!landscape) {
tileSize = Math.round(gameWidth / tilesPerWidth);
document.documentElement.style.setProperty('--tile-size', tileSize)
// } else {
//     tileSize = Math.round(gameHeight/tilesPerHeight)
// }
let newPixelSize = tileSize / tilesPerWidth;
document.documentElement.style.setProperty('--pixel-size', newPixelSize + 'px');


let introTime = 30;
let walkupTime = 120;
let topScore = 0;
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
  knifeFrequency = 60;
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
  // blockStyle.fontSize = Math.round(tileSize / 2.25) + 'px';
  // blockStyle.lineHeight = tileSize * 0.9;
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
    document.getElementById('brutal-logo').classList.add('hidden');
    document.getElementById('kung-fu-logo').classList.add('hidden');
    document.getElementById('hard-reload').classList.add('hidden');
    playSound(gameStartMusic);
  }
}

function toggleSound() {
  if (!soundOn) {
    if (!soundsLoaded) {
      // loadMessage.visible = true;
      loadSounds();
    }
    // Howler.mute(false);
  } else {
    // Howler.mute(true);
  }
  soundOn = !soundOn;
}
function toggleMusic() {
  if (!musicOn) {
    if (!soundsLoaded) {
      // loadMessage.visible = true;
      loadSounds();
    }
    // Howler.mute(false);
    introTime = 300;
  } else {
    // Howler.mute(true);
    introTime = 30;
  }
  musicOn = !musicOn;
}
function toggleBlood() {
  bloodOn = !bloodOn;
}

const startingLives = 2;
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
      tomtoms: 3
    },
    tomtoms: false,
    boss: stickMan,
    water: 'waterbg'
  },
  {
    direction: 'right',
    enemyFrequency: 50,
    eggFrequency: 12,
    limits: {
      grippers: 4,
      tomtoms: 3
    },
    tomtoms: true,
    boss: boomerangMan,
    water: 'spinebg'
  },
  {
    direction: 'left',
    enemyFrequency: 30,
    eggFrequency: 30,
    limits: {
      grippers: 6,
      tomtoms: 4
    },
    tomtoms: true,
    boss: giant,
    water: 'spinebg'
  },
  {
    direction: 'right',
    enemyFrequency: 15,
    eggFrequency: 10,
    limits: {
      grippers: 8,
      tomtoms: 1
    },
    tomtoms: false,
    boss: blackMagician,
    water: 'spinebg'
  },
  {
    direction: 'left',
    enemyFrequency: 10,
    eggFrequency: 0,
    limits: {
      grippers: 12,
      tomtoms: 8
    },
    tomtoms: true,
    boss: misterX,
    water: 'spinebg'
  }
];

// let enemyFrequency, eggFrequency;

function createGame() {
  created = true;
  level1 = new Level(1, 'left', gameHeight, 'waterbg', topEdge, groundY);
  gameContainer.setChildIndex(player.sprite, gameContainer.children.length - 1);

  player.level = level1;
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
  
  document.getElementById('close-controls-button').onclick = () => {
    toggleControlScreen();
  }
  document.getElementById('keyboard-controls-tab').onclick = function() {
    controlTabSelected = 'keyboard';
    this.classList.add('selected');
    document.getElementById('gamepad-controls-tab').classList.remove('selected');
    document.getElementById('gamepad-controls-grid').classList.add('hidden');
    document.getElementById('keyboard-controls-grid').classList.remove('hidden');
  }
  document.getElementById('gamepad-controls-tab').onclick = function() {
    controlTabSelected = 'gamepad';
    this.classList.add('selected');
    document.getElementById('keyboard-controls-tab').classList.remove('selected');
    document.getElementById('keyboard-controls-grid').classList.add('hidden');
    document.getElementById('gamepad-controls-grid').classList.remove('hidden');
  }
}
// [...document.querySelectorAll('.key-edit-button')].map((but, i) => {
//   but.onpointerdown = function(e) {
//     let action = Object.keys(actionKeys)[i];
//     this.classList.add('depressed');
//     callKeyEditModal(action);
//   }
// });
[...document.querySelectorAll('.key-row')].map((but, i) => {
  but.onpointerdown = function(e) {
    let action = Object.keys(actionKeys)[i];
    this.classList.add('depressed');
    callKeyEditModal(action);
  }
});
document.getElementById('sound-toggle').onpointerdown = () => {
  if (soundOn) {
    document.getElementById('sound-toggle').classList.remove('on');
  } else {
    document.getElementById('sound-toggle').classList.add('on');  
  }
  toggleSound();
};
document.getElementById('music-toggle').onpointerdown = () => {
  if (musicOn) {
    document.getElementById('music-toggle').classList.remove('on');
  } else {
    document.getElementById('music-toggle').classList.add('on');  
  }
  toggleMusic();
};
document.getElementById('blood-toggle').onpointerdown = () => {
  if (bloodOn) {
    document.getElementById('blood-toggle').classList.remove('on');
  } else {
    document.getElementById('blood-toggle').classList.add('on');  
  }
  toggleBlood();
};
document.getElementById('full-screen-toggle').onpointerdown = () => {
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
  document.getElementById('stage-select-mode-panel').classList.remove('selected');
  document.getElementById('stage-select-mode-panel').classList.remove('expanded');
  document.getElementById('game-canvas').style.backgroundColor = 'var(--original-bg-color)';
  document.getElementById('story-mode-panel').classList.remove('truncated');
  document.getElementById('horde-mode-panel').classList.remove('truncated');
  gameMode = 'story';
  floorDisplay.legend.text = 'LEVEL 1';
  floorDisplay.bg.width = tileSize * 3.5;
}
document.getElementById('horde-mode-panel').onclick = function() {
  this.classList.add('selected');
  document.getElementById('story-mode-panel').classList.remove('selected');
  document.getElementById('stage-select-mode-panel').classList.remove('selected');
  document.getElementById('stage-select-mode-panel').classList.remove('expanded');
  document.getElementById('game-canvas').style.backgroundColor = 'var(--horde-bg-color)';
  document.getElementById('story-mode-panel').classList.remove('truncated');
  document.getElementById('horde-mode-panel').classList.remove('truncated');
  gameMode = 'horde';
  floorDisplay.legend.text = 'HORDE MODE';
  floorDisplay.bg.width = tileSize * 5;
}
document.getElementById('stage-select-mode-panel').onclick = function() {
  this.classList.add('selected');
  this.classList.add('expanded');
  document.getElementById('story-mode-panel').classList.remove('selected');
  document.getElementById('horde-mode-panel').classList.remove('selected');
  document.getElementById('story-mode-panel').classList.add('truncated');
  document.getElementById('horde-mode-panel').classList.add('truncated');
  gameMode = 'story';
}
document.getElementById('hint-close-button').onclick = function() {
  this.parentElement.parentElement.classList.remove('showing');
  gameInitiated = true;
}
document.getElementById('confirm-mode-button').onclick = function() {
  if (gameMode === 'horde') {
    lives = 0;
    gameContainer.x += level1.levelWidth / 2;
    floorDisplay.container.x -= level1.levelWidth / 2;
    player.sprite.x = (gameWidth / 2) - (level1.levelWidth / 2);
    level1.tomtoms = true;
    level1.boss.sprite.alpha = 0;
    level1.container.alpha = 0;
  } else if (gameMode === 'story') {
    level1.tomtoms = false;
    level1.boss.sprite.alpha = 1;
    level1.container.alpha = 1;
    if (selectedStage) {
      levelUp(selectedStage - 1);
      selectedStage = 0;
    }
  }
  console.log('show?', showInstructions)
  document.getElementById('mode-select-screen').classList.remove('showing');
  if (showInstructions) {
    document.getElementById('controls-hint').classList.add('showing');
    showInstructions = false;
  } else {
    gameInitiated = true;
  }
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
  document.getElementById('kung-fu-logo').classList.remove('hidden');
  document.getElementById('brutal-logo').classList.remove('hidden');
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
function init() {
  setVariables();
  player = new Fighter('thomas');
  nesPanel = new NESPanel();
  createGame();
  titleScreen = new TitleScreen();
  stage.addChild(titleScreen.container);
  enterNameScreen = new EnterNameScreen();
  highScoresScreen = new HighScoresScreen();
  stage.addChild(enterNameScreen.container);
  stage.addChild(highScoresScreen.container);
  selector = new DragonSelector();
  // alert("randerer x " + renderer.x + " gameC X " + gameContainer.x + " gameW " + gameWidth + " mask w " + gameContainer.mask.width + " at X " + gameContainer.mask.x)
  if (!landscape) {
    gameContainer.mask.width = gameContainer.width;
    gameContainer.mask.height = gameHeight;
    gameContainer.mask.x = gameContainer.x;
    gameContainer.mask.y = gameContainer.y;
  }
  getScoresFromDatabase(gameName, true);
  PIXI.ticker.shared.add(function(time) {
    renderer.render(stage);
    update();
  });
}