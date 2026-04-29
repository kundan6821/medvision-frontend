// Modal functionality
const modal = document.getElementById('searchModal');
const openBtn = document.getElementById('openSearchBtn');
const closeBtn = document.querySelector('.close-modal');
const searchBtn = document.getElementById('searchBtn');
const uploadBtn = document.getElementById('uploadBtn');
const medicineInput = document.getElementById('medicineInput');
const imageInput = document.getElementById('imageInput');
const uploadArea = document.getElementById('uploadArea');
const searchResults = document.getElementById('searchResults');
const textSearchTab = document.getElementById('textSearchTab');
const imageSearchTab = document.getElementById('imageSearchTab');
const textSearchSection = document.getElementById('textSearchSection');
const imageSearchSection = document.getElementById('imageSearchSection');
const searchMethodTabs = document.querySelector('.search-method-tabs');

let selectedFile = null;

// Tab switching
textSearchTab.addEventListener('click', () => {
    textSearchTab.classList.add('active');
    imageSearchTab.classList.remove('active');
    textSearchSection.classList.add('active');
    imageSearchSection.classList.remove('active');
    searchResults.innerHTML = '';
});

imageSearchTab.addEventListener('click', () => {
    imageSearchTab.classList.add('active');
    textSearchTab.classList.remove('active');
    imageSearchSection.classList.add('active');
    textSearchSection.classList.remove('active');
    searchResults.innerHTML = '';
});

// File upload handling
uploadArea.addEventListener('click', () => {
    imageInput.click();
});

uploadArea.addEventListener('dragover', (e) => {
    e.preventDefault();
    uploadArea.classList.add('drag-over');
});

uploadArea.addEventListener('dragleave', () => {
    uploadArea.classList.remove('drag-over');
});

uploadArea.addEventListener('drop', (e) => {
    e.preventDefault();
    uploadArea.classList.remove('drag-over');
    const files = e.dataTransfer.files;
    if (files.length > 0) {
        handleFileSelect(files[0]);
    }
});

imageInput.addEventListener('change', (e) => {
    if (e.target.files.length > 0) {
        handleFileSelect(e.target.files[0]);
    }
});

function handleFileSelect(file) {
    if (!file.type.startsWith('image/')) {
        alert('Please select an image file');
        return;
    }
    
    if (file.size > 5 * 1024 * 1024) {
        alert('File size must be less than 5MB');
        return;
    }
    
    selectedFile = file;
    uploadArea.innerHTML = `
        <div class="upload-content">
            <i class="fas fa-check-circle upload-icon" style="color: #00FFFF;"></i>
            <h4 class="upload-title">File Selected</h4>
            <p class="upload-description">${file.name}</p>
            <div class="upload-specs">
                <span class="spec-item"><i class="fas fa-check"></i> Ready to analyze</span>
            </div>
        </div>
    `;
    uploadBtn.disabled = false;
}

// Upload and analyze image
uploadBtn.addEventListener('click', analyzeImage);

async function analyzeImage() {
    if (!selectedFile) {
        alert('Please select an image first');
        return;
    }
    
    const formData = new FormData();
    formData.append('image', selectedFile);
    
    // Hide upload section and tabs, then show loading
    imageSearchSection.style.display = 'none';
    searchMethodTabs.style.display = 'none';
    searchResults.innerHTML = '<div class="loading"><i class="fas fa-spinner fa-spin"></i> Analyzing image and extracting medicine name...</div>';
    uploadBtn.disabled = true;
    
    try {
        const headers = {};
        const token = localStorage.getItem('medvision_token');
        if (token) headers['Authorization'] = `Bearer ${token}`;

        const response = await fetch('/api/medicine/upload', {
            method: 'POST',
            body: formData,
            headers: headers
        });
        
        const data = await response.json();
        
        if (!response.ok) {
            throw new Error(data.message || (typeof data.error === 'string' ? data.error : 'Failed to analyze image'));
        }
        
        displayResults(data, true);
    } catch (error) {
        searchResults.innerHTML = `<div class="error"><i class="fas fa-exclamation-triangle"></i> ${error.message}</div>`;
        // Show upload section again on error
        imageSearchSection.style.display = '';
        searchMethodTabs.style.display = 'flex';
    } finally {
        uploadBtn.disabled = false;
    }
}

