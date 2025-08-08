import { initMap, placeMarkers } from "./modules/google/map.js";
import { geocodeCity } from "./modules/google/geocode.js";
import { nearbySearch } from "./modules/google/places-search.js";
import { compileResultsList, displayResultsList } from "./modules/results/results.js";
import { sortTableByColumn, selectResult, clearTable } from "./modules/tools/tools.js";

"use strict"

let map;
let center;
let cityCenter;
let cityDiameter;
let hotels;
let groceries;
let googleApiKey;

// ChatGPT-assisted //
async function loadGoogleMapsScript() {

    if (!googleApiKey) {
        const res = await fetch("/api/key");
        const data = await res.json();
        googleApiKey = data.apiKey;
    }

    if (!googleApiKey) {
      console.error("API key is missing");
      return;
    }

    const body = document.querySelector("body");
    const script = document.createElement("script");
    script.src = `https://maps.googleapis.com/maps/api/js?key=${googleApiKey}&libraries=places&v=beta`;
    script.async = true;
    script.defer = true;
    body.appendChild(script);
}

window.addEventListener("DOMContentLoaded", loadGoogleMapsScript);
// ChatGPT-assisted //

document.getElementById("input").addEventListener("submit", async (event) => {
    event.preventDefault();
    clearTable();

    // Get values from the user input form for the city, state, and maximum desired distance between hotel/grocery store pairs.
    let city = document.getElementById("cityInput").value;
    let state = document.getElementById("stateInput").value;
    let distance = document.getElementById("distanceInput").value;

    try {
        // Geocode the input city to finds its latitude and longitude at the center, 
        // as well as the radius of the city from the center (Using Geocoding API)
        // (to be used in the Places API Nearby Search later)
        
        ({ cityCenter, cityDiameter } = await geocodeCity(googleApiKey, city, state));
        let searchRadius = cityDiameter / 2;

        // Create map at the given city, state
        ({ map, center } = await initMap(cityCenter, 11));

        // Perform search for hotels and grocery stores within the city bounds
        ({ hotels, groceries } = await nearbySearch(center, searchRadius));
        
        // Compile the list of relevant results
        let resultsList = await compileResultsList(hotels, groceries, distance);

        // Display the results as a table
        if (resultsList.length > 0) {
            displayResultsList(resultsList);
            placeMarkers(hotels.places, groceries.places, map);
            document.getElementById("clear-btn").style.display = 'block';
            document.getElementById("map").style.display = 'block';
        } else {
            document.getElementById("table").style.display = 'none';
            document.getElementById("return-btn").style.display = 'none';
            window.alert("No results within the given distance");
        };

        document.querySelectorAll("tbody tr").forEach(tableRow => {
            tableRow.addEventListener("click", () => {
                selectResult(tableRow, resultsList);
            });
        });

    } catch(error) {
        console.error("Search failed:", error);
    }

});

// Functionality for sorting the results table by header
document.querySelectorAll(".table-sortable th").forEach(headerCell => {
    headerCell.addEventListener("click", () => {
        const tableElement = headerCell.closest(".table");
        const headerIndex = Array.prototype.indexOf.call(headerCell.parentElement.children, headerCell);  // Finds the index of the table header cell that was clicked
        const currentIsAscending = headerCell.classList.contains("th-sort-asc");

        sortTableByColumn(tableElement, headerIndex, !currentIsAscending);
    });
});

// Functionality for the Clear Results button
document.getElementById("clear-btn").addEventListener("click", (e) => {

    clearTable();

});

// Functionality for the Return to All Results button
document.getElementById("return-btn").addEventListener("click", async (e) => {
    ({ map } = await initMap(cityCenter, 11));
    placeMarkers(hotels.places, groceries.places, map);
    document.getElementById("return-btn").style.display = 'none';
    document.querySelectorAll("tr").forEach((tr) => {
        tr.classList.remove("active");
    });
});