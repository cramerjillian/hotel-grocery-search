export async function initMap(cityCenter, zoom) {

    // Imports the necessary map library and constructs a map object.
    try {
        const { Map } = await google.maps.importLibrary("maps");

        let center = new google.maps.LatLng(cityCenter);

        map = new Map(document.getElementById("map"), {
            center: center,
            zoom: zoom,
            mapId: "DEMO_MAP_ID"
        });

        return { map, center };
        
    } catch {
        console.error(error);
        window.alert("Failed to load Google Maps object. Please check the API key.")
    }
}

export async function placeMarkers(hotels, groceries, map) {

    const { AdvancedMarkerElement } = await google.maps.importLibrary("marker");
    const infoWindow = new google.maps.InfoWindow();
    
    hotels.forEach((hotel) => {
        const hotelPinImg = document.createElement('img');
        hotelPinImg.src = './img/hotel-50px.png';

        const markerView = new AdvancedMarkerElement({
            map,
            position: hotel.location,
            content: hotelPinImg,
            title: hotel.displayName,
            gmpClickable: true,
        });

        markerView.addListener('click', ({ domEvent, latLng }) => {
            const { target } = domEvent;
            infoWindow.close();
            infoWindow.setContent(markerView.title);
            infoWindow.open(markerView.map, markerView);
        });
    });

    groceries.forEach((grocery) => {
        const groceryPinImg = document.createElement('img');
        groceryPinImg.src = './img/grocery-50px.png';

        const markerView = new AdvancedMarkerElement({
            map,
            position: grocery.location,
            content: groceryPinImg,
            title: grocery.displayName,
            gmpClickable: true,
        });

        markerView.addListener('click', ({ domEvent, latLng }) => {
            const { target } = domEvent;
            infoWindow.close();
            infoWindow.setContent(markerView.title);
            infoWindow.open(markerView.map, markerView);
        });
    });

}