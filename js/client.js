const socket = io('http://localhost:8000');

//get DOM elements in respective js variables
const form = document.getElementById('send-container');
const messageinput = document.getElementById('messageinp');
const messagecontainer = document.querySelector(".container");
const btn1 = document.getElementById("btn1");
const btn2 = document.getElementById("btn2");
const btn3 = document.getElementById("btn3");
let gamePlayArea = document.querySelector(".gamePlayArea")

var audioChat = new Audio('ting.mp3');
var audioWin = new Audio('Win.wav');
var audioLose = new Audio('Lose.wav');
var audioShoot = new Audio('Shooter.wav');



//function that will append event info to the chat container
const append = (message, position) => {

    const messageelement = document.createElement('div');
    messageelement.innerText = message;
    messageelement.classList.add('message');
    messageelement.classList.add(position);
    messagecontainer.append(messageelement);
    if (position == 'left') {

        audioChat.play();
    }

}

const name = prompt("enter your name to join");
if (name) {
    playerFormsubmit(0, name, 0, 0, 0);
}

///////////////// LEADERBOARD SECTION ///////////////////

//constructor
function player(position, name, wam, si, mr) {
    this.position = position;
    this.name = name;
    this.wam = wam;
    this.si = si;
    this.mr = mr;
}


// function to clear localstorage if it contains only one player
function clearStorage() {
    console.log("inside clearstorage()")
    localStorage.clear();
}

//function to store all values
function playerFormsubmit(positionG, nameG, wamG, siG, mrG) {
    console.log("you have submitted")
    let position = positionG;
    let name = nameG;
    let wam = wamG;
    let si = siG;
    let mr = mrG;


    let Player = new player(position, name, wam, si, mr);
    console.log(Player);





    // to store Players as an array of objects in localstorage
    let arrayPlayers = localStorage.getItem('arrayPlayers');
    if (arrayPlayers == null) {
        playersObj = [];
    }
    else {
        playersObj = JSON.parse(arrayPlayers);
    }

    playersObj.push(Player);
    localStorage.setItem('arrayPlayers', JSON.stringify(playersObj));

    showPlayers();

}

// update values in Leaderboard
function updateWin(game, nameWon) {

    let arrayPlayers = localStorage.getItem('arrayPlayers');
    if (arrayPlayers == null) {
        playersObj = [];
    }
    else {
        playersObj = JSON.parse(arrayPlayers);
    }

    playersObj.forEach(function (element, index) {
        if (element.name == nameWon) {
            if (game == "mr") {
                element.mr += 1;
            }
            else if (game == "si") {
                element.si += 1;
            }
            else if (game == "wam") {
                element.wam += 1;
            }
            localStorage.setItem('arrayPlayers', JSON.stringify(playersObj));
            showPlayers();

        }

    });
    updatePosition();

}

// update leaderboard position for current winner
function updatePosition() {

    let arrayPlayers = localStorage.getItem('arrayPlayers');
    if (arrayPlayers == null) {
        playersObj = [];
    }
    else {
        playersObj = JSON.parse(arrayPlayers);
    }

    playersObj.forEach(function (element, index) {
        element.position = (element.wam + element.si + element.mr)

        localStorage.setItem('arrayPlayers', JSON.stringify(playersObj));

    });

    let check = 0;
    playersObj.forEach(function (element, index) {
        check = Math.max((element.position), check);


        localStorage.setItem('arrayPlayers', JSON.stringify(playersObj));

    });

    playersObj.forEach(function (element, index) {
        if (element.position == check) {
            element.position = "Winning";
        }
        else {
            element.position = "Trying"
        }

        localStorage.setItem('arrayPlayers', JSON.stringify(playersObj));
    });



    let tempEle;
    playersObj.forEach(function (element, index) {
        if (element.position == "Winning") {
            tempEle = playersObj[index];
            playersObj[index] = playersObj[0];
            playersObj[0] = tempEle;
        }

        localStorage.setItem('arrayPlayers', JSON.stringify(playersObj));
    });

    showPlayers();

}

// function to delete player
function deletePlayer(indexName) {
    let arrayPlayers = localStorage.getItem('arrayPlayers');
    if (arrayPlayers == null) {

        playersObj = [];
    }

    else {
        playersObj = JSON.parse(arrayPlayers);
    }


    playersObj.forEach(function (element, index) {
        if (element.name == indexName) {
            playersObj.splice(index, 1);
            localStorage.setItem('arrayPlayers', JSON.stringify(playersObj));

        }
    });

    if (playersObj.length == 1) {
        clearStorage();
    }

    showPlayers();


}

