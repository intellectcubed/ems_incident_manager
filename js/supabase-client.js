/**
 * Supabase Client Utility
 *
 * This file initializes the Supabase client and provides helper functions
 * for authentication and database queries.
 *
 * NOTE: This requires the Supabase JavaScript library to be loaded via CDN.
 * Add this to your HTML: <script src="https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2"></script>
 */

let supabaseClient = null;

/**
 * Initialize the Supabase client
 */
function initSupabase() {
    if (!window.supabase) {
        console.error('Supabase library not loaded. Make sure to include the Supabase CDN script.');
        return null;
    }

    supabaseClient = window.supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
    return supabaseClient;
}

/**
 * Sign in with email and password
 * @param {string} email - User's email address
 * @param {string} password - User's password
 * @returns {Promise<{user: object, session: object, error: object}>}
 */
async function signIn(email, password) {
    const { data, error } = await supabaseClient.auth.signInWithPassword({
        email: email,
        password: password
    });

    if (error) {
        return { user: null, session: null, error };
    }

    return { user: data.user, session: data.session, error: null };
}

/**
 * Sign out the current user
 * @returns {Promise<{error: object}>}
 */
async function signOut() {
    const { error } = await supabaseClient.auth.signOut();
    return { error };
}

/**
 * Get the current authenticated user
 * @returns {Promise<{user: object, error: object}>}
 */
async function getCurrentUser() {
    const { data: { user }, error } = await supabaseClient.auth.getUser();
    return { user, error };
}

/**
 * Check if user is authenticated
 * @returns {Promise<boolean>}
 */
async function isAuthenticated() {
    const { user } = await getCurrentUser();
    return user !== null;
}

/**
 * Query incidents from the past 7 days with pagination
 * @param {number} page - Page number (1-indexed)
 * @param {number} limit - Number of results per page (default: 20)
 * @returns {Promise<{data: array, count: number, error: object}>}
 */
async function getRecentIncidents(page = 1, limit = 20) {
    const offset = (page - 1) * limit;
    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);

    const { data, error, count } = await supabaseClient
        .from('rip_and_runs')
        .select('*', { count: 'exact' })
        .gt('incident_date', sevenDaysAgo.toISOString())
        .order('incident_date', { ascending: false })
        .range(offset, offset + limit - 1);

    return { data, count, error };
}

/**
 * Query incidents by specific date
 * @param {string} date - Date in YYYY-MM-DD format
 * @param {number} page - Page number (1-indexed)
 * @param {number} limit - Number of results per page (default: 20)
 * @returns {Promise<{data: array, count: number, error: object}>}
 */
async function getIncidentsByDate(date, page = 1, limit = 20) {
    const offset = (page - 1) * limit;
    const startDate = new Date(date);
    const endDate = new Date(date);
    endDate.setDate(endDate.getDate() + 1);

    const { data, error, count } = await supabaseClient
        .from('rip_and_runs')
        .select('*', { count: 'exact' })
        .gte('incident_date', startDate.toISOString())
        .lt('incident_date', endDate.toISOString())
        .order('incident_date', { ascending: false })
        .range(offset, offset + limit - 1);

    return { data, count, error };
}

/**
 * Query incidents by incident number (all units for that incident)
 * @param {number} incidentNumber - The incident number to search for
 * @returns {Promise<{data: array, error: object}>}
 */
async function getIncidentByNumber(incidentNumber) {
    const { data, error } = await supabaseClient
        .from('rip_and_runs')
        .select('*')
        .eq('incident_number', incidentNumber)
        .order('unit_id', { ascending: true });

    return { data, error };
}

/**
 * Get a single incident by incident_number and unit_id
 * @param {number} incidentNumber - The incident number
 * @param {string} unitId - The unit ID
 * @returns {Promise<{data: object, error: object}>}
 */
async function getIncident(incidentNumber, unitId) {
    const { data, error } = await supabaseClient
        .from('rip_and_runs')
        .select('*')
        .eq('incident_number', incidentNumber)
        .eq('unit_id', unitId)
        .single();

    return { data, error };
}
