// // ==================== FIREBASE AUTHENTICATION ====================

// // Firebase Auth Functions
// const auth = window.firebaseAuth;

// // ==================== LOGIN FUNCTIONALITY ====================

// if (document.getElementById('loginForm')) {
//     const form = document.getElementById('loginForm');
    
//     form.addEventListener('submit', async (e) => {
//         e.preventDefault();
        
//         const email = document.getElementById('email').value.trim();
//         const password = document.getElementById('password').value;
        
//         clearErrors();
        
//         if (!email || !isValidEmail(email)) {
//             showError('emailError', 'Valid email is required');
//             return;
//         }
        
//         if (!password) {
//             showError('passwordError', 'Password is required');
//             return;
//         }
        
//         try {
//             const userCredential = await window.signInWithEmailAndPassword(auth, email, password);
//             const user = userCredential.user;
            
//             // Save user data
//             saveUser({
//                 id: user.uid,
//                 name: user.displayName || user.email.split('@')[0],
//                 email: user.email
//             });
            
//             showSuccess('Login successful! Redirecting...');
            
//             setTimeout(() => {
//                 window.location.href = 'dashboard.html';
//             }, 1500);
//         } catch (error) {
//             showErrorMessage(getFirebaseErrorMessage(error.code));
//         }
//     });
// }

// // ==================== SIGNUP FUNCTIONALITY ====================

// if (document.getElementById('signupForm')) {
//     const form = document.getElementById('signupForm');
    
//     form.addEventListener('submit', async (e) => {
//         e.preventDefault();
        
//         const name = document.getElementById('name').value.trim();
//         const email = document.getElementById('email').value.trim();
//         const password = document.getElementById('password').value;
        
//         clearErrors();
        
//         if (!name) {
//             showError('nameError', 'Name is required');
//             return;
//         }
        
//         if (!email || !isValidEmail(email)) {
//             showError('emailError', 'Valid email is required');
//             return;
//         }
        
//         if (password.length < 6) {
//             showError('passwordError', 'Password must be at least 6 characters');
//             return;
//         }
        
//         try {
//             const userCredential = await window.createUserWithEmailAndPassword(auth, email, password);
//             const user = userCredential.user;
            
//             // Update display name
//             await user.updateProfile({
//                 displayName: name
//             });
            
//             // Save user data
//             saveUser({
//                 id: user.uid,
//                 name: name,
//                 email: user.email
//             });
            
//             showSuccess('Account created! Redirecting...');
            
//             setTimeout(() => {
//                 window.location.href = 'dashboard.html';
//             }, 1500);
//         } catch (error) {
//             showErrorMessage(getFirebaseErrorMessage(error.code));
//         }
//     });
// }

// // ==================== AUTH STATE LISTENER ====================

// // Check authentication state on all pages
// window.onAuthStateChanged(auth, (user) => {
//     if (user) {
//         // User is signed in
//         saveUser({
//             id: user.uid,
//             name: user.displayName || user.email.split('@')[0],
//             email: user.email
//         });
//     } else {
//         // User is signed out
//         if (window.location.pathname.includes('dashboard.html') || 
//             window.location.pathname.includes('quiz.html') || 
//             window.location.pathname.includes('results.html')) {
//             window.location.href = 'login-firebase.html';
//         }
//     }
// });

// // ==================== LOGOUT FUNCTIONALITY ====================

// function logout() {
//     window.signOut(auth).then(() => {
//         clearAuth();
//         window.location.href = 'login-firebase.html';
//     }).catch((error) => {
//         console.error('Logout error:', error);
//     });
// }

// // ==================== HELPER FUNCTIONS ====================

// function isValidEmail(email) {
//     const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
//     return emailRegex.test(email);
// }

// function getFirebaseErrorMessage(errorCode) {
//     switch (errorCode) {
//         case 'auth/user-not-found':
//             return 'No account found with this email';
//         case 'auth/wrong-password':
//             return 'Incorrect password';
//         case 'auth/email-already-in-use':
//             return 'Email already registered';
//         case 'auth/weak-password':
//             return 'Password is too weak';
//         case 'auth/invalid-email':
//             return 'Invalid email format';
//         default:
//             return 'Authentication error. Please try again.';
//     }
// }

// function showError(elementId, message) {
//     const element = document.getElementById(elementId);
//     if (element) {
//         element.textContent = message;
//         element.style.display = 'block';
//     }
// }

// function clearErrors() {
//     const errorMessages = document.querySelectorAll('.error-message');
//     errorMessages.forEach(msg => {
//         msg.style.display = 'none';
//         msg.textContent = '';
//     });
// }

// function showSuccess(message) {
//     const successElement = document.getElementById('successMessage');
//     if (successElement) {
//         successElement.textContent = message;
//         successElement.style.display = 'block';
//     }
// }

// function showErrorMessage(message) {
//     const errorElement = document.getElementById('errorMessage');
//     if (errorElement) {
//         errorElement.textContent = '❌ ' + message;
//         errorElement.style.display = 'block';
//     }
// }

// // ==================== UTILITY FUNCTIONS ====================

// function saveUser(user) {
//     localStorage.setItem('user', JSON.stringify(user));
// }

// function getUser() {
//     const user = localStorage.getItem('user');
//     return user ? JSON.parse(user) : null;
// }

// function clearAuth() {
//     localStorage.removeItem('user');
// }

// function isLoggedIn() {
//     return !!getUser();
// }
