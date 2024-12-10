/* modules/uiHelper.js 

This project has been developed with guidance and assistance from ChatGPT, a conversational AI by OpenAI.
*/

import { showCircuitDetails, showDriverDetails, showConstructorDetails } from './modals.js';

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
    homeSection.style.display = "flex";
    browseSection.style.display = "none";

    document.querySelector("#raceResults").style.display = "none";
    document.querySelector("#qualifying").innerHTML = "";
    document.querySelector("#results").innerHTML = "";
    document.querySelector("#seasonList").value = "";
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

/** Create a favorite button dynamically */
export function createFavoriteButton(name, type) {
    const button = document.createElement("button");
    button.classList.add("favorite-icon");
    button.id = "favoriteToggle";
    button.dataset.favoriteName = name;
    button.dataset.favoriteType = type;
    button.textContent = "★";

    // Set initial state
    setFavoriteIconState(name, type, button);

    button.addEventListener("click", () => {
        toggleFavorite(name, type, button);
    });

    return button;
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
        <li><strong>Circuit Name:</strong>`;

    // Append Circuit Name with the Favorite Button
    const circuitNameLi = document.createElement("li");
    circuitNameLi.innerHTML = `
        <strong>Circuit Name:</strong>
        <button class="hyperlink-style" id="circuitLink" data-circuit='${JSON.stringify(race.circuit)}'>
            ${race.circuit.name}
        </button>
    `;
    const favoriteButton = createFavoriteButton(race.circuit.name, "circuits");
    circuitNameLi.appendChild(favoriteButton);
    ul.appendChild(circuitNameLi);

    ul.innerHTML += `
        <li><strong>Date:</strong> ${race.date}</li>
        <li><strong>URL:</strong> <a href="${race.circuit.url}" target="_blank">${race.circuit.url}</a></li>
    `;
    raceInfo.appendChild(ul);

    // Event listener for circuit details
    raceInfo.addEventListener("click", (event) => {
        if (event.target.id === "circuitLink") {
            const circuitData = JSON.parse(event.target.dataset.circuit);
            showCircuitDetails(circuitData);
        }
    });

    // Last minute fix for toggling favorite for circuits
    raceInfo.addEventListener("click", (event) => {
        if (event.target.classList.contains("favorite-icon")) {
            const name = event.target.dataset.favoriteName;
            const type = event.target.dataset.favoriteType;
    
            console.log(`Delegated toggle favorite: Name=${name}, Type=${type}`);
            toggleFavorite(name, type, event.target);
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
                    // Driver column with favorite button
                    (() => {
                        const container = document.createElement("div");
                        const nameLink = createHyperlink(
                            `${item.driver?.forename || ""} ${item.driver?.surname}`,
                            () => showDriverDetails(item.driver.ref, item.race.year, resultsData)
                        );
                        const favoriteButton = createFavoriteButton(
                            `${item.driver?.forename || ""} ${item.driver?.surname}`,
                            "drivers"
                        );
                        container.appendChild(nameLink);
                        container.appendChild(favoriteButton);
                        return container;
                    })(),
                    // Constructor column with favorite button
                    (() => {
                        const container = document.createElement("div");
                        const nameLink = createHyperlink(
                            item.constructor?.name,
                            () => showConstructorDetails(item.constructor.name, item.race.year, resultsData)
                        );
                        const favoriteButton = createFavoriteButton(item.constructor?.name, "constructors");
                        container.appendChild(nameLink);
                        container.appendChild(favoriteButton);
                        return container;
                    })(),
                    item.q1 || "-",
                    item.q2 || "-",
                    item.q3 || "-",
                ];
            } else {
                // For Race Results Table
                return [
                    item.position,
                    // Driver column with favorite button
                    (() => {
                        const container = document.createElement("div");
                        const nameLink = createHyperlink(
                            `${item.driver?.forename || ""} ${item.driver?.surname}`,
                            () => showDriverDetails(item.driver.ref, item.race.year, resultsData)
                        );
                        const favoriteButton = createFavoriteButton(
                            `${item.driver?.forename || ""} ${item.driver?.surname}`,
                            "drivers"
                        );
                        container.appendChild(nameLink);
                        container.appendChild(favoriteButton);
                        return container;
                    })(),
                    // Constructor column with favorite button
                    (() => {
                        const container = document.createElement("div");
                        const nameLink = createHyperlink(
                            item.constructor?.name,
                            () => showConstructorDetails(item.constructor.name, item.race.year, resultsData)
                        );
                        const favoriteButton = createFavoriteButton(item.constructor?.name, "constructors");
                        container.appendChild(nameLink);
                        container.appendChild(favoriteButton);
                        return container;
                    })(),
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

/* ========== Favorite UI ========== */

// Adding/removing items from favorites
export function toggleFavorite(name, type, button) {
    console.log(`Toggle favorite: Name=${name}, Type=${type}, Button=${button}`);

    const validTypes = ["circuits", "drivers", "constructors"];
    if (!validTypes.includes(type)) {
        console.error(`Invalid type: ${type}. Must be one of: ${validTypes.join(", ")}`);
        return;
    }

    const favorites = JSON.parse(localStorage.getItem("favorites")) || { circuits: [], drivers: [], constructors: [] };

    if (favorites[type].includes(name)) {
        // Remove from favorites
        favorites[type] = favorites[type].filter(fav => fav !== name);
        button.style.color = ""; // Default color
    } else {
        // Add to favorites
        favorites[type].push(name);
        button.style.color = "#FF1E00"; // Favorite color
    }

    // Update localStorage
    localStorage.setItem("favorites", JSON.stringify(favorites));
}

// Ensures the icon reflects the current favorite state
export function setFavoriteIconState(name, type, button) {
    const validTypes = ["circuits", "drivers", "constructors"];
    if (!validTypes.includes(type)) {
        console.error(`Invalid type: ${type}. Must be one of: ${validTypes.join(", ")}`);
        return;
    }

    if (!button) {
        console.error(`Button is undefined for ${type}: ${name}`);
        return;
    }

    const favorites = JSON.parse(localStorage.getItem("favorites")) || { circuits: [], drivers: [], constructors: [] };

    if (favorites[type].includes(name)) {
        button.style.color = "#FF1E00"; // Favorite color
    } else {
        button.style.color = ""; // Default color
    }
}

