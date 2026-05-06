// ==================== QUIZ PAGE FUNCTIONALITY ====================

const token = localStorage.getItem("token");

if (!token) {
    alert("Login required");
    window.location.href = "login.html";
}
if (!isLoggedIn()) {
    redirectToLogin();
}

let currentQuizId = sessionStorage.getItem('currentQuizId');
let currentQuizTitle = sessionStorage.getItem('currentQuizTitle');
let quizQuestions = [];
let currentQuestionIndex = 0;
let userAnswers = {};
let quizStartTime = Date.now();
let timeLimit = 30 * 60; // default 30 minutes
let timerInterval = null;
let soundEnabled = true;
let audioContext = null;
let quizSubmitted = false;

function loadSoundSetting() {
    const saved = localStorage.getItem('quizSound');
    soundEnabled = saved === null ? true : saved === 'true';
    updateSoundButton();
    if (soundEnabled) {
        initAudioContext();
    }
}

async function initAudioContext() {
    if (!audioContext) {
        audioContext = new (window.AudioContext || window.webkitAudioContext)();
    }

    if (audioContext.state === 'suspended') {
        try {
            await audioContext.resume();
        } catch (error) {
            console.warn('Unable to resume audio context:', error);
        }
    }

    return audioContext;
}

function updateSoundButton() {
    const soundBtn = document.getElementById('soundToggle');
    const soundLabel = document.getElementById('soundLabel');
    if (!soundBtn || !soundLabel) return;
    soundBtn.textContent = soundEnabled ? '🔊' : '🔇';
    soundLabel.textContent = getText(soundEnabled ? 'soundOn' : 'soundOff');
}

function toggleSound() {
    soundEnabled = !soundEnabled;
    localStorage.setItem('quizSound', soundEnabled);
    updateSoundButton();
    if (soundEnabled) {
        initAudioContext();
    }
}

function playTick() {
    if (!soundEnabled) return;
    if (!audioContext) {
        audioContext = new (window.AudioContext || window.webkitAudioContext)();
    }
    if (audioContext.state === 'suspended') {
        audioContext.resume().catch((error) => console.warn('Audio resume failed:', error));
    }
    const oscillator = audioContext.createOscillator();
    const gain = audioContext.createGain();
    oscillator.type = 'square';
    oscillator.frequency.value = 880;
    gain.gain.value = 0.08;
    oscillator.connect(gain);
    gain.connect(audioContext.destination);
    oscillator.start();
    oscillator.stop(audioContext.currentTime + 0.06);
}

async function initializeQuiz() {
    initSite();
    loadSoundSetting();
    const soundToggle = document.getElementById('soundToggle');
    if (soundToggle) {
        soundToggle.addEventListener('click', toggleSound);
    }
    document.body.addEventListener('click', () => {
        if (soundEnabled) {
            initAudioContext();
        }
    }, { once: true });

    if (!currentQuizId) {
        const message = getText('loginToStart');
        alert(message);
        setTimeout(() => {
            window.location.href = 'index.html';
        }, 500);
        return;
    }

    try {
        document.getElementById('quizTitle').textContent = currentQuizTitle || getText('homeTitle');
        
        const quizData = await quizzes.getById(currentQuizId);
        currentQuizTitle = currentQuizTitle || quizData.quiz?.title || '';
        if (currentQuizTitle) {
            sessionStorage.setItem('currentQuizTitle', currentQuizTitle);
        }
        quizQuestions = quizData.questions || [];
        quizStartTime = Date.now();
        
        if (quizQuestions.length === 0) {
            alert(getText('noQuizzes'));
            redirectToDashboard();
            return;
        }

        document.getElementById('totalQuestions').textContent = quizQuestions.length;
        timeLimit = quizQuestions.length * 7;
        
        displayQuestion();
        startTimer();
    } catch (error) {
        console.error('Error loading quiz:', error);
        alert(getText('guestNotice'));
        redirectToDashboard();
    }
}

