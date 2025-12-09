// ==UserScript==
// @name         EMS Incident Manager Integration
// @namespace    http://tampermonkey.net/
// @version      1.0
// @description  Integrates EMS Incident Manager with ImageTrend Elite for incident data transfer
// @author       Martinsville Rescue Squad
// @match        https://intellectcubed.github.io/ems_incident_manager/*
// @match        https://newjersey.imagetrendelite.com/Elite/Organizationnewjersey/*
// @updateURL    https://raw.githubusercontent.com/intellectcubed/ems_incident_manager/main/tampermonkey/ems-incident-integration.user.js
// @downloadURL  https://raw.githubusercontent.com/intellectcubed/ems_incident_manager/main/tampermonkey/ems-incident-integration.user.js
// @icon         data:image/gif;base64,R0lGODlhAQABAAAAACH5BAEKAAEALAAAAAABAAEAAAICTAEAOw==
// @grant        GM_setValue
// @grant        GM_getValue
// @grant        unsafeWindow
// ==/UserScript==

(function() {
    'use strict';

    /**
     * EMS Incident Manager Integration Script
     *
     * This Tampermonkey userscript provides two main functions:
     *
     * 1. On EMS Incident Manager pages (GitHub Pages):
     *    - Exposes GM_setValue and GM_getValue to the page context
     *    - Allows the web app to save incident data when the user clicks "Select"
     *
     * 2. On ImageTrend Elite pages:
     *    - Retrieves saved incident data
     *    - Can be used to auto-fill forms or assist with data entry
     */

    const currentUrl = window.location.href;

    // Check if we're on the EMS Incident Manager pages
    if (currentUrl.includes('github.io/mrs_incident_manager')) {
        console.log('[EMS Incident Manager] Tampermonkey script loaded');

        // Expose GM_setValue and GM_getValue to the page context
        // This allows the vanilla JavaScript app to use Tampermonkey storage
        unsafeWindow.GM_setValue = GM_setValue;
        unsafeWindow.GM_getValue = GM_getValue;

        console.log('[EMS Incident Manager] GM functions exposed to page context');
    }

    // Check if we're on ImageTrend Elite
    else if (currentUrl.includes('imagetrendelite.com')) {
        console.log('[EMS Incident Manager] On ImageTrend Elite page');

        // Retrieve the saved incident data
        const incidentJson = GM_getValue('incident_json', null);

        if (incidentJson) {
            console.log('[EMS Incident Manager] Incident data found');

            try {
                const incidentData = JSON.parse(incidentJson);
                console.log('[EMS Incident Manager] Incident data:', incidentData);

                // Store in unsafeWindow for potential use by other scripts or console access
                unsafeWindow.EMSIncidentData = incidentData;

                // Display notification to user
                displayNotification('Incident data loaded from EMS Incident Manager');

                // TODO: Add auto-fill logic here if needed
                // This is where you would implement form auto-fill based on the incident data
                // For example:
                // fillIncidentForm(incidentData);

            } catch (error) {
                console.error('[EMS Incident Manager] Error parsing incident data:', error);
                displayNotification('Error loading incident data', true);
            }
        } else {
            console.log('[EMS Incident Manager] No incident data found');
        }
    }

    /**
     * Display a notification to the user
     * @param {string} message - Message to display
     * @param {boolean} isError - Whether this is an error message
     */
    function displayNotification(message, isError = false) {
        const notification = document.createElement('div');
        notification.textContent = message;
        notification.style.cssText = `
            position: fixed;
            top: 20px;
            right: 20px;
            background: ${isError ? '#d4183d' : '#2563eb'};
            color: white;
            padding: 12px 20px;
            border-radius: 8px;
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
            font-size: 14px;
            font-weight: 500;
            box-shadow: 0 4px 6px rgba(0, 0, 0, 0.2);
            z-index: 10000;
            animation: slideIn 0.3s ease-out;
        `;

        // Add animation keyframes
        if (!document.getElementById('ems-notification-styles')) {
            const style = document.createElement('style');
            style.id = 'ems-notification-styles';
            style.textContent = `
                @keyframes slideIn {
                    from {
                        transform: translateX(400px);
                        opacity: 0;
                    }
                    to {
                        transform: translateX(0);
                        opacity: 1;
                    }
                }
            `;
            document.head.appendChild(style);
        }

        document.body.appendChild(notification);

        // Remove notification after 5 seconds
        setTimeout(() => {
            notification.style.transition = 'opacity 0.3s ease-out';
            notification.style.opacity = '0';
            setTimeout(() => notification.remove(), 300);
        }, 5000);
    }

    /**
     * Example function to auto-fill incident form
     * CUSTOMIZE THIS based on the actual ImageTrend Elite form structure
     * @param {Object} incidentData - Parsed incident data
     */
    function fillIncidentForm(incidentData) {
        // This is a placeholder function
        // You would need to inspect the ImageTrend Elite form and map fields accordingly

        console.log('[EMS Incident Manager] Auto-fill not implemented yet');

        // Example of what this might look like:
        /*
        const times = incidentData.incidentTimes?.times || {};
        const location = incidentData.incidentLocation || {};

        // Find and fill form fields
        const addressField = document.querySelector('input[name="address"]');
        if (addressField && location.street_address) {
            addressField.value = location.street_address;
        }

        // Fill timestamp fields
        if (times.notifiedByDispatch) {
            const dispatchTimeField = document.querySelector('input[name="dispatch_time"]');
            if (dispatchTimeField) {
                dispatchTimeField.value = times.notifiedByDispatch.time;
            }
        }
        */
    }

    /**
     * Helper function to clear saved incident data
     * Can be called from browser console: clearEMSIncidentData()
     */
    unsafeWindow.clearEMSIncidentData = function() {
        GM_setValue('incident_json', null);
        console.log('[EMS Incident Manager] Incident data cleared');
    };

    /**
     * Helper function to view saved incident data
     * Can be called from browser console: viewEMSIncidentData()
     */
    unsafeWindow.viewEMSIncidentData = function() {
        const data = GM_getValue('incident_json', null);
        if (data) {
            console.log('[EMS Incident Manager] Saved incident data:');
            console.log(JSON.parse(data));
        } else {
            console.log('[EMS Incident Manager] No incident data saved');
        }
    };

})();
