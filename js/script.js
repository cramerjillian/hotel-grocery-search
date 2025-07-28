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
        let cityCenter = geocodeResult.cityCenter;
        let searchRadius = geocodeResult.cityDiameter / 2;
        console.log(cityCenter);
        console.log(searchRadius);
        
        initMap(cityCenter, searchRadius);

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

async function initMap(cityCenter, searchRadius) {

    // Imports the necessary map library and constructs a map object.

    const { Map, InfoWindow } = await google.maps.importLibrary("maps");
    let center = new google.maps.LatLng(cityCenter);

    map = new Map(document.getElementById("map"), {
        center: center,
        zoom: 12,
        mapId: "DEMO_MAP_ID"
    });

    await nearbySearch(map, cityCenter, searchRadius);
}

async function nearbySearch(map, cityCenter, searchRadius) {

    const { Place } = await google.maps.importLibrary("places");
    const { LatLngBounds } = await google.maps.importLibrary("core");
    const { AdvancedMarkerElement } = await google.maps.importLibrary("marker");

    let center = new google.maps.LatLng(cityCenter);

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

    console.log(hotels);
    console.log(groceries);

    if (hotels.places.length > 0) {

        console.log(hotels.places);
        const bounds = new LatLngBounds();

        // Loop through and get all the results.
        hotels.places.forEach((hotel) => {
            const hotelPinImg = document.createElement('img');
            hotelPinImg.src = './img/hotel-50px.png';

            const markerView = new AdvancedMarkerElement({
                map,
                position: hotel.location,
                content: hotelPinImg,
                title: hotel.displayName
        });
            bounds.extend(hotel.location);
            console.log(hotel);
        });
        map.fitBounds(bounds);
    } else {
        console.log("No results");
    };

    return { hotels, groceries };
}

function haversineConversion(lat1, lat2, lng1, lng2) {

    // Taken from: https://www.movable-type.co.uk/scripts/latlong.html //
    // Calculates the distance (in meters) between two latitude/longitude points.

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