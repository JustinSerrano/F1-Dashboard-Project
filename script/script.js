const url = `https://www.randyconnolly.com/funwebdev/3rd/api/f1`;

// Execute script until DOM content is fully loaded
document.addEventListener("DOMContentLoaded", function () {
    // Check if data for the season already exists 
    // in localStorage, if so, load it into memory 
    // and then skip to displayRaces() and hide other data
    let resultData;
    let qualifyingData;
    let data = localStorage.setItem("races");
    if (!data) {
        //Display loading animation

        //Fetch races, results, and qualifuing data for the selected season
        getSeasonData().then(data => {
            displayRaces(data[0]);
            resultData = data[1];
            qualifyingData = data[2];

            // Save all data in localStorage
            localStorage.setItem("races", JSON.stringify(data[0]))
            localStorage.setItem("results", JSON.stringify(data[1]))
            localStorage.setItem("qualifying", JSON.stringify(data[2]))
        })
    } else {
        // Load locally stored data
        resultData = JSON.parse(localStorage("results"))
        
    }


})

function getSeasonData(season) {
    let prom1 =
        fetch(url + `/races.php?season=${season}`
            .then(response => {
                if (response.ok) {
                    return response.json()
                } else throw new Error("Error: could not fetch race data")
            }).catch(error => { console.log(error) }));

}