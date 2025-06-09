/**
 * @file help-center-injection.js
 * @description This script is designed to populate the backend with a predefined set of sample
 * help center entries. It contains a hardcoded JWT and API endpoint for this purpose.
 *
 * IMPORTANT: This script is intended for development/setup purposes only.
 * It should NOT be included in a production build or run in an environment
 * where the hardcoded token could be exposed, as this poses a security risk.
 */

/**
 * @constant {string} token
 * @description The JWT token used for authorizing API requests to create help center entries.
 * @warning Hardcoding JWTs is a security risk if this script is exposed. This token may have an expiration date.
 *          For production systems, use a secure method for API authentication.
 */
const token = 'eyJhbGciOiJIUzI1NiJ9.eyJzdWIiOiJhZG1pbkBnbWFpbC5jb20iLCJyb2xlIjpbIkFETUlOIl0sImlhdCI6MTcyODI4MTU0MiwiZXhwIjoxNzI4MzE3NTQyfQ.QrHvQeYA2z8PNb8-e2B_LyYPogHsluUcksaOOjMCLFI'; // Replace with your actual JWT token

/**
 * @constant {string} apiUrl
 * @description The API endpoint URL for creating help center entries.
 */
const apiUrl = 'https://otgbackend.nemesisnet.co.za/api/admin/help-center/create'; // Replace with your API endpoint

/**
 * @constant {Array<object>} entries
 * @description An array of sample help center entry objects to be created.
 * Each object should have `title`, `content`, and `category` properties.
 */