// Open modal
openBtn.addEventListener('click', () => {
    modal.style.display = 'block';
});

// Close modal
closeBtn.addEventListener('click', () => {
    modal.style.display = 'none';
});

// Close modal when clicking outside
window.addEventListener('click', (e) => {
    if (e.target === modal) {
        modal.style.display = 'none';
    }
});

// Search medicine
searchBtn.addEventListener('click', searchMedicine);
medicineInput.addEventListener('keypress', (e) => {
    if (e.key === 'Enter') {
        searchMedicine();
    }
});

async function searchMedicine() {
    const medicineName = medicineInput.value.trim();
    
    if (!medicineName) {
        searchResults.innerHTML = '<div class="error">Please enter a medicine name</div>';
        return;
    }
    
    // Hide search interfaces and show loading
    textSearchSection.style.display = 'none';
    searchMethodTabs.style.display = 'none';
    searchResults.innerHTML = '<div class="loading"><i class="fas fa-spinner fa-spin"></i> Searching...</div>';
    searchBtn.disabled = true;
    
    try {
        const headers = {};
        const token = localStorage.getItem('medvision_token');
        if (token) headers['Authorization'] = `Bearer ${token}`;

        const response = await fetch(`/api/medicine/search?name=${encodeURIComponent(medicineName)}`, { headers });
        const data = await response.json();
        
        if (!response.ok) {
            throw new Error(data.message || (typeof data.error === 'string' ? data.error : 'Failed to fetch medicine information'));
        }
        
        displayResults(data, false);
    } catch (error) {
        searchResults.innerHTML = `<div class="error"><i class="fas fa-exclamation-triangle"></i> ${error.message}</div>`;
        // Show search section again on error
        textSearchSection.style.display = '';
        searchMethodTabs.style.display = 'flex';
    } finally {
        searchBtn.disabled = false;
    }
}

