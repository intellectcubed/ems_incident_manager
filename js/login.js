/**
 * Login Page JavaScript
 */

// Initialize Supabase when the page loads
document.addEventListener('DOMContentLoaded', async () => {
    // Initialize Supabase client
    initSupabase();

    // Check if user is already logged in
    const { user } = await getCurrentUser();
    if (user) {
        // Redirect to incident list if already authenticated
        window.location.href = 'incident-list.html';
        return;
    }

    // Handle login form submission
    const loginForm = document.getElementById('loginForm');
    const emailInput = document.getElementById('email');
    const passwordInput = document.getElementById('password');
    const loginButton = document.getElementById('loginButton');
    const errorMessage = document.getElementById('errorMessage');

    loginForm.addEventListener('submit', async (e) => {
        e.preventDefault();

        // Clear any previous error messages
        errorMessage.textContent = '';
        errorMessage.classList.remove('active');

        // Get form values
        const email = emailInput.value.trim();
        const password = passwordInput.value;

        // Validate inputs
        if (!email || !password) {
            showError('Please enter both email and password.');
            return;
        }

        // Disable button and show loading state
        loginButton.disabled = true;
        loginButton.textContent = 'Signing in...';

        try {
            // Attempt to sign in
            const { user, session, error } = await signIn(email, password);

            if (error) {
                throw error;
            }

            if (user && session) {
                // Success! Redirect to incident list
                window.location.href = 'incident-list.html';
            } else {
                throw new Error('Login failed. Please try again.');
            }
        } catch (error) {
            // Show error message
            console.error('Login error:', error);
            showError(error.message || 'Login failed. Please check your credentials and try again.');

            // Re-enable button
            loginButton.disabled = false;
            loginButton.textContent = 'Log In';
        }
    });

    /**
     * Display an error message
     * @param {string} message - The error message to display
     */
    function showError(message) {
        errorMessage.textContent = message;
        errorMessage.classList.add('active');
    }
});
