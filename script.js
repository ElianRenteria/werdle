const MAX_ATTEMPTS = 6;
let TARGET_WORD = '';
let attempts = 0;
const submittedGuesses = new Set(); 

async function fetchTargetWord() {
    try {
        const response = await fetch(WORDLE_API_URL); 
        if (!response.ok) throw new Error('Network response was not ok.');
        const data = await response.json();
        TARGET_WORD = data.word.toUpperCase();
        if (TARGET_WORD.length !== 5) throw new Error('Received word is not 5 letters.');
        console.log('Target word:', TARGET_WORD);
    } catch (error) {
        console.error('Failed to fetch the target word:', error);
        showMessage('Failed to load the target word. Please try again later.', 'red');
    }
}

async function validateWord(word) {
    try {
        const response = await fetch(`${VALID_WORDLE_WORD_API_URL}?word=${word}`);
        if (!response.ok) throw new Error('Network response was not ok.');
        const data = await response.json();
        return data.isValid;
    } catch (error) {
        console.error('Failed to validate the word:', error);
        showMessage('Failed to validate the word. Please try again later.', 'red');
        return false;
    }
}

async function handleGuess() {
    const guess = document.getElementById('guess-input').value.toUpperCase();
    const messageElement = document.getElementById('message');

    if (guess.length !== 5) {
        showMessage('Guess must be 5 letters!', 'red');
        return;
    }

    if (submittedGuesses.has(guess)) {
        showMessage('You already guessed that word!', 'red');
        return;
    }

    const isValid = await validateWord(guess);
    if (!isValid) {
        showMessage('Invalid word! Please try a different word.', 'red');
        return;
    }

    submittedGuesses.add(guess); 
    attempts++;
    checkGuess(guess);

    if (guess === TARGET_WORD) {
        showMessage('Congratulations! You guessed the word!', 'green');
        document.getElementById('submit-guess').disabled = true;
        setTimeout(restartGame, 5500); 
    } else if (attempts >= MAX_ATTEMPTS) {
        showMessage(`Sorry, you've used all attempts. The word was ${TARGET_WORD}.`, 'red');
        document.getElementById('submit-guess').disabled = true;
        setTimeout(restartGame, 5500); 
    }

    document.getElementById('guess-input').value = '';
}

function showMessage(message, color) {
    const messageElement = document.getElementById('message');
    const guessInput = document.getElementById('guess-input');

    messageElement.textContent = message;
    messageElement.style.color = color; // Set the text color
    guessInput.value = ''; 

    setTimeout(() => {
        messageElement.textContent = '';
    }, 5000);
}

function createEmptyGrid() {
    const wordGrid = document.getElementById('word-grid');
    wordGrid.innerHTML = ''; 
    for (let i = 0; i < MAX_ATTEMPTS; i++) {
        const guessRow = document.createElement('div');
        guessRow.classList.add('guess-row');

        for (let j = 0; j < 5; j++) {
            const letterCell = document.createElement('div');
            letterCell.classList.add('guess-cell');
            guessRow.appendChild(letterCell);
        }

        wordGrid.appendChild(guessRow);
    }
}

function checkGuess(guess) {
    const wordGrid = document.getElementById('word-grid');
    const guessRows = wordGrid.getElementsByClassName('guess-row');
    const guessRow = guessRows[attempts - 1]; 

    for (let i = 0; i < 5; i++) {
        const letterCell = guessRow.children[i];
        letterCell.textContent = guess[i];

        if (guess[i] === TARGET_WORD[i]) {
            letterCell.style.backgroundColor = 'green';
        } else if (TARGET_WORD.includes(guess[i])) {
            letterCell.style.backgroundColor = 'yellow';
        } else {
            letterCell.style.backgroundColor = 'gray';
        }
    }
}

function restartGame() {
    attempts = 0;
    submittedGuesses.clear(); 
    createEmptyGrid();
    fetchTargetWord().then(() => {
        document.getElementById('submit-guess').disabled = false;
    });
}

function initializeGame() {
    createEmptyGrid();
    fetchTargetWord().then(() => {
        document.getElementById('submit-guess').addEventListener('click', handleGuess);
        document.getElementById('guess-input').addEventListener('keydown', (event) => {
            if (event.key === 'Enter') {
                event.preventDefault();
                handleGuess();
            }
        });
    });
}

initializeGame();

