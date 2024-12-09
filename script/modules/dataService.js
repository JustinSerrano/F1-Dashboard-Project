/* modules/dataService.js 

This project has been developed with guidance and assistance from ChatGPT, a conversational AI by OpenAI.
*/

import { displayRaces } from './uiHelper.js';

const API_DOMAIN = "https://www.randyconnolly.com/funwebdev/3rd/api/f1";


/**
 * Fetch data for a specific season.
 * @param {string} season - The selected season.
 * @returns {Promise<[Object[], Object[], Object[]]>} - Array of race, qualifying, and results data.
 */
export function fetchSeasonData(season) {
    const racePromise = fetch(`${API_DOMAIN}/races.php?season=${season}`)
        .then((response) => {
            if (response.ok) return response.json();
            throw new Error("Error fetching race data");
        });
    const qualifyingPromise = fetch(`${API_DOMAIN}/qualifying.php?season=${season}`)
        .then((response) => {
            if (response.ok) return response.json();
            throw new Error("Error fetching qualifying data");
        });
    const resultsPromise = fetch(`${API_DOMAIN}/results.php?season=${season}`)
        .then((response) => {
            if (response.ok) return response.json();
            throw new Error("Error fetching results data");
        });

    return Promise.all([racePromise, qualifyingPromise, resultsPromise]);
}

/**
 * Cache season data in localStorage.
 * @param {Object} keys - Object containing localStorage keys.
 * @param {Array} data - Data to cache.
 */
export function cacheSeasonData(keys, data) {
    localStorage.setItem(keys.racesKey, JSON.stringify(data[0]));
    localStorage.setItem(keys.qualifyingKey, JSON.stringify(data[1]));
    localStorage.setItem(keys.resultsKey, JSON.stringify(data[2]));
}

/**
 * Handle season selection and display races.
 * @param {Object} options - Parameters for handling season selection.
 * @param {string} options.selectedSeason - The selected season.
 * @param {HTMLElement} options.homeSection - The home section element.
 * @param {HTMLElement} options.browseLoader - The loader element.
 * @param {HTMLElement} options.browseSection - The browse section element.
 */
export function handleSeasonSelection(selectedSeason, homeSection, browseLoader, browseSection) {
    const keys = {
        racesKey: `races_${selectedSeason}`,
        qualifyingKey: `qualifying_${selectedSeason}`,
        resultsKey: `results_${selectedSeason}`,
    };

    // Update UI to show loading state
    homeSection.style.display = "none";
    browseLoader.style.display = "flex";
    browseSection.style.display = "none";

    // Check localStorage for cached data
    let racesData = localStorage.getItem(keys.racesKey);
    let qualifyingData = localStorage.getItem(keys.qualifyingKey);
    let resultsData = localStorage.getItem(keys.resultsKey);

    if (!(racesData && qualifyingData && resultsData)) {
        fetchSeasonData(selectedSeason).then((data) => {
            cacheSeasonData(keys, data);
            displayRaces(data[0], data[1], data[2], selectedSeason, browseLoader, browseSection);
        }).catch((error) => {
            console.error("Data fetch failed:", error.message);
            alert("Failed to fetch data. Please try again.");
            browseLoader.style.display = "none";
        });
    } else {
        racesData = JSON.parse(racesData);
        qualifyingData = JSON.parse(qualifyingData);
        resultsData = JSON.parse(resultsData);
        displayRaces(racesData, qualifyingData, resultsData, selectedSeason, browseLoader, browseSection);
    }
}

/**
 * Fetch all drivers.
 * @returns {Promise<Object[]>} - List of drivers.
 */
export async function fetchDrivers() {
    const driverEndpoint = `${API_DOMAIN}/drivers.php`;

    try {
        const response = await fetch(driverEndpoint);
        if (!response.ok) {
            throw new Error("Error fetching driver data");
        }
        return await response.json();
    } catch (error) {
        console.error("Error in fetchDrivers:", error.message);
        throw error; // Rethrow the error for the caller to handle
    }
}

/**
 * Fetch all constructors.
 * @returns {Promise<Object[]>} - List of constructors.
 */
export async function fetchConstructors() {
    const constructorEndpoint = `${API_DOMAIN}/constructors.php`;

    try {
        const response = await fetch(constructorEndpoint);
        if (!response.ok) {
            throw new Error("Error fetching constructor data");
        }
        return await response.json();
    } catch (error) {
        console.error("Error in fetchConstructors:", error.message);
        throw error; // Rethrow the error for the caller to handle
    }
}