function displayQuestion() {
    const question = quizQuestions[currentQuestionIndex] || {
        questionText: getText('loadingQuestion'),
        options: [],
    };

    document.getElementById('currentQuestion').textContent = currentQuestionIndex + 1;
    document.getElementById('questionText').textContent = question.questionText;

    const optionsContainer = document.getElementById('optionsContainer');
    if (!question.options || question.options.length === 0) {
        optionsContainer.innerHTML = `<div class="loading">${getText('loadingQuestion')}</div>`;
    } else {
        optionsContainer.innerHTML = question.options.map((option, index) => `
            <div class="option ${userAnswers[currentQuestionIndex] === index ? 'selected' : ''}" onclick="selectAnswer(${index})">
                <div class="option-radio"></div>
                <span>${option}</span>
            </div>
        `).join('');
    }

    const progress = quizQuestions.length > 0 ? ((currentQuestionIndex + 1) / quizQuestions.length) * 100 : 0;
    document.getElementById('progressFill').style.width = `${progress}%`;

    document.getElementById('prevBtn').disabled = currentQuestionIndex === 0;
    document.getElementById('nextBtn').textContent = currentQuestionIndex === quizQuestions.length - 1 ? getText('submitQuiz') : getText('next');
    document.getElementById('submitBtn').textContent = getText('submitQuiz');
}

function selectAnswer(optionIndex) {
    userAnswers[currentQuestionIndex] = optionIndex;
    displayQuestion();
}

document.getElementById('prevBtn').addEventListener('click', () => {
    if (currentQuestionIndex > 0) {
        currentQuestionIndex--;
        displayQuestion();
    }
});

document.getElementById('nextBtn').addEventListener('click', () => {
    if (currentQuestionIndex < quizQuestions.length - 1) {
        currentQuestionIndex++;
        displayQuestion();
    } else {
        document.getElementById('confirmModal').style.display = 'flex';
    }
});

document.getElementById('submitBtn').addEventListener('click', () => {
    document.getElementById('confirmModal').style.display = 'flex';
});

document.getElementById('confirmSubmit').addEventListener('click', submitQuiz);

document.getElementById('cancelSubmit').addEventListener('click', () => {
    document.getElementById('confirmModal').style.display = 'none';
});

async function submitQuiz() {
    document.getElementById('confirmModal').style.display = 'none';

    try {
        const timeTaken = Math.floor((Date.now() - quizStartTime) / 1000);
        const answers = quizQuestions.map((question, index) => ({
            questionId: question._id || question.id,
            selectedAnswer: userAnswers[index] !== undefined ? userAnswers[index] : -1
        }));

        sessionStorage.setItem('submittedAnswers', JSON.stringify(answers));
        sessionStorage.setItem('submittedQuizTitle', currentQuizTitle || '');

        const response = await results.submit({
            quizId: currentQuizId,
            answers,
            timeTaken
        });

        const rawResult = response && typeof response === 'object' ? (response.result ? response.result : response) : {};
        const normalizedAnswers = Array.isArray(rawResult.answers) && rawResult.answers.length > 0
            ? rawResult.answers
            : answers;

        const resultData = {
            ...rawResult,
            quizId: rawResult.quizId || currentQuizId,
            quizTitle: rawResult.quizTitle || currentQuizTitle || sessionStorage.getItem('submittedQuizTitle') || '',
            answers: normalizedAnswers,
            totalQuestions: rawResult.totalQuestions ?? quizQuestions.length,
            correctAnswers: rawResult.correctAnswers ?? 0,
            score: rawResult.score ?? 0,
            timeTaken: rawResult.timeTaken ?? timeTaken
        };

        quizSubmitted = true;
        sessionStorage.setItem('lastResult', JSON.stringify(resultData));
        if (resultData._id) {
            sessionStorage.setItem('resultId', resultData._id);
        }

        clearInterval(timerInterval);
        setTimeout(() => {
            window.location.href = 'results.html';
        }, 300);
    } catch (error) {
        console.error('Error submitting quiz:', error);
        alert(error.message || 'Unable to submit quiz.');
    }
}

function startTimer() {
    let timeRemaining = timeLimit;
    const timerDisplay = document.getElementById('timerDisplay');

    timerInterval = setInterval(() => {
        const minutes = Math.floor(timeRemaining / 60);
        const seconds = timeRemaining % 60;

        document.getElementById('minutes').textContent = String(minutes).padStart(2, '0');
        document.getElementById('seconds').textContent = String(seconds).padStart(2, '0');

        if (timeRemaining <= 10) {
            timerDisplay.classList.add('critical');
            timerDisplay.classList.remove('warning');
        } else if (timeRemaining <= Math.ceil(timeLimit / 2)) {
            timerDisplay.classList.add('warning');
            timerDisplay.classList.remove('critical');
        }

        playTick();

        if (timeRemaining > 0) {
            timeRemaining--;
        } else {
            clearInterval(timerInterval);
            submitQuiz();
        }
    }, 1000);
}

document.addEventListener('DOMContentLoaded', initializeQuiz);

window.addEventListener('beforeunload', (e) => {
    if (timerInterval && !quizSubmitted) {
        e.preventDefault();
        e.returnValue = '';
    }
});
