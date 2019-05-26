viewWidth = window.screen.width;
viewHeight = window.innerHeight;
isTouchDevice = 'ontouchstart' in document.documentElement;
landscape = viewWidth > viewHeight;
gameName = 'kungfu';
console.log('top of init at', window.performance.now())
var kungFuSounds = undefined;
window.addEventListener('load', function () {
  PIXI.loader
    .add('assets/nessprites.json')
    .add('assets/kfsprites.json')
    .load(function() {
      init();
      document.body.style.opacity = 1;
      document.body.style.transform = 'scaleY(1)';
    });
});

$(document).ready(function() {
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
  soundsLoaded = 0;
  $('#name-entry').keyup(function() {
    if ($(this).val() != '') {
      $('#name-submit').removeAttr('disabled');
    } else {
      $('#name-submit').attr('disabled', 'disabled');
    }
  });
});

var gameStartMusic = undefined;
var bgMusic = undefined;
var stepSound = undefined;
var punchSound = 'thomaspunch';
var kickSound = 'thomaskick';
var jumpkickSound = 'thomasjumpkick';
var knifeSound = undefined;
var shortHitSound = undefined;
var longHitSound = undefined;
var highLaugh = undefined;
var midLaugh = undefined;
var lowLaugh = undefined;
var deathSound = undefined;
var gameStart = undefined;
var loadSounds = function() {
  Howler.autoSuspend = true;
  stepSound = new Howl({
    // src: ['assets/sounds/step.mp3'],
    src: ['assets/sounds/step.mp3', 'assets/sounds/step.ogg'],
    html: true,

    onload: function() {
      soundsLoaded++;
      loadMessage.text = 'SOUNDS LOADED: ' + soundsLoaded + '/13';
    }
  });

  punchSound = new Howl({
    src: ['assets/sounds/thomaspunch.mp3'],
    html: true,

    onload: function() {
      soundsLoaded++;
      loadMessage.text = 'SOUNDS LOADED: ' + soundsLoaded + '/13';
    }
  });
  kickSound = new Howl({
    src: ['assets/sounds/thomaskick.mp3', 'assets/sounds/thomaskick.ogg'],
    html: true,

    onload: function() {
      soundsLoaded++;
      loadMessage.text = 'SOUNDS LOADED: ' + soundsLoaded + '/13';
    }
  });
  jumpkickSound = new Howl({
    // src: ['assets/sounds/thomasjumpkick.mp3'],
    src: ['assets/sounds/thomasjumpkick.mp3', 'assets/sounds/thomasjumpkick.ogg'],
    html: true,

    onload: function() {
      soundsLoaded++;
      loadMessage.text = 'SOUNDS LOADED: ' + soundsLoaded + '/13';
    }
  });

  knifeSound = new Howl({
    // src: ['assets/sounds/thomasknife.mp3'],
    src: ['assets/sounds/thomasknife.mp3', 'assets/sounds/thomasknife.ogg'],
    html: true,

    onload: function() {
      soundsLoaded++;
      loadMessage.text = 'SOUNDS LOADED: ' + soundsLoaded + '/13';
    }
  });
  shortHitSound = new Howl({
    // src: ['assets/sounds/shorthit.mp3'],
    src: ['assets/sounds/shorthit.mp3', 'assets/sounds/shorthit.ogg'],
    html: true,

    onload: function() {
      soundsLoaded++;
      loadMessage.text = 'SOUNDS LOADED: ' + soundsLoaded + '/13';
    }
  });
  longHitSound = new Howl({
    // src: ['assets/sounds/longhit.mp3'],
    src: ['assets/sounds/longhit.mp3', 'assets/sounds/longhit.ogg'],
    volume: 0.8,
    html: true,

    onload: function() {
      soundsLoaded++;
      loadMessage.text = 'SOUNDS LOADED: ' + soundsLoaded + '/13';
    }
  });
  highLaugh = new Howl({
    // src: ['assets/sounds/highlaugh.mp3'],
    src: ['assets/sounds/highlaugh.mp3', 'assets/sounds/highlaugh.ogg'],
    volume: 1,
    html: true,

    onload: function() {
      soundsLoaded++;
      loadMessage.text = 'SOUNDS LOADED: ' + soundsLoaded + '/13';
    }
  });
  midLaugh = new Howl({
    // src: ['assets/sounds/midlaugh.mp3'],
    src: ['assets/sounds/midlaugh.mp3', 'assets/sounds/midlaugh.ogg'],
    // volume:1,
    html: true,
    onload: function() {
      soundsLoaded++;
      loadMessage.text = 'SOUNDS LOADED: ' + soundsLoaded + '/13';
    }
  });
  lowLaugh = new Howl({
    // src: ['assets/sounds/lowlaugh.mp3'],
    src: ['assets/sounds/lowlaugh.mp3', 'assets/sounds/lowlaugh.ogg'],
    // volume:1,
    // playing: false,

    html: true,
    onload: function() {
      soundsLoaded++;
      loadMessage.text = 'SOUNDS LOADED: ' + soundsLoaded + '/13';
    }
  });
  deathSound = new Howl({
    // src: ['assets/sounds/thomasdeath.mp3'],
    src: ['assets/sounds/thomasdeath.mp3', 'assets/sounds/thomasdeath.ogg'],
    // playing: false,
    html: true,

    onload: function() {
      soundsLoaded++;
      loadMessage.text = 'SOUNDS LOADED: ' + soundsLoaded + '/13';
    }
  });
  gameStartMusic = new Howl({
    // src: ['assets/sounds/gamestart.mp3'],
    src: ['assets/sounds/gamestart.mp3', 'assets/sounds/gamestart.ogg'],
    volume: 0.5,
    html: true,

    onload: function() {
      soundsLoaded++;
      loadMessage.text = 'SOUNDS LOADED: ' + soundsLoaded + '/13';
    }
  });
  bgMusic = new Howl({
    // src: ['assets/sounds/bgmusiclow.mp3'],
    src: ['assets/sounds/bgmusiclow.mp3', 'assets/sounds/bgmusiclow.ogg'],
    volume: 0.6,
    html: true,

    loop: true,
    onload: function() {
      soundsLoaded++;
      loadMessage.text = 'SOUNDS LOADED: ' + soundsLoaded + '/13';
      loadMessage.style.fill = 0xeeeeee;
      setTimeout(function() {
        loadMessage.visible = false;
      }, 500);
    }
  });
};
function playSound(sound) {
  if (!noSound) {
    sound.play();
  }
}
PIXI.settings.SCALE_MODE = PIXI.SCALE_MODES.NEAREST;
PIXI.settings.RESOLUTION = window.devicePixelRatio;
renderer = PIXI.autoDetectRenderer({
  width: viewWidth,
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
stage = new PIXI.Container();
gameContainer = new PIXI.Container();
nesContainer = new PIXI.Container();
stage.addChild(gameContainer);
// if (!landscape) {
stage.addChild(nesContainer);
// }

document.getElementById('game-canvas').appendChild(renderer.view);

// var gameWidth = document.getElementById("game-canvas").offsetWidth
var gameWidth = document.getElementById('game-canvas').offsetWidth;
var gameHeight = document.getElementById('game-canvas').offsetHeight;
var tilesPerHeight = 15;
var tilesPerWidth = 16;
currentLevel = undefined;
currentScore = 0;
lastEggX = undefined;

// if (!landscape) {
tileSize = Math.round(gameWidth / tilesPerWidth);
// } else {
//     tileSize = Math.round(gameHeight/tilesPerHeight)
// }
var newPixelSize = tileSize / tilesPerWidth;
introTime = 30;
var walkupTime = 120;
topScore = 0;
lowScore = 0;
currentRecord = { player: undefined, score: undefined };
scoreArray = [];
fighterScale = 1;
levelReached = 1;
dragonLevel = 0;
livesAwarded = 0;
newLifeScore = 50000;

function setVariables() {
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
var eggTypes = ['snake', 'dragon', 'confetti'];

function randomInt(min, max) {
  return Math.floor(Math.random() * (max - min + 1) + min);
}

titleStyle = {
  fontFamily: 'Press Start 2P',
  fontSize: tileSize * 0.7 + 'px',
  fill: '#ddd'
};
titleStyle2 = {
  fontFamily: 'Press Start 2P',
  fontSize: tileSize * 0.5 + 'px',
  fill: '#ddd'
};
highScoreStyle = {
  fontFamily: 'Press Start 2P',
  fontSize: tileSize / 1.75 + 'px',
  fill: '#ddd'
};
scoreStyle = {
  fontFamily: 'Press Start 2P',
  fontSize: tileSize / 2.25 + 'px',
  fill: '#ddd'
};
blockStyle = {
  fontFamily: 'Press Start 2P',
  fontSize: tileSize / 1.5 + 'px',
  fill: '#ddd',
  wordWrap: true,
  wordWrapWidth: gameWidth - tileSize * 4,
  align: 'center',
  lineHeight: tileSize * 1.5
};
buttonStyle = {
  fontFamily: 'Press Start 2P',
  fontSize: tileSize / 2.5 + 'px',
  fill: '#ddd'
};
blipStyle = {
  fontFamily: 'Press Start 2P',
  fontSize: tileSize / 3 + 'px',
  fill: '#ddd'
};
created = false;
function clearTitle() {
  if (!startDisabled) {
    if (landscape) {
      $('body').css({ 'background-color': 'transparent' });
    }
    titleScreen.container.visible = false;
    if (!floorDisplay.container.visible) {
      floorDisplay.container.visible = true;
    }

    // playSound(gameStartMusic);
  }
  // stage.removeChild(titleScreen)
  // if (landscape) {
  //     stage.removeChild(screenCover)
  // }
}
noSound = true;

function toggleSound() {
  if (noSound) {
    if (!soundsLoaded) {
      loadMessage.visible = true;
      loadSounds();
    }
    noSound = false;
    Howler.mute(false);
    // introTime = 300;
    introTime = 30;
    titleScreen.soundBg.tint = 0x224422;
    titleScreen.soundText.tint = 0xaaaaaa;
    titleScreen.soundText.text = 'SOUND: ON';
  } else {
    noSound = true;
    Howler.mute(true);
    introTime = 30;
    titleScreen.soundBg.tint = 0x444444;
    titleScreen.soundText.tint = 0x777777;
    titleScreen.soundText.text = 'SOUND: OFF';
  }
}
lives = startingLives = 1;
bottomSpace = viewHeight - gameHeight;
topEdge = gameHeight - tileSize * (tilesPerHeight - 3.5);
groundY = gameHeight - newPixelSize * 20 - tileSize * 2;

function createGame() {
  // player = new Thomas()
  // if (randomInt(0,1)) {
  var dir = 'left';
  // } else {
  // var dir = "right"
  // }
  created = true;

  // if (bottomSpace < nesPanel.controls.height) {
  // topEdge -= tileSize/2
  // groundY -= tileSize/2
  // stage.height -= tileSize
  // gameContainer.height -= tileSize/2
  // }
  level1 = new Level(1, 'left', gameHeight, 'waterbg', topEdge, groundY);
  // levelReached = 2
  // level1 = new Level(2,"right",gameHeight,"waterbg",topEdge,groundY)
  gameContainer.setChildIndex(player.sprite, gameContainer.children.length - 1);

  player.level = level1;
  player.sprite.x = player.level.playerStartX;
  lastEggX = player.level.playerStartX;
  player.sprite.y = player.level.groundY;

  arrow = new Arrow();
  stickMan = new StickMan();
  boomerangMan = new BoomerangMan();
  giant = new Giant();
  // blackMagician = new BlackMagician()
  bosses = [stickMan, boomerangMan, giant, stickMan];
  levelData = [
    {
      direction: 'left',
      enemyFrequency: 50,
      eggFrequency: 0,
      tomtoms: false,
      boss: stickMan,
      water: 'waterbg'
    },
    {
      direction: 'right',
      enemyFrequency: 45,
      eggFrequency: 20,
      tomtoms: true,
      boss: boomerangMan,
      water: 'spinebg'
    },
    {
      direction: 'left',
      enemyFrequency: 30,
      eggFrequency: 30,
      tomtoms: true,
      boss: giant,
      water: 'spinebg'
    },
    {
      direction: 'right',
      enemyFrequency: 25,
      eggFrequency: 20,
      tomtoms: true,
      boss: stickMan,
      water: 'spinebg'
    },
    {
      direction: 'left',
      enemyFrequency: 15,
      eggFrequency: 0,
      tomtoms: true,
      boss: stickMan,
      water: 'spinebg'
    }
  ];
  var lvlData = levelData[levelReached - 1];
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

  if (isTouchDevice) {
    // nesContainer.addChild(soundButton)
    // soundButton.x = (soundButton.width/2)+(tileSize/2)
    // soundButton.y = gameHeight+(tileSize/2)
    // titleScreen.addChild(soundButton)
  } else {
    // titleScreen.addChild(soundButton)
  }
  floorDisplay = new FloorDisplay();
  scoreDisplay = new ScoreDisplay();

  if (!isTouchDevice) {
    nesPanel.container.visible = false;
  } else if (!landscape) {
    var bottomSpace = viewHeight - gameHeight;
    if (bottomSpace < nesPanel.controls.height) {
      nesPanel.controls.height = bottomSpace - newPixelSize * 6;
      nesPanel.hideDecor();
      nesPanel.controls.y = gameHeight + newPixelSize * 6;
      // var extraY = bottomSpace-nesPanel.controls.height
      // nesPanel.controls.y = viewHeight-nesPanel.controls.height-(extraY/2)
    } else if (bottomSpace < $('#nes-panel-bg').outerHeight() + newPixelSize * 4) {
      // nesPanel.controls.height = bottomSpace-(newPixelSize*6)
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
  } else {
    var sideSpace = (window.innerWidth - gameWidth) / 2;
    $('.blinder').css({
      width: sideSpace
    });
    // $("#blinder-left").css({
    //     left:0
    // })
    $('#right-control').css({
      left: sideSpace + gameWidth
    });
    // controlsContainer.y = gameHeight-controlsContainer.height-(newPixelSize*4)
    // nesPanel.dPad.x -= gameWidth/4
    // nesPanel.dPad.y = 100
    // nesPanel.container.y -= gameHeight
    // nesPanel.bg.alpha = 0
  }
}
scoreDisplay = undefined;
function init() {
  setVariables();
  player = new Fighter('thomas');
  nesPanel = new NESPanel();
  createGame();

  titleScreen = new TitleScreen();
  stage.addChild(titleScreen.container);
  highScoresScreen = new HighScoresScreen();
  stage.addChild(highScoresScreen.container);
  enterNameScreen = new EnterNameScreen();
  stage.addChild(enterNameScreen.container);
  selector = new DragonSelector();
  // alert("randerer x " + renderer.x + " gameC X " + gameContainer.x + " gameW " + gameWidth + " mask w " + gameContainer.mask.width + " at X " + gameContainer.mask.x)
  if (!landscape) {
    gameContainer.mask.width = gameContainer.width;
    gameContainer.mask.height = gameHeight;
    gameContainer.mask.x = gameContainer.x;
    gameContainer.mask.y = gameContainer.y;
  }
  // getScoresFromDatabase(gameName, true, false);
  PIXI.ticker.shared.add(function(time) {
    renderer.render(stage);
    update();
  });
}