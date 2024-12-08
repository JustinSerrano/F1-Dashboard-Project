// Domain for APIs
const domain = `https://www.randyconnolly.com/funwebdev/3rd/api/f1`;

// Execute script until DOM content is fully loaded
document.addEventListener("DOMContentLoaded", function () {

    // Loaders and sections
    const browseLoader = document.querySelector("#browseLoader");
    const browseSection = document.querySelector("#browse");

    // First hide loaders and sections
    browseLoader.style.display = "none";
    browseSection.style.display = "none"

    // Populate <select> season list with options
    populateSeasons();

    // Add event listener for season selection
    document.querySelector("#seasonList").addEventListener("change", function (e) {
        const selectedSeason = e.target.value;

        // Append season to localStorage keys
        const racesKey = `races_${selectedSeason}`;
        const resultsKey = `results_${selectedSeason}`;
        const qualifyingKey = `qualifying_${selectedSeason}`;

        // Hide the home section
        const homeSection = document.querySelector("#home");
        homeSection.style.display = "none";

        // Display the browse loader
        browseLoader.style.display = "block";
        browseSection.style.display = "none";

        // Check if data for the season already exists in localStorage
        let racesData = localStorage.getItem(racesKey);
        let qualifyingData = localStorage.getItem(qualifyingKey);
        let resultsData = localStorage.getItem(resultsKey);

        if (!(racesData && qualifyingData && resultsData)) {

            //Fetch new data
            getSeasonData(selectedSeason).then(data => {

                // Hide the loader and show the browse section
                browseLoader.style.display = "none";
                browseSection.style.display = "block";

                displayRaces(data[0], data[1], data[2], selectedSeason);

                // Save all data in localStorage
                localStorage.setItem(racesKey, JSON.stringify(data[0]));
                localStorage.setItem(resultsKey, JSON.stringify(data[1]));
                localStorage.setItem(qualifyingKey, JSON.stringify(data[2]));
            }).catch(error => {
                console.log("Data fetch failed:", error);
                browseLoader.style.display = "none";
                alert("Failed to fetch data. Please try again.");
            })
        } else {
            // Display the browse loader
            browseLoader.style.display = "block";
            browseSection.style.display = "none"

            // Load locally stored data
            racesData = JSON.parse(localStorage.getItem(racesKey));
            qualifyingData = JSON.parse(localStorage.getItem(qualifyingKey));
            resultsData = JSON.parse(localStorage.getItem(resultsKey));

            // Display races
            displayRaces(racesData, qualifyingData, resultsData, selectedSeason);

            // Hide loader and display browse section
            browseLoader.style.display = "none";
            browseSection.style.display = "block";
        }
    })

    // MRU logo returns to home section
    document.querySelector("#mruLogo").addEventListener("click", function () {
        const homeSection = document.querySelector("#home");
        const browseSection = document.querySelector("#browse");
        const raceResultsSection = document.querySelector("#raceResults");

        homeSection.style.display = "block";
        browseSection.style.display = "none";
        raceResultsSection.style.display = "none";

        // Reset any displayed race details
        document.querySelector("#qualifying").innerHTML = "";
        document.querySelector("#results").innerHTML = "";

        // Reset season dropdown
        document.querySelector("#seasonList").value = "";
    });
})

// Populate seasonList <select> tag with years
function populateSeasons() {
    const seasons = [2020, 2021, 2022, 2023];
    const select = document.querySelector("#seasonList");

    // Create placeholder
    const placeholder = document.createElement("option");
    placeholder.textContent = "Select a season";
    placeholder.value = "";
    placeholder.selected = true;
    placeholder.disabled = true;
    select.appendChild(placeholder);

    seasons.forEach(season => {
        const option = document.createElement("option");
        option.textContent = season;
        option.value = season;
        select.appendChild(option);
    })
}

