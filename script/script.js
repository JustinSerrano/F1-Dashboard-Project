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

                displayRaces(data[0], selectedSeason);

                // Save all data in localStorage
                localStorage.setItem(racesKey, JSON.stringify(data[0]));
                localStorage.setItem(resultsKey, JSON.stringify(data[1]));
                localStorage.setItem(qualifyingKey, JSON.stringify(data[2]));
            }).catch(error => {
                console.log("Data fetch failed:", error);
                browseLoader.style.display = "none";
            })
        } else {
            // Display the browse loader
            browseLoader.style.display = "block";
            browseSection.style.display = "none"

            // Load locally stored data
            displayRaces(JSON.parse(racesData), selectedSeason);

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
function displayRaces(data, season) {
    const races = document.querySelector("#races");
    races.innerHTML ="";

    // Create header
    const h2 = document.createElement("h2");
    h2.textContent = `${season} Races`;
    races.appendChild(h2);

    // Create raceList
    const raceList = document.createElement("ul");
    raceList.id = "raceList";
    raceList.innerHTML = data.map(race => `<li>${race.name}</li>`).join("");
    races.appendChild(raceList);
}