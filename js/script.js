"use strict"

let map;
let cityCenter;
let hotels;
let groceries;

let GOOGLE_API_KEY="hidden";

document.getElementById("input").addEventListener("submit", async (event) => {
    event.preventDefault();
    clearTable();

    // Get values from the user input form for the city, state, and maximum desired distance between hotel/grocery store pairs.
    let city = document.getElementById("cityInput").value;
    let state = document.getElementById("stateInput").value;
    let distance = document.getElementById("distanceInput").value;

    try {
        // Geocode the input city to finds its latitude and longitude at the center, as well as the radius of the city from the center
        // (to be used in the Places API nearby search later)
        
        let geocodeResult = await geocodeCity(city, state);
        cityCenter = geocodeResult.cityCenter;
        let searchRadius = geocodeResult.cityDiameter / 2;

        // Create map at the given city, state
        const { map, center } = await initMap(cityCenter, 12);

        // Perform search for hotels and grocery stores within the city bounds
        ({ hotels, groceries } = await nearbySearch(center, searchRadius));
        
        // Compile the list of relevant results
        let resultsList = await compileResultsList(hotels, groceries, distance);

        // Display the results as a table
        if (resultsList.length > 0) {
            displayResultsList(resultsList);
            placeMarkers(hotels.places, groceries.places, map);
        } else {
            document.getElementById("table").style.display = 'none';
            document.getElementById("return-btn").style.display = 'none';
            window.alert("Sorry, no results within the given distance");
        };

        document.querySelectorAll("tbody tr").forEach(tableRow => {
            tableRow.addEventListener("click", () => {
                selectResult(tableRow, resultsList);
            });
        });

    } catch(error) {
        console.error(error);
    }

});

document.querySelectorAll(".table-sortable th").forEach(headerCell => {
    headerCell.addEventListener("click", () => {
        const tableElement = headerCell.closest(".table");
        const headerIndex = Array.prototype.indexOf.call(headerCell.parentElement.children, headerCell);  // Finds the index of the table header cell that was clicked
        const currentIsAscending = headerCell.classList.contains("th-sort-asc");

        sortTableByColumn(tableElement, headerIndex, !currentIsAscending);
    });
});

document.getElementById("clear-btn").addEventListener("click", (e) => {
    
    clearTable();
    document.getElementById("table").style.display = 'none';
    document.getElementById("map").style.display = 'none';

});

document.getElementById("return-btn").addEventListener("click", async (e) => {
    const { map } = await initMap(cityCenter, 12);
    placeMarkers(hotels.places, groceries.places, map);
    document.getElementById("return-btn").style.display = 'none';
});

/////////////////////////////// FUNCTIONS //////////////////////////////////////////

async function geocodeCity(city, state) {

    const geocodeEndpoint = `https://maps.googleapis.com/maps/api/geocode/json?address=${encodeURI(city)}+${state}&key=${GOOGLE_API_KEY}`;
    try {
        const response = await fetch(geocodeEndpoint);
        const data = await response.json();

        if (data.results.length > 0) {

            const cityCenter = data.results[0].geometry.location;
            const cityDiameter = haversineConversion(
                data.results[0].geometry.bounds.northeast.lat,
                data.results[0].geometry.bounds.southwest.lat,
                data.results[0].geometry.bounds.northeast.lng,
                data.results[0].geometry.bounds.southwest.lng,
            );

            return { cityCenter, cityDiameter };

        } else {
            return "No results found";
        }

    } catch (error) {
        console.error(error)
    }
    
}

async function initMap(cityCenter, zoom) {

    // Imports the necessary map library and constructs a map object.

    const { Map } = await google.maps.importLibrary("maps");
    let center = new google.maps.LatLng(cityCenter);

    map = new Map(document.getElementById("map"), {
        center: center,
        zoom: zoom,
        mapId: "DEMO_MAP_ID"
    });

    return { map, center };
}

async function nearbySearch(center, searchRadius) {

    const { Place } = await google.maps.importLibrary("places");

    const requestHotels = {
        fields: ["displayName", "location"],
        locationRestriction: {
            center: center,
            radius: searchRadius
        },
        includedPrimaryTypes: ["lodging"],
        maxResultCount: 5,
        language: "en-US",
        region: "us"
    };

    const requestGroceries = {
        fields: ["displayName", "location"],
        locationRestriction: {
            center: center,
            radius: searchRadius
        },
        includedPrimaryTypes: ["supermarket"],
        maxResultCount: 5,
        language: "en-US",
        region: "us"
    };

    const hotels = await Place.searchNearby(requestHotels);
    const groceries = await Place.searchNearby(requestGroceries);

    if (hotels.places.length === 0) {
        window.alert("Search failed: no hotel results.");
        return;
    };

    if (groceries.places.length === 0) {
        window.alert("Search failed: no grocery results.");
        return;
    };

    return { hotels, groceries };
}

