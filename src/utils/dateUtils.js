// src/utils/dateUtils.js
/**
 * dateUtils.js
 * A centralized utility for formatting date and time strings.
 * Uses the built-in Intl.DateTimeFormat for performance and automatic localization.
 */

/**
 * Formats an ISO date string into a human-readable date (e.g., "June 8, 2024").
 * It handles invalid or null inputs gracefully.
 * The format will be localized based on the user's browser settings.
 *
 * @param {string | null | undefined} dateString - The ISO date string to format (e.g., "2024-06-08T10:30:00").
 * @returns {string} The formatted date string, or 'N/A' if the input is invalid.
 *
 * @example
 * formatDate("2024-12-25T14:00:00Z"); // Returns "December 25, 2024" (in en-US locale)
 */
export const formatDate = (dateString) => {
    // Guard clause: Handle null, undefined, or empty string inputs.
    if (!dateString) {
        return 'N/A';
    }

    try {
        const date = new Date(dateString);

        // Check if the created date object is valid.
        // An invalid date's time is NaN.
        if (isNaN(date.getTime())) {
            console.error(`Invalid date string provided to formatDate: "${dateString}"`);
            return 'Invalid Date';
        }

        const options = {
            year: 'numeric', // e.g., 2024
            month: 'long',   // e.g., June
            day: 'numeric',    // e.g., 8
        };

        // 'undefined' tells the formatter to use the browser's default locale.
        return new Intl.DateTimeFormat(undefined, options).format(date);

    } catch (error) {
        console.error(`Error formatting date for string "${dateString}":`, error);
        return 'Formatting Error';
    }
};

/**
 * Formats an ISO date string into a human-readable date and time (e.g., "Jun 8, 2024, 12:30 PM").
 * It handles invalid or null inputs gracefully.
 * The format will be localized based on the user's browser settings.
 *
 * @param {string | null | undefined} dateTimeString - The ISO date string to format.
 * @returns {string} The formatted date and time string, or 'N/A' if the input is invalid.
 *
 * @example
 * formatDateTime("2024-06-08T13:45:00Z"); // Returns "Jun 8, 2024, 1:45 PM" (in en-US locale)
 */
export const formatDateTime = (dateTimeString) => {
    // Guard clause for invalid inputs
    if (!dateTimeString) {
        return 'N/A';
    }

    try {
        const date = new Date(dateTimeString);

        if (isNaN(date.getTime())) {
            console.error(`Invalid date string provided to formatDateTime: "${dateTimeString}"`);
            return 'Invalid Date';
        }

        const options = {
            year: 'numeric',
            month: 'short',  // 'short' is often better for datetime to save space
            day: 'numeric',
            hour: 'numeric', // '2-digit' is also an option
            minute: '2-digit',
            hour12: true,    // Use AM/PM
        };

        return new Intl.DateTimeFormat(undefined, options).format(date);

    } catch (error) {
        console.error(`Error formatting datetime for string "${dateTimeString}":`, error);
        return 'Formatting Error';
    }
};/*
export function formatDateTime(dateTimeStr) {
    if (!dateTimeStr) return '';

    const options = {
        year: 'numeric',
        month: 'short', // or 'long'
        day: '2-digit',
        hour: '2-digit',
        minute: '2-digit',
        hour12: false,
    };

    return new Date(dateTimeStr).toLocaleString('en-ZA', options);
}*/



/**
 * Formats a JavaScript Date object or a date string into YYYY-MM-DDTHH:MM format
 * suitable for datetime-local input fields.
 * @param {Date|string} dateInput - The date to format.
 * @returns {string} The formatted date string, or an empty string if input is invalid.
 */
export function formatInputDateTime(dateInput) {
    if (!dateInput) return '';
    try {
        const date = new Date(dateInput); // Handles both Date objects and valid date strings
        if (isNaN(date.getTime())) { // Check if the date is valid
            console.warn("formatInputDateTime: Invalid dateInput received:", dateInput);
            return '';
        }

        const year = date.getFullYear();
        const month = (date.getMonth() + 1).toString().padStart(2, '0'); // getMonth is 0-indexed
        const day = date.getDate().toString().padStart(2, '0');
        const hours = date.getHours().toString().padStart(2, '0');
        const minutes = date.getMinutes().toString().padStart(2, '0');

        return `${year}-${month}-${day}T${hours}:${minutes}`;
    } catch (error) {
        console.error("Error in formatInputDateTime:", error, "Input was:", dateInput);
        return '';
    }

}