const entries = [
    {
        title: "How to Change Your Email",
        content: "Step-by-step guide on how to change your registered email address.",
        category: "Account Management"
    },
    {
        title: "Understanding User Roles",
        content: "Learn about different user roles and their permissions.",
        category: "User Management"
    },
    {
        title: "Reporting Bugs",
        content: "How to report bugs effectively to our support team.",
        category: "Support"
    },
    {
        title: "Using the API",
        content: "A comprehensive guide to using our API for developers.",
        category: "Developer Resources"
    },
    {
        title: "Feedback Submission Process",
        content: "Details on how to submit feedback and suggestions.",
        category: "User Experience"
    },
    {
        title: "System Status Updates",
        content: "Check the status of our systems and services.",
        category: "Announcements"
    },
    {
        title: "Customizing Notifications",
        content: "Instructions for customizing your notification settings.",
        category: "Settings"
    },
    {
        title: "Understanding Subscription Plans",
        content: "A breakdown of available subscription plans and pricing.",
        category: "Billing"
    },
    {
        title: "Best Practices for Data Security",
        content: "Essential tips for keeping your data secure.",
        category: "Security"
    },
    {
        title: "Using the Help Center Search",
        content: "Guide to effectively searching for help topics in the Help Center.",
        category: "Getting Started"
    },
    {
        title: "Troubleshooting Common Issues",
        content: "Common issues and how to troubleshoot them.",
        category: "Troubleshooting"
    },
    {
        title: "Understanding Analytics Dashboard",
        content: "Overview of the analytics dashboard and its features.",
        category: "User Interface"
    },
    {
        title: "Installing the Mobile App",
        content: "Instructions for installing the mobile application on iOS and Android.",
        category: "Mobile"
    },
    {title: "How to Export Data", content: "Steps to export your data from the platform.", category: "Data Management"},
    {
        title: "Using Help Center Resources",
        content: "How to effectively use resources available in the Help Center.",
        category: "Getting Started"
    },
    {
        title: "Troubleshooting Payment Issues",
        content: "Find solutions to common payment-related problems.",
        category: "Billing"
    },
    {
        title: "Integrating with Other Tools",
        content: "Instructions for integrating our platform with other tools.",
        category: "Integration"
    },
    {
        title: "Managing Team Members",
        content: "How to manage team members and their permissions.",
        category: "User Management"
    },
    {
        title: "Understanding Privacy Policies",
        content: "Overview of our privacy policies and user rights.",
        category: "Privacy"
    },
    {
        title: "Feature Requests",
        content: "How to submit feature requests and suggestions.",
        category: "User Experience"
    },
    {
        title: "Navigating the Settings Page",
        content: "Guide to navigating the settings page and its options.",
        category: "User Interface"
    },
    {
        title: "How to Use the Help Center",
        content: "This entry provides a comprehensive guide on using the Help Center effectively.",
        category: "Getting Started"
    },
    {
        title: "Troubleshooting Login Issues",
        content: "Find solutions to common login problems and how to resolve them.",
        category: "Troubleshooting"
    },
    {
        title: "Understanding the Dashboard",
        content: "Learn about the various components of the dashboard and their functionalities.",
        category: "User Interface"
    },
    {
        title: "Creating a New Account",
        content: "Step-by-step instructions on how to create a new user account.",
        category: "Account Management"
    },
    {
        title: "Resetting Your Password",
        content: "Instructions for resetting your password securely.",
        category: "Account Management"
    },
    {
        title: "Setting Up Notifications",
        content: "Guide to configuring your notification preferences.",
        category: "Settings"
    },
    {
        title: "Using the Search Functionality",
        content: "How to effectively use the search feature to find help entries.",
        category: "User Interface"
    },
    {
        title: "Contacting Support",
        content: "Information on how to contact customer support for assistance.",
        category: "Support"
    },
    {
        title: "Updating Your Profile",
        content: "Learn how to update your user profile information.",
        category: "Account Management"
    },
    {
        title: "Navigating the Help Center",
        content: "Tips for navigating the Help Center easily.",
        category: "Getting Started"
    },
    {
        title: "Understanding Account Security",
        content: "Best practices for keeping your account secure.",
        category: "Security"
    },
    {title: "Mobile App Features", content: "Overview of features available in the mobile app.", category: "Mobile"},
    {
        title: "Integrating Third-Party Services",
        content: "Guide to integrating third-party services with our platform.",
        category: "Integration"
    },
    {
        title: "Managing Your Subscription",
        content: "Instructions on how to manage your subscription settings.",
        category: "Account Management"
    },
    {
        title: "Using the Feedback Feature",
        content: "How to provide feedback and suggestions.",
        category: "User Experience"
    },
    {
        title: "Understanding Data Privacy",
        content: "Information on how we handle your data privacy.",
        category: "Privacy"
    },
    {
        title: "Feature Updates",
        content: "Keep track of the latest feature updates and enhancements.",
        category: "Announcements"
    },
    {title: "Common FAQ", content: "Answers to frequently asked questions.", category: "FAQ"},
    {
        title: "Help Center Overview",
        content: "An overview of what the Help Center offers.",
        category: "Getting Started"
    },
    {
        title: "Using Keyboard Shortcuts",
        content: "A guide to using keyboard shortcuts for efficiency.",
        category: "User Interface"
    },
    {
        title: "System Requirements",
        content: "Information on system requirements for using our services.",
        category: "Technical"
    }
];

/**
 * Sends a request to the API to create a single help center entry.
 * @async
 * @param {object} entry - The help center entry object to create.
 * @param {string} entry.title - The title of the help entry.
 * @param {string} entry.content - The content of the help entry.
 * @param {string} entry.category - The category of the help entry.
 * @returns {Promise<object>} A promise that resolves with the JSON response from the API.
 */
const createEntries = async (entry) => { // Renamed from original 'createEntries' to avoid conflict if this was meant to be singular. Kept plural as it's used in a loop.
    const response = await fetch(apiUrl, {
        method: 'POST',
        headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
        },
        body: JSON.stringify(entry)
    });
    return response.json();
};

/**
 * Iterates through all predefined `entries` and calls `createEntries` for each one
 * to populate the backend. Logs the title of each created entry.
 * @async
 * @returns {void}
 */
const createAllEntries = async () => {
    for (const entry of entries) {
        try {
            const result = await createEntries(entry); // Corrected to call the renamed/correct function
            // Assuming result has a title or some identifier, adjust if API response is different
            console.log(`Created entry: ${result.title || entry.title } status: ${result.status || 'unknown'}`);
        } catch (error) {
            console.error(`Failed to create entry "${entry.title}":`, error);
        }
    }
};

// Run the function to create all entries when the script is executed.
createAllEntries();
