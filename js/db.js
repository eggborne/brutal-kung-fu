function populateEntries(scrollToNewRecord) {
  let storyGrid = document.getElementById('story-scores');
  let hordeGrid = document.getElementById('horde-scores');
  storyGrid.innerHTML = '';
  hordeGrid.innerHTML = '';
  let storyScores = highScores.story;
  let hordeScores = highScores.horde;
  if (storyScores.length > scoresToDisplay) { storyScores.length = scoresToDisplay }
  if (hordeScores.length > scoresToDisplay) { hordeScores.length = scoresToDisplay }
  hordeScores.map((scoreEntry, s) => {
    let rank = s + 1;
    let name = scoreEntry.name;
    let score = scoreEntry.score;
    let tintClass = s % 2 === 0 ? '' : 'gray-bg';
    let highlightClass = '';
    if (currentRecord.player && name == currentRecord.player && score.toString() == currentRecord.score.toString()) {        
      highlightClass = 'highlighted';
    }
    hordeGrid.innerHTML += `
      <div class='score-rank ${tintClass}'>${rank}</div>
      <div class='score-name ${tintClass} ${highlightClass}'>${name}</div>
      <div class='score-amount ${tintClass} ${highlightClass}'>${secondsToMinutes(score)}</div>
    `;
  });
  storyScores.map((scoreEntry, s, arr) => {
    let rank = s + 1;
    let name = scoreEntry.name;
    let score = scoreEntry.score;
    let tintClass = s % 2 === 0 ? '' : 'gray-bg';
    let highlightClass = '';
    if (currentRecord.player && name == currentRecord.player && score.toString() == currentRecord.score.toString()) {        
      highlightClass = 'highlighted';
    }
    storyGrid.innerHTML += `
      <div class='score-rank ${tintClass}'>${rank}</div>
      <div class='score-name ${tintClass} ${highlightClass}'>${name}</div>
      <div class='score-amount ${tintClass} ${highlightClass}'>${score}</div>
    `;
  });
  if (scrollToNewRecord) {
    // scroll to player's new high score
    let playerEntry = document.querySelector('.score-amount.highlighted');
    if (playerEntry) {
      // show the approriate tab
      // vertically center the entry on screen
      // compensate for any amount already scrolled
      if (gameMode === 'story') {
        document.getElementById('top-fighters-screen').classList.remove('horde-mode');
        document.getElementById('top-fighters-screen').classList.add('story-mode');
      }
      if (gameMode === 'horde') {
        document.getElementById('top-fighters-screen').classList.remove('story-mode');
        document.getElementById('top-fighters-screen').classList.add('horde-mode');
      }
      let properGrid = document.getElementById(`${gameMode}-scores`);
      // highScoreTabSelected = selectingTab.toLowerCase();
      let halfGrid = (properGrid.offsetHeight / 2) - (playerEntry.offsetHeight / 2);
      let alreadyScrolled = playerEntry.parentElement.scrollTop;
      playerEntry.parentElement.scrollBy(0, playerEntry.offsetTop - halfGrid - alreadyScrolled);
    }
  }
};
function submitHighScore() {
  lastEnteredName = document.getElementById('name-entry').value.toUpperCase();
  console.info('player submitting score', player)
  saveScoreToDatabase(gameName, lastEnteredName, currentRecord.score);
}
function getScoresFromDatabase(mode, populate, check, scrollToNew) {
  axios({
    method: 'get',
    url: `https://api.eggborne.com/${gameName}/gethighscores.php`,
    headers: {
      'Content-type': 'application/x-www-form-urlencoded'
    },
    params: {
      mode: mode,
      game: gameName
    }
  }).then((response) => {
    if (response.data) {
      let newScores = [];
      response.data.split(' || ').filter(entry => entry).map(dbArr => {
        let scoreEntry = JSON.parse(dbArr);
        newScores.push({name: scoreEntry.name, score:scoreEntry.score, gameMode:scoreEntry.gameMode});
      });
      let scoreList = response.data.split(' || ')
        .filter(entry => entry)
        .map(score => {
          let parsedEntry = JSON.parse(score);
          return score = {
            name: parsedEntry.name,
            score: parsedEntry.score,
            gameMode: parsedEntry.gameMode,
            date: parsedEntry.date
          }
        });
      highScores[mode] = scoreList;
      // scoreArray = [...scoreArray, ...newScores];
      if (populate) {
        populateEntries(scrollToNew);
      }
      topScores[mode] = newScores[0].score;
      if (mode ==='story' && scoreDisplay) {
        scoreDisplay.topText.text = 'TOP-' + ('0'.repeat(6 - topScores.story.toString().length) + topScores[mode]);
      }
      if (check) {
        scoreList = scoreList.filter(scoreObj => scoreObj.gameMode === gameMode);
        let lowestIndex = scoresToDisplay - 1;
        let lowScore = 0;
        if (scoreList.length < scoresToDisplay) {
          lowScore = 0;
        } else {
          lowScore = scoreList[lowestIndex].score;
        }
        if (player.score > lowScore) {
          currentRecord.score = player.score;
          let playerRank = findRank(player.score);
          toggleNameEntry(playerRank);
          gameInitiated = false;
        } else {
          resetGame();
        }    
      }      

    } else {
      scoreList = [['void', 1212]];
    }
  });
}
function saveScoreToDatabase(gameName, playerName, playerScore) {
  currentRecord.player = playerName;
  gameOptions.playerName = playerName;
  let cookieExists = getCookie('brutalkungfu') !== undefined;
  if (cookieExists) {
    setCookie(JSON.stringify(gameOptions));
  }
  axios({
    method: 'post',
    url: `https://api.eggborne.com/${gameName}/savehighscores.php`,
    headers: {
      'Content-type': 'application/x-www-form-urlencoded'
    },
    data: {
      game: gameName,
      name: playerName,
      score: playerScore,
      gameMode: gameMode
    }
  }).then(response => {
    if (response.data) {
      resetGame();
      toggleNameEntry(); // off
      toggleHighScores(); // on
     
      getScoresFromDatabase('story', true, false, true);    
    } else {
      console.error('Could not connect to post score!');
    }
  });
}