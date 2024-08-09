const MAX_ATTEMPTS = 6;
let TARGET_WORD = '';
let attempts = 0;

async function fetchTargetWord() {
    try {
        const response = await fetch(WORDLE_API_URL);
        if (!response.ok) throw new Error('Network response was not ok.');
        const data = await response.json();
        TARGET_WORD = data.word.toUpperCase();
        if (TARGET_WORD.length !== 5) throw new Error('Received word is not 5 letters.');
    } catch (error) {
        console.error('Failed to fetch the target word:', error);
        document.getElementById('message').textContent = 'Failed to load the target word. Please try again later.';
    }
}

async function initializeGame() {
    await fetchTargetWord();
    document.getElementById('submit-guess').addEventListener('click', handleGuess);
    document.getElementById('guess-input').addEventListener('keydown', (event) => {
        if (event.key === 'Enter') {
            event.preventDefault();
            handleGuess();
        }
    });
}


function handleGuess() {
    const guess = document.getElementById('guess-input').value.toUpperCase();
    if (guess.length !== 5) {
        alert('Guess must be 5 letters!');
        return;
    }

    attempts++;
    checkGuess(guess);

    if (guess === TARGET_WORD) {
        document.getElementById('message').textContent = 'Congratulations! You guessed the word!';
        document.getElementById('submit-guess').disabled = true;
    } else if (attempts >= MAX_ATTEMPTS) {
        document.getElementById('message').textContent = `Sorry, you've used all attempts. The word was ${TARGET_WORD}.`;
        document.getElementById('submit-guess').disabled = true;
    }

    document.getElementById('guess-input').value = '';
}


function checkGuess(guess) {
    const wordGrid = document.getElementById('word-grid');
    const guessRow = document.createElement('div');
    guessRow.classList.add('guess-row');

    for (let i = 0; i < 5; i++) {
        const letterCell = document.createElement('div');
        letterCell.classList.add('guess-cell');
        letterCell.textContent = guess[i];

        if (guess[i] === TARGET_WORD[i]) {
            letterCell.style.backgroundColor = 'green';
        } else if (TARGET_WORD.includes(guess[i])) {
            letterCell.style.backgroundColor = 'yellow';
        } else {
            letterCell.style.backgroundColor = 'gray';
        }

        guessRow.appendChild(letterCell);
    }

    wordGrid.appendChild(guessRow);
}


initializeGame();

