// main.js
// Entry point of the application, initializing the app once the DOM is fully loaded.

import { initializeApp } from './modules/initialize.js';

document.addEventListener("DOMContentLoaded", () => {
    try {
        initializeApp();
    } catch (error) {
        console.error("Error initializing the application:", error);
    }
});
