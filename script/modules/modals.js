/* modules/modals.js 

This project has been developed with guidance and assistance from ChatGPT, a conversational AI by OpenAI.
*/

import { fetchDrivers, fetchConstructors } from "./dataService.js";

/* ========== Modal-Specific Logic ========== */

/**
 * Show circuit details in a modal.
 * @param {Object} circuit - Circuit data object containing details to display.
 */
export function showCircuitDetails(circuit) {
    const dialog = document.querySelector("#circuit");
    const contentContainer = document.querySelector("#circuitDetails");

    try {
        // Generate dynamic content
        contentContainer.innerHTML = `
            <h2>Circuit Details</h2>
            <img src="https://placehold.co/150x100" alt="Circuit image placeholder">
            <ul>
                <li><strong>Name:</strong> ${circuit.name}</li>
                <li><strong>Location:</strong> ${circuit.location}, ${circuit.country}</li>
                <li><strong>URL:</strong> <a href="${circuit.url}" target="_blank">${circuit.url}</a></li>
            </ul>
        `;

        // Show modal
        dialog.style.display = "flex"; // Make it visible if not already set
        dialog.showModal();
    } catch (error) {
        console.error("Error displaying circuit details:", error);
        contentContainer.innerHTML = `<p>Error loading circuit details. Please try again later.</p>`;
        dialog.showModal();
    }
}

/** Show driver details in a modal */
export async function showDriverDetails(driverRef, year, resultsData) {
    const driverDialog = document.querySelector("#driver");
    const driverDetails = document.querySelector("#driverDetails");

    try {
        // Fetch drivers
        const allDrivers = await fetchDrivers();

        // Find the specific driver by driverRef
        const driverInfo = allDrivers.find((driver) => driver.driverRef === driverRef);
        if (!driverInfo) throw new Error("Driver not found");

        // Filter resultsData for the specific driver and year
        const driverResults = resultsData.filter(
            (result) => result.driver.ref === driverRef && result.race.year === parseInt(year)
        );
        if (!driverResults.length) throw new Error("No race results available for this driver in the selected year");

        // Format race results into table rows
        const raceResults = driverResults.map(
            (race) => `
                <tr>
                    <td>${race.race.round}</td>
                    <td>${race.race.name}</td>
                    <td>${race.position}</td>
                    <td>${race.points || 0}</td>
                </tr>
            `
        ).join("");

        // Populate driver-info section
        driverDetails.innerHTML = `
            <div class="driver-content">
                <div class="driver-info">
                    <h2>Driver Details</h2>
                    <img src="https://placehold.co/150x100" alt="Driver image placeholder">
                    <ul>
                        <li><strong>Name:</strong> ${driverInfo.forename} ${driverInfo.surname}</li>
                        <li><strong>Date of Birth:</strong> ${driverInfo.dob || "N/A"}</li>
                        <li><strong>Nationality:</strong> ${driverInfo.nationality || "N/A"}</li>
                        <li><strong>URL:</strong> <a href="${driverInfo.url || "#"}" target="_blank">${driverInfo.url || "N/A"}</a></li>
                    </ul>
                </div>
                <div class="race-results">
                    <h3>Race Results</h3>
                    <div class="modal-table">
                        <table>
                            <thead>
                                <tr>
                                    <th>Rnd#</th>
                                    <th>Race Name</th>
                                    <th>Pos#</th>
                                    <th>Pts</th>
                                </tr>
                            </thead>
                            <tbody>
                                ${raceResults}
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>
        `;

        // Show modal
        driverDialog.style.display = "flex";
        driverDialog.showModal();
    } catch (error) {
        console.error("Error fetching driver details:", error);
        driverDetails.innerHTML = `<li>Error loading driver details. Please try again later.</li>`;
        driverDialog.style.display = "flex";
        driverDialog.showModal();
    }
}

