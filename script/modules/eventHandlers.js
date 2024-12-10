/* modules/eventHandlers.js 

This project has been developed with guidance and assistance from ChatGPT, a conversational AI by OpenAI.
*/

import { showFavorites } from "./modals.js"; // Import the displayFavorites function

/**
 * Adds event listeners for dialogs.
 */
export function addDialogListeners() {
    const dialogCloseMappings = [
        { button: "#closeCircuitDialog", dialog: "#circuit" },
        { button: "#closeDriverDialog", dialog: "#driver" },
        { button: "#closeConstructorDialog", dialog: "#constructor" },
        { button: "#closeFavoriteDialog", dialog: "#favorite" },
    ];

    // Close buttons for each dialog
    dialogCloseMappings.forEach(({ button, dialog }) => {
        const closeButton = document.querySelector(button);
        const dialogElement = document.querySelector(dialog);

        closeButton?.addEventListener("click", () => {
            dialogElement?.close();
            dialogElement.style.display = "none"; // Hide the dialog
        });
    });

    // Click outside to close dialogs
    const dialogIds = ["circuit", "driver", "constructor", "favorite"];
    dialogIds.forEach((dialogId) => {
        const dialog = document.querySelector(`#${dialogId}`);
        dialog?.addEventListener("click", (e) => {
            if (e.target === dialog) {
                dialog.close();
                dialog.style.display = "none";
            }
        });
    });

    // Add listener for the Favorites button
    document.querySelector("#favoritesButton")?.addEventListener("click", () => {
        showFavorites(); // Populate the dialog with current favorites
        const favoriteDialog = document.querySelector("#favorite");
        favoriteDialog.style.display = "flex"; // Make it visible
        favoriteDialog.showModal(); // Show the dialog
    });
}


/**
 * Attaches an event listener to the season dropdown for handling season changes.
 * @param {Function} callback - Function to handle the selected season change.
 */
export function attachSeasonDropdownHandler(callback) {
    const seasonList = document.querySelector("#seasonList");
    seasonList?.addEventListener("change", (e) => {
        const selectedSeason = e.target.value;
        if (selectedSeason) callback(selectedSeason);
    });
}

/**
 * Attaches an event listener to the logo for handling navigation back to the home page.
 * @param {Function} callback - Function to handle logo click event.
 */
export function attachLogoClickHandler(callback) {
    const logo = document.querySelector("#homeLogo");
    logo?.addEventListener("click", callback);
}