function displayResults(data, isImageSearch = false) {
    if (data.error) {
        searchResults.innerHTML = `<div class="error">${data.message || data.error}</div>`;
        return;
    }
    
    const medicineInfo = data.medicine_info || {};
    const usageInfo = data.usage_information || {};
    const pricingInfo = data.pricing_information || {};
    const alternatives = pricingInfo.alternatives_sorted_by_price || [];
    const ocrInfo = data.ocr_info || null;
    const disclaimer = data.disclaimer || '';
    
    let html = '<div class="result-card">';
    
    // Quick Reset Button for Text Search
    if (!isImageSearch) {
        html += '<div style="padding: 15px; border-bottom: 1px solid rgba(0, 255, 255, 0.1); display: flex; justify-content: space-between; align-items: center;">';
        html += '<h3 style="margin: 0; color: #00FFFF; font-size: 16px;"><i class="fas fa-clipboard-list"></i> Search Results</h3>';
        html += '<button onclick="resetSearch()" style="padding: 8px 16px; background: rgba(0,255,255,0.2); border: 1px solid rgba(0,255,255,0.4); color: #00FFFF; border-radius: 8px; cursor: pointer; font-size: 12px; transition: all 0.3s;" onmouseover="this.style.background=\'rgba(0,255,255,0.3)\'" onmouseout="this.style.background=\'rgba(0,255,255,0.2)\'">';
        html += '<i class="fas fa-search"></i> Search Another';
        html += '</button>';
        html += '</div>';
    }
    
    // OCR Results (for image search)
    if (isImageSearch && ocrInfo) {
        html += '<div class="result-section" style="background: rgba(0, 255, 255, 0.1); border: 1px solid rgba(0, 255, 255, 0.3);">';
        html += '<div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 15px;">';
        html += '<h3 style="margin: 0;"><i class="fas fa-eye"></i> Image Analysis Results</h3>';
        html += '<button onclick="resetSearch()" style="padding: 8px 16px; background: rgba(0,255,255,0.2); border: 1px solid rgba(0,255,255,0.4); color: #00FFFF; border-radius: 8px; cursor: pointer; font-size: 12px; transition: all 0.3s;" onmouseover="this.style.background=\'rgba(0,255,255,0.3)\'" onmouseout="this.style.background=\'rgba(0,255,255,0.2)\'">';
        html += '<i class="fas fa-search"></i> Search Another';
        html += '</button>';
        html += '</div>';
        html += '<div class="info-grid">';
        html += `<div class="info-item"><div class="info-label">Detected Medicine</div><div class="info-value">${ocrInfo.detected_medicine}</div></div>`;
        html += `<div class="info-item"><div class="info-label">OCR Confidence</div><div class="info-value">${ocrInfo.confidence}%</div></div>`;
        html += '</div>';
        
        // Manual correction option if confidence is low
        if (ocrInfo.confidence < 80) {
            html += '<div style="margin-top: 15px; padding: 10px; background: rgba(255, 165, 0, 0.1); border-radius: 8px;">';
            html += '<p style="color: #FFA726; font-size: 13px; margin-bottom: 10px;"><i class="fas fa-exclamation-triangle"></i> Low confidence detected. You can correct the medicine name:</p>';
            html += '<div style="display: flex; gap: 10px;">';
            html += `<input type="text" id="correctedName" value="${ocrInfo.detected_medicine}" style="flex: 1; padding: 8px; background: rgba(255,255,255,0.1); border: 1px solid rgba(0,255,255,0.3); border-radius: 5px; color: white;">`;
            html += '<button onclick="searchCorrectedName()" style="padding: 8px 15px; background: linear-gradient(135deg, #4A90E2 0%, #00FFFF 100%); border: none; color: white; border-radius: 5px; cursor: pointer;">Search</button>';
            html += '</div>';
            html += '</div>';
        }
        
        if (ocrInfo.extracted_text) {
            html += `<p style="margin-top: 10px; font-size: 12px; color: #888;"><strong>Full extracted text:</strong> ${ocrInfo.extracted_text.substring(0, 200)}${ocrInfo.extracted_text.length > 200 ? '...' : ''}</p>`;
        }
        html += '</div>';
    }
    
    // Allergy Alert
    if (data.allergy_alert) {
        // Robust state parsing for the API boolean outputs
        let isSafe = true;
        const rawWarning = data.allergy_alert.warning;
        
        if (typeof rawWarning === 'boolean') {
            isSafe = !rawWarning; // If warning is true, it is NOT safe.
        } else if (typeof rawWarning === 'string') {
            const warnStr = rawWarning.toLowerCase().trim();
            isSafe = (warnStr === 'false' || warnStr.includes('safe to take') || warnStr === '');
        }

        const statusClass = isSafe ? 'allergy-safe' : 'allergy-danger';
        const icon = isSafe ? 'fa-shield-alt' : 'fa-skull-crossbones';
        const displayWarning = isSafe ? 'SAFE TO TAKE' : 'DANGEROUS: ALLERGY CONFLICT DETECTED';
        
        html += `<div class="allergy-alert-box ${statusClass}">`;
        html += `   <div class="allergy-icon-wrapper"><i class="fas ${icon}"></i></div>`;
        html += `   <div class="allergy-alert-content">`;
        html += `       <h3 class="allergy-alert-title"><i class="fas fa-heartbeat"></i> Allergy Analysis</h3>`;
        html += `       <p class="allergy-alert-warning">${displayWarning}</p>`;
        
        if (!isSafe && data.allergy_alert.details) {
            html += `       <p class="allergy-alert-details"><i class="fas fa-info-circle"></i> ${data.allergy_alert.details}</p>`;
        }
        
        html += `   </div>`;
        html += `</div>`;
    }
    
    // Medicine Information
    if (Object.keys(medicineInfo).length > 0) {
        html += '<div class="result-section">';
        html += '<h3><i class="fas fa-pills"></i> Medicine Information</h3>';
        html += '<div class="info-grid">';
        
        if (medicineInfo.brand_name) {
            html += `<div class="info-item"><div class="info-label">Brand Name</div><div class="info-value">${medicineInfo.brand_name}</div></div>`;
        }
        if (medicineInfo.composition) {
            html += `<div class="info-item"><div class="info-label">Composition</div><div class="info-value">${medicineInfo.composition}</div></div>`;
        }
        if (medicineInfo.strength) {
            html += `<div class="info-item"><div class="info-label">Strength</div><div class="info-value">${medicineInfo.strength}</div></div>`;
        }
        if (medicineInfo.dosage_form) {
            html += `<div class="info-item"><div class="info-label">Dosage Form</div><div class="info-value">${medicineInfo.dosage_form}</div></div>`;
        }
        
        html += '</div>';
        
        if (medicineInfo.common_uses) {
            html += `<p style="margin-top: 15px;"><strong style="color: #00FFFF;">Common Uses:</strong> ${medicineInfo.common_uses}</p>`;
        }
        if (medicineInfo.dosage_guidance) {
            html += `<p style="margin-top: 10px;"><strong style="color: #00FFFF;">Dosage Guidance:</strong> ${medicineInfo.dosage_guidance}</p>`;
        }
        
        html += '</div>';
    }
    
    // Uses
    if (usageInfo.uses && usageInfo.uses.length > 0) {
        html += '<div class="result-section">';
        html += '<h3><i class="fas fa-check-circle"></i> Common Uses</h3>';
        html += '<ul>';
        usageInfo.uses.forEach(use => {
            html += `<li>${use}</li>`;
        });
        html += '</ul>';
        html += '</div>';
    }
    
    // Safety Information
    if (usageInfo.side_effects && usageInfo.side_effects.length > 0) {
        html += '<div class="result-section">';
        html += '<h3><i class="fas fa-shield-alt"></i> Side Effects</h3>';
        html += '<ul>';
        usageInfo.side_effects.forEach(effect => {
            html += `<li>${effect}</li>`;
        });
        html += '</ul>';
        html += '</div>';
    }
    
    // Substitutes (Same Composition)
    if (alternatives.length > 0) {
        html += '<div class="result-section">';
        html += '<h3><i class="fas fa-exchange-alt"></i> Substitutes (Same Composition) - Sorted by Price</h3>';
        html += '<p style="color: #00FFFF; margin-bottom: 15px; font-size: 14px;">These medicines have the same active ingredient(s) and can be used as substitutes:</p>';
        
        // Get current medicine price for comparison
        const currentMedicine = medicineInfo.brand_name;
        const currentComposition = medicineInfo.composition;
        const currentStrength = medicineInfo.strength;
        
        html += '<div class="alternatives-list">';
        alternatives.forEach(alt => {
            const isAISuggested = alt.source === 'ai_suggested';
            const hasApproxPrice = alt.price && alt.price.includes('(approx)');
            html += `<div class="alternative-item">`;
            html += `<div>`;
            html += `<span class="alternative-name">${alt.name || 'N/A'}</span>`;
            if (alt.manufacturer && alt.manufacturer !== 'N/A') {
                html += `<span style="display: block; font-size: 12px; color: #888; margin-top: 3px;">by ${alt.manufacturer}</span>`;
            }
            if (isAISuggested) {
                html += `<span style="display: block; font-size: 11px; color: #FFA500; margin-top: 3px;">⚠ AI Suggested${hasApproxPrice ? ' - Price is approximate' : ' - Verify with pharmacist'}</span>`;
            }
            // Comparison info
            html += `<span style="display: block; font-size: 11px; color: #00FFFF; margin-top: 5px;">`;
            html += `✓ Same composition: ${currentComposition}`;
            if (alt.strength && currentStrength && alt.strength === currentStrength) {
                html += ` | ✓ Same strength: ${currentStrength}`;
            } else if (alt.strength) {
                html += ` | ⚠ Different strength: ${alt.strength}`;
            }
            html += `</span>`;
            html += `</div>`;
            html += `<span class="alternative-price">${alt.price || 'Price not available'}</span>`;
            html += `</div>`;
        });
        html += '</div>';
        html += '</div>';
    }
    
    // Price Note / Disclaimer for AI prices
    if (pricingInfo.price_note) {
        html += `<div class="result-section" style="background: rgba(255, 165, 0, 0.1); border: 1px solid rgba(255, 165, 0, 0.3); border-radius: 10px; padding: 15px; margin-top: 10px;">`;
        html += `<p style="color: #FFA726; font-size: 13px; margin: 0;"><i class="fas fa-info-circle"></i> ${pricingInfo.price_note}</p>`;
        html += '</div>';
    }
    
    // Disclaimer
    if (disclaimer) {
        html += `<div class="disclaimer"><p><i class="fas fa-info-circle"></i> ${disclaimer}</p></div>`;
    }
    
    html += '</div>';
    
    searchResults.innerHTML = html;
}

