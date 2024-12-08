// Domain for APIs
const API_DOMAIN = "https://www.randyconnolly.com/funwebdev/3rd/api/f1";

// Execute script once DOM content is fully loaded
document.addEventListener("DOMContentLoaded", () => {
    initializeApp();
});

// Initialize the application
function initializeApp() {
    const browseLoader = document.querySelector("#browseLoader");
    const browseSection = document.querySelector("#browse");
    const homeSection = document.querySelector("#home");

    // Hide initial sections
    browseLoader.style.display = "none";
    browseSection.style.display = "none";

    // Populate season dropdown
    populateSeasons();

    // Event listener for season selection
    document.querySelector("#seasonList").addEventListener("change", (e) => {
        const selectedSeason = e.target.value;
        handleSeasonSelection(selectedSeason, homeSection, browseLoader, browseSection);
    });

    // Event listener for returning to home
    document.querySelector("#mruLogo").addEventListener("click", () => {
        navigateToHome(homeSection, browseSection);
    });

    // Event listeners for closing dialogs
    addDialogCloseListeners();

    // Event listeners for clicking outside dialogs to close
    addOutsideClickListeners();
}

// Handle season selection
function handleSeasonSelection(selectedSeason, homeSection, browseLoader, browseSection) {
    const racesKey = `races_${selectedSeason}`;
    const resultsKey = `results_${selectedSeason}`;
    const qualifyingKey = `qualifying_${selectedSeason}`;

    homeSection.style.display = "none";
    browseLoader.style.display = "flex";
    browseSection.style.display = "none";

    let racesData = localStorage.getItem(racesKey);
    let qualifyingData = localStorage.getItem(qualifyingKey);
    let resultsData = localStorage.getItem(resultsKey);

    if (!(racesData && qualifyingData && resultsData)) {
        // Fetch and cache data if not already stored
        fetchSeasonData(selectedSeason).then((data) => {
            cacheSeasonData(racesKey, qualifyingKey, resultsKey, data);
            displayRaces(data[0], data[1], data[2], selectedSeason, browseLoader, browseSection);
        }).catch((error) => {
            console.error("Data fetch failed:", error);
            alert("Failed to fetch data. Please try again.");
            browseLoader.style.display = "none";
        });
    } else {
        // Use cached data
        racesData = JSON.parse(racesData);
        qualifyingData = JSON.parse(qualifyingData);
        resultsData = JSON.parse(resultsData);
        displayRaces(racesData, qualifyingData, resultsData, selectedSeason, browseLoader, browseSection);
    }
}

// Navigate back to home
function navigateToHome(homeSection, browseSection) {
    homeSection.style.display = "block";
    browseSection.style.display = "none";

    document.querySelector("#raceResults").style.display = "none";
    document.querySelector("#qualifying").innerHTML = "";
    document.querySelector("#results").innerHTML = "";
    document.querySelector("#seasonList").value = "";
}

