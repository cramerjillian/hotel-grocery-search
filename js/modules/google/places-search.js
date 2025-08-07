export async function nearbySearch(center, searchRadius) {

    const { Place } = await google.maps.importLibrary("places");

    const requestHotels = {
        fields: ["displayName", "location"],
        locationRestriction: {
            center: center,
            radius: searchRadius
        },
        includedPrimaryTypes: ["lodging"],
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