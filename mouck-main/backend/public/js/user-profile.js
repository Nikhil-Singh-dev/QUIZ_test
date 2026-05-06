// ==================== USER PROFILE PAGE ====================

if (!Auth.isLoggedIn()) {
    window.location.href = 'login.html';
}

async function loadUserProfile() {
    const userId = sessionStorage.getItem('viewUserId');
    if (!userId) {
        window.location.href = 'dashboard.html';
        return;
    }

    const currentUser = Auth.getUser();
    const isOwnProfile = currentUser && currentUser.id === userId;

    try {
        const data = await users.getProfile(userId);
        const { user, results } = data;

        let editButton = '';
        if (isOwnProfile) {
            editButton = '<button id="editProfileBtn" class="btn-primary">Edit Profile</button>';
        }

        document.getElementById('userProfile').innerHTML = `
            <div class="profile-header">
                <div class="profile-card">
                    <img src="${user.profilePic || '/default-avatar.png'}" alt="Profile Picture" class="profile-avatar" />
                    <div class="profile-info">
                        <div class="profile-title-row">
                            <h2>${user.name}</h2>
                            <span class="user-role-badge ${user.role === 'admin' ? 'admin-badge' : 'user-badge'}">${user.role === 'admin' ? 'Admin' : 'User'}</span>
                        </div>
                        <p class="profile-email">${user.email}</p>
                        ${user.bio ? `<p class="profile-bio">${user.bio}</p>` : ''}
                    </div>
                </div>
                ${editButton}
            </div>

            <div class="profile-stats">
                <div class="stat-card">
                    <h3>Quizzes Taken</h3>
                    <p class="stat-number">${results.length}</p>
                </div>
                <div class="stat-card">
                    <h3>Average Score</h3>
                    <p class="stat-number">${results.length > 0 ? Math.round(results.reduce((sum, r) => sum + r.score, 0) / results.length) : 0}%</p>
                </div>
                <div class="stat-card">
                    <h3>Best Score</h3>
                    <p class="stat-number">${results.length > 0 ? Math.max(...results.map(r => r.score)) : 0}%</p>
                </div>
            </div>

            <h3>Recent Quiz Results</h3>
            <div class="results-list">
                ${results.length > 0 ? results.map(result => `
                    <div class="result-item">
                        <h4>${result.quizTitle || 'Unknown Quiz'}</h4>
                        <div class="result-details">
                            <span>Score: ${result.score}%</span>
                            <span>Correct: ${result.correctAnswers}/${result.totalQuestions}</span>
                            <span>Date: ${new Date(result.completedAt).toLocaleDateString()}</span>
                        </div>
                    </div>
                `).join('') : '<p>No quiz results yet.</p>'}
            </div>
        `;

        // Add edit button event listener
        if (isOwnProfile) {
            document.getElementById('editProfileBtn').addEventListener('click', showEditProfileModal);
        }

    } catch (error) {
        console.error('Error loading profile:', error);
        document.getElementById('userProfile').innerHTML = '<p>Error loading profile</p>';
    }
}

// Edit Profile Modal
function closeEditProfileModal() {
    const modal = document.getElementById('editProfileModal');
    if (modal) {
        modal.remove();
    }
    document.body.style.overflow = '';
}

function showEditProfileModal() {
    const currentUser = Auth.getUser();
    if (!currentUser) return;
    if (document.getElementById('editProfileModal')) return;

    // Create modal HTML with file upload
    const modalHTML = `
        <div id="editProfileModal" class="modal">
            <div class="modal-content">
                <span class="close-modal" id="closeModal">&times;</span>
                <h3>Edit Profile</h3>
                <form id="editProfileForm" enctype="multipart/form-data">
                    <div class="form-group">
                        <label for="editName">Name:</label>
                        <input type="text" id="editName" value="${currentUser.name}" required>
                    </div>
                    <div class="form-group">
                        <label for="editEmail">Email:</label>
                        <input type="email" id="editEmail" value="${currentUser.email}" required>
                    </div>
                    <div class="form-group">
                        <label for="editBio">Bio:</label>
                        <textarea id="editBio" rows="3" placeholder="Tell us about yourself...">${currentUser.bio || ''}</textarea>
                    </div>
                    <div class="form-group">
                        <label for="editProfilePic">Profile Picture:</label>
                        <div class="image-upload-container">
                            <div class="current-image">
                                <img src="${currentUser.profilePic || 'https://via.placeholder.com/120?text=Avatar'}" alt="Current Profile" id="currentProfileImg" class="profile-preview">
                            </div>
                            <input type="file" id="profilePicFile" accept="image/*" style="display: none;">
                            <button type="button" id="uploadBtn" class="image-upload-button">📷 Choose Image</button>
                            <small class="upload-hint">Supported formats: JPG, PNG, GIF (Max 5MB)</small>
                        </div>
                    </div>
                    <div class="modal-actions">
                        <button type="button" id="cancelEdit" class="btn-secondary">Cancel</button>
                        <button type="submit" class="btn-primary">Save Changes</button>
                    </div>
                </form>
            </div>
        </div>
    `;

    document.body.insertAdjacentHTML('beforeend', modalHTML);
    document.body.style.overflow = 'hidden';

    // Add event listeners
    document.getElementById('closeModal').addEventListener('click', closeEditProfileModal);

    document.getElementById('cancelEdit').addEventListener('click', closeEditProfileModal);

    // Image upload functionality
    document.getElementById('uploadBtn').addEventListener('click', () => {
        document.getElementById('profilePicFile').click();
    });

    document.getElementById('profilePicFile').addEventListener('change', (e) => {
        const file = e.target.files[0];
        if (file) {
            const reader = new FileReader();
            reader.onload = (event) => {
                document.getElementById('currentProfileImg').src = event.target.result;
            };
            reader.readAsDataURL(file);
        }
    });

    document.getElementById('editProfileForm').addEventListener('submit', async (e) => {
        e.preventDefault();

        const name = document.getElementById('editName').value.trim();
        const email = document.getElementById('editEmail').value.trim();
        const bio = document.getElementById('editBio').value.trim();
        const profilePicFile = document.getElementById('profilePicFile').files[0];

        try {
            let profilePicUrl = currentUser.profilePic;

            // Upload image if selected
            if (profilePicFile) {
                const formData = new FormData();
                formData.append('profilePic', profilePicFile);

                // Use the same API_BASE from api.js (detects localhost vs production)
                const uploadResponse = await fetch(`${API_BASE}/upload/profile-picture`, {
                    method: 'POST',
                    headers: {
                        'Authorization': `Bearer ${Auth.getToken()}`
                    },
                    body: formData
                });

                if (uploadResponse.ok) {
                    const uploadData = await uploadResponse.json();
                    profilePicUrl = uploadData.imageUrl;
                } else {
                    throw new Error('Failed to upload image');
                }
            }

            // Update profile
            const response = await Auth.updateProfile({ name, email, bio, profilePic: profilePicUrl });
            const updatedUser = response.user || response;
            saveUser(updatedUser);
            closeEditProfileModal();
            alert('Profile updated successfully!');
            loadUserProfile(); // Reload profile
        } catch (error) {
            alert('Error updating profile: ' + error.message);
        }
    });
}

document.getElementById('logoutBtn').addEventListener('click', () => {
    Auth.logout();
});

document.addEventListener('DOMContentLoaded', loadUserProfile);