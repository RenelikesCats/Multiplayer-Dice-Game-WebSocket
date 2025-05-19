const usernameAreaDiv = document.getElementById('usernameAreaDiv');
const usernameInput = document.getElementById('username');
const setUsernameButton = document.getElementById('setUsername');
const scoreArea = document.getElementById('score-area');
const gameArea = document.getElementById('game-area');
const scoreYouSpan = document.getElementById('scoreYou');
const scoreOtherSpan = document.getElementById('scoreOther');
const dice1Img = document.getElementById('dice1Image');
const dice2Img = document.getElementById('dice2Image');
const rollDiceButton = document.getElementById('roll-dice');
const systemMsgDiv = document.getElementById("system-msg");
const winner = document.getElementById('winner');
const message = document.getElementById('message');

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
                message.textContent = `${data.username} has joined!`;
                clearMessageTimeout();
                timeout = setTimeout(() => message.textContent = "", timeOutDelay)
                break;
            case 'LEAVE':
                message.textContent = `${data.username} has left!`;
                clearMessageTimeout();
                timeout = setTimeout(() => {
                    resetResults()
                    rollDiceButton.disabled = false;
                }, timeOutDelay)
                break;
            case 'WAIT':
                rollDiceButton.disabled = true;
                message.textContent = "Waiting for other player to play...";
                clearMessageTimeout();
                break;
            case 'ROLL':
                dice1Img.src = `images/${data.roll1}.png`;
                dice2Img.src = `images/${data.roll2}.png`;
                scoreYouSpan.textContent = data.roll1 + data.roll2
                break;
            case 'RESULT':
                rollDiceButton.disabled = true;
                data.username ? winner.textContent = data.username : winner.textContent = "Tie!";
                message.textContent = data.resultMessage;
                clearMessageTimeout();
                timeout = setTimeout(() => {
                    resetResults()
                    rollDiceButton.disabled = false;
                }, timeOutDelay)
                break;
            case 'ROLLOTHERPLAYER':
                scoreOtherSpan.textContent = data.roll1 + data.roll2;
                break;
            case 'NOTENOUGHPLAYERS':
                message.textContent = "Not enough players...";
                clearMessageTimeout();
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
    dice1Img.src = `images/0.png`;
    dice2Img.src = `images/0.png`;
    winner.textContent = "";
    message.textContent = "";
    scoreOtherSpan.textContent = "";
    scoreYouSpan.textContent = "";
}

function clearMessageTimeout() {
    if (timeout) {
        clearTimeout(timeout);
    }
}