async function placeMarkers(hotels, groceries, map) {

    const { AdvancedMarkerElement } = await google.maps.importLibrary("marker");
    
    hotels.forEach((hotel) => {
        const hotelPinImg = document.createElement('img');
        hotelPinImg.src = './img/hotel-50px.png';

        const markerView = new AdvancedMarkerElement({
            map,
            position: hotel.location,
            content: hotelPinImg,
            title: hotel.displayName
        });
    });

    groceries.forEach((grocery) => {
        const groceryPinImg = document.createElement('img');
        groceryPinImg.src = './img/grocery-50px.png';

        const markerView = new AdvancedMarkerElement({
            map,
            position: grocery.location,
            content: groceryPinImg,
            title: grocery.displayName
        });
    });
}

function compileResultsList(hotels, groceries, distance) {

    let resultsList = [];
    let resultNum = 0;

    hotels.places.forEach((hotel) => {
       groceries.places.forEach((grocery) => {
            const distanceBetween = haversineConversion(hotel.location.lat(), grocery.location.lat(), hotel.location.lng(), grocery.location.lng()) * 0.000621371;  
            // Converts haversine equation result to miles at the end

            // If the calculated distance between a hotel and grocery store search result is less than/equal to the given distance, 
            // add it to the results list
            if (distanceBetween <= distance) {
                resultsList.push([resultNum, hotel, grocery, distanceBetween]);
                resultNum += 1;
            };
       });
    });
    return resultsList;
}

function displayResultsList(resultsList) {

    const resultsTable = document.getElementById("table-body");

    // Loop through and get all the hotel results.
    resultsList.forEach((result) => {
        const resultRow = document.createElement('tr');
        
        const resultNumCell = document.createElement('td');
        const hotelCell = document.createElement('td');
        const groceryCell = document.createElement('td');
        const distanceCell = document.createElement('td');

        resultNumCell.textContent = result[0];
        hotelCell.textContent = result[1].displayName;
        groceryCell.textContent = result[2].displayName;
        distanceCell.textContent = result[3].toFixed(2);

        resultRow.appendChild(resultNumCell);
        resultRow.appendChild(hotelCell);
        resultRow.appendChild(groceryCell);
        resultRow.appendChild(distanceCell);

        resultsTable.appendChild(resultRow);
    });

    document.querySelector("table").style.display = 'block';
}


function haversineConversion(lat1, lat2, lng1, lng2) {

    // Taken from: https://www.movable-type.co.uk/scripts/latlong.html //
    // Calculates the distance (in miles) between two latitude/longitude points.

    const R = 6371 * 1000;

    const p1 = lat1 * Math.PI/180;
    const p2 = lat2 * Math.PI/180;
    const deltaP = (lat2 - lat1) * Math.PI/180;
    const deltaL = (lng2 - lng1) * Math.PI/180;

    const a = Math.sin(deltaP/2) * Math.sin(deltaP/2) +
              Math.cos(p1) * Math.cos(p2) *
              Math.sin(deltaL/2) * Math.sin(deltaL/2);
    
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
    const d = R * c;

    return d;

}

// TABLE FUNCTIONS //
// Made by following dcode's tutorial for a sortable table: https://youtu.be/8SL_hM1a0yo //

function sortTableByColumn(table, column, asc = true) {

    // Direction modifier: Determines whether order is ascending or descending
    const dirModifier = asc ? 1 : -1;

    const tBody = table.tBodies[0];
    const rows = Array.from(tBody.querySelectorAll("tr"));

    // Sort each row //
    const sortedRows = rows.sort((a, b) => {
        const aColText = a.querySelector(`td:nth-child(${ column + 1 })`).textContent.trim();
        const bColText = b.querySelector(`td:nth-child(${ column + 1 })`).textContent.trim();

        return aColText > bColText ? (1 * dirModifier) : (-1 * dirModifier);
    });

    // Remove all existing rows from the table //
    while (tBody.firstChild) {
        tBody.removeChild(tBody.firstChild);
    }

    // Rebuild the table with the newly sorted rows
    tBody.append(...sortedRows);

    // Remember how the column is currently sorted
    table.querySelectorAll("th").forEach(th => th.classList.remove("th-sort-asc", "th-sort-desc")); // Clear out table sorting parameter
    table.querySelector(`th:nth-child(${ column + 1 })`).classList.toggle("th-sort-asc", asc); // If passed in ascending param, will add the "th-sort-asc" class to the table header
    table.querySelector(`th:nth-child(${ column + 1 })`).classList.toggle("th-sort-desc", !asc); // If passed in descending param, will add the "th-sort-desc" class to the table header

}

function clearTable() {

    const tBody = document.getElementById("table-body");

    while (tBody.firstChild) {
        tBody.removeChild(tBody.firstChild);
    };
}

async function selectResult(tableRow, resultsList) {

    document.getElementById("return-btn").style.display = 'inline-block';

    document.querySelectorAll("tr").forEach((tr) => {
        tr.classList.remove("active");
    });
    tableRow.classList.add("active");

    const selectedResult = tableRow.firstChild.textContent;

    let hotelSelected = resultsList[selectedResult][1];
    let grocerySelected = resultsList[selectedResult][2];

    const midpointLatLng = { lat: (hotelSelected.location.lat() + grocerySelected.location.lat()) / 2, 
        lng: (hotelSelected.location.lng() + grocerySelected.location.lng()) / 2 };

    const { map } = await initMap(midpointLatLng, 13);

    placeMarkers([hotelSelected], [grocerySelected], map);
    
}