// Function to reset search interface
window.resetSearch = function() {
    // Clear results
    searchResults.innerHTML = '';
    
    // Show search sections again
    textSearchSection.style.display = '';
    imageSearchSection.style.display = '';
    searchMethodTabs.style.display = 'flex';
    
    // Reset text search
    medicineInput.value = '';
    searchBtn.disabled = false;
    
    // Reset image search
    selectedFile = null;
    uploadBtn.disabled = true;
    uploadArea.innerHTML = `
        <div class="upload-content">
            <i class="fas fa-cloud-upload-alt upload-icon"></i>
            <h4 class="upload-title">Upload Medicine Image</h4>
            <p class="upload-description">Click to browse or drag & drop your image here</p>
            <div class="upload-specs">
                <span class="spec-item"><i class="fas fa-check"></i> JPG, PNG supported</span>
                <span class="spec-item"><i class="fas fa-check"></i> Max 5MB</span>
            </div>
        </div>
    `;
    
    // Switch to text search tab by default
    textSearchTab.classList.add('active');
    imageSearchTab.classList.remove('active');
    textSearchSection.classList.add('active');
    imageSearchSection.classList.remove('active');
    
    // Focus on text input
    setTimeout(() => {
        medicineInput.focus();
    }, 100);
}

// Function to search with corrected name
window.searchCorrectedName = async function() {
    const correctedName = document.getElementById('correctedName').value.trim();
    if (!correctedName) {
        alert('Please enter a medicine name');
        return;
    }
    
    searchResults.innerHTML = '<div class="loading"><i class="fas fa-spinner fa-spin"></i> Searching with corrected name...</div>';
    
    try {
        const response = await fetch(`/api/medicine/search?name=${encodeURIComponent(correctedName)}`);
        const data = await response.json();
        
        if (!response.ok) {
            throw new Error(data.error || 'Failed to fetch medicine information');
        }
        
        displayResults(data, false);
    } catch (error) {
        searchResults.innerHTML = `<div class="error"><i class="fas fa-exclamation-triangle"></i> ${error.message}</div>`;
    }
}