// Populate season dropdown
function populateSeasons() {
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

// Fetch season data
function fetchSeasonData(season) {
    const racePromise = fetch(`${API_DOMAIN}/races.php?season=${season}`)
        .then(response => {
            if (response.ok) {
                return response.json
            } else throw new Error("Error fetching race data");
        })
        .catch(error => console.log(error))
    const qualifyingPromise = fetch(`${API_DOMAIN}/qualifying.php?season=${season}`)
        .then(response => {
            if (response.ok) {
                return response.json
            } else throw new Error("Error fetching qualifying data");
        })
        .catch(error => console.log(error))
    const resultsPromise = fetch(`${API_DOMAIN}/results.php?season=${season}`)
        .then(response => {
            if (response.ok) {
                return response.json
            } else throw new Error("Error fetching results data");
        })
        .catch(error => console.log(error))
    return Promise.all([racePromise, qualifyingPromise, resultsPromise]);
}

// Cache season data in localStorage
function cacheSeasonData(racesKey, qualifyingKey, resultsKey, data) {
    localStorage.setItem(racesKey, JSON.stringify(data[0]));
    localStorage.setItem(qualifyingKey, JSON.stringify(data[1]));
    localStorage.setItem(resultsKey, JSON.stringify(data[2]));
}

// Display races
function displayRaces(racesData, qualifyingData, resultsData, season, loader, section) {
    loader.style.display = "none";
    section.style.display = "flex";

    const races = document.querySelector("#races");
    races.innerHTML = `<h2>${season} Races</h2>`;

    const headers = ["Round", "Race Name"];
    const rows = racesData.sort((a, b) => a.round - b.round).map((race) => [
        race.round,
        createHyperlink(race.name, () => populateRaceDetails(race, qualifyingData, resultsData))
    ]);

    const table = createTable(headers, rows);
    races.appendChild(table);
}

// Create table
function createTable(headers, rows) {
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


// Populate race details
function populateRaceDetails(race, qualifyingData, resultsData) {
    const resultsSection = document.querySelector("#raceResults");
    document.querySelector("#raceResults h2").innerHTML = `Results for ${race.year} <button class="hyperlink-style" id="circuitLink">${race.name}</button>`;

    document.querySelector("#circuitLink").addEventListener("click", () => {
        showCircuitDetails(race.circuit);
    });

    populateTable("#qualifying", "Qualifying", qualifyingData, race, ["Position", "Driver", "Constructor", "Q1", "Q2", "Q3"], resultsData);
    populateTable("#results", "Race Results", resultsData, race, ["Position", "Driver", "Constructor", "Laps", "Points"], resultsData);

    resultsSection.style.display = "flex";
}

// Populate a table with data
function populateTable(selector, title, data, race, headers, resultsData) {
    const container = document.querySelector(selector);
    container.innerHTML = `<h3>${title}</h3>`;

    // Determine rows based on header context
    const rows = data
        .filter((item) => item.race.round === race.round)
        .map((item) => {
            if (headers.includes("Q1")) {
                // For Qualifying Table
                return [
                    item.position,
                    createHyperlink(`${item.driver?.forename || ""} ${item.driver?.surname}`, () =>
                        fetchAndShowDriverDetails(item.driver.ref, item.race.year, resultsData)),
                    createHyperlink(item.constructor?.name, () =>
                        fetchAndShowConstructorDetails(item.constructor.name, item.race.year, resultsData)),
                    item.q1 || "-",
                    item.q2 || "-",
                    item.q3 || "-",
                ];
            } else {
                // For Race Results Table
                return [
                    item.position,
                    createHyperlink(`${item.driver?.forename || ""} ${item.driver?.surname}`, () =>
                        fetchAndShowDriverDetails(item.driver.ref, item.race.year, resultsData)),
                    createHyperlink(item.constructor?.name, () =>
                        fetchAndShowConstructorDetails(item.constructor.name, item.race.year, resultsData)),
                    item.laps || "-",
                    item.points || "-",
                ];
            }
        });

    container.appendChild(createTable(headers, rows));
}

// Create hyperlink
function createHyperlink(text, action) {
    const link = document.createElement("button");
    link.textContent = text;
    link.classList.add("hyperlink-style");
    link.addEventListener("click", action);
    return link;
}

function showCircuitDetails(circuit) {
    const dialog = document.querySelector("#circuit");
    const detailsList = document.querySelector("#circuitDetails");

    try {
        // Populate dialog with circuit details directly from the race object
        detailsList.innerHTML = `
            <li><strong>Name:</strong> ${circuit.name}</li>
            <li><strong>Location:</strong> ${circuit.location}, ${circuit.country}</li>
            <li><strong>URL:</strong> <a href="${circuit.url}" target="_blank">${circuit.url}</a></li>
        `;

        // Show the dialog
        dialog.showModal();
    } catch (error) {
        console.error("Error displaying circuit details:", error);
        detailsList.innerHTML = `<li>Error loading circuit details. Please try again later.</li>`;
        dialog.showModal();
    }
}

// Fetch and Display Driver Details
async function fetchAndShowDriverDetails(driverRef, year, resultsData) {
    const driverEndpoint = `${API_DOMAIN}/drivers.php`;
    const driverDialog = document.querySelector("#driver");
    const driverDetails = document.querySelector("#driverDetails");

    try {
        // Fetch all drivers
        const driverResponse = await fetch(driverEndpoint);
        if (!driverResponse.ok) throw new Error("Driver details not found");
        const allDrivers = await driverResponse.json();

        // Find the specific driver by driverRef
        const driverInfo = allDrivers.find((driver) => driver.driverRef === driverRef);
        if (!driverInfo) throw new Error("Driver not found");

        // Filter resultsData for the specific driver and year
        const driverResults = resultsData.filter(
            (result) => result.driver.ref === driverRef && result.race.year === parseInt(year)
        );
        if (!driverResults.length) throw new Error("No race results available for this driver in the selected year");

        // Format race results
        const raceResults = driverResults.map(
            (race) =>
                `<li>Round ${race.race.round}: ${race.race.name}, Position: ${race.position}, Points: ${race.points || 0}</li>`
        );

        // Render Driver Details
        driverDetails.innerHTML = `
            <li><strong>Name:</strong> ${driverInfo.forename} ${driverInfo.surname}</li>
            <li><strong>Date of Birth:</strong> ${driverInfo.dob || "N/A"}</li>
            <li><strong>Nationality:</strong> ${driverInfo.nationality || "N/A"}</li>
            <li><strong>URL:</strong> <a href="${driverInfo.url || "#"}" target="_blank">${driverInfo.url || "N/A"}</a></li>
            <h3>Race Results</h3>
            <ul class="scrollable-list">${raceResults.join("")}</ul>
        `;

        // Show modal
        driverDialog.showModal();
    } catch (error) {
        console.error("Error fetching driver details:", error);
        driverDetails.innerHTML = `<li>Error loading driver details. Please try again later.</li>`;
        driverDialog.showModal();
    }
}

// Fetch and Display Constructor Details
async function fetchAndShowConstructorDetails(constructorName, year, resultsData) {
    const constructorEndpoint = `${API_DOMAIN}/constructors.php`;
    const constructorDialog = document.querySelector("#constructor");
    const constructorDetails = document.querySelector("#constructorDetails");

    try {
        // Fetch all constructors
        const constructorResponse = await fetch(constructorEndpoint);
        if (!constructorResponse.ok) throw new Error("Constructor details not found");
        const allConstructors = await constructorResponse.json();

        // Find the specific constructor by name
        const constructorInfo = allConstructors.find((constructor) => constructor.name === constructorName);
        if (!constructorInfo) throw new Error("Constructor not found");

        // Filter resultsData for the specific constructor and year
        const constructorResults = resultsData.filter(
            (result) => result.constructor.name === constructorName && result.race.year === parseInt(year)
        );
        if (!constructorResults.length) throw new Error("No race results available for this constructor in the selected year");

        console.log(constructorInfo);
        console.log(constructorResults);

        // Format race results
        const raceResults = constructorResults.map(
            (result) =>
                `<li>Round ${result.race.round}: ${result.race.name}, Driver: ${result.driver.forename} ${result.driver.surname}, Position: ${result.position}, Points: ${result.points || 0}</li>`
        );

        // Render Constructor Details
        constructorDetails.innerHTML = `
            <li><strong>Name:</strong> ${constructorInfo.name}</li>
            <li><strong>Nationality:</strong> ${constructorInfo.nationality || "N/A"}</li>
            <li><strong>URL:</strong> <a href="${constructorInfo.url || "#"}" target="_blank">${constructorInfo.url || "N/A"}</a></li>
            <h3>Race Results</h3>
            <ul class="scrollable-list">${raceResults.join("")}</ul>
        `;

        // Show modal
        constructorDialog.showModal();
    } catch (error) {
        console.error("Error fetching constructor details:", error);
        constructorDetails.innerHTML = `<li>Error loading constructor details. Please try again later.</li>`;
        constructorDialog.showModal();
    }
}



// Add event listeners to close buttons
function addDialogCloseListeners() {
    document.querySelector("#closeCircuitDialog").addEventListener("click", () => {
        document.querySelector("#circuit").close();
    });
    document.querySelector("#closeDriverDialog").addEventListener("click", () => {
        document.querySelector("#driver").close();
    });
    document.querySelector("#closeConstructorDialog").addEventListener("click", () => {
        document.querySelector("#constructor").close();
    });
}

// Add event listeners for closing dialogs by clicking outside
function addOutsideClickListeners() {
    ["circuit", "driver", "constructor"].forEach((dialogId) => {
        const dialog = document.querySelector(`#${dialogId}`);
        dialog.addEventListener("click", (e) => {
            if (e.target === dialog) dialog.close();
        });
    });
}
