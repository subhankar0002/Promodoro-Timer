let timer;
let minutes;
let seconds = 0;
let isRunning = false;
let sessionCount = 0;
let isDarkTheme = false;

const minutesDisplay = document.getElementById('minutes');
const secondsDisplay = document.getElementById('seconds');
const startStopButton = document.getElementById('start-stop');
const resetButton = document.getElementById('reset');
const themeButton = document.getElementById('theme-btn');
const popup = document.getElementById('popup');
const closePopupButton = document.getElementById('close-popup');

const noteText = document.getElementById('note-text');
const notePriority = document.getElementById('note-priority');
const noteTime = document.getElementById('note-time');
const addNoteButton = document.getElementById('add-note');
const notesList = document.getElementById('notes-list');

const editPopup = document.getElementById('edit-popup');
const editNoteText = document.getElementById('edit-note-text');
const editNotePriority = document.getElementById('edit-note-priority');
const saveNoteButton = document.getElementById('save-note');
const closeEditPopupButton = document.getElementById('close-edit-popup');

let currentEditingNote = null;

const sessionTimeInput = document.getElementById('session-time');
const breakTimeInput = document.getElementById('break-time');
const sessionsCountInput = document.getElementById('sessions-count');

function updateDisplay() {
    minutesDisplay.textContent = String(minutes).padStart(2, '0');  
    secondsDisplay.textContent = String(seconds).padStart(2, '0');
    updateTimerColor();
}

function updateTimerColor() {
    const totalSeconds = parseInt(sessionTimeInput.value) * 60;
    const elapsedSeconds = totalSeconds - (minutes * 60 + seconds);

    if (elapsedSeconds / totalSeconds >= 0.9) {
        document.querySelector('.timer').style.color = '#dc3545';   /*doubt*/
    } else if (elapsedSeconds / totalSeconds >= 0.50) {
        document.querySelector('.timer').style.color = '#ffc107';
    } else {
        document.querySelector('.timer').style.color = '#28a745';
    }
}

function startTimer() {
    if (!isRunning) {
        isRunning = true;
        startStopButton.textContent = 'Stop';
        minutes = parseInt(sessionTimeInput.value);
        sessionCount = 0;
        runSession();
    } else {
        clearInterval(timer);     /*what is the clearInterval function ?*/
        isRunning = false;
        startStopButton.textContent = 'Start';
    }
}

function runSession() {
    sessionCount++;
    if (sessionCount > parseInt(sessionsCountInput.value)) {
        showPopup("All sessions complete! Time to rest.");
        resetTimer();
        return;              /** what will be retuen? */
    }

    timer = setInterval(() => { /**what is the setInterval */
        if (seconds === 0) {
            if (minutes === 0) {
                clearInterval(timer);
                if (sessionCount < parseInt(sessionsCountInput.value)) {
                    showPopup(`Session ${sessionCount} complete! Starting break.`);
                    minutes = parseInt(breakTimeInput.value);
                    runSession();
                } else {
                    showPopup("All sessions complete! Time to rest.");
                    resetTimer();
                }
            } else {
                minutes--;
                seconds = 59;
            }
        } else {
            seconds--;
        }
        updateDisplay();
    }, 1000);
}

function resetTimer() {
    clearInterval(timer);
    isRunning = false;
    startStopButton.textContent = 'Start';
    minutes = parseInt(sessionTimeInput.value);
    seconds = 0;
    updateDisplay();
}

function toggleTheme() {
    isDarkTheme = !isDarkTheme;
    if (isDarkTheme) {
        document.body.classList.add('dark-theme');
    } else {
        document.body.classList.remove('dark-theme');
    }
}

function showPopup(message) {
    popup.querySelector('p').textContent = message;
    popup.style.display = 'block';
}

function closePopup() {
    popup.style.display = 'none';
}

function addNote() {
    const text = noteText.value.trim();
    const priority = notePriority.value;
    const time = parseInt(noteTime.value) * 60; // Convert minutes to seconds

    if (text !== '' && !isNaN(time)) {
        const noteItem = document.createElement('li');
        noteItem.classList.add(`${priority}-priority`);
        noteItem.innerHTML = `
            <span>${text} (${priority})</span>
            <span class="note-timer" data-time="${time}">${formatTime(time)}</span>
            <div class="note-controls">
                <button class="complete-note">Complete Task</button>
                <button class="edit-note">Edit</button>
            </div>
        `;
        notesList.appendChild(noteItem);
        sortNotes(); // Sort notes after adding a new one

        const noteTimer = noteItem.querySelector('.note-timer');
        startNoteTimer(noteTimer, noteItem);

        noteItem.querySelector('.complete-note').addEventListener('click', () => {
            noteItem.remove();
        });

        noteItem.querySelector('.edit-note').addEventListener('click', () => {
            openEditPopup(noteItem, noteTimer);
        });

        noteText.value = '';
        noteTime.value = '';
    }
}

function startNoteTimer(timerElement, noteItem) {
    let remainingTime = parseInt(timerElement.getAttribute('data-time'));

    const interval = setInterval(() => {
        if (remainingTime > 0) {
            remainingTime--;
            timerElement.textContent = formatTime(remainingTime);
            timerElement.setAttribute('data-time', remainingTime);
        } else {
            clearInterval(interval);
            timerElement.textContent = 'Time\'s up!';
            showPopup(`Time's up for task: ${noteItem.querySelector('span').textContent.split(' (')[0]}!`);
        }
    }, 1000);
}

function formatTime(seconds) {
    const minutes = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${String(minutes).padStart(2, '0')}:${String(secs).padStart(2, '0')}`;
}

function openEditPopup(noteItem, noteTimer) {
    currentEditingNote = { noteItem, noteTimer };

    editNoteText.value = noteItem.querySelector('span').textContent.split(' (')[0];
    editNotePriority.value = noteItem.className.split('-')[0];

    editPopup.style.display = 'block';
}

function saveNoteChanges() {
    const { noteItem } = currentEditingNote;

    const newText = editNoteText.value.trim();
    const newPriority = editNotePriority.value;

    if (newText !== '') {
        noteItem.querySelector('span').textContent = `${newText} (${newPriority})`;
        noteItem.className = `${newPriority}-priority`;
        sortNotes(); // Sort notes after editing
        editPopup.style.display = 'none';
        currentEditingNote = null;
    }
}

function sortNotes() {
    const highPriority = [];
    const mediumPriority = [];
    const lowPriority = [];

    Array.from(notesList.children).forEach(note => {
        if (note.classList.contains('high-priority')) {
            highPriority.push(note);
        } else if (note.classList.contains('medium-priority')) {
            mediumPriority.push(note);
        } else if (note.classList.contains('low-priority')) {
            lowPriority.push(note);
        }
    });

    notesList.innerHTML = ''; // Clear current notes
    highPriority.concat(mediumPriority, lowPriority).forEach(note => {
        notesList.appendChild(note); // Re-append sorted notes
    });
}

themeButton.addEventListener('click', toggleTheme);
startStopButton.addEventListener('click', startTimer);
resetButton.addEventListener('click', resetTimer);
closePopupButton.addEventListener('click', closePopup);
addNoteButton.addEventListener('click', addNote);
saveNoteButton.addEventListener('click', saveNoteChanges);
closeEditPopupButton.addEventListener('click', () => {
    editPopup.style.display = 'none';
    currentEditingNote = null;
});
