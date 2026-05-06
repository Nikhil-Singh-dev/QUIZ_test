// ==================== RESULTS PAGE FUNCTIONALITY ====================

if (!isLoggedIn()) {
    redirectToLogin();
}

let lastResult = null;
let quizData = null;

// Initialize results page
async function initializeResults() {
    try {
        initSite();

        const sessionResult = sessionStorage.getItem('lastResult');
        const resultId = sessionStorage.getItem('resultId');
        const currentQuizId = sessionStorage.getItem('currentQuizId');

        if (sessionResult) {
            lastResult = JSON.parse(sessionResult);
        } else if (resultId) {
            lastResult = await results.getById(resultId);
        }

        if (!lastResult) {
            throw new Error('Result data not found');
        }

        const submittedAnswers = sessionStorage.getItem('submittedAnswers');
        const submittedQuizTitle = sessionStorage.getItem('submittedQuizTitle');

        lastResult.answers = (lastResult.answers && lastResult.answers.length > 0)
            ? lastResult.answers
            : (submittedAnswers ? JSON.parse(submittedAnswers) : []);
        lastResult.quizTitle = lastResult.quizTitle || submittedQuizTitle || sessionStorage.getItem('currentQuizTitle') || lastResult.quizTitle;

        const quizId = currentQuizId || lastResult.quizId;
        if (quizId) {
            try {
                quizData = await quizzes.getById(quizId, true);
            } catch (error) {
                console.warn('Could not fetch quiz details:', error);
            }
        }

        displayResults();
        sessionStorage.removeItem('lastResult');
        sessionStorage.removeItem('resultId');
        sessionStorage.removeItem('submittedAnswers');
        sessionStorage.removeItem('submittedQuizTitle');
    } catch (error) {
        console.error('Error initializing results:', error);
        redirectToDashboard();
    }
}

// Display results
function displayResults() {
    if (!lastResult) return;
    
    const {
        correctAnswers = 0,
        totalQuestions = 0,
        score = 0,
        timeTaken = 0,
        answers = []
    } = lastResult;
    
    // Update header
    document.getElementById('quizName').textContent = lastResult.quizTitle || sessionStorage.getItem('currentQuizTitle') || '✓ Quiz Completed Successfully!';
    
    // Update score
    document.getElementById('scoreNumber').textContent = `${score}%`;
    
    // Animate score circle
    animateScoreCircle(score, totalQuestions);
    
    // Update stats
    const incorrectAnswers = totalQuestions - correctAnswers;
    document.getElementById('correctCount').textContent = correctAnswers;
    document.getElementById('incorrectCount').textContent = incorrectAnswers;
    document.getElementById('timeTaken').textContent = formatTime(timeTaken);
    
    // Display answer review
    displayAnswerReview(answers || [], totalQuestions);
}

// Animate score circle
function animateScoreCircle(score, totalQuestions) {
    const circumference = 2 * Math.PI * 90; // radius = 90
    const offset = circumference - (score / 100) * circumference;
    
    const circle = document.getElementById('scoreCircle');
    circle.style.strokeDashoffset = offset;
    
    // Add gradient
    const svg = document.querySelector('.score-circle');
    if (!svg.querySelector('defs')) {
        const defs = document.createElementNS('http://www.w3.org/2000/svg', 'defs');
        const gradient = document.createElementNS('http://www.w3.org/2000/svg', 'linearGradient');
        gradient.setAttribute('id', 'scoreGradient');
        gradient.setAttribute('x1', '0%');
        gradient.setAttribute('y1', '0%');
        gradient.setAttribute('x2', '100%');
        gradient.setAttribute('y2', '100%');
        
        const stop1 = document.createElementNS('http://www.w3.org/2000/svg', 'stop');
        stop1.setAttribute('offset', '0%');
        stop1.setAttribute('stop-color', '#2ECC71');
        
        const stop2 = document.createElementNS('http://www.w3.org/2000/svg', 'stop');
        stop2.setAttribute('offset', '100%');
        stop2.setAttribute('stop-color', '#27AE60');
        
        gradient.appendChild(stop1);
        gradient.appendChild(stop2);
        defs.appendChild(gradient);
        svg.appendChild(defs);
    }
}

// Display answer review
function displayAnswerReview(answers, totalQuestions) {
    const answersList = document.getElementById('answersList');
    
    if (!quizData || !quizData.questions) {
        answersList.innerHTML = '<div class="loading">Loading answer details...</div>';
        return;
    }
    
    const questions = quizData.questions || [];
    const items = [];
    
    questions.forEach((question, index) => {
        const userAnswer = answers[index] || {};
        const selectedAnswerIndex = userAnswer.selectedAnswer;
        const correctAnswerIndex = question.correctAnswer;
        const isCorrect = selectedAnswerIndex === correctAnswerIndex && selectedAnswerIndex !== -1;
        
        const selectedAnswerText = selectedAnswerIndex >= 0 && selectedAnswerIndex < question.options.length 
            ? question.options[selectedAnswerIndex] 
            : 'Not answered';
        
        const correctAnswerText = correctAnswerIndex >= 0 && correctAnswerIndex < question.options.length
            ? question.options[correctAnswerIndex]
            : 'N/A';
        
        const itemClass = isCorrect ? 'correct' : 'incorrect';
        const statusIcon = isCorrect ? '✓' : '✗';
        const statusText = isCorrect ? 'Correct' : 'Incorrect';
        
        items.push(`
            <div class="answer-item ${itemClass}">
                <span class="answer-number">${index + 1}</span>
                <div class="answer-question"><strong>Q${index + 1}:</strong> ${question.questionText}</div>
                <div class="answer-details">
                    <div class="answer-detail">
                        <div class="detail-label">Your Answer</div>
                        <div class="detail-value">${selectedAnswerText}</div>
                    </div>
                    <div class="answer-detail">
                        <div class="detail-label">Correct Answer</div>
                        <div class="detail-value">${correctAnswerText}</div>
                    </div>
                    <div class="answer-detail">
                        <div class="detail-label">Status</div>
                        <div class="detail-value detail-status">${statusIcon} ${statusText}</div>
                    </div>
                </div>
            </div>
        `);
    });
    
    answersList.innerHTML = items.join('');
}

// Go to dashboard
function goToDashboard() {
    redirectToDashboard();
}

// Retake quiz
function retakeQuiz() {
    const quizId = sessionStorage.getItem('currentQuizId');
    const quizTitle = sessionStorage.getItem('currentQuizTitle');
    
    if (quizId && quizTitle) {
        window.location.href = 'quiz.html';
    } else {
        redirectToDashboard();
    }
}

// Format time
function formatTime(seconds) {
    const minutes = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${minutes}m ${secs}s`;
}

// Initialize on page load
document.addEventListener('DOMContentLoaded', initializeResults);
