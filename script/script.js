// Domain for APIs
const domain = `https://www.randyconnolly.com/funwebdev/3rd/api/f1`;

// Execute script until DOM content is fully loaded
document.addEventListener("DOMContentLoaded", function () {

    // Loaders and sections
    const loader1 = document.querySelector("#loader1");
    const browseSection = document.querySelector("#browse");
    const raceResultsSection = document.querySelector("#raceResults");

    // First hide loaders and sections
    loader1.style.display = "none";
    browseSection.style.display = "none"
    raceResultsSection.style.display = "none";

    // Populate <select> season list with options
    populateSeasons();

    // Add event listener for season selection
    document.querySelector("#seasonList").addEventListener("change", function (e) {
        const selectedSeason = e.target.value;

        // Append season to localStorage keys
        const racesKey = `races_${selectedSeason}`;
        const resultsKey = `results_${selectedSeason}`;
        const qualifyingKey = `qualifying_${selectedSeason}`;

        // Display loader
        loader1.style.display = "block";
        browseSection.style.display = "none";

        // Check if data for the season already exists in localStorage
        let racesData = localStorage.getItem(racesKey);
        let qualifyingData = localStorage.getItem(qualifyingKey);
        let resultsData = localStorage.getItem(resultsKey);

        if (!(racesData && qualifyingData && resultsData)) {

            //Fetch new data
            getSeasonData(selectedSeason).then(data => {
                displayRaces(data[0]);

                // Save all data in localStorage
                localStorage.setItem(racesKey, JSON.stringify(data[0]));
                localStorage.setItem(resultsKey, JSON.stringify(data[1]));
                localStorage.setItem(qualifyingKey, JSON.stringify(data[2]));

                // Hide loader and display content
                loader1.style.display = "none";
                browseSection.style.display = "block";
            }).catch(error => {
                console.log("Data fetch failed:", error);
                loader1.style.display = "none";
            })
        } else {
            // Load locally stored data
            displayRaces(JSON.parse(racesData));

            // Display races and then hide results and qualifying area
            loader1.style.display = "none";
            browseSection.style.display = "block";
            raceResultsSection.style.display = "none";
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
function displayRaces(data) {
    const raceList = document.querySelector("#raceList");
    raceList.innerHTML = "";
    raceList.innerHTML = data.map(race => `<li>${race.name}</li>`).join("");
}