//function to show players 
function showPlayers() {
    let arrayPlayers = localStorage.getItem('arrayPlayers');
    if (arrayPlayers == null) {
        playersObj = [];
    }

    else {
        playersObj = JSON.parse(arrayPlayers);
    }
    let tableBody = document.getElementById('tablebody');
    tableBody.innerHTML = " ";
    playersObj.forEach(function (element) {


        let uistring = " ";
        uistring = `
                    <tr>
                    <td>${element.position}</td>
                    <td>${element.name}</td>
                    <td>${element.wam}</td>
                    <td>${element.si}</td>
                    <td>${element.mr}</td>
                    </tr>`
        tableBody.innerHTML += uistring;
    });
}



socket.emit('new-user-joined', name);

socket.on('user-joined', name => {
    append(`${name} joined the chat`, 'right');

    showPlayers();
})

socket.on('receive', data => {
    append(`${data.name}: ${data.message}`, 'left');
})

// when user leaves
socket.on('left', name => {
    append(`${name} left the chat`, 'right');
    deletePlayer(name);
})

form.addEventListener('submit', (e) => {
    e.preventDefault();
    const message = messageinput.value;
    append(`You : ${message}`, 'right');
    socket.emit('send', message);
    messageinput.value = '';
})

// To Broadcast Game Won By User////////
socket.on('userWinsSI', name => {
    append(`${name} : Just Won-Space Invaders`, 'right');
})

socket.on('userWinsWAM', name => {
    append(`${name} : Just Won-Whack-A-Mole`, 'right');
})

socket.on('userWinsMG', name => {
    append(`${name} : Just Won-Memory-Game`, 'right');
})

/////////////////////////// Memory Game //////////////////////
btn1.addEventListener("click", () => {

    let html = '';
    html += `<h1>Gameplay- Memo-Rise</h1>
    <ul>
        <li>1. Click On Cards To Unfold</li>
        <li>2. Remember The Positions Of Cards</li>
        <li>3. Match All The Pairs of Cards</li> 
        <li>4. You Have 4 Lives </li>  
        <li>5. Click Below to Start</li>
    </ul>
    <button id="startBtn" class="btn" onclick="memoryGameDom()">Start</button> `;

    gamePlayArea.innerHTML = html;

})

function memoryGameDom() {

    let html = " ";
    html += `
    <h3>Score:<span id="result"></span></h3>
    <h3>Lives-Left: <span id="lives"></span></h3>
    <div class="gridMemoryGame">
    </div>`

    gamePlayArea.innerHTML = html;
    memoryGameMaster();
}

function memoryGameMaster() {

    //card options
    const cardArray = [
        {
            name: 'fries',
            img: '../images/fries.png'
        },
        {
            name: 'cheeseburger',
            img: '../images/cheeseburger.png'
        },
        {
            name: 'ice-cream',
            img: '../images/ice-cream.png'
        },
        {
            name: 'pizza',
            img: '../images/pizza.png'
        },
        {
            name: 'milkshake',
            img: '../images/milkshake.png'
        },
        {
            name: 'hotdog',
            img: '../images/hotdog.png'
        },
        {
            name: 'fries',
            img: '../images/fries.png'
        },
        {
            name: 'cheeseburger',
            img: '../images/cheeseburger.png'
        },
        {
            name: 'ice-cream',
            img: '../images/ice-cream.png'
        },
        {
            name: 'pizza',
            img: '../images/pizza.png'
        },
        {
            name: 'milkshake',
            img: '../images/milkshake.png'
        },
        {
            name: 'hotdog',
            img: '../images/hotdog.png'
        }
    ]

    cardArray.sort(() => 0.5 - Math.random())

    const grid = document.querySelector('.gridMemoryGame')
    const resultDisplay = document.querySelector('#result')
    const livesLeftDisplay = document.querySelector('#lives')
    let cardsChosen = []
    let cardsChosenId = []
    let cardsWon = []
    let lives = 4;

    //create your board
    function createBoard() {
        for (let i = 0; i < cardArray.length; i++) {
            const card = document.createElement('img')
            card.setAttribute('src', 'images/blank.png')
            card.setAttribute('data-id', i)
            card.addEventListener('click', flipCard)
            grid.appendChild(card)
        }
    }

    //check for matches
    function checkForMatch() {
        const cards = document.querySelectorAll('img')
        const optionOneId = cardsChosenId[0]
        const optionTwoId = cardsChosenId[1]

        if (optionOneId == optionTwoId) {
            cards[optionOneId].setAttribute('src', 'images/blank.png')
            cards[optionTwoId].setAttribute('src', 'images/blank.png')
            alert('You have clicked the same image!')
        }
        else if (cardsChosen[0] === cardsChosen[1]) {
            alert('You found a match')
            cards[optionOneId].setAttribute('src', 'images/white.png')
            cards[optionTwoId].setAttribute('src', 'images/white.png')
            cards[optionOneId].removeEventListener('click', flipCard)
            cards[optionTwoId].removeEventListener('click', flipCard)
            cardsWon.push(cardsChosen)
        } else {
            cards[optionOneId].setAttribute('src', 'images/blank.png')
            cards[optionTwoId].setAttribute('src', 'images/blank.png')
            alert('Sorry, try again')
            lives--;
        }
        cardsChosen = []
        cardsChosenId = []
        resultDisplay.textContent = cardsWon.length;
        livesLeftDisplay.textContent = lives;

        if (lives === 0) {
            audioLose.play();
            grid.textContent = 'Sorry! You Lose! All Lives Over!';
        }

        if (cardsWon.length === cardArray.length / 2) {
            audioWin.play();
            resultDisplay.textContent = 'Congratulations! You found them all!';
            socket.emit('user-wins-MG', name);
            updateWin("mr", name);
        }
    }

    //flip your card
    function flipCard() {
        let cardId = this.getAttribute('data-id')
        cardsChosen.push(cardArray[cardId].name)
        cardsChosenId.push(cardId)
        this.setAttribute('src', cardArray[cardId].img)
        if (cardsChosen.length === 2) {
            setTimeout(checkForMatch, 500)
        }
    }

    createBoard();

}


