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

/** Sort the table based on a column and type */
export function sortTable(table, columnIndex, type, activeHeader) {
    const tbody = table.querySelector("tbody");
    const rows = Array.from(tbody.querySelectorAll("tr"));

    // Determine sorting order
    const isAscending = !activeHeader.classList.contains("asc");
    table.querySelectorAll("th").forEach(th => th.classList.remove("asc", "desc")); // Reset all headers
    activeHeader.classList.toggle("asc", isAscending);
    activeHeader.classList.toggle("desc", !isAscending);

    // Sort rows based on column content
    rows.sort((a, b) => {
        const cellA = a.children[columnIndex].textContent.trim();
        const cellB = b.children[columnIndex].textContent.trim();

        if (type === "number") {
            return isAscending ? cellA - cellB : cellB - cellA;
        } else {
            return isAscending ? cellA.localeCompare(cellB) : cellB.localeCompare(cellA);
        }
    });

    // Re-append sorted rows to tbody
    rows.forEach(row => tbody.appendChild(row));
}


/* ========== Table and Reusable Components ========== */

/** Create a table dynamically based on provided headers and rows */
export function createTable(headers, rows, tableId = "") {
    const table = document.createElement("table");
    table.id = tableId;

    // Create thead with headers
    const thead = document.createElement("thead");
    const headerRow = document.createElement("tr");
    headers.forEach((header, index) => {
        const th = document.createElement("th");
        th.textContent = header.label || header;
        th.dataset.sortIndex = index;
        th.dataset.sortType = header.type || "string";

        headerRow.appendChild(th);
    });

    thead.appendChild(headerRow);
    table.appendChild(thead);

    // Create tbody with rows
    const tbody = document.createElement("tbody");
    rows.forEach((row) => {
        const tr = document.createElement("tr");

        // Apply dynamic styling only for the resultsTable
        if (tableId === "resultsTable") {
            const position = parseInt(row[0], 10); // Convert first cell to a number
            if (position === 1) tr.style.backgroundColor = "#FFD700"; // Gold
            if (position === 2) tr.style.backgroundColor = "#C0C0C0"; // Silver
            if (position === 3) tr.style.backgroundColor = "#CD7F32"; // Bronze
        }

        row.forEach((cell) => {
            const td = document.createElement("td");
            if (cell instanceof HTMLElement) td.appendChild(cell);
            else td.textContent = cell;
            tr.appendChild(td);
        });
        tbody.appendChild(tr);
    });
    table.appendChild(tbody);

    // Enable sorting for this table
    enableTableSorting(table);

    return table;
}

/** Enable sorting functionality for a given table */
export function enableTableSorting(table) {
    const headers = table.querySelectorAll("thead th");
    headers.forEach((header) => {
        header.addEventListener("click", () => {
            const columnIndex = header.dataset.sortIndex;
            const type = header.dataset.sortType || "string";
            const tbody = table.querySelector("tbody");
            const rows = Array.from(tbody.querySelectorAll("tr"));

            // Determine sorting order
            const isAscending = !header.classList.contains("asc");
            table.querySelectorAll("th").forEach((th) => th.classList.remove("asc", "desc"));
            header.classList.toggle("asc", isAscending);
            header.classList.toggle("desc", !isAscending);

            // Sort rows
            rows.sort((a, b) => {
                const cellA = a.children[columnIndex].textContent.trim();
                const cellB = b.children[columnIndex].textContent.trim();
                return type === "number"
                    ? (isAscending ? cellA - cellB : cellB - cellA)
                    : (isAscending ? cellA.localeCompare(cellB) : cellB.localeCompare(cellA));
            });

            // Re-append sorted rows
            rows.forEach((row) => tbody.appendChild(row));
        });
    });
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

    const headers = [
        { label: "Rnd#", type: "number" },
        { label: "Race Name", type: "string" },
    ];
    const rows = racesData.map((race) => [
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

    // Add title and race details
    const h2 = document.createElement("h2");
    h2.textContent = `Results for ${race.year} ${race.name}`;
    raceInfo.appendChild(h2);

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

    raceInfo.addEventListener("click", (event) => {
        if (event.target.matches(".hyperlink-style") && event.target.id === "circuitLink") {
            const circuitData = JSON.parse(event.target.dataset.circuit);
            showCircuitDetails(circuitData);
        }
    });

    // Populate tables
    populateTable("#qualifying", "Qualifying", qualifyingData, race, [
        { label: "Pos#", type: "number" },
        "Driver",
        "Constructor",
        "Q1",
        "Q2",
        "Q3",
    ], resultsData);

    populateTable("#results", "Race Results", resultsData, race, [
        { label: "Pos#", type: "number" },
        "Driver",
        "Constructor",
        "Laps",
        { label: "Pts", type: "number" },
    ], resultsData);

    document.querySelector("#raceResults").style.display = "flex";
}

/** Populate a table dynamically based on data and headers */
export function populateTable(selector, title, data, race, headers, resultsData) {
    const container = document.querySelector(selector);
    container.innerHTML = `<h3>${title}</h3>`;

    // Determine table id and classes
    let tableId, tableClasses = ["results"];
    if (selector === "#qualifying") {
        tableId = "qualifyingTable";
    } else if (selector === "#results") {
        tableId = "resultsTable";
    }

    // Generate table rows
    const rows = data
        .filter((item) => item.race.round === race.round)
        .map((item) => {
            if (headers.includes("Q1")) {
                // For Qualifying Table
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
                // For Race Results Table
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

    const table = createTable(headers, rows, tableId);
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