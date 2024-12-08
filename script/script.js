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

// Display races data
function displayRaces(racesData, qualifyingData, resultsData, selectedSeason) {
    const races = document.querySelector("#races");
    races.innerHTML = "";

    // Create header
    const h2 = document.createElement("h2");
    h2.textContent = `${selectedSeason} Races`;
    races.appendChild(h2);

    // Create a table for races
    const table = document.createElement("table");
    table.innerHTML = `
        <thead>
            <tr>
                <th>Round</th>
                <th>Race Name</th>
                <th>Action</th>
            </tr>
        </thead>
        <tbody id="raceTableBody"></tbody>
    `;

    // Sort racesData by round
    const sortedRaces = racesData.sort((a, b) => a.round - b.round);

    // Populate table with race data
    const tbody = table.querySelector("#raceTableBody");
    sortedRaces.forEach(race => {
        const tr = document.createElement("tr");

        const roundCell = document.createElement("td");
        roundCell.textContent = race.round;

        const nameCell = document.createElement("td");
        nameCell.textContent = race.name;

        const actionCell = document.createElement("td");
        const button = document.createElement("button");
        button.textContent = "View Details";
        button.addEventListener("click", () => populateRaceDetails(race, qualifyingData, resultsData));
        actionCell.appendChild(button);

        tr.appendChild(roundCell);
        tr.appendChild(nameCell);
        tr.appendChild(actionCell);
        tbody.appendChild(tr);
    });

    races.appendChild(table);
}

// Populate race details
function populateRaceDetails(race, qualifyingData, resultsData) {
    const raceResultsSection = document.querySelector("#raceResults");

    // Update headaer
    const resultsHeader = document.querySelector("#raceResults h2");
    resultsHeader.textContent = `Results for ${race.year} ${race.name}`;

    // Populate qualifying data with a table
    const qualifyingList = document.querySelector("#qualifying");
    qualifyingList.innerHTML = "";
    qualifyingList.innerHTML = `
        <h3>Qualifying</h3>
        <table>
            <thead>
                <tr>
                    <th>Position</th>
                    <th>Driver</th>
                    <th>Constructor</th>
                    <th>Q1</th>
                    <th>Q2</th>
                    <th>Q3</th>
                </tr>
            </thead>
            <tbody id="qualifyingTableBody"></tbody>
        </table>
    `;
    const qualifyingBody = qualifyingList.querySelector("#qualifyingTableBody");
    const filteredQualifying = qualifyingData.filter(q => q.race.round === race.round);

    filteredQualifying.forEach(q => {
        const tr = document.createElement("tr");

        tr.innerHTML = `
            <td>${q.position}</td>
            <td>${q.driver.forename} ${q.driver.surname}</td>
            <td>${q.constructor.name}</td>
            <td>${q.q1 || "-"}</td>
            <td>${q.q2 || "-"}</td>
            <td>${q.q3 || "-"}</td>
        `;

        qualifyingBody.appendChild(tr);
    });

    // Populate results data with a table
    const resultsList = document.querySelector("#results");
    resultsList.innerHTML = "";
    resultsList.innerHTML = `
        <h3>Race Results</h3>
        <table>
            <thead>
                <tr>
                    <th>Position</th>
                    <th>Driver</th>
                    <th>Constructor</th>
                    <th>Laps</th>
                    <th>Points</th>
                </tr>
            </thead>
            <tbody id="resultsTableBody"></tbody>
        </table>
    `;
    const resultsBody = resultsList.querySelector("#resultsTableBody");
    const filteredResults = resultsData.filter(r => r.race.round === race.round);

    filteredResults.forEach(r => {
        const tr = document.createElement("tr");

        tr.innerHTML = `
            <td>${r.position}</td>
            <td>${r.driver.forename} ${r.driver.surname}</td>
            <td>${r.constructor.name}</td>
            <td>${r.laps}</td>
            <td>${r.points}</td>
        `;

        resultsBody.appendChild(tr);
    });

    // Display raceResults section
    raceResultsSection.style.display = "block";
}