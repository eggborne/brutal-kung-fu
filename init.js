let viewWidth = window.screen.width;
let viewHeight = window.innerHeight;
const isTouchDevice = 'ontouchstart' in document.documentElement;
const isWebApp = (window.navigator.standalone === true) || (window.matchMedia('(display-mode: standalone)').matches);
let landscape = viewWidth > viewHeight;
const gameName = 'brutalkungfu';
let kungFuSounds;
let onStorySlide = 0;
let soundsLoaded = 0;
window.addEventListener('load', function () {
  app.loader.add('assets/nessprites.json')
    .add('assets/bkfsprites.json')
    .load(function () {
      init();
      document.getElementById('game-canvas').classList.remove('hidden');
      document.getElementById('options-screen').classList.add('hidden');
      document.getElementById('top-fighters-screen').classList.add('hidden');
      document.body.className = 'loaded';
      document.getElementById('credit').style.opacity = 0.3;
    });
  document.documentElement.style.setProperty('--screen-height', window.innerHeight + 'px');
  document.getElementById('name-entry').onkeyup = function () {
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

  let userCookie = getCookie('brutalkungfu');
  if (userCookie) {
    console.warn('gameOpt now', gameOptions);
    applyUserOptions(userCookie);
    gameOptions = { ...userCookie };
    console.warn('options set to user')
  } else {
    console.warn('options left at default')
  }
  userGamepad = null;
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
  // let properArray = scoreArray.filter(entry => entry.gameMode === gameMode)
  let properArray = highScores[gameMode];
  properArray.map((entry, i) => {
    let entryName = entry.name;
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
  scanLines: true,
  actionKeys: {
    'WALK LEFT': 'a',
    'WALK RIGHT': 'd',
    'JUMP': 'w',
    'CROUCH': 's',
    'PUNCH/WEAPON': 'j',
    'KICK': 'k',
    'THROW WEAPON': 'l'
  },
  buttonMappings: {
    0: { action: 'kick' },
    1: { action: 'punch' },
    2: { action: '' },
    3: { action: 'throw' },
    4: { action: '' },
    5: { action: '' },
    6: { action: '' },
    7: { action: '' },
    8: { action: 'select' },
    9: { action: 'start' },
    10: { action: '' },
    11: { action: '' },
    12: { action: 'up' },
    13: { action: 'down' },
    14: { action: 'left' },
    15: { action: 'right' }
  },
  actionButtons: {
    'WALK LEFT': 'left',
    'WALK RIGHT': 'right',
    'JUMP': 'up',
    'CROUCH': 'down',
    'PUNCH/WEAPON': 'y',
    'KICK': 'b',
    'THROW WEAPON': 'x'
  },
  gamepadPosition: 'HIGH',
  showInstructions: landscape,
  addedToHomeScreen: isWebApp,
  playerName: ''
}
let gameOptions = { ...defaultOptions };

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
let loadSounds = function () {
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
    onload: function () {
      soundsLoaded++;
      // loadMessage.text = 'SOUNDS LOADED: ' + soundsLoaded + '/13';
    }
  });

  punchSound = new Howl({
    src: ['assets/sounds/thomaspunch.mp3'],
    html: true,
    onload: function () {
      soundsLoaded++;
    }
  });
  kickSound = new Howl({
    src: ['assets/sounds/thomaskick.mp3', 'assets/sounds/thomaskick.ogg'],
    html: true,
    onload: function () {
      soundsLoaded++;
    }
  });
  jumpkickSound = new Howl({
    src: ['assets/sounds/thomasjumpkick.mp3', 'assets/sounds/thomasjumpkick.ogg'],
    html: true,
    onload: function () {
      soundsLoaded++;
    }
  });
  knifeSound = new Howl({
    src: ['assets/sounds/thomasknife.mp3', 'assets/sounds/thomasknife.ogg'],
    html: true,
    onload: function () {
      soundsLoaded++;
    }
  });
  shortHitSound = new Howl({
    src: ['assets/sounds/shorthit.mp3', 'assets/sounds/shorthit.ogg'],
    html: true,
    onload: function () {
      soundsLoaded++;
    }
  });
  longHitSound = new Howl({
    src: ['assets/sounds/longhit.mp3', 'assets/sounds/longhit.ogg'],
    volume: 0.8,
    html: true,
    onload: function () {
      soundsLoaded++;
    }
  });
  highLaugh = new Howl({
    src: ['assets/sounds/highlaugh.mp3', 'assets/sounds/highlaugh.ogg'],
    volume: 1,
    html: true,
    onload: function () {
      soundsLoaded++;
    }
  });
  midLaugh = new Howl({
    src: ['assets/sounds/midlaugh.mp3', 'assets/sounds/midlaugh.ogg'],
    html: true,
    onload: function () {
      soundsLoaded++;
    }
  });
  lowLaugh = new Howl({
    src: ['assets/sounds/lowlaugh.mp3', 'assets/sounds/lowlaugh.ogg'],
    html: true,
    onload: function () {
      soundsLoaded++;
    }
  });
  deathSound = new Howl({
    src: ['assets/sounds/thomasdeath.mp3', 'assets/sounds/thomasdeath.ogg'],
    html: true,
    onload: function () {
      soundsLoaded++;
    }
  });
  gameStartMusic = new Howl({
    src: ['assets/sounds/gamestart.mp3', 'assets/sounds/gamestart.ogg'],
    volume: 0.5,
    html: true,
    onload: function () {
      soundsLoaded++;
    }
  });
  bgMusic = new Howl({
    src: ['assets/sounds/bgmusiclow.mp3', 'assets/sounds/bgmusiclow.ogg'],
    volume: 0.6,
    html: true,
    loop: true,
    onload: function () {
      soundsLoaded++;
    }
  });
};
function playSound(sound) {
  if (sound === gameStartMusic || sound === bgMusic) {
    if (gameOptions.musicOn && sound) {
      sound.play();
    }
  } else {
    if (gameOptions.soundOn && sound) {
      sound.play();
    }
  }
}

let gameWidth = viewWidth;
let gameHeight = viewWidth * (15 / 16);
let gameX = 0;
if (landscape) {
  gameHeight = window.innerHeight;
  gameWidth = gameHeight * (16 / 15);
  gameX = (viewWidth - gameWidth) / 2;
}
PIXI.settings.SCALE_MODE = PIXI.SCALE_MODES.NEAREST;
// PIXI.settings.PRECISION_FRAGMENT = PIXI.PRECISION.LOW;
// PIXI.settings.PRECISION_VERTEX = PIXI.PRECISION.LOW;
console.log('PIXI.set.prec', PIXI.settings)
const app = new PIXI.Application({
  // width: viewWidth,
  width: gameWidth,
  height: viewHeight,
  powerPreference: 'high-performance',
  resolution: window.devicePixelRatio,
  autoResize: true,
  // roundPixels: true,
  // backgroundColor: 0x9290ff,
  transparent: true
});

// app.plugins.interaction.interactionFrequency = 1;
// app.x = 0
const stage = app.stage;
const gameContainer = new PIXI.Container();
const nesContainer = new PIXI.Container();
const UIContainer = new PIXI.Container();
stage.addChild(gameContainer);
stage.addChild(UIContainer);
if (landscape) {
  // stage.addChild(nesContainer);
} else {
  stage.addChild(nesContainer);
}
document.getElementById('game-canvas').appendChild(app.view);

// let gameWidth = document.getElementById('game-canvas').offsetWidth;
// let gameHeight = document.getElementById('game-canvas').offsetHeight;

document.documentElement.style.setProperty('--game-x', gameX + 'px')
document.documentElement.style.setProperty('--game-width', gameWidth + 'px')
document.documentElement.style.setProperty('--game-height', gameHeight + 'px')
actualHeight = parseInt(gameHeight);
let tilesPerHeight = 15;
let tilesPerWidth = 16;
let currentLevel = undefined;
let currentScore = 0;
lastEggX = undefined;

// if (!landscape) {
let tileSize = Math.round(gameWidth / tilesPerWidth);
// let tileSize = Math.round(gameHeight/tilesPerHeight)
// tileSize = gameWidth / tilesPerWidth;
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
let highScores = {
  story: [],
  horde: []
}
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
    document.getElementById('title-screen').classList.add('hidden');
    if (!floorDisplay.container.visible) {
      floorDisplay.container.visible = true;
    }
    console.warn('clearTitle ---------------------------------------------------------------------------------');
  }
}

