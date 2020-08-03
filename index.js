document.addEventListener("DOMContentLoaded", function () {
  let cardFlip = 0;
  let cardArray = [];
  const containerDiv = document.getElementsByClassName("grid-container")[0];
  const timer = document.getElementById("timer");
  const score = document.getElementById("score");
  let scoreNum = parseInt(score.innerText.split(" ")[1]);
  const gameOverPopUp = document.getElementById("game-over");
  const leaderBoardPopUp = document.getElementById("leaderboard");

  const defaultUrl =
    "https://image.freepik.com/free-vector/vector-creativity-concept-brain-light-bulb_106427-92.jpg";

  startGame();

  function startGame() {
    score.innerText = "Score: 0";
    timer.innerText = "Timer: 60";
    // fetch("http://localhost:3000/api/v1/cards")
    fetch("https://spiritualityversememorygame.herokuapp.com/api/v1/cards")
      .then((resp) => resp.json())
      .then((cards) => {
        const doubledCards = [...cards, ...cards];

        document.getElementById("loading").style.display = "none";

        function shuffle(array) {
          array.sort(() => Math.random() - 0.5);
        }

        shuffle(doubledCards);

        containerDiv.innerHTML = "";
        doubledCards.forEach((card) => {
          const littleDiv = document.createElement("div");
          const image = document.createElement("img");
          littleDiv.setAttribute("class", "grid-item");
          littleDiv.dataset.id = card.id;
          containerDiv.dataset.id = card.card_set.id;
          image.setAttribute("class", "card-image");
          image.src = defaultUrl;
          littleDiv.appendChild(image);
          containerDiv.appendChild(littleDiv);

          littleDiv.addEventListener("click", function (event) {
            if (parseInt(timer.innerText.split(" ")[1]) > 0) {
              if (cardFlip < 2) {
                event.target.src = card.imageUrl;
                if (
                  cardArray[0] !== event.target &&
                  event.target.className === "card-image"
                ) {
                  cardArray.push(event.target);
                  cardFlip++;
                }
              }
              if (cardFlip === 2) {
                cardCheck();
              }
            }
          });
        });
      });
  }

  function cardCheck() {
    if (
      cardArray[0].parentElement.dataset.id ===
      cardArray[1].parentElement.dataset.id
    ) {
      setTimeout(function () {
        cardArray[0].parentElement.innerHTML = "";
        cardArray[1].parentElement.innerHTML = "";
        cardFlip = 0;
        cardArray = [];
        updateScore();
      }, 500);
    } else {
      setTimeout(function () {
        cardArray[0].src = defaultUrl;
        cardArray[1].src = defaultUrl;
        cardFlip = 0;
        cardArray = [];
      }, 500);
    }
  }

  let counter = setInterval(decrementCounter, 1000);

  function decrementCounter() {
    let timerNum = parseInt(timer.innerText.split(" ")[1]);
    if (timerNum > 0) {
      let currentSec = timerNum - 1;
      timer.innerText = `Timer: ${currentSec}`;
    }
    if (timerNum < 1 || scoreNum === 100) {
      gameOver();
    }
  }

  function updateScore() {
    scoreNum += 10;
    score.innerText = `Score: ${scoreNum}`;
  }

  function gameOver() {
    clearInterval(counter);
    gameOverPopUp.style.display = "block";
    if (scoreNum === 100) {
      popUpGameOver("WON", "🤩");
    } else {
      popUpGameOver("LOST", "😩");
    }
  }

  function popUpGameOver(result, expression) {
    let timerNum = parseInt(timer.innerText.split(" ")[1]);
    gameOverPopUp.innerHTML = `
      <button class="close">X</button>
            <h2 id="game-over-title"><strong>YOU ${result}! ${expression} </strong> </h2>
            <h3>Your score is ${scoreNum} <br>
            Your time remaining is ${timerNum} seconds</h3>
            
            <form class="form">
            <h3>Please Enter Your Name:</h3>
            <input type="text" name="username" value="">
            &nbsp &nbsp
            <input type="submit" name="submit" value="Submit">
            </form>`;
    const xButton = document.getElementsByClassName("close")[0];
    xButton.addEventListener("click", (e) => {
      gameOverPopUp.style.display = "none";
    });

    const form = document.getElementsByClassName("form")[0];
    form.addEventListener("submit", function (event) {
      event.preventDefault();
      let name = event.target.username.value;
      let cardSetId = parseInt(containerDiv.dataset.id);

      // fetch("http://localhost:3000/api/v1/games", {
      fetch("https://spiritualityversememorygame.herokuapp.com/api/v1/games", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Accept: "application/json",
        },
        body: JSON.stringify({
          username: name,
          score: scoreNum,
          time: timerNum,
          card_set_id: cardSetId,
        }),
      }).then(() => helperFunc());
    });
  }

  function helperFunc() {
    leaderBoard();
    gameOverPopUp.innerHTML = "";
    gameOverPopUp.style.display = "none";
  }

  function leaderBoard() {
    // fetch("http://localhost:3000/api/v1/games")
    fetch("https://spiritualityversememorygame.herokuapp.com/api/v1/games")
      .then((resp) => resp.json())
      .then((games) => {
        leaderBoardPopUp.style.display = "block";

        const closeButton = document.createElement("button");
        closeButton.setAttribute("class", "close");
        closeButton.innerText = "X";
        leaderBoardPopUp.appendChild(closeButton);
        const h2 = document.createElement("h2");
        h2.setAttribute("id", "top-10");
        h2.innerText = "LEADERBOARD";
        leaderBoardPopUp.appendChild(h2);

        closeButton.addEventListener("click", function (e) {
          leaderBoardPopUp.style.display = "none";
          leaderBoardPopUp.innerHTML = "";
        });

        const ol = document.createElement("ol");
        games.forEach((game) => {
          const li = document.createElement("li");
          li.setAttribute("id", "li");
          li.innerHTML = `Score: ${
            game.score.toString().length === 3
              ? game.score
              : game.score.toString().length === 2
              ? game.score + "\xa0\xa0"
              : game.score + "\xa0\xa0\xa0\xa0"
          } &nbsp &nbsp Time: ${
            60 - game.time
          } sec &nbsp &nbsp Name: ${game.username
            .split(" ")
            .map((s) => s.charAt(0).toUpperCase() + s.slice(1).toLowerCase())
            .join(" ")}`;

          const deleteButton = document.createElement("button");
          deleteButton.setAttribute("id", "delete");
          deleteButton.innerText = "Delete";
          deleteButton.dataset.id = game.id;

          deleteButton.addEventListener("click", function (e) {
            deleteButton.parentNode.remove();
            fetch(
              `http://localhost:3000/api/v1/games/${deleteButton.dataset.id}`,
              {
                method: "DELETE",
              }
            ).then(() => {
              leaderBoardPopUp.innerHTML = "";
              leaderBoard();
            });
          });
          li.appendChild(deleteButton);

          ol.appendChild(li);
        });
        leaderBoardPopUp.appendChild(ol);
      });
  }

  const topScores = document.getElementById("top-scores");
  topScores.addEventListener("click", function (e) {
    leaderBoardPopUp.innerHTML = "";
    leaderBoard();
  });

  function restart() {
    clearInterval(counter);
    timer.innerText = "Timer: 60";
    scoreNum = 0;
    gameOverPopUp.innerHTML = "";
    gameOverPopUp.style.display = "none";
    leaderBoardPopUp.innerHTML = "";
    leaderBoardPopUp.style.display = "none";
    counter = setInterval(decrementCounter, 1000);
    startGame();
  }

  restartButton = document.getElementById("restart");
  restartButton.addEventListener("click", function (e) {
    restart();
  });
});
