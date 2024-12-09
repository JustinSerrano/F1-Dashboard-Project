/* main.js 

This project has been developed with guidance and assistance from ChatGPT, a conversational AI by OpenAI.
*/

// Entry point of the application, initializing the app once the DOM is fully loaded.

import { initializeApp } from './modules/initialize.js';

document.addEventListener("DOMContentLoaded", () => {
    try {
        initializeApp();
    } catch (error) {
        console.error("Error initializing the application:", error);
    }
});