// Fetch races, results, and qualifying data for selected season
function getSeasonData(season) {
    let prom1 = fetch(domain + `/races.php?season=${season}`)
        .then(response => (response.ok ? response.json() : Promise.reject("Error fetching race data")))
        .catch(error => console.log(error));

    let prom2 = fetch(domain + `/results.php?season=${season}`)
        .then(response => (response.ok ? response.json() : Promise.reject("Error fetching results data")))
        .catch(error => console.log(error));

    let prom3 = fetch(domain + `/qualifying.php?season=${season}`)
        .then(response => (response.ok ? response.json() : Promise.reject("Error fetching qualifying data")))
        .catch(error => console.log(error));

    return Promise.all([prom1, prom2, prom3]);
}

// Abstract table creation helper function
function createTable(headers, rows) {
    const table = document.createElement("table");

    // Create table headers
    const thead = document.createElement("thead");
    const headerRow = document.createElement("tr");
    headers.forEach(header => {
        const th = document.createElement("th");
        th.textContent = header;
        headerRow.appendChild(th);
    });
    thead.appendChild(headerRow);
    table.appendChild(thead);

    // Create table rows
    const tbody = document.createElement("tbody");
    rows.forEach(row => {
        const tr = document.createElement("tr");
        row.forEach(cell => {
            const td = document.createElement("td");
            td.textContent = cell;
            tr.appendChild(td);
        });
        tbody.appendChild(tr);
    });
    table.appendChild(tbody);

    return table;
}



// Display races data
function displayRaces(racesData, qualifyingData, resultsData, selectedSeason) {
    const races = document.querySelector("#races");
    races.innerHTML = "";

    // Create header
    const h2 = document.createElement("h2");
    h2.textContent = `${selectedSeason} Races`;
    races.appendChild(h2);

    // Prepare data for the table
    const headers = ["Round", "Race Name", "Action"];
    const rows = racesData.sort((a, b) => a.round - b.round).map(race => [
        race.round,
        race.name,
        "View Details"
    ]);

    // Generate the table
    const table = createTable(headers, rows);

    // Add event listeners to "View Details" buttons
    const buttons = table.querySelectorAll("tbody tr td:last-child");
    buttons.forEach((cell, index) => {
        const button = document.createElement("button");
        button.textContent = "View Details";
        button.addEventListener("click", () => populateRaceDetails(racesData[index], qualifyingData, resultsData));
        cell.textContent = ""; // Clear placeholder text
        cell.appendChild(button);
    });

    races.appendChild(table);
}

// Populate race details
function populateRaceDetails(race, qualifyingData, resultsData) {
    const raceResultsSection = document.querySelector("#raceResults");

    // Update headaer
    const resultsHeader = document.querySelector("#raceResults h2");
    resultsHeader.textContent = `Results for ${race.year} ${race.name}`;

    // Populate qualifying table
    const qualifyingList = document.querySelector("#qualifying");
    qualifyingList.innerHTML = "<h3>Qualifying</h3>";

    const qualifyingHeaders = ["Position", "Driver", "Constructor", "Q1", "Q2", "Q3"];
    const qualifyingRows = qualifyingData
        .filter(q => q.race.round === race.round)
        .map(q => [
            q.position,
            `${q.driver.forename} ${q.driver.surname}`,
            q.constructor.name,
            q.q1 || "-",
            q.q2 || "-",
            q.q3 || "-"
        ]);

    const qualifyingTable = createTable(qualifyingHeaders, qualifyingRows);
    qualifyingList.appendChild(qualifyingTable);

    // Populate results table
    const resultsList = document.querySelector("#results");
    resultsList.innerHTML = "<h3>Race Results</h3>";

    const resultsHeaders = ["Position", "Driver", "Constructor", "Laps", "Points"];
    const resultsRows = resultsData
        .filter(r => r.race.round === race.round)
        .map(r => [
            r.position,
            `${r.driver.forename} ${r.driver.surname}`,
            r.constructor.name,
            r.laps,
            r.points
        ]);

    const resultsTable = createTable(resultsHeaders, resultsRows);
    resultsList.appendChild(resultsTable);

    // Display raceResults section
    raceResultsSection.style.display = "block";
}