/////////////////////////// Space Invaders ////////////////////
btn2.addEventListener("click", () => {

    let html = '';
    html += `<h1>Gameplay- Space Invaders</h1>
    <ul>
        <li>1. Press 'W' to Shoot at Alien Invaders</li>
        <li>2. Use Left and Right Arrow Keys for Moving Shooter</li>
        <li>3. See Your Current Score Above</li> 
        <li>4. You Lose if Any Invader Reaches the Base or Shooter</li>  
        <li>5. Click Below to Start</li>
    </ul>
    <button id="startBtn" class="btn" onclick="spaceInvadersDom()">Start</button> `;

    gamePlayArea.innerHTML = html;

})

function spaceInvadersDom() {
    let html = '';
    html += `    <h2 id="score">score <span id= "result"></span></h2>
    <div class='grid' >
        <!-- 15 x 15 =225 divs -->
        
        <div></div>
        <div></div>
        <div></div>
        <div></div>
        <div></div>
        <div></div>
        <div></div>
        <div></div>
        <div></div>
        <div></div>
        <div></div>
        <div></div>
        <div></div>
        <div></div>
        <div></div>
        <div></div>
        <div></div>
        <div></div>
        <div></div>
        <div></div>
        <div></div>
        <div></div>
        <div></div>
        <div></div>
        <div></div>
        <div></div>
        <div></div>
        <div></div>
        <div></div>
        <div></div>
        <div></div>
        <div></div>
        <div></div>
        <div></div>
        <div></div>
        <div></div>
        <div></div>
        <div></div>
        <div></div>
        <div></div>
        <div></div>
        <div></div>
        <div></div>
        <div></div>
        <div></div>
        <div></div>
        <div></div>
        <div></div>
        <div></div>
        <div></div>
        <div></div>
        <div></div>
        <div></div>
        <div></div>
        <div></div>
        <div></div>
        <div></div>
        <div></div>
        <div></div>
        <div></div>
        <div></div>
        <div></div>
        <div></div>
        <div></div>
        <div></div>
        <div></div>
        <div></div>
        <div></div>
        <div></div>
        <div></div>
        <div></div>
        <div></div>
        <div></div>
        <div></div>
        <div></div>
        <div></div>
        <div></div>
        <div></div>
        <div></div>
        <div></div>
        <div></div>
        <div></div>
        <div></div>
        <div></div>
        <div></div>
        <div></div>
        <div></div>
        <div></div>
        <div></div>
        <div></div>
        <div></div>
        <div></div>
        <div></div>
        <div></div>
        <div></div>
        <div></div>
        <div></div>
        <div></div>
        <div></div>
        <div></div>
        <div></div>
        <div></div>
        <div></div>
        <div></div>
        <div></div>
        <div></div>
        <div></div>
        <div></div>
        <div></div>
        <div></div>
        <div></div>
        <div></div>
        <div></div>
        <div></div>
        <div></div>
        <div></div>
        <div></div>
        <div></div>
        <div></div>
        <div></div>
        <div></div>
        <div></div>
        <div></div>
        <div></div>
        <div></div>
        <div></div>
        <div></div>
        <div></div>
        <div></div>
        <div></div>
        <div></div>
        <div></div>
        <div></div>
        <div></div>
        <div></div>
        <div></div>
        <div></div>
        <div></div>
        <div></div>
        <div></div>
        <div></div>
        <div></div>
        <div></div>
        <div></div>
        <div></div>
        <div></div>
        <div></div>
        <div></div>
        <div></div>
        <div></div>
        <div></div>
        <div></div>
        <div></div>
        <div></div>
        <div></div>
        <div></div>
        <div></div>
        <div></div>
        <div></div>
        <div></div>
        <div></div>
        <div></div>
        <div></div>
        <div></div>
        <div></div>
        <div></div>
        <div></div>
        <div></div>
        <div></div>
        <div></div>
        <div></div>
        <div></div>
        <div></div>
        <div></div>
        <div></div>
        <div></div>
        <div></div>
        <div></div>
        <div></div>
        <div></div>
        <div></div>
        <div></div>
        <div></div>
        <div></div>
        <div></div>
        <div></div>
        <div></div>
        <div></div>
        <div></div>
        <div></div>
        <div></div>
        <div></div>
        <div></div>
        <div></div>
        <div></div>
        <div></div>
        <div></div>
        <div></div>
        <div></div>
        <div></div>
        <div></div>
        <div></div>
        <div></div>
        <div></div>
        <div></div>
        <div></div>
        <div></div>
        <div></div>
        <div></div>
        <div></div>
        <div></div>
        <div></div>
        <div></div>
        <div></div>
        <div></div>
        <div></div>
        <div></div>
        <div></div>
        <div></div>
        <div></div>
        <div></div>
        <div></div>
        <div></div>
        <div></div>
        <div></div>
    </div>`

    gamePlayArea.innerHTML = html;
    spaceInvaders();

}

