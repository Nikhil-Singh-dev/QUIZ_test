// ==================== ADMIN QUIZ CREATION ====================

if (!isLoggedIn()) {
    redirectToLogin();
}

// Check if user is admin
async function verifyAdminAccess() {
    try {
        const user = await Auth.getProfile();
        if (!user || user.role !== 'admin') {
            alert('Access Denied: Only admins can create quizzes');
            redirectToDashboard();
            return false;
        }
        return true;
    } catch (error) {
        console.error('Error verifying admin access:', error);
        redirectToDashboard();
        return false;
    }
}

// Verify admin on page load
document.addEventListener('DOMContentLoaded', async () => {
    const isAdmin = await verifyAdminAccess();
    if (isAdmin) {
        initQuestionBuilder();
        setupEventListeners();
    }
});

const adminForm = document.getElementById('adminForm');
const questionsContainer = document.getElementById('questionsContainer');
const addQuestionBtn = document.getElementById('addQuestionBtn');
const resetFormBtn = document.getElementById('resetFormBtn');
const adminMessage = document.getElementById('adminMessage');

let questionCount = 0;
const MAX_QUESTIONS = Infinity;

// Initialize with two questions
function initQuestionBuilder() {
    questionsContainer.innerHTML = '';
    questionCount = 0;
    addQuestionBlock();
    addQuestionBlock();
}

// function setupEventListeners() {
//     // Add event listeners after admin verification
// }
function addQuestionBlock() {
    questionCount += 1;

    const questionBlock = document.createElement('div');
    questionBlock.className = 'question-block';
    questionBlock.dataset.index = questionCount;

    questionBlock.innerHTML = `
        <div class="question-header">
            <h3>Question ${questionCount}</h3>
            <button type="button" class="btn-remove" data-index="${questionCount}">Remove</button>
        </div>
        <div class="form-row">
            <label>Question Text</label>
            <textarea class="question-text" placeholder="Enter question text" required></textarea>
        </div>
        <div class="options-grid">
            <div class="form-row">
                <label>Option A</label>
                <input type="text" class="option-input" required>
            </div>
            <div class="form-row">
                <label>Option B</label>
                <input type="text" class="option-input" required>
            </div>
            <div class="form-row">
                <label>Option C</label>
                <input type="text" class="option-input" required>
            </div>
            <div class="form-row">
                <label>Option D</label>
                <input type="text" class="option-input" required>
            </div>
        </div>
        <div class="form-row">
            <label>Correct Answer</label>
            <select class="correct-answer">
                <option value="0">Option A</option>
                <option value="1">Option B</option>
                <option value="2">Option C</option>
                <option value="3">Option D</option>
            </select>
        </div>
    `;

    questionsContainer.appendChild(questionBlock);
    updateQuestionHeaders();
}

function removeQuestionBlock(index) {
    const block = questionsContainer.querySelector(`.question-block[data-index='${index}']`);
    if (!block) return;
    block.remove();
    questionCount -= 1;
    updateQuestionHeaders();
}

function updateQuestionHeaders() {
    const blocks = Array.from(questionsContainer.querySelectorAll('.question-block'));
    blocks.forEach((block, index) => {
        block.dataset.index = index + 1;
        block.querySelector('.question-header h3').textContent = `Question ${index + 1}`;
        block.querySelector('.btn-remove').dataset.index = index + 1;
    });
}

function showAdminMessage(message, type = 'success') {
    adminMessage.textContent = message;
    adminMessage.className = `admin-message ${type}`;
}

function clearAdminMessage() {
    adminMessage.textContent = '';
    adminMessage.className = 'admin-message';
}

function collectQuizData() {
    const title = document.getElementById('quizTitle').value.trim();
    const description = document.getElementById('quizDescription').value.trim();
    const questionBlocks = Array.from(questionsContainer.querySelectorAll('.question-block'));

    if (!title) {
        throw new Error('Quiz title is required.');
    }

    if (questionBlocks.length === 0) {
        throw new Error('Add at least one question.');
    }

    const questions = questionBlocks.map((block, index) => {
        const questionText = block.querySelector('.question-text').value.trim();
        const options = Array.from(block.querySelectorAll('.option-input')).map(input => input.value.trim());
        const correctAnswer = parseInt(block.querySelector('.correct-answer').value, 10);

        if (!questionText) {
            throw new Error(`Question ${index + 1} text is required.`);
        }

        if (options.some(option => !option)) {
            throw new Error(`All options are required for question ${index + 1}.`);
        }

        return {
            questionText,
            options,
            correctAnswer
        };
    });

    return { title, description, questions };
}

function setupEventListeners() {
    // Form submission
    adminForm.addEventListener('submit', async (event) => {
        event.preventDefault();
        clearAdminMessage();

        try {
            const quizData = collectQuizData();
            await admin.createQuiz(quizData.title, quizData.description, quizData.questions);
            showAdminMessage('Quiz created successfully! You can refresh dashboard to see it.', 'success');
            adminForm.reset();
            initQuestionBuilder();
        } catch (error) {
            showAdminMessage(error.message || 'Failed to create quiz.', 'error');
        }
    });

    addQuestionBtn.addEventListener('click', () => {
        addQuestionBlock();
        clearAdminMessage();
    });

    resetFormBtn.addEventListener('click', () => {
        adminForm.reset();
        initQuestionBuilder();
        clearAdminMessage();
    });

    questionsContainer.addEventListener('click', (event) => {
        if (event.target.matches('.btn-remove')) {
            const index = parseInt(event.target.dataset.index, 10);
            removeQuestionBlock(index);
        }
    });

    const logoutBtn = document.getElementById('logoutBtn');
    if (logoutBtn) {
        logoutBtn.addEventListener('click', (e) => {
            e.preventDefault();
            clearAuth();
            redirectToLogin();
        });
    }
}
