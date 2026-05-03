/**
 * Incident List Page JavaScript
 */

let currentPage = 1;
let totalCount = 0;
let currentFilter = null; // { type: 'date'|'incident', value: string|number }
const ITEMS_PER_PAGE = 20;

// Initialize when page loads
document.addEventListener('DOMContentLoaded', async () => {
    // Initialize Supabase client
    initSupabase();

    // Check authentication
    const { user } = await getCurrentUser();
    if (!user) {
        // Redirect to login if not authenticated
        window.location.href = 'index.html';
        return;
    }

    // Set up event listeners
    setupEventListeners();

    // Load initial data (past 7 days)
    await loadIncidents();
});

/**
 * Set up event listeners for buttons and form elements
 */
function setupEventListeners() {
    const logoutButton = document.getElementById('logoutButton');
    const searchButton = document.getElementById('searchButton');
    const clearButton = document.getElementById('clearButton');
    const prevButton = document.getElementById('prevButton');
    const nextButton = document.getElementById('nextButton');
    const dateFilter = document.getElementById('dateFilter');
    const incidentNumberFilter = document.getElementById('incidentNumberFilter');

    // Logout button
    logoutButton.addEventListener('click', async () => {
        await signOut();
        window.location.href = 'index.html';
    });

    // Search button
    searchButton.addEventListener('click', handleSearch);

    // Clear button
    clearButton.addEventListener('click', () => {
        dateFilter.value = '';
        incidentNumberFilter.value = '';
        currentFilter = null;
        currentPage = 1;
        loadIncidents();
    });

    // Pagination buttons
    prevButton.addEventListener('click', () => {
        if (currentPage > 1) {
            currentPage--;
            loadIncidents();
        }
    });

    nextButton.addEventListener('click', () => {
        const totalPages = Math.ceil(totalCount / ITEMS_PER_PAGE);
        if (currentPage < totalPages) {
            currentPage++;
            loadIncidents();
        }
    });

    // Allow Enter key to trigger search
    dateFilter.addEventListener('keypress', (e) => {
        if (e.key === 'Enter') handleSearch();
    });

    incidentNumberFilter.addEventListener('keypress', (e) => {
        if (e.key === 'Enter') handleSearch();
    });
}

/**
 * Handle search button click
 */
async function handleSearch() {
    const dateFilter = document.getElementById('dateFilter').value;
    const incidentNumberFilter = document.getElementById('incidentNumberFilter').value;

    // Determine which filter to apply
    if (incidentNumberFilter.trim()) {
        // Search by incident number takes precedence
        currentFilter = {
            type: 'incident',
            value: parseInt(incidentNumberFilter.trim())
        };
    } else if (dateFilter) {
        // Search by date
        currentFilter = {
            type: 'date',
            value: dateFilter
        };
    } else {
        // No filter, show default
        currentFilter = null;
    }

    currentPage = 1;
    await loadIncidents();
}

/**
 * Load incidents based on current filter and page
 */
async function loadIncidents() {
    showLoading();

    try {
        let result;

        if (currentFilter && currentFilter.type === 'incident') {
            // Search by incident number (no pagination for this)
            result = await getIncidentByNumber(currentFilter.value);
            // For incident number search, we don't have a count, so use data length
            totalCount = result.data ? result.data.length : 0;
        } else if (currentFilter && currentFilter.type === 'date') {
            // Search by date
            result = await getIncidentsByDate(currentFilter.value, currentPage, ITEMS_PER_PAGE);
            totalCount = result.count || 0;
        } else {
            // Default: past 7 days
            result = await getRecentIncidents(currentPage, ITEMS_PER_PAGE);
            totalCount = result.count || 0;
        }

        if (result.error) {
            throw result.error;
        }

        displayIncidents(result.data || []);
        updatePagination();
    } catch (error) {
        console.error('Error loading incidents:', error);
        showError('Failed to load incidents. Please try again.');
    }
}

/**
 * Display incidents in the table
 * @param {Array} incidents - Array of incident objects
 */
function displayIncidents(incidents) {
    const tbody = document.getElementById('incidentsTableBody');

    if (!incidents || incidents.length === 0) {
        tbody.innerHTML = `
            <tr>
                <td colspan="5" style="text-align: center; padding: 2rem; color: var(--muted-foreground);">
                    No incidents found.
                </td>
            </tr>
        `;
        return;
    }

    tbody.innerHTML = incidents.map(incident => `
        <tr onclick="viewIncidentDetails(${incident.incident_number}, '${incident.unit_id}')">
            <td data-label="Incident Number">${incident.incident_number}</td>
            <td data-label="Unit ID">${incident.unit_id}</td>
            <td data-label="Date/Time">${formatDateTime(incident.incident_date)}</td>
            <td data-label="Address">${incident.location || 'N/A'}</td>
            <td data-label="Incident Type">${incident.incident_type || 'N/A'}</td>
        </tr>
    `).join('');
}

