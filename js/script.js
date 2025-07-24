"use strict"

let map;
let resultsList;
let GOOGLE_API_KEY="hidden";

document.getElementById("input").addEventListener("submit", async (event) => {
    event.preventDefault();

    // Get values from the user input form for the city, state, and maximum desired distance between hotel/grocery store pairs.
    let city = document.getElementById("cityInput").value;
    let state = document.getElementById("stateInput").value;
    let distance = document.getElementById("distanceInput").value;

    try {
        // Geocode the input city to finds its latitude and longitude at the center, as well as the radius of the city from the center
        // (to be used in the Places API nearby search later)
        let geocodeResult = await geocodeCity(city, state);
        let location = geocodeResult.cityCenter;
        let searchRadius = geocodeResult.cityDiameter / 2;

        createMap(location, city, state);

    } catch(error) {
        console.error(error);
    }

})

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
            )

            return { cityCenter, cityDiameter };

        } else {
            return "No results found";
        }

    } catch (error) {
        console.error(error)
    }
    
}

async function findHotelsGroceries(location, searchRadius) {

    let results = [];


}

async function createMap(location, city, state) {

    // Generates a map at the input city.

    const { Map } = await google.maps.importLibrary("maps");
    const { AdvancedMarkerElement } = await google.maps.importLibrary("marker");

    map = new Map(document.getElementById("map"), {
        zoom: 12,
        center: location,
        mapId: "DEMO_MAP_ID",
    });

    const marker = new AdvancedMarkerElement({
        map: map,
        position: location,
        title: `${city}, ${state}`,
    });
}

function haversineConversion(lat1, lat2, lon1, lon2) {

    // Taken from: https://www.movable-type.co.uk/scripts/latlong.html //
    // Calculates the distance (in meters) between two latitude/longitude points.

    const R = 6371 * 1000;

    const p1 = lat1 * Math.PI/180;
    const p2 = lat2 * Math.PI/180;
    const deltaP = (lat2 - lat1) * Math.PI/180;
    const deltaL = (lon2 - lon1) * Math.PI/180;

    const a = Math.sin(deltaP/2) * Math.sin(deltaP/2) +
              Math.cos(p1) * Math.cos(p2) *
              Math.sin(deltaL/2) * Math.sin(deltaL/2);
    
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
    const d = R * c;

    return d;

}