function toggleSound() {
  !soundsLoaded ? loadSounds() : null;
  document.getElementById('sound-toggle').classList.toggle('on');
  gameOptions.soundOn = !gameOptions.soundOn;
}
function toggleMusic() {
  !soundsLoaded ? loadSounds() : null;
  document.getElementById('music-toggle').classList.toggle('on');
  gameOptions.musicOn = !gameOptions.musicOn;
  introTime = gameOptions.musicOn ? 300 : 30;
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
    enemyFrequency: 80,
    eggFrequency: 0,
    limits: {
      grippers: 3,
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
      grippers: 4,
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
      grippers: 5,
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

let hordeLevel;

function createGame() {
  created = true;
  console.log(levelData)
  // level1 = new Level(1, 'left', gameHeight, 'waterbg', topEdge, groundY);
  let firstLevel = levelData[0];
  level1 = new Level(1, firstLevel.direction, gameHeight, firstLevel.water, topEdge, groundY);
  hordeLevel = new Level(0, 'left', gameHeight, 'waterbg', topEdge, groundY, 6, true);
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
    // let nesPanelHeight = document.getElementById('nes-panel-bg').offsetHeight;
    let nesPanelHeight = nesContainer.height;
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
function callKeyControlsScreen() {
  document.getElementById('controls-hint').classList.add('showing');
}
function callGamepadSetupScreen() {
  if (!userGamepad) {
    document.getElementById('press-instructions').innerText = 'PRESS ANY BUTTON TO DETECT GAMEPAD';
    document.getElementById('button-assigning').innerText = '';
  }
  document.getElementById('dim-cover').classList.add('showing');
  document.getElementById('gamepad-setup').classList.add('showing');
}
document.getElementById('controls-button').onclick = () => {
  callKeyControlsScreen()
}
document.getElementById('gamepad-button').onclick = callGamepadSetupScreen;
document.getElementById('cancel-gamepad-assigns-button').onclick = () => {
  document.getElementById('dim-cover').classList.remove('showing');
  document.getElementById('gamepad-setup').classList.remove('showing');
}
[...document.querySelectorAll('.key-row')].map((but, i) => {
  but.onclick = function (e) {
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
document.getElementById('full-screen-toggle').onpointerdown = () => {  
  toggleFullScreen();
};
document.getElementById('close-options-button').onclick = function () {
  toggleOptionsScreen();
};
document.getElementById('close-high-scores-button').onclick = function () {
  toggleHighScores();
};
document.getElementById('story-mode-panel').onpointerdown = function () {
  changeGameMode('story')
};
document.getElementById('horde-mode-panel').onpointerdown = function () {
  changeGameMode('horde')
}
document.getElementById('hint-close-button').onclick = function () {
  this.parentElement.parentElement.classList.remove('showing');
  if (document.getElementById('options-screen').classList.contains('hidden')) {
    gameInitiated = true;
  }
}
document.getElementById('cinematic').onclick = function () {
  skipTextOrNextSlide();
}
document.getElementById('skip-cinematic-button').onclick = function () {
  skipCinematic();
}

function changeGameMode(newMode) {
  if (newMode === 'story') {
    document.getElementById('story-mode-panel').classList.add('selected');
    document.getElementById('horde-mode-panel').classList.remove('selected');
  }
  if (newMode === 'horde') {
    document.getElementById('horde-mode-panel').classList.add('selected');
    document.getElementById('story-mode-panel').classList.remove('selected');
  }
  gameMode = newMode;
}

function confirmGameMode() {
  if (gameMode === 'horde') {
    floorDisplay.legend.text = 'HORDE MODE';
    floorDisplay.bg.width = tileSize * 5;
    lives = 0;
    scoreDisplay.updateLives(lives);
    player.sprite.x = (gameWidth / 2);
    tomtomLimit = 2;
    gameContainer.removeChild(player.level.container);
    levelTime = 0;
    scoreDisplay.timeText.text = '0000';
    player.level = hordeLevel;
    if (fighterScale !== 1) {
      fighterScale = 1;
      player.setAttributesToScale(fighterScale);
    }
    // fighterScale = 0.8;
    // player.setAttributesToScale(fighterScale);
    document.getElementById('game-canvas').classList.add('horde-mode');
    gameInitiated = true;
  } else if (gameMode === 'story') {
    floorDisplay.legend.text = 'LEVEL 1';
    floorDisplay.bg.width = tileSize * 3.5;
    lives = startingLives;
    scoreDisplay.updateLives(lives);
    player.level = level1;
    gameContainer.addChildAt(player.level.container, 0);
    if (selectedStage) {
      levelUp(selectedStage - 1);
      selectedStage = 0;
    }
    if (fighterScale !== 1) {
      fighterScale = 1;
      player.setAttributesToScale(fighterScale);
    }
    document.getElementById('game-canvas').classList.remove('horde-mode');
    document.getElementById('cinematic').classList.remove('hidden');
    requestAnimationFrame(() => {
      advanceSlide();
    });
  }
  document.getElementById('mode-select-screen').classList.add('hidden');
}


Array.from(document.querySelectorAll('#top-fighters-screen .tab-area > .tab')).map((tab, i, arr) => {
  tab.onpointerdown = function () {
    let selectingTab = this.innerText.split(' ')[0];
    document.getElementById('top-fighters-screen').classList.remove(highScoreTabSelected.toLowerCase() + '-mode');
    document.getElementById('top-fighters-screen').classList.add(selectingTab.toLowerCase() + '-mode');
    highScoreTabSelected = selectingTab.toLowerCase();
    console.log(highScoreTabSelected);
  };
});
async function advanceSlide() {
  console.log('onStorySlide', onStorySlide);
  let currentSlide = storySlides[onStorySlide];
  // start game if at end
  if (!currentSlide || (onStorySlide && !document.querySelector(`.cinema-scene:nth-child(${onStorySlide})`))) {
    console.error('END of slides. Hiding cinematic and starting game');
    gameInitiated = true;
    return document.getElementById('cinematic').classList.add('hidden');
  }
  document.getElementById('cinematic-caret').classList.remove('ready');
  if (onStorySlide && !currentSlide.keepImage) {
    document.querySelector(`.cinema-scene:nth-child(${onStorySlide - 1})`).classList.remove('full-opacity');
    document.querySelector(`.cinema-scene:nth-child(${onStorySlide})`).classList.add('full-opacity');
  }
  await typeCaption(currentSlide);
  if (gameInitiated) { return document.getElementById('cinematic').classList.add('hidden') };
  if (onStorySlide === 0) {
    document.querySelector('#cinematic > .caption').classList.add('moved-down');
    // wait for 'years ago' to shrink
    setTimeout(async function () {
      document.getElementById('cinema-screen').classList.add('full-opacity');
      document.querySelector('.cinema-scene:first-child').classList.add('full-opacity');
      await typeCaption(storySlides[1]);
      if (gameInitiated) { return document.getElementById('cinematic').classList.add('hidden') };
      document.getElementById('cinematic-caret').classList.add('ready');
    }, 1750);
    onStorySlide++;
  } else {
    if (currentSlide.caption) {
      document.getElementById('cinematic-caret').classList.add('ready');
    } else {
      setTimeout(async function () {
        console.error('auto-advancing.')
        await advanceSlide()
      }, 1500);
    }

  }
  onStorySlide++;
}
document.getElementById('confirm-mode-button').onclick = confirmGameMode;
Array.from(document.querySelectorAll('.title-button')).map((but, i, arr) => {
  but.onpointerdown = function () {
    this.classList.add('selected')
    arr
      .filter(but => but !== this)
      .map(but => but.classList.remove('selected'));
  }
});
document.getElementById('start-button').onpointerup = function () {
  callModeSelectScreen()
  clearTitle();
};
document.getElementById('top-fighters-button').onpointerup = function () {
  toggleHighScores();
};
document.getElementById('options-button').onpointerup = function () {
  toggleOptionsScreen();
};
document.getElementById('skip-name-entry-button').onclick = function () {
  toggleNameEntry();
  startDisabled = true;
  setTimeout(function () {
    startDisabled = false;
  }, 500);
}
Array.from(document.querySelectorAll('.stage-knob')).map((knob, i) => {
  knob.onpointerdown = function () {
    Array.from(this.parentElement.children).map(sibling => {
      sibling.classList.remove('selected');
    });
    this.classList.add('selected');
    selectedStage = this.innerHTML;
  }
});
Array.from(document.querySelectorAll('.option-range-value')).map((knob, i) => {
  knob.onpointerdown = function () {
    Array.from(this.parentElement.children).map(sibling => {
      sibling.classList.remove('on');
    });
    this.classList.add('on');
    newPosition = this.innerHTML;
    console.log('new!', newPosition)
    gameOptions.gamepadPosition = newPosition;
    nesPanel.moveToYPosition(newPosition);
  }
});
document.getElementById('mode-back-button').onclick = function () {
  document.getElementById('title-screen').classList.remove('hidden');
  document.getElementById('mode-select-screen').classList.add('hidden');
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
    cookieObj = JSON.parse(cookieObj[0].split('=')[1]);
    console.warn('cookie is good', cookieObj)
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
  nesPanel = new NESPanel();
  player = new Fighter('thomas');
  createGame();
  setTimeout(() => {
    getScoresFromDatabase('horde', true);
    getScoresFromDatabase('story', true);
  }, 750);
  if (!landscape) {
    // gameContainer.mask.width = gameContainer.width;
    // gameContainer.mask.height = gameHeight;
    // gameContainer.mask.x = gameContainer.x;
    // gameContainer.mask.y = gameContainer.y;
  }

  PIXI.Ticker.shared.add(function (time) {
    app.render(gameContainer);
    update();
  });
}