// ==========================================
// AUTHENTICATION & PROFILE LOGIC
// ==========================================

// Auth Modals
const loginModal = document.getElementById('loginModal');
const registerModal = document.getElementById('registerModal');
const profileModal = document.getElementById('profileModal');

// Nav Buttons
const navLoginBtn = document.getElementById('navLoginBtn');
const navRegisterBtn = document.getElementById('navRegisterBtn');
const navProfileBtn = document.getElementById('navProfileBtn');
const navLogoutBtn = document.getElementById('navLogoutBtn');

// Nav States
const guestNav = document.getElementById('guestNav');
const authNav = document.getElementById('authNav');
const navUserName = document.getElementById('navUserName');

// API URL (Node Server)
const AUTH_API = 'https://medvision-backend-egoh.onrender.com/api';

// State
let currentUser = null;

// Initialization
function checkAuth() {
    const token = localStorage.getItem('medvision_token');
    const userStr = localStorage.getItem('medvision_user');
    
    if (token && userStr) {
        try {
            currentUser = JSON.parse(userStr);
            showAuthenticatedNav();
        } catch (e) {
            doLogout();
        }
    } else {
        showGuestNav();
    }
}

function showAuthenticatedNav() {
    guestNav.style.display = 'none';
    authNav.style.display = 'flex';
    navUserName.textContent = currentUser.name.split(' ')[0];
}

