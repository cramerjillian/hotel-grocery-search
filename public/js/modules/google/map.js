export async function initMap(cityCenter, zoom) {

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

export async function placeMarkers(hotels, groceries, map) {

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