// ==================== AUTH PAGE HELPERS ====================

function logout() {
    if (Auth && typeof Auth.logout === 'function') {
        Auth.logout();
    } else {
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        window.location.href = "login.html";
    }
}

// ==================== PAGE PROTECTION ====================

function protectPage() {
    const protectedPages = ["quiz.html", "dashboard.html", "results.html"];
    const currentPage = window.location.pathname.split("/").pop();

    if (protectedPages.includes(currentPage) && !isLoggedIn()) {
        window.location.href = "login.html";
    }
}

// ==================== AUTO RUN ====================

console.log("auth.js loaded");

window.onload = function () {
    console.log("Window loaded");

const currentPage = window.location.pathname.split("/").pop();

if (currentPage !== "login.html" && currentPage !== "signup.html") {
    protectPage();
}// ✅ add this

    // ================= LOGIN =================
    const loginForm = document.getElementById("loginForm");

    if (loginForm) {
        console.log("Login form found ✅");

        loginForm.addEventListener("submit", async function (e) {
            e.preventDefault();

            console.log("Login submit clicked ✅");

            const email = document.getElementById("email").value;
            const password = document.getElementById("password").value;

            const errorMessage = document.getElementById("errorMessage");
            const successMessage = document.getElementById("successMessage");

            errorMessage.style.display = "none";
            successMessage.style.display = "none";

            try {
                const res = await Auth.login(email, password);
                console.log("Login success ✅", res);

                successMessage.style.display = "block";

                setTimeout(() => {
                    window.location.href = "dashboard.html";
                }, 1000);

            } catch (err) {
                console.error("Login failed ❌", err);

                errorMessage.textContent = err.message;
                errorMessage.style.display = "block";
            }
        });
    }

    // ================= SIGNUP =================
    const signupForm = document.getElementById("signupForm");

    if (signupForm) {
        console.log("Signup form found ✅");

        signupForm.addEventListener("submit", async function (e) {
            e.preventDefault();

            const name = document.getElementById("name").value;
            const email = document.getElementById("email").value;
            const password = document.getElementById("password").value;

            const errorMessage = document.getElementById("errorMessage");
            const successMessage = document.getElementById("successMessage");

            errorMessage.style.display = "none";
            successMessage.style.display = "none";

            try {
                await Auth.signup(name, email, password);
                console.log("Signup success ✅");

                successMessage.style.display = "block";

                setTimeout(() => {
                    window.location.href = "dashboard.html";
                }, 1000);

            } catch (error) {
                console.error("Signup failed ❌", error);

                errorMessage.textContent = error.message;
                errorMessage.style.display = "block";
            }
        });
    }
};

// ================= GLOBAL =================

window.redirectToLogin = () => window.location.href = "login.html";
window.redirectToDashboard = () => window.location.href = "dashboard.html";