function showGuestNav() {
    guestNav.style.display = 'flex';
    authNav.style.display = 'none';
}

function doLogout() {
    localStorage.removeItem('medvision_token');
    localStorage.removeItem('medvision_user');
    currentUser = null;
    showGuestNav();
    profileModal.style.display = 'none';
}

// Modal Listeners
navLoginBtn.addEventListener('click', () => loginModal.style.display = 'block');
navRegisterBtn.addEventListener('click', () => registerModal.style.display = 'block');
navProfileBtn.addEventListener('click', openProfile);
navLogoutBtn.addEventListener('click', doLogout);

document.getElementById('switchToRegister').addEventListener('click', (e) => {
    e.preventDefault();
    loginModal.style.display = 'none';
    registerModal.style.display = 'block';
});

document.getElementById('switchToLogin').addEventListener('click', (e) => {
    e.preventDefault();
    registerModal.style.display = 'none';
    loginModal.style.display = 'block';
});

// Close functionality for all modals
document.querySelectorAll('.close-modal').forEach(btn => {
    btn.addEventListener('click', function() {
        this.closest('.modal').style.display = 'none';
    });
});
window.addEventListener('click', (e) => {
    if (e.target.classList.contains('modal')) {
        e.target.style.display = 'none';
    }
});

// Register
document.getElementById('doRegisterBtn').addEventListener('click', async (e) => {
    const btn = e.target;
    btn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Loading...';
    
    const name = document.getElementById('regName').value;
    const email = document.getElementById('regEmail').value;
    const password = document.getElementById('regPassword').value;
    
    try {
        const res = await fetch(`${AUTH_API}/auth/register`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ name, email, password })
        });
        const data = await res.json();
        
        if (!data.success) throw new Error(data.message);
        
        // Success
        localStorage.setItem('medvision_token', data.token);
        localStorage.setItem('medvision_user', JSON.stringify(data.user));
        currentUser = data.user;
        showAuthenticatedNav();
        registerModal.style.display = 'none';
        
    } catch (err) {
        alert(err.message || 'Registration failed');
    } finally {
        btn.innerHTML = 'Sign Up';
    }
});

// Login
document.getElementById('doLoginBtn').addEventListener('click', async (e) => {
    const btn = e.target;
    btn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Loading...';
    
    const email = document.getElementById('loginEmail').value;
    const password = document.getElementById('loginPassword').value;
    
    try {
        const res = await fetch(`${AUTH_API}/auth/login`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ email, password })
        });
        const data = await res.json();
        
        if (!data.success) throw new Error(data.message);
        
        // Success
        localStorage.setItem('medvision_token', data.token);
        localStorage.setItem('medvision_user', JSON.stringify(data.user));
        currentUser = data.user;
        showAuthenticatedNav();
        loginModal.style.display = 'none';
        
    } catch (err) {
        alert(err.message || 'Login failed');
    } finally {
        btn.innerHTML = 'Sign In';
    }
});

// Profile Logic
function openProfile() {
    document.getElementById('profileName').textContent = currentUser.name;
    document.getElementById('profileEmail').textContent = currentUser.email;
    renderAllergies();
    profileModal.style.display = 'block';
}

function renderAllergies() {
    const container = document.getElementById('allergyTagsContainer');
    const badge = document.getElementById('allergyCountBadge');
    container.innerHTML = '';

    const allergies = currentUser.allergies || [];
    badge.textContent = `${allergies.length} Logged`;

    if (allergies.length === 0) {
        container.innerHTML = '<span class="allergy-empty"><i class="fas fa-leaf"></i> No allergies documented yet.</span>';
        return;
    }

    allergies.forEach(allergy => {
        const tag = document.createElement('div');
        tag.className = 'allergy-tag';
        tag.innerHTML = `<i class="fas fa-exclamation-circle" style="font-size:11px;color:#e74c3c;"></i>${allergy}<button class="allergy-tag-remove" title="Remove"><i class="fas fa-times"></i></button>`;
        tag.querySelector('.allergy-tag-remove').addEventListener('click', () => removeAllergy(allergy));
        container.appendChild(tag);
    });
}

