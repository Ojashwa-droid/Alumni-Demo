/**
 * auth.js - Authentication management module
 * Contains functions for handling user authentication across the application
 */

/**
 * Checks if a JWT token is expired
 * @param {string} token - JWT token to check
 * @returns {boolean} - True if token is expired or invalid, false otherwise
 */
function isTokenExpired(token) {
    if (!token) return true;
    
    try {
        // JWT tokens consist of three parts: header.payload.signature
        const payload = token.split('.')[1];
        // Decode the base64 payload
        const decodedPayload = JSON.parse(atob(payload));
        // Check if the token has an expiration time and if it's in the past
        return decodedPayload.exp && decodedPayload.exp * 1000 < Date.now();
    } catch (e) {
        console.error("Error checking token expiration:", e);
        return true; // If there's an error parsing the token, consider it expired
    }
}

/**
 * Checks if the user is authenticated with a valid token
 * @returns {boolean} - True if user has a valid token, false otherwise
 */
function checkAuthentication() {
    const accessToken = localStorage.getItem('access_token');
    
    if (!accessToken || isTokenExpired(accessToken)) {
        // Token is expired or doesn't exist
        clearAuthData();
        return false;
    }
    
    return true;
}

/**
 * Gets the current user's information from localStorage
 * @returns {Object|null} - User object or null if not authenticated
 */
function getCurrentUser() {
    if (!checkAuthentication()) return null;
    
    const username = localStorage.getItem('username');
    return {
        username: username,
        initials: username ? username.substring(0, 2).toUpperCase() : 'U'
    };
}

/**
 * Clears all authentication data from localStorage
 */
function clearAuthData() {
    localStorage.removeItem('access_token');
    localStorage.removeItem('refresh_token');
    localStorage.removeItem('isAuthenticated');
    localStorage.removeItem('username');
}

/**
 * Logs out the current user
 */
function logout() {
    clearAuthData();
    window.location.href = "../index.html"; // Redirect to home or login page
}

/**
 * Makes an authenticated API request with token validation
 * @param {string} url - The endpoint URL
 * @param {string} method - HTTP method (GET, POST, PUT, DELETE, etc.)
 * @param {Object} [body] - Optional request body
 * @returns {Promise} - Response from the API
 */
async function makeAuthenticatedRequest(url, method, body = null) {
    // Check if we have a valid token before making the request
    if (!checkAuthentication()) {
        // Token is invalid or expired
        redirectToLogin("Your session has expired. Please log in again.");
        throw new Error("Authentication required");
    }
    
    // Prepare request options
    const options = {
        method: method,
        headers: {
            "Content-Type": "application/json",
            "Authorization": `Bearer ${localStorage.getItem('access_token')}`
        }
    };
    
    // Add body if provided
    if (body) {
        options.body = JSON.stringify(body);
    }
    
    // Make the request
    try {
        const response = await fetch(url, options);
        
        // Handle 401 Unauthorized errors (token rejected by server)
        if (response.status === 401) {
            // Future implementation: Try to refresh the token
            // For now, just redirect to login
            clearAuthData();
            redirectToLogin("Your session has expired. Please log in again.");
            throw new Error("Authentication failed");
        }
        
        return response;
    } catch (error) {
        console.error("Request failed:", error);
        throw error;
    }
}

/**
 * Redirects to login page with an optional message
 * @param {string} [message] - Optional message to display after redirect
 */
function redirectToLogin(message = null) {
    if (message) {
        // Store message to display after redirect
        sessionStorage.setItem('login_message', message);
    }
    window.location.href = "../Login/login.html";
}

/**
 * Toggles UI elements based on authentication state
 * Call this function when the page loads to update UI
 */
function updateAuthUI() {
    const isLoggedIn = checkAuthentication();
    
    // Find common auth-related elements
    const loginBtn = document.getElementById('loginBtn');
    const registerBtn = document.getElementById('registerBtn');
    const logoutBtn = document.getElementById('logoutBtn');
    const profileSection = document.getElementById('profileSection');
    
    // Find elements with auth-required class (only visible when logged in)
    const authRequiredElements = document.querySelectorAll('.auth-required');
    
    // Find elements with no-auth class (only visible when logged out)
    const noAuthElements = document.querySelectorAll('.no-auth');
    
    if (isLoggedIn) {
        // User is logged in
        if (loginBtn) loginBtn.style.display = 'none';
        if (registerBtn) registerBtn.style.display = 'none';
        if (logoutBtn) logoutBtn.style.display = 'block';
        if (profileSection) {
            profileSection.style.display = 'block';
            
            // Update profile initials if element exists
            const profileCircle = document.querySelector('.profile-circle');
            if (profileCircle) {
                const user = getCurrentUser();
                profileCircle.textContent = user ? user.initials : 'U';
            }
        }
        
        // Show auth-required elements
        authRequiredElements.forEach(el => el.style.display = 'block');
        
        // Hide no-auth elements
        noAuthElements.forEach(el => el.style.display = 'none');
    } else {
        // User is not logged in
        if (loginBtn) loginBtn.style.display = 'block';
        if (registerBtn) registerBtn.style.display = 'block';
        if (logoutBtn) logoutBtn.style.display = 'none';
        if (profileSection) profileSection.style.display = 'none';
        
        // Hide auth-required elements
        authRequiredElements.forEach(el => el.style.display = 'none');
        
        // Show no-auth elements
        noAuthElements.forEach(el => el.style.display = 'block');
    }
}

/**
 * Protects a page that requires authentication
 * Call this at the beginning of scripts for pages that should only be accessible to logged-in users
 */
function protectPage() {
    if (!checkAuthentication()) {
        redirectToLogin("Please log in to access this page.");
    }
}

/**
 * Initialize authentication features on page load
 * Call this function when the DOM content is loaded
 */
function initAuth() {
    // Update UI based on authentication state
    updateAuthUI();
    
    // Attach event listener to logout button if it exists
    const logoutBtn = document.getElementById('logoutBtn');
    if (logoutBtn) {
        logoutBtn.addEventListener('click', (e) => {
            e.preventDefault();
            logout();
        });
    }
    
    // Check for login messages
    const loginMessage = sessionStorage.getItem('login_message');
    if (loginMessage) {
        alert(loginMessage);
        sessionStorage.removeItem('login_message');
    }
}

// Auto-initialize when DOM is ready
document.addEventListener('DOMContentLoaded', initAuth);