function spaceInvaders() {

    const squares = document.querySelectorAll('.grid div')
    const resultDisplay = document.querySelector('#result')
    let width = 15;
    let currentShooterIndex = 202;
    let currentInvaderIndex = 0;
    let alienInvadersTakenDown = [];
    let result = 0;
    let direction = 1;
    let invaderId;

    //define alien invaders
    const alienInvaders = [
        0, 1, 2, 3, 4, 5, 6, 7, 8, 9,
        15, 16, 17, 18, 19, 20, 21, 22, 23, 24,
        30, 31, 32, 33, 34, 35, 36, 37, 38, 39
    ]

    //draw the alien invaders
    alienInvaders.forEach(invader => squares[currentInvaderIndex + invader].classList.add('invader'))

    //draw shooter
    squares[currentShooterIndex].classList.add('shooter')


    function moveShooter(e) {
        squares[currentShooterIndex].classList.remove('shooter')
        switch (e.keyCode) {
            case 37:
                if (currentShooterIndex % width !== 0) currentShooterIndex -= 1
                break
            case 39:
                if (currentShooterIndex % width < width - 1) currentShooterIndex += 1
                break
        }
        squares[currentShooterIndex].classList.add('shooter')
    }


    document.addEventListener('keydown', moveShooter);


    // move the alien invaders
    function moveInvaders() {
        const leftEdge = alienInvaders[0] % width === 0;
        const rightEdge = alienInvaders[alienInvaders.length - 1] % width === width - 1;
        
        if ((leftEdge && direction === -1) || (rightEdge && direction === 1)) {
            direction = width
        } else if (direction === width) {
            if (leftEdge) direction = 1
            else direction = -1
        }
        for (let i = 0; i <= alienInvaders.length - 1; i++) {
            squares[alienInvaders[i]].classList.remove('invader')
        }
        for (let i = 0; i <= alienInvaders.length - 1; i++) {
            alienInvaders[i] += direction
        }
        for (let i = 0; i <= alienInvaders.length - 1; i++) {
            //ADD IF LATER
            if (!alienInvadersTakenDown.includes(i)) {
                squares[alienInvaders[i]].classList.add('invader')
            }
        }

        //decide a game over
        //if alien invaders touch our shooter
        if (squares[currentShooterIndex].classList.contains('invader', 'shooter')) {
            resultDisplay.textContent = 'Game Over';
            audioLose.play();

            squares[currentShooterIndex].classList.add('boom');
            clearInterval(invaderId);
        }

        //if any of the aliens miss the shooter but are in the last 15 squares of the grid
        for (let i = 0; i < alienInvaders.length - 1; i++) {
            if (alienInvaders[i] > (squares.length - (width - 1))) {
                resultDisplay.textContent = 'Game Over';
                audioLose.play();

                clearInterval(invaderId);
            }
        }

        //decide the win
        if (alienInvadersTakenDown.length === alienInvaders.length) {
            resultDisplay.textContent = "YOU WIN";
            audioWin.play();

            socket.emit('user-wins-SI', name);
            clearInterval(invaderId);
            updateWin("si", name);

        }
    }
    invaderId = setInterval(moveInvaders, 180)

    // shoot at aliens
    function shoot(e) {
        let laserId
        let currentLaserIndex = currentShooterIndex;
        //move the laser from the shooter to the alien Invader
        function moveLaser() {
            squares[currentLaserIndex].classList.remove('laser')
            currentLaserIndex -= width
            squares[currentLaserIndex].classList.add('laser')

            if (squares[currentLaserIndex].classList.contains('invader')) {
                squares[currentLaserIndex].classList.remove('laser')
                squares[currentLaserIndex].classList.remove('invader')
                squares[currentLaserIndex].classList.add('boom')

                setTimeout(() => squares[currentLaserIndex].classList.remove('boom'), 250)
                clearInterval(laserId);


                const alienTakenDown = alienInvaders.indexOf(currentLaserIndex)
                alienInvadersTakenDown.push(alienTakenDown)
                result++
                resultDisplay.textContent = result
            }

            if (currentLaserIndex < width) {
                clearInterval(laserId)
                setTimeout(() => squares[currentLaserIndex].classList.remove('laser'), 100);
            }
        }

        switch (e.keyCode) {
            case 87:
                laserId = setInterval(moveLaser, 100)
                audioShoot.play();
                break
        }
    }


    document.addEventListener('keyup', shoot);
}