document.getElementById('addAllergyBtn').addEventListener('click', addAllergy);
document.getElementById('newAllergyInput').addEventListener('keypress', (e) => {
    if (e.key === 'Enter') addAllergy();
});

async function addAllergy() {
    const input = document.getElementById('newAllergyInput');
    const allergy = input.value.trim();
    if (!allergy) return;

    const token = localStorage.getItem('medvision_token');
    try {
        const res = await fetch(`${AUTH_API}/user/allergies`, {
            method: 'POST',
            headers: { 
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`
            },
            body: JSON.stringify({ allergy })
        });
        const data = await res.json();
        if (data.success) {
            currentUser.allergies = data.allergies;
            localStorage.setItem('medvision_user', JSON.stringify(currentUser));
            input.value = '';
            renderAllergies();
        }
    } catch (err) {
        console.error(err);
    }
}

async function removeAllergy(allergy) {
    const token = localStorage.getItem('medvision_token');
    try {
        const res = await fetch(`${AUTH_API}/user/allergies/${encodeURIComponent(allergy)}`, {
            method: 'DELETE',
            headers: { 'Authorization': `Bearer ${token}` }
        });
        const data = await res.json();
        if (data.success) {
            currentUser.allergies = data.allergies;
            localStorage.setItem('medvision_user', JSON.stringify(currentUser));
            renderAllergies();
        }
    } catch (err) {
        console.error(err);
    }
}

// Run auth check on boot
checkAuth();

// Make reveal-up elements visible (no GSAP needed)
document.querySelectorAll('.reveal-up').forEach(el => {
    el.style.opacity = '1';
    el.style.visibility = 'visible';
    el.style.transform = 'none';
});

// ==========================================
// MEDICINE REMINDER SYSTEM
// ==========================================

const reminderModal = document.getElementById('reminderModal');
document.getElementById('navReminderBtnGuest').addEventListener('click', openReminderModal);
document.getElementById('navReminderBtnAuth').addEventListener('click', openReminderModal);
document.getElementById('addReminderBtn').addEventListener('click', addReminder);

function openReminderModal() {
    reminderModal.style.display = 'block';
    loadReminders();
    requestNotificationPermission();
}

function requestNotificationPermission() {
    if ('Notification' in window && Notification.permission === 'default') {
        Notification.requestPermission();
    }
}

async function loadReminders() {
    const list = document.getElementById('reminderList');
    list.innerHTML = '<div class="loading"><i class="fas fa-spinner fa-spin"></i> Loading...</div>';
    try {
        const res = await fetch('/api/reminders');
        const reminders = await res.json();
        renderReminderList(reminders);
    } catch {
        list.innerHTML = '<div class="error">Failed to load reminders</div>';
    }
}

function renderReminderList(reminders) {
    const list = document.getElementById('reminderList');
    if (!reminders.length) {
        list.innerHTML = '<p style="color:#718096; text-align:center; font-style:italic; padding:10px 0;">No reminders set yet.</p>';
        return;
    }
    list.innerHTML = reminders.map(r => `
        <div style="display:flex; justify-content:space-between; align-items:center; background:rgba(0,255,255,0.06); border:1px solid rgba(0,255,255,0.2); border-radius:12px; padding:14px 18px; margin-bottom:10px;">
            <div>
                <span style="color:#fff; font-weight:600; font-size:15px;"><i class="fas fa-pills" style="color:#00FFFF; margin-right:8px;"></i>${r.medicine}</span>
                <span style="display:block; color:#00FFFF; font-size:13px; margin-top:4px;"><i class="fas fa-clock" style="margin-right:6px;"></i>${r.time}</span>
            </div>
            <button onclick="deleteReminder(${r.id})" style="background:rgba(231,76,60,0.15); border:1px solid rgba(231,76,60,0.4); color:#ff6b81; border-radius:8px; padding:8px 12px; cursor:pointer; font-size:13px; transition:all 0.2s;" onmouseover="this.style.background='rgba(231,76,60,0.3)'" onmouseout="this.style.background='rgba(231,76,60,0.15)'">
                <i class="fas fa-trash"></i>
            </button>
        </div>
    `).join('');
}

async function addReminder() {
    const medicine = document.getElementById('reminderMedicine').value.trim();
    const time = document.getElementById('reminderTime').value;
    if (!medicine || !time) {
        alert('Please enter both medicine name and time.');
        return;
    }
    try {
        const res = await fetch('/api/reminders', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ medicine, time })
        });
        if (!res.ok) throw new Error();
        document.getElementById('reminderMedicine').value = '';
        document.getElementById('reminderTime').value = '';
        loadReminders();
    } catch {
        alert('Failed to add reminder.');
    }
}

window.deleteReminder = async function(id) {
    await fetch(`/api/reminders/${id}`, { method: 'DELETE' });
    loadReminders();
};

// Check reminders every 10 seconds and fire browser notification + on-screen alert
function checkReminders() {
    const now = new Date();
    const currentTime = `${String(now.getHours()).padStart(2,'0')}:${String(now.getMinutes()).padStart(2,'0')}`;
    fetch('/api/reminders')
        .then(r => r.json())
        .then(reminders => {
            reminders.forEach(r => {
                const key = `reminded_${r.id}_${currentTime}`;
                if (r.time === currentTime && !sessionStorage.getItem(key)) {
                    sessionStorage.setItem(key, '1');
                    showReminderAlert(r.medicine);
                    if (Notification.permission === 'granted') {
                        new Notification('💊 Medicine Reminder', { body: `Time to take: ${r.medicine}` });
                    }
                }
            });
        })
        .catch(() => {});
}

// ---- Nokia alarm (loops until dismissed) ----
const _alarmAudio = new Audio('/static/nokia.mp3');
_alarmAudio.loop = true;
_alarmAudio.preload = 'auto';

function playFaahLoop() {
    _alarmAudio.currentTime = 0;
    const playPromise = _alarmAudio.play();
    if (playPromise !== undefined) {
        playPromise.catch(err => {
            console.warn('Audio play failed:', err);
        });
    }
}

function stopFaahLoop() {
    _alarmAudio.pause();
    _alarmAudio.currentTime = 0;
}
window.stopFaahLoop = stopFaahLoop;
window.playFaahLoop = playFaahLoop;

function showReminderAlert(medicine) {
    const existing = document.getElementById('reminderAlertBanner');
    if (existing) existing.remove();
    stopFaahLoop();
    playFaahLoop();

    const banner = document.createElement('div');
    banner.id = 'reminderAlertBanner';
    banner.innerHTML = `
        <div style="display:flex; align-items:center; gap:15px;">
            <div style="font-size:32px;">💊</div>
            <div>
                <div style="font-size:16px; font-weight:700; color:#fff;">Medicine Reminder</div>
                <div style="font-size:14px; color:#00FFFF; margin-top:3px;">Time to take: <strong>${medicine}</strong></div>
            </div>
        </div>
        <button onclick="stopFaahLoop(); document.getElementById('reminderAlertBanner').remove();" style="background:rgba(255,255,255,0.15); border:1px solid rgba(255,255,255,0.3); color:#fff; border-radius:8px; padding:8px 16px; cursor:pointer; font-size:13px; white-space:nowrap;">Dismiss</button>
    `;
    Object.assign(banner.style, {
        position: 'fixed',
        bottom: '30px',
        right: '30px',
        zIndex: '9999',
        background: 'linear-gradient(135deg, rgba(74,144,226,0.95), rgba(0,200,200,0.95))',
        border: '1px solid rgba(0,255,255,0.5)',
        borderRadius: '16px',
        padding: '20px 24px',
        display: 'flex',
        alignItems: 'center',
        gap: '20px',
        justifyContent: 'space-between',
        boxShadow: '0 8px 32px rgba(0,255,255,0.4)',
        maxWidth: '380px',
        animation: 'slideInBanner 0.4s ease-out'
    });
    document.body.appendChild(banner);
}

setInterval(checkReminders, 10000);
