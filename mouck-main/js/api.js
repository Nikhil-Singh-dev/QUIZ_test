// ==================== API CONFIGURATION ====================

// const API_BASE = 'http://localhost:5000/api';
const API_BASE = 'http://localhost:5000/api';
// ==================== TOKEN STORAGE ====================
function saveToken(token) {
    if (typeof token === "string" && token.length > 10) {
        localStorage.setItem('token', token);
    }
}

function saveUser(user) {
    try {
        localStorage.setItem('user', JSON.stringify(user));
    } catch (error) {
        console.error("Error saving user:", error);
    }
}

// function getToken() {
//     try {
//         const token = localStorage.getItem('token');
//         return token && token.length > 10 ? token : null;
//     } catch {
//         return null;
//     }
// }
// function saveToken(token) {
//     localStorage.setItem('token', token);
// }

function getToken() {
    try {
        return localStorage.getItem('token');
    } catch {
        return null;
    }
}

const isLoggedIn = () => {
    const token = getToken();
    return !!token;
};

function getUser() {
    try {
        const user = localStorage.getItem('user');
        return user ? JSON.parse(user) : null;
    } catch {
        return null;
    }
}

function clearAuth() {
    try {
        localStorage.removeItem('token');
        localStorage.removeItem('user');
    } catch (error) {
        console.error("Error clearing auth:", error);
    }
}

// const isLoggedIn = () => {
//     try {
//         const token = getToken();
//         return !!token;
//     } catch {
//         return false;
//     }
// };

// ==================== API CALL ====================

async function apiCall(endpoint, method = 'GET', body = null) {
    const options = {
        method,
        headers: {
            'Content-Type': 'application/json',
        }
    };

    const token = getToken();
    if (token) {
        options.headers['Authorization'] = `Bearer ${token}`;
    }

    if (body) {
        options.body = JSON.stringify(body);
    }

    let response;

    try {
        response = await fetch(`${API_BASE}${endpoint}`, options);
    } catch (error) {
        throw new Error("Server not reachable");
    }

    const text = await response.text();
    let data = {};

    if (text) {
        try {
            data = JSON.parse(text);
        } catch {
            data = { message: 'Invalid JSON response from server' };
        }
    }

    if (!response.ok) {
        if (response.status === 401) {
            clearAuth();
            if (!window.location.pathname.endsWith('login.html') &&
                !window.location.pathname.endsWith('signup.html')) {
                window.location.href = 'login.html';
            }
        }
        throw new Error(data.message || 'API Error');
    }

    return data;
}
// ==================== AUTH ====================

const Auth = {
    async login(email, password) {
        const data = await apiCall('/auth/login', 'POST', { email, password });
        saveToken(data.token);
        saveUser(data.user);
        return data;
    },

    async signup(name, email, password) {
        const data = await apiCall('/auth/signup', 'POST', { name, email, password });
        saveToken(data.token);
        saveUser(data.user);
        return data;
    },

    async getProfile() {
        const data = await apiCall('/auth/me');
        return data.user;
    },

    async updateProfile(data) {
        const response = await apiCall('/auth/profile', 'PUT', data);
        return response.user || response;
    },

    getToken,

    logout() {
        clearAuth();
        window.location.href = 'login.html';
    },

    isLoggedIn,
    getUser
};

// ==================== RESULTS ====================

const results = {
    getAll: () => apiCall('/results'),
    getById: (id) => apiCall(`/results/${id}`),
   submit: (data) => apiCall('/results/submit', 'POST', data)
};

// ==================== QUIZZES ====================

const quizzes = {
    getAll: () => apiCall('/quizzes'),
    getById: (id, includeAnswers = false) => {
        const query = includeAnswers ? '?includeAnswers=true' : '';
        return apiCall(`/quizzes/${id}${query}`);
    }
};

// ==================== ADMIN ====================

const admin = {
    createQuiz: (title, description, questions) => apiCall('/admin/quizzes', 'POST', {
        title,
        description,
        questions
    })
};

// ==================== USERS ====================

const users = {
    search: (query) => apiCall(`/users/search?q=${encodeURIComponent(query)}`),
    getProfile: (id) => apiCall(`/users/${id}`)
};

// ==================== OPEN QUIZ ====================

function openQuiz(quizId) {
    if (!quizId) return;

    if (!isLoggedIn()) {
        alert("Please login first");
        window.location.href = "login.html";
        return;
    }

    sessionStorage.setItem("currentQuizId", quizId);
    window.location.href = "quiz.html";
}

// ==================== PAGE PROTECTION ====================

function protectPage() {
    const protectedPages = ["quiz.html", "dashboard.html", "results.html", "admin.html", "user-profile.html"];
    const current = window.location.pathname.split("/").pop();

    if (protectedPages.includes(current) && !isLoggedIn()) {
        window.location.href = "login.html";
    }
}

// document.addEventListener("DOMContentLoaded", protectPage);

// ==================== GLOBAL ====================

window.Auth = Auth;
window.quizzes = quizzes;
window.admin = admin;
window.users = users;
window.openQuiz = openQuiz;
window.isLoggedIn = isLoggedIn;
window.redirectToLogin = () => { window.location.href = 'login.html'; };
window.redirectToDashboard = () => { window.location.href = 'dashboard.html'; };
window.clearAuth = clearAuth;