////////////////// Whack a Mole ////////////////////
btn3.addEventListener("click", () => {

    let html = '';
    html += `<h1>Gameplay- Whack-A-Mole</h1>
    <ul>
        <li>1. Click To Whack The Mole</li>
        <li>2. You Have 60 Seconds to Whack!</li>
        <li>3. Timer Is Shown Above</li> 
        <li>4. The More Times You Whack You Score More </li>  
        <li>5. Click Below to Start</li>
    </ul>
    <button id="startBtn" class="btn" onclick="whackAMoleDom()">Start</button> `;

    gamePlayArea.innerHTML = html;

})

function whackAMoleDom() {
    let html = " ";
    html += `
 
    <h3>Your score:<span id="scoreHit"></span> Seconds left:<span id="time-left">60</span></h3>

    

  <div class="gridWhack">
    <div class="square" id="1"></div>
    <div class="square" id="2"></div>
    <div class="square" id="3"></div>
    <div class="square" id="4"></div>
    <div class="square" id="5"></div>
    <div class="square" id="6"></div>
    <div class="square" id="7"></div>
    <div class="square" id="8"></div>
    <div class="square" id="9"></div>
  </div>`;

    gamePlayArea.innerHTML = html;
    whackAMole();
}

function whackAMole() {

    const gridWhack = document.querySelector(".gridWhack")
    const square = document.querySelectorAll('.square')
    const mole = document.querySelectorAll('.mole')
    const timeLeft = document.querySelector('#time-left')
    let score = document.querySelector('#scoreHit')

    let result = 0
    let currentTime = timeLeft.textContent

    function randomSquare() {
        square.forEach(className => {
            className.classList.remove('mole')
        })
        let randomPosition = square[Math.floor(Math.random() * 9)]
        randomPosition.classList.add('mole')

        //assign the id of the randomPosition to hitPosition for us to use later
        hitPosition = randomPosition.id
    }

    square.forEach(id => {
        id.addEventListener('mouseup', () => {
            if (id.id === hitPosition) {
                result = result + 1
                score.textContent = result
                hitPosition = null
            }
        })
    })


    function moveMole() {
        let timerId = null
        timerId = setInterval(randomSquare, 600)
    }

    moveMole()


    function countDown() {
        currentTime--
        timeLeft.textContent = currentTime

        if (currentTime === 0) {
            clearInterval(timerId)
            gridWhack.textContent = `GAME OVER! Your final score is :  ${result}`;
            socket.emit('user-wins-WAM', name);
            updateWin("wam", name);

        }
    }

    let timerId = setInterval(countDown, 1000)

}

setInterval(() => {
    updatePosition();

}, 10000);