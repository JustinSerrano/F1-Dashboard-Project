// modules/eventHandlers.js

/**
 * Adds event listeners to close dialog modals when the close button is clicked.
 */
export function addDialogCloseListeners() {
    const dialogCloseMappings = [
        { button: "#closeCircuitDialog", dialog: "#circuit" },
        { button: "#closeDriverDialog", dialog: "#driver" },
        { button: "#closeConstructorDialog", dialog: "#constructor" },
    ];

    dialogCloseMappings.forEach(({ button, dialog }) => {
        const closeButton = document.querySelector(button);
        const dialogElement = document.querySelector(dialog);

        closeButton?.addEventListener("click", () => {
            dialogElement?.close();
            dialogElement.style.display = "none"; // Hide the dialog by setting display to none
        });
    });
}

/**
 * Adds event listeners to close dialog modals when clicking outside the dialog content.
 */
export function addOutsideClickListeners() {
    const dialogIds = ["circuit", "driver", "constructor"];
    dialogIds.forEach((dialogId) => {
        const dialog = document.querySelector(`#${dialogId}`);
        dialog?.addEventListener("click", (e) => {
            if (e.target === dialog) {
                dialog.close();
                dialog.style.display = "none"; // Hide the dialog
            }
        });
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
    const logo = document.querySelector("#f1Logo");
    logo?.addEventListener("click", callback);
}

