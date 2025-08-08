import { initMap, placeMarkers } from "../google/map.js";

export function sortTableByColumn(table, column, asc = true) {

    // Direction modifier: Determines whether order is ascending or descending
    const dirModifier = asc ? 1 : -1;

    const tBody = table.tBodies[0];
    const rows = Array.from(tBody.querySelectorAll("tr"));

    // Sort each row //
    const sortedRows = rows.sort((a, b) => {

        let aColText = parseFloat(a.querySelector(`td:nth-child(${ column + 1 })`).textContent.trim());
        let bColText = parseFloat(b.querySelector(`td:nth-child(${ column + 1 })`).textContent.trim());

        // Handle if column is text rather than a number
        if (isNaN(aColText) || isNaN(bColText)) {
            aColText = a.querySelector(`td:nth-child(${ column + 1 })`).textContent.trim();
            bColText = b.querySelector(`td:nth-child(${ column + 1 })`).textContent.trim();
        };

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

export async function selectResult(tableRow, resultsList) {

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

    const { map } = await initMap(midpointLatLng, 12);

    placeMarkers([hotelSelected], [grocerySelected], map);
    
}

export function clearTable() {

    const tBody = document.getElementById("table-body");

    while (tBody.firstChild) {
        tBody.removeChild(tBody.firstChild);
    };
    
    document.getElementById("table").style.display = 'none';
    document.getElementById("map").style.display = 'none';
    document.getElementById("return-btn").style.display = 'none';
    document.getElementById("clear-btn").style.display = 'none';
}