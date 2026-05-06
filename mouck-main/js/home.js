// ==================== UPDATE NAVBAR BASED ON LOGIN STATE ====================

function updateNavbar() {
    const authControls = document.getElementById('authControls');
    if (!authControls) return;

    const isLogged = Auth.isLoggedIn();
    const user = Auth.getUser();

    if (isLogged && user) {
        // Show dashboard, profile button, logout button
        authControls.innerHTML = `
            <a href="dashboard.html" class="btn-secondary">🏠 Dashboard</a>
            <button id="profileBtn" class="btn-secondary">👤 Profile</button>
            <button id="logoutBtn" class="btn-secondary">🚪 Logout</button>
        `;

        // Add event listeners
        setTimeout(() => {
            document.getElementById('profileBtn').addEventListener('click', () => {
                sessionStorage.setItem('viewUserId', user.id);
                window.location.href = 'user-profile.html';
            });
            document.getElementById('logoutBtn').addEventListener('click', () => {
                Auth.logout();
                updateNavbar();
                loadHomeQuizzes(); // Refresh quiz buttons
            });
        }, 100);
    } else {
        // Show login/signup button
        authControls.innerHTML = `
            <a href="login.html" class="btn-primary">Login / Signup</a>
        `;
    }
}

// ==================== LOAD HOME QUIZZES ====================

async function loadHomeQuizzes() {
    const grid = document.getElementById('quizzesGrid');

    if (!grid) {
        console.error("quizzesGrid not found in DOM");
        return;
    }

    try {
        const quizList = await quizzes.getAll();
       const isLogged = Auth.isLoggedIn();

        if (!quizList || quizList.length === 0) {
            grid.innerHTML = `<div class="loading">No quizzes available</div>`;
            return;
        }

        grid.innerHTML = quizList.slice(0, 4).map((quiz) => `
            <div class="quiz-card">
                <div class="quiz-card-header">
                    <h3>${quiz.title}</h3>
                    <span class="quiz-questions">🧠 ${quiz.totalQuestions} Questions</span>
                </div>
                <p class="quiz-description">${quiz.description}</p>
                <div class="quiz-card-footer">
                    <span class="quiz-time">⏱ ~${Math.ceil(quiz.totalQuestions * 1.5)} mins</span>
                    <button class="btn-primary quiz-btn" onclick="openQuiz('${quiz._id}')">
                        ${isLogged ? 'Start Quiz →' : 'Login to Start'}
                    </button>
                </div>
            </div>
        `).join('');

    } catch (error) {
        console.error(error);
        grid.innerHTML = `<div class="loading">Unable to load quizzes.</div>`;
    }
}

function openQuiz(quizId) {
    if (!quizId) return;

    if (!Auth.isLoggedIn()) {
        alert("Please login first");
        window.location.href = "login.html";
        return;
    }

    sessionStorage.setItem("currentQuizId", quizId);
    window.location.href = "quiz.html";
}

// ==================== INITIALIZE ====================

window.addEventListener('DOMContentLoaded', async () => {
    try {
        if (typeof initSite === "function") {
            await initSite();
        }

        updateNavbar(); // Update navbar based on login state
        await loadHomeQuizzes();
    } catch (err) {
        console.error("Init error:", err);
    }
});