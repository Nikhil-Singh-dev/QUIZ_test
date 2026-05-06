// ==================== DASHBOARD INITIALIZATION ====================

// Check authentication
if (!Auth.isLoggedIn()) {
    window.location.href = 'login.html';
}

let allQuizzes = [];
let userResults = [];

// Initialize dashboard
async function initializeDashboard() {
    try {
        initSite();

        // Get current user
        console.log('Getting user profile...');
        const user = await Auth.getProfile();
        console.log('User profile:', user);

        if (!user || !user.name) {
            console.error('User profile is invalid:', user);
            window.location.href = 'login.html';
            return;
        }

        document.getElementById('userName').textContent = user.name.split(' ')[0];
        document.getElementById('userEmail').textContent = user.email;
        saveUser(user);

        // Show admin link if admin
        const adminLink = document.querySelector('a[href="admin.html"]');
        if (adminLink) {
           // adminLink.style.display = user.role === 'admin' ? 'block' : 'none';
            adminLink.style.display = user.role === 'admin' ? 'block' : 'none';
        }

        // Load quizzes
        await loadQuizzes();
        
        // Load results
        await loadResults();
    } catch (error) {
        console.error('Error initializing dashboard:', error);
        redirectToLogin();
    }
}

// Load all quizzes
async function loadQuizzes() {
    try {
        allQuizzes = await quizzes.getAll();
        displayQuizzes();
    } catch (error) {
        console.error('Error loading quizzes:', error);
        document.getElementById('quizzesContainer').innerHTML = 
            '<div class="loading">Error loading quizzes</div>';
    }
}

// Display quizzes
function displayQuizzes() {
    const container = document.getElementById('quizzesContainer');
    
    if (allQuizzes.length === 0) {
        container.innerHTML = '<div class="loading">No quizzes available yet</div>';
        return;
    }
    
    container.innerHTML = allQuizzes.map(quiz => `
        <div class="quiz-card" onclick="startQuiz('${quiz._id}', '${quiz.title}')">
            <h3>${quiz.title}</h3>
            <p>${quiz.description || 'No description'}</p>
            <div class="quiz-meta">
                <span>📝 ${quiz.totalQuestions} Questions</span>
                <span>⏱ ~${Math.ceil(quiz.totalQuestions * 1.5)} mins</span>
            </div>
            <button class="btn-start">Start Quiz →</button>
        </div>
    `).join('');
}

// Start quiz
function startQuiz(quizId, quizTitle) {
    sessionStorage.setItem('currentQuizId', quizId);
    sessionStorage.setItem('currentQuizTitle', quizTitle);
    window.location.href = 'quiz.html';
}

// Load user results
async function loadResults() {
    try {
        userResults = await results.getAll();
        displayResults();
        updateStats();
    } catch (error) {
        console.error('Error loading results:', error);
        document.getElementById('resultsBody').innerHTML = 
            '<tr><td colspan="5" class="loading">Error loading results</td></tr>';
    }
}

// Display results
function displayResults() {
    const tbody = document.getElementById('resultsBody');
    
    if (userResults.length === 0) {
        tbody.innerHTML = '<tr><td colspan="5" class="loading">No results yet. Take a quiz to get started!</td></tr>';
        return;
    }
    
    tbody.innerHTML = userResults.slice(0, 10).map(result => `
        <tr>
            <td>${result.quizTitle}</td>
            <td>
                <strong>${result.score}%</strong>
            </td>
            <td>
                ${result.correctAnswers}/${result.totalQuestions}
            </td>
            <td>${formatDate(result.createdAt || result.completedAt)}</td>
            <td>
                <button class="btn-view" onclick="viewResult('${result._id}')">View</button>
            </td>
        </tr>
    `).join('');
}

// View result
function viewResult(resultId) {
    sessionStorage.setItem('resultId', resultId);
    window.location.href = 'results.html';
}

