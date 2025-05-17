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