/**
 * Update pagination controls
 */
function updatePagination() {
    const totalPages = Math.ceil(totalCount / ITEMS_PER_PAGE);
    const prevButton = document.getElementById('prevButton');
    const nextButton = document.getElementById('nextButton');
    const pageNumbers = document.getElementById('pageNumbers');
    const paginationInfo = document.getElementById('paginationInfo');

    // Update prev/next buttons
    prevButton.disabled = currentPage === 1;
    nextButton.disabled = currentPage >= totalPages || totalPages === 0;

    // Generate page numbers
    pageNumbers.innerHTML = generatePageNumbers(currentPage, totalPages);

    // Update info text
    if (totalCount === 0) {
        paginationInfo.textContent = 'No results';
    } else {
        const start = (currentPage - 1) * ITEMS_PER_PAGE + 1;
        const end = Math.min(currentPage * ITEMS_PER_PAGE, totalCount);
        paginationInfo.textContent = `Showing ${start}-${end} of ${totalCount} incidents`;
    }
}

/**
 * Generate page number buttons
 * @param {number} current - Current page number
 * @param {number} total - Total number of pages
 * @returns {string} HTML string for page numbers
 */
function generatePageNumbers(current, total) {
    if (total <= 1) return '';

    let pages = [];
    const maxVisible = 7;

    if (total <= maxVisible) {
        // Show all pages
        for (let i = 1; i <= total; i++) {
            pages.push(i);
        }
    } else {
        // Smart pagination
        if (current <= 4) {
            pages = [1, 2, 3, 4, 5, '...', total];
        } else if (current >= total - 3) {
            pages = [1, '...', total - 4, total - 3, total - 2, total - 1, total];
        } else {
            pages = [1, '...', current - 1, current, current + 1, '...', total];
        }
    }

    return pages.map(page => {
        if (page === '...') {
            return `<span class="page-btn" style="border: none; cursor: default;">...</span>`;
        }
        const activeClass = page === current ? 'active' : '';
        return `<button class="page-btn ${activeClass}" onclick="goToPage(${page})">${page}</button>`;
    }).join('');
}

/**
 * Go to a specific page
 * @param {number} page - Page number to navigate to
 */
function goToPage(page) {
    currentPage = page;
    loadIncidents();
}

/**
 * Navigate to incident details page
 * @param {number} incidentNumber - Incident number
 * @param {string} unitId - Unit ID
 */
function viewIncidentDetails(incidentNumber, unitId) {
    // Store in sessionStorage for the details page to retrieve
    sessionStorage.setItem('selectedIncident', JSON.stringify({
        incident_number: incidentNumber,
        unit_id: unitId
    }));

    window.location.href = 'incident-details.html';
}

/**
 * Format date/time for display
 * @param {string} dateString - ISO date string
 * @returns {string} Formatted date/time
 */
function formatDateTime(dateString) {
    if (!dateString) return 'N/A';

    const date = new Date(dateString);
    const dateOptions = { month: '2-digit', day: '2-digit', year: 'numeric' };
    const timeOptions = { hour: '2-digit', minute: '2-digit', hour12: false };

    const datePart = date.toLocaleDateString('en-US', dateOptions);
    const timePart = date.toLocaleTimeString('en-US', timeOptions);

    return `${datePart} ${timePart}`;
}

/**
 * Show loading state
 */
function showLoading() {
    const tbody = document.getElementById('incidentsTableBody');
    tbody.innerHTML = `
        <tr>
            <td colspan="5" style="text-align: center; padding: 2rem;">
                <div class="spinner" style="margin: 0 auto;"></div>
                <p style="margin-top: 1rem; color: var(--muted-foreground);">Loading incidents...</p>
            </td>
        </tr>
    `;

    document.getElementById('paginationInfo').textContent = 'Loading...';
}

/**
 * Show error message
 * @param {string} message - Error message to display
 */
function showError(message) {
    const tbody = document.getElementById('incidentsTableBody');
    tbody.innerHTML = `
        <tr>
            <td colspan="5" style="text-align: center; padding: 2rem;">
                <p style="color: var(--destructive);">${message}</p>
            </td>
        </tr>
    `;
}
