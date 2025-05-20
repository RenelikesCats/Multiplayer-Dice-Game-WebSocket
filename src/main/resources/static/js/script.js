const usernameAreaDiv = document.getElementById('usernameAreaDiv');
const usernameInput = document.getElementById('username');
const setUsernameButton = document.getElementById('setUsername');
const scoreArea = document.getElementById('score-area');
const gameArea = document.getElementById('game-area');
const scoreYouSpan = document.getElementById('scoreYou');
const scoreOtherSpan = document.getElementById('scoreOther');
const dice1Img = document.getElementById('dice1Image');
const dice2Img = document.getElementById('dice2Image');
const diceLoadingAnimation = document.getElementsByClassName('loader-dice');
const rollDiceButton = document.getElementById('roll-dice');
const systemMsgDiv = document.getElementById("system-msg");
const winner = document.getElementById('winner');
const message = document.getElementById('message');

const colorOk = '#28a745'
const colorWarning = '#fc3939'

const URL = "ws://localhost:8080/ws-dice?username=";
const timeOutDelay = 4000;
let timeout;
let websocket;

document.addEventListener("keydown", (event) => {
    if (event.key === 'Enter') {
        setUsernameButton.click();
    }
});

setUsernameButton.addEventListener('click', () => {
    const usernameTrimmed = usernameInput.value.trim();
    const username = usernameTrimmed.charAt(0).toUpperCase() + usernameTrimmed.slice(1);
    if (!username) {
        alert('Please enter a valid username');
        return;
    }
    websocket = new WebSocket(`${URL}${username}`);
    connectWebsocket();
});

function connectWebsocket() {
    websocket.addEventListener('open', () => {
        showLoggedInElements()
    })

    websocket.onmessage = (event) => {
        const data = JSON.parse(event.data);
        switch (data.type) {
            case 'JOIN':
                clearMessageTimeout();
                message.style.color = colorOk;
                message.textContent = `${data.username} has joined!`;
                timeout = setTimeout(() => message.textContent = "", timeOutDelay)
                break;
            case 'LEAVE':
                clearMessageTimeout();
                message.style.color = colorWarning;
                message.textContent = `${data.username} has left!`;
                timeout = setTimeout(() => {
                    resetResults()
                    rollDiceButton.disabled = false;
                }, timeOutDelay)
                break;
            case 'WAIT':
                clearMessageTimeout();
                rollDiceButton.disabled = true;
                message.style.color = colorOk;
                message.innerHTML = `Waiting for other player to play...  <div class='loader'></div>`
                diceLoadingAnimation[0].hidden = true;
                diceLoadingAnimation[1].hidden = true;
                dice1Img.hidden = false;
                dice2Img.hidden = false;
                dice1Img.src = `images/${data.roll1}.png`;
                dice2Img.src = `images/${data.roll2}.png`;
                scoreYouSpan.textContent = data.roll1 + data.roll2
                break;
            case 'ROLL':
                diceLoadingAnimation[0].hidden = false;
                diceLoadingAnimation[1].hidden = false;
                dice1Img.hidden = true;
                dice2Img.hidden = true;
                break;
            case 'RESULT':
                clearMessageTimeout();
                winner.innerHTML = `Winner: <span>${data.username ? data.username : "Tie!"} </span>`
                rollDiceButton.disabled = true;
                message.style.color = colorOk;
                message.textContent = data.resultMessage;
                timeout = setTimeout(() => {
                    resetResults()
                    rollDiceButton.disabled = false;
                }, timeOutDelay)
                break;
            case 'ROLLOTHERPLAYER':
                scoreOtherSpan.textContent = data.roll1 + data.roll2;
                break;
            case 'NOTENOUGHPLAYERS':
                clearMessageTimeout();
                message.style.color = colorWarning;
                message.textContent = "Not enough players...";
                break;
            case 'LOBBYFULL':
                alert("Lobby is full!")
                break;
            default:
                console.log("Unknown message type:", data.type);
        }
    }

    websocket.addEventListener('close', () => {
        if (websocket.readyState === WebSocket.CLOSING || websocket.readyState === WebSocket.CLOSED) {
            showLoggedOffElements();
            resetResults()
        }
    });
    websocket.addEventListener('error', () => {
        alert("Connection error. Please try again later.");
        showLoggedOffElements();
        resetResults();
    });

    rollDiceButton.addEventListener('click', () => {
        websocket.send(JSON.stringify({type: "ROLL"}));


    });
}

function showLoggedInElements() {
    gameArea.style.display = 'flex';
    scoreArea.hidden = false;
    rollDiceButton.hidden = false;
    systemMsgDiv.hidden = false;
    usernameAreaDiv.hidden = true;
}

function showLoggedOffElements() {
    gameArea.style.display = 'none';
    scoreArea.hidden = true;
    rollDiceButton.hidden = true;
    systemMsgDiv.hidden = true;
    usernameAreaDiv.hidden = false;
}

function resetResults() {
    diceLoadingAnimation[0].hidden = true;
    diceLoadingAnimation[1].hidden = true;
    dice1Img.src = `images/0.png`;
    dice2Img.src = `images/0.png`;
    winner.textContent = "";
    message.textContent = "";
    message.style.color = '';
    scoreOtherSpan.textContent = "";
    scoreYouSpan.textContent = "";
}

function clearMessageTimeout() {
    if (timeout) {
        clearTimeout(timeout);
    }
}