export function compileResultsList(hotels, groceries, distance) {

    let resultsList = [];
    let resultNum = 0;

    console.log(hotels.places);
    console.log(groceries.places);

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
    console.log(resultsList);
    return resultsList;
}

export function displayResultsList(resultsList) {

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