document.addEventListener("DOMContentLoaded", function () {
  let cardFlip = 0;
  const cardArray = [];
  const containerDiv = document.getElementsByClassName("grid-container")[0];
  const score = document.getElementById("score");

  startGame();

  function startGame() {
    fetch("http://localhost:3000/api/v1/cards")
      .then((resp) => resp.json())
      .then((cards) => {
        const doubledCards = [...cards, ...cards];

        function shuffle(array) {
          array.sort(() => Math.random() - 0.5);
        }

        shuffle(doubledCards);
        let numScore = 0;
        score.innerText = `Score: ${numScore}`;

        containerDiv.innerHTML = "";
        doubledCards.forEach((card) => {
          const littleDiv = document.createElement("div");
          const image = document.createElement("img");
          littleDiv.setAttribute("class", "grid-item");
          littleDiv.dataset.id = card.id;
          containerDiv.dataset.id = card.card_set_id;
          image.setAttribute("class", "card-image");
          image.src =
            //   card.imageUrl;
            "https://image.freepik.com/free-vector/vector-creativity-concept-brain-light-bulb_106427-92.jpg";
          littleDiv.appendChild(image);
          containerDiv.appendChild(littleDiv);
        });
      });
  }
});

// let currentScore = score.innerText.split(" ")[1]
// let numScore = parseInt(currentScore)
// numScore = 0
// score.innerText = `Score: ${numScore}`
