// modules/uiHelper.js

import { fetchDrivers, fetchConstructors } from "./dataService.js";

/* ========== UI Management ========== */

/** Populate season dropdown with predefined values */
export function populateSeasons() {
    const seasons = [2020, 2021, 2022, 2023];
    const select = document.querySelector("#seasonList");

    const placeholder = document.createElement("option");
    placeholder.textContent = "Select a season";
    placeholder.value = "";
    placeholder.selected = true;
    placeholder.disabled = true;
    select.appendChild(placeholder);

    seasons.forEach((season) => {
        const option = document.createElement("option");
        option.textContent = season;
        option.value = season;
        select.appendChild(option);
    });
}

/** Navigate to home section and reset relevant UI elements */
export function navigateToHome(homeSection, browseSection) {
    homeSection.style.display = "block";
    browseSection.style.display = "none";

    document.querySelector("#raceResults").style.display = "none";
    document.querySelector("#qualifying").innerHTML = "";
    document.querySelector("#results").innerHTML = "";
    document.querySelector("#seasonList").value = "";
}

/* ========== Table and Reusable Components ========== */

/** Create a table dynamically based on provided headers and rows */
export function createTable(headers, rows) {
    const table = document.createElement("table");
    const thead = document.createElement("thead");
    const headerRow = document.createElement("tr");

    headers.forEach((header) => {
        const th = document.createElement("th");
        th.textContent = header;
        headerRow.appendChild(th);
    });

    thead.appendChild(headerRow);
    table.appendChild(thead);

    const tbody = document.createElement("tbody");
    rows.forEach((row) => {
        const tr = document.createElement("tr");
        row.forEach((cell) => {
            const td = document.createElement("td");
            if (cell instanceof HTMLElement) td.appendChild(cell);
            else td.textContent = cell;
            tr.appendChild(td);
        });
        tbody.appendChild(tr);
    });

    table.appendChild(tbody);
    return table;
}

/** Create a button styled as a hyperlink */
export function createHyperlink(text, action, customClass = "hyperlink-style") {
    const link = document.createElement("button");
    link.textContent = text;
    link.classList.add(customClass);
    link.addEventListener("click", action);
    return link;
}

/* ========== Content Population ========== */

/** Display race data in a table */
export function displayRaces(racesData, qualifyingData, resultsData, season, loader, section) {
    loader.style.display = "none";
    section.style.display = "flex";

    const races = document.querySelector("#races");
    races.innerHTML = `<h2>${season} Races</h2>`;

    const headers = ["Rnd#", "Race Name"];
    const rows = racesData.sort((a, b) => a.round - b.round).map((race) => [
        race.round,
        createHyperlink(race.name, () => populateRaceDetails(race, qualifyingData, resultsData), "button-style"),
    ]);

    const table = createTable(headers, rows);
    races.appendChild(table);
}

/** Populate race details in the UI */
export function populateRaceDetails(race, qualifyingData, resultsData) {
    const raceInfo = document.querySelector("#raceInfo");

    // Clear existing content
    raceInfo.innerHTML = ""

    // Create and append the <h2> element
    const h2 = document.createElement("h2");
    h2.textContent = `Results for ${race.year} ${race.name}`;
    raceInfo.appendChild(h2);

    // Populate race info
    const ul = document.createElement("ul");
    ul.innerHTML = `
        <li><strong>Race Name:</strong> ${race.name}</li>
        <li><strong>Rnd#:</strong> ${race.round}</li>
        <li><strong>Year:</strong> ${race.year}</li>
        <li><strong>Circuit Name:</strong> <button class="hyperlink-style" id="circuitLink" data-circuit='${JSON.stringify(race.circuit)}'>
            ${race.circuit.name}</button></li>
        <li><strong>Date:</strong> ${race.date}</li>
        <li><strong>URL:</strong> <a href="${race.circuit.url}" target="_blank">${race.circuit.url}</a></li>
    `;
    raceInfo.appendChild(ul);

    // Attach a single event listener for all circuit links (delegation)
    raceInfo.addEventListener("click", (event) => {
        const target = event.target;

        // Ensure the click event is on a circuit link
        if (target.matches(".hyperlink-style") && target.id === "circuitLink") {
            const circuitData = target.dataset.circuit; // Retrieve circuit data from attribute
            showCircuitDetails(JSON.parse(circuitData)); // Display details
        }
    });

    // Populate qualifying and results tables
    populateTable("#qualifying", "Qualifying", qualifyingData, race, ["Pos#", "Driver", "Constructor", "Q1", "Q2", "Q3"], resultsData);
    populateTable("#results", "Race Results", resultsData, race, ["Pos#", "Driver", "Constructor", "Laps", "Pts"], resultsData);

    // Show the results section
    document.querySelector("#raceResults").style.display = "flex";
}

/** Populate a table dynamically based on data and headers */
export function populateTable(selector, title, data, race, headers, resultsData) {
    const container = document.querySelector(selector);
    container.innerHTML = `<h3>${title}</h3>`;

    let tableId, tableClasses = ["results"];
    if (selector === "#qualifying") {
        tableId = "qualifyingTable";
    } else if (selector === "#results") {
        tableId = "resultsTable";
        tableClasses.push("placement");
    }

    const rows = data
        .filter((item) => item.race.round === race.round)
        .map((item) => {
            if (headers.includes("Q1")) {
                return [
                    item.position,
                    createHyperlink(`${item.driver?.forename || ""} ${item.driver?.surname}`, () =>
                        showDriverDetails(item.driver.ref, item.race.year, resultsData)),
                    createHyperlink(item.constructor?.name, () =>
                        showConstructorDetails(item.constructor.name, item.race.year, resultsData)),
                    item.q1 || "-",
                    item.q2 || "-",
                    item.q3 || "-",
                ];
            } else {
                return [
                    item.position,
                    createHyperlink(`${item.driver?.forename || ""} ${item.driver?.surname}`, () =>
                        showDriverDetails(item.driver.ref, item.race.year, resultsData)),
                    createHyperlink(item.constructor?.name, () =>
                        showConstructorDetails(item.constructor.name, item.race.year, resultsData)),
                    item.laps || "-",
                    item.points || "-",
                ];
            }
        });

    const table = createTable(headers, rows);
    table.id = tableId;
    tableClasses.forEach((cls) => table.classList.add(cls));

    container.appendChild(table);
}

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