/**
 * Incident Details Page JavaScript
 */

let currentIncident = null;

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

    // Get selected incident from sessionStorage
    const selectedIncident = sessionStorage.getItem('selectedIncident');
    if (!selectedIncident) {
        // No incident selected, redirect back to list
        window.location.href = 'incident-list.html';
        return;
    }

    const { incident_number, unit_id } = JSON.parse(selectedIncident);

    // Load incident details
    await loadIncidentDetails(incident_number, unit_id);

    // Set up select button
    setupSelectButton();
});

/**
 * Load and display incident details
 * @param {number} incidentNumber - The incident number
 * @param {string} unitId - The unit ID
 */
async function loadIncidentDetails(incidentNumber, unitId) {
    try {
        const { data, error } = await getIncident(incidentNumber, unitId);

        if (error) {
            throw error;
        }

        if (!data) {
            throw new Error('Incident not found');
        }

        currentIncident = data;
        displayIncidentDetails(data);
    } catch (error) {
        console.error('Error loading incident details:', error);
        alert('Failed to load incident details. Redirecting back to list.');
        window.location.href = 'incident-list.html';
    }
}

/**
 * Display incident details on the page
 * @param {Object} incident - The incident object from the database
 */
function displayIncidentDetails(incident) {
    // Update header
    document.getElementById('incidentNumber').textContent = incident.incident_number;

    // Update summary
    document.getElementById('unitId').textContent = incident.unit_id;
    document.getElementById('address').textContent = incident.location || 'N/A';
    document.getElementById('incidentType').textContent = incident.incident_type || 'N/A';

    // Parse and display timeline
    displayTimeline(incident.content);
}

/**
 * Parse content JSON and display timeline
 * @param {string} contentJson - JSON string from the content field
 */
function displayTimeline(contentJson) {
    const tbody = document.getElementById('timelineTableBody');

    try {
        const content = JSON.parse(contentJson);
        const times = content.incidentTimes?.times || {};

        if (Object.keys(times).length === 0) {
            tbody.innerHTML = `
                <tr>
                    <td colspan="2" style="text-align: center; padding: 2rem; color: var(--muted-foreground);">
                        No timeline data available.
                    </td>
                </tr>
            `;
            return;
        }

        // Convert times object to array and sort by time
        const timelineEntries = Object.entries(times).map(([key, value]) => ({
            status: key,
            date: value.date,
            time: value.time,
            datetime: parseDateTimeForSort(value.date, value.time)
        }));

        // Sort by datetime
        timelineEntries.sort((a, b) => a.datetime - b.datetime);

        // Render timeline rows
        tbody.innerHTML = timelineEntries.map(entry => `
            <tr>
                <td data-label="Status">${formatStatus(entry.status)}</td>
                <td data-label="Date/Time">${entry.date} ${entry.time}</td>
            </tr>
        `).join('');

    } catch (error) {
        console.error('Error parsing timeline:', error);
        tbody.innerHTML = `
            <tr>
                <td colspan="2" style="text-align: center; padding: 2rem; color: var(--destructive);">
                    Error loading timeline data.
                </td>
            </tr>
        `;
    }
}

/**
 * Format status key to readable text
 * @param {string} status - Status key (e.g., "notifiedByDispatch")
 * @returns {string} Formatted status text
 */
function formatStatus(status) {
    // Convert camelCase to Title Case with spaces
    return status
        .replace(/([A-Z])/g, ' $1') // Add space before capital letters
        .replace(/^./, str => str.toUpperCase()) // Capitalize first letter
        .trim();
}

/**
 * Parse date and time strings for sorting
 * @param {string} dateStr - Date string (e.g., "11/06/2025")
 * @param {string} timeStr - Time string (e.g., "18:32:08")
 * @returns {Date} Date object for sorting
 */
function parseDateTimeForSort(dateStr, timeStr) {
    // Parse MM/DD/YYYY format
    const [month, day, year] = dateStr.split('/');
    const [hours, minutes, seconds] = timeStr.split(':');

    return new Date(year, month - 1, day, hours, minutes, seconds);
}

/**
 * Set up the select button event listener
 */
function setupSelectButton() {
    const selectButton = document.getElementById('selectButton');

    selectButton.addEventListener('click', () => {
        if (!currentIncident) {
            alert('No incident data available.');
            return;
        }

        try {
            // Check if Tampermonkey GM_setValue is available
            if (typeof GM_setValue === 'undefined') {
                alert('Tampermonkey is not detected. Please install the Tampermonkey userscript first.');
                return;
            }

            // Save the incident content JSON to Tampermonkey storage
            GM_setValue('incident_json', currentIncident.content);

            // Navigate to the target URL
            window.location.href = 'https://newjersey.imagetrendelite.com/Elite/Organizationnewjersey/';

        } catch (error) {
            console.error('Error saving incident:', error);
            alert('Failed to save incident data. Please make sure Tampermonkey is installed and enabled.');
        }
    });
}
