// src/utils/dateUtils.js

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
}



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
