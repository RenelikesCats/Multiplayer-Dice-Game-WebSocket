const usernameAreaDiv = document.getElementById('usernameAreaDiv');
const usernameInput = document.getElementById('username');
const setUsernameButton = document.getElementById('setUsername');
const scoreArea = document.getElementById('score-area');
const gameArea = document.getElementById('game-area');
const scoreYouSpan = document.getElementById('scoreYou');
const scoreOtherSpan = document.getElementById('scoreOther');
const dice1Div = document.getElementById('dice1');
const dice2Div = document.getElementById('dice2');
const rollDiceButton = document.getElementById('roll-dice');

const systemMsgDiv = document.getElementById("system-msg");
const winner = document.getElementById('winner');
const message = document.getElementById('message');
const timeOutDelay = 4000;
let websocket;

document.addEventListener("keydown", (event) => {
    if (event.key === 'Enter') {
        setUsernameButton.click();
    }
})

setUsernameButton.addEventListener('click', () => {
    const usernameTrimmed = usernameInput.value.trim();
    const username = usernameTrimmed.charAt(0).toUpperCase() + usernameTrimmed.slice(1);
    if (!username) {
        alert('Please enter a valid username');
        return;
    }
    showLoggedInElements();
    websocket = new WebSocket(`ws://localhost:8080/ws-dice?username=${username}`);
    connectWebsocket();
})

function connectWebsocket() {
    websocket.onopen = (event) => {
        console.log("WebSocket connection opened:", event);
    };

    websocket.onmessage = (event) => {
        const data = JSON.parse(event.data);
        switch (data.type) {
            case 'JOIN':
                message.textContent = `${data.username} has joined!`;
                setTimeout(() => message.textContent = "", timeOutDelay)
                break;
            case 'LEAVE':
                message.textContent = `${data.username} has left!`;
                setTimeout(() => message.textContent = "", timeOutDelay)
                break;
            case 'WAIT':
                rollDiceButton.disabled = true;
                message.textContent = "Waiting for other player to play...";
                break;
            case 'ROLL':
                dice1Div.textContent = data.roll1;
                dice2Div.textContent = data.roll2;
                scoreYouSpan.textContent = data.roll1 + data.roll2
                break;
            case 'RESULT':
                rollDiceButton.disabled = true;
                winner.textContent = data.username;
                message.textContent = data.resultMessage;
                setTimeout(() => {
                    resetResults()
                    rollDiceButton.disabled = false;
                }, timeOutDelay)
                break;
            case 'ROLLOTHERPLAYER':
                scoreOtherSpan.textContent = data.roll1 + data.roll2;
                break;
            case 'NOTENOUGHPLAYERS':
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

    rollDiceButton.addEventListener('click', () => {
        websocket.send(JSON.stringify({type: "ROLL"}));

    })
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
    dice1Div.textContent = "";
    dice2Div.textContent = "";
    winner.textContent = "";
    message.textContent = "";
    scoreOtherSpan.textContent = "";
    scoreYouSpan.textContent = "";
}