/** Show constructor details in a modal */
export async function showConstructorDetails(constructorName, year, resultsData) {
    const constructorDialog = document.querySelector("#constructor");
    const constructorDetails = document.querySelector("#constructorDetails");

    try {
        // Fetch constructors
        const allConstructors = await fetchConstructors();

        // Find the specific constructor by name
        const constructorInfo = allConstructors.find((constructor) => constructor.name === constructorName);
        if (!constructorInfo) throw new Error("Constructor not found");

        // Filter resultsData for the specific constructor and year
        const constructorResults = resultsData.filter(
            (result) => result.constructor.name === constructorName && result.race.year === parseInt(year)
        );
        if (!constructorResults.length) throw new Error("No race results available for this constructor in the selected year");

        console.log(constructorResults);
        // Format race results into table rows
        const raceResults = constructorResults.map(
            (race) => `
                <tr>
                    <td>${race.race.round}</td>
                    <td>${race.race.name}</td>
                    <td>${race.driver.forename} ${race.driver.surname}</td>
                    <td>${race.position}</td>
                    <td>${race.points || 0}</td>
                </tr>
            `
        ).join("");

        // Render Constructor Details
        // Populate constructor-info section
        constructorDetails.innerHTML = `
            <div class="constructor-content">
                <div class="constructor-info">
                    <h2>Constructor Details</h2>
                    <img src="https://placehold.co/150x100" alt="Driver image placeholder">
                    <ul>
                        <li><strong>Name:</strong> ${constructorInfo.name}</li>
                        <li><strong>Nationality:</strong> ${constructorInfo.nationality || "N/A"}</li>
                        <li><strong>URL:</strong> <a href="${constructorInfo.url || "#"}" target="_blank">${constructorInfo.url || "N/A"}</a></li>
                    </ul>
                </div>
                <div class="race-results">
                    <h3>Race Results</h3>
                    <div class="modal-table">
                        <table>
                            <thead>
                                <tr>
                                    <th>Rnd#</th>
                                    <th>Race Name</th>
                                    <th>Driver</th>
                                    <th>Pos#</th>
                                    <th>Pts</th>
                                </tr>
                            </thead>
                            <tbody>
                                ${raceResults}
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>
        `;

        // Show modal
        constructorDialog.style.display = "flex";
        constructorDialog.showModal();
    } catch (error) {
        console.error("Error fetching constructor details:", error);
        constructorDetails.innerHTML = `<li>Error loading constructor details. Please try again later.</li>`;
        constructorDialog.style.display = "flex";
        constructorDialog.showModal();
    }
}

// Function to display the list of favorite circuits, drivers, and constructors
export function showFavorites() {
    const favorites = JSON.parse(localStorage.getItem("favorites")) || { circuits: [], drivers: [], constructors: [] };

    // Populate the circuits section
    const favoriteCircuitsList = document.querySelector("#favoriteDetails");
    favoriteCircuitsList.innerHTML = favorites.circuits.length
        ? favorites.circuits
            .map(
                (circuit) => `
            <li>
                ${circuit}
                <button class="remove-favorite" onclick="removeFavoriteCircuit('${circuit}')">Remove</button>
            </li>
        `
            )
            .join("")
        : "<p>No favorite circuits yet!</p>";

    // Populate drivers
    const favoriteDriversList = document.querySelector("#favoriteDetails");
    favoriteDriversList.innerHTML = favorites.drivers
        .map((driver) => `
            <li>
                ${driver}
                <button onclick="removeFavorite('${driver}', 'drivers')">Remove</button>
            </li>
        `)
        .join("");

    // Populate constructors
    const favoriteConstructorsList = document.querySelector("#favoriteDetails");
    favoriteConstructorsList.innerHTML = favorites.constructors
        .map((constructor) => `
            <li>
                ${constructor}
                <button onclick="removeFavorite('${constructor}', 'constructors')">Remove</button>
            </li>
        `)
        .join("");
}

// Function to remove a circuit from the favorites list
export function removeFavoriteCircuit(circuitName) {
    const favorites = JSON.parse(localStorage.getItem("favorites")) || { circuits: [], drivers: [], constructors: [] };
    favorites.circuits = favorites.circuits.filter(fav => fav !== circuitName);
    localStorage.setItem("favorites", JSON.stringify(favorites));

    // Re-render the favorites dialog
    showFavorites();
}
