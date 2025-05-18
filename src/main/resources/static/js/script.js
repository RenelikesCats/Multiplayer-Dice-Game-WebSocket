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

let websocket;


setUsernameButton.addEventListener('click', () => {
    if (usernameInput.value === '') {
        alert('Please enter a valid username');
        return
    }
    showLoggedInElements();
    websocket = new WebSocket(`ws://localhost:8080/ws-dice?username=${usernameInput.value}`);
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
                console.log(data.username + ' has joined!');
                break;
            case 'LEAVE':
                console.log(data.username + ' has left!');
                break;
        }
    }

    rollDiceButton.addEventListener('click', () => {
        websocket.send(JSON.stringify({type: "ROLL"}));
    })
}

function showLoggedInElements() {
    gameArea.style.display = 'flex';
    scoreArea.hidden = false;
    rollDiceButton.hidden = false;
    //usernameAreaDiv.hidden = true;
}