// Update stats
function updateStats() {
    if (userResults.length === 0) {
        document.getElementById('testsTaken').textContent = '0';
        document.getElementById('avgScore').textContent = '0%';
        document.getElementById('bestScore').textContent = '0%';
        document.getElementById('totalCorrect').textContent = '0';
        return;
    }
    
    document.getElementById('testsTaken').textContent = userResults.length;
    
    const avgScore = Math.round(
        userResults.reduce((sum, r) => sum + r.score, 0) / userResults.length
    );
    document.getElementById('avgScore').textContent = avgScore + '%';
    
    const bestScore = Math.max(...userResults.map(r => r.score));
    document.getElementById('bestScore').textContent = bestScore + '%';
    
    const totalCorrect = userResults.reduce((sum, r) => sum + r.correctAnswers, 0);
    document.getElementById('totalCorrect').textContent = totalCorrect;
}

// Logout
const logoutButton = document.getElementById('logoutBtn');
if (logoutButton) {
    logoutButton.addEventListener('click', (e) => {
        e.preventDefault();
        Auth.logout();
        window.location.href = 'login.html';
    });
}

// Profile button
const profileButton = document.getElementById('profileBtn');
if (profileButton) {
    profileButton.addEventListener('click', (e) => {
        e.preventDefault();
        const user = Auth.getUser();
        if (user) {
            sessionStorage.setItem('viewUserId', user.id || user._id);
            window.location.href = 'user-profile.html';
        }
    });
}

// Edit Profile
const editProfileBtn = document.getElementById('editProfileBtn');
const editProfileForm = document.getElementById('editProfileForm');
const cancelEditButton = document.getElementById('cancelEdit');
const closeEditModal = document.getElementById('closeEditModal');

if (editProfileBtn) {
    editProfileBtn.addEventListener('click', () => {
        const user = Auth.getUser();
        if (!user) return;
        document.getElementById('editName').value = user.name || '';
        document.getElementById('editProfilePic').value = user.profilePic || '';
        document.getElementById('editProfileModal').style.display = 'flex';
    });
}

if (closeEditModal) {
    closeEditModal.addEventListener('click', () => {
        document.getElementById('editProfileModal').style.display = 'none';
    });
}

if (editProfileForm) {
    editProfileForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        const name = document.getElementById('editName').value.trim();
        const profilePic = document.getElementById('editProfilePic').value.trim();
        try {
            const updatedUser = await Auth.updateProfile({ name, profilePic });
            saveUser(updatedUser);
            document.getElementById('userName').textContent = updatedUser.name.split(' ')[0];
            document.getElementById('editProfileModal').style.display = 'none';
            alert('Profile updated!');
        } catch (error) {
            console.error('Edit profile failed:', error);
            alert('Error updating profile. See console for details.');
        }
    });
}

if (cancelEditButton) {
    cancelEditButton.addEventListener('click', () => {
        document.getElementById('editProfileModal').style.display = 'none';
    });
}

// Helper functions
function formatDate(dateString) {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'short',
        day: 'numeric'
    });
}

// Initialize on page load
document.addEventListener('DOMContentLoaded', () => {
    initializeDashboard();

    const userSearchInput = document.getElementById('userSearch');
    const resultsDiv = document.getElementById('searchResults');

    if (userSearchInput && resultsDiv) {
        userSearchInput.addEventListener('input', async (e) => {
            const query = e.target.value.trim();

            if (query.length < 2) {
                resultsDiv.style.display = 'none';
                return;
            }

            try {
                const data = await users.search(query);
                const usersList = data.users || [];

                if (usersList.length === 0) {
                    resultsDiv.innerHTML = '<div class="search-item">No users found</div>';
                } else {
                    resultsDiv.innerHTML = usersList.map(user => {
                        const userId = user.id || user._id;
                        return `
                            <div class="search-item" onclick="viewUserProfile('${userId}')">
                                <img src="${user.profilePic || '/default-avatar.png'}" alt="${user.name}" class="search-avatar">
                                <div>
                                    <div class="search-name">${user.name}</div>
                                    <div class="search-email">${user.email}</div>
                                </div>
                            </div>
                        `;
                    }).join('');
                }

                resultsDiv.style.display = 'block';
            } catch (error) {
                console.error('Search error:', error);
                resultsDiv.innerHTML = '<div class="search-item">Error searching users</div>';
                resultsDiv.style.display = 'block';
            }
        });
    } else {
        console.warn('Dashboard search input or results container missing');
    }
});

function viewUserProfile(userId) {
    sessionStorage.setItem('viewUserId', userId);
    window.location.href = 'user-profile.html'; // Assuming a profile page
}
