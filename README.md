# Hotel-Grocery Search

## About the Project

Hotel-Grocery Search is a single-page application meant to support travel planning.

Users may enter any U.S. city and a distance to find hotels within their preferred distance of a grocery store in that city. Using Google APIs and libraries, this tool provides a new service in that Google Maps does not currently support proximity-based searches of two different types of establishments in one query.

## User Instructions

* Enter a valid U.S. city and state (abbreviated).
* Enter a distance (in miles), representing the maximum distance between a hotel and grocery store in the results.
* Click the "Submit" button to perform the search.
* Use the interactable map and search results table to view hotel-grocery store pairs that are within the your preferred distance.
  * Clicking on a row within the results table will bring up a zoomed-in map of that single hotel-grocery store result.

## Tools Used

**Frontend:**

* HTML5
* CSS6
* JavaScript ES6

**Backend:**

* Node.js server served by Express.js framework
  * Used to prevent the Google API key from being publicly accessible on Github

**Google APIs:**

* Google Geocoding API
  * Converts the user input city, state data into geographical coordinates
* Google Maps Javascript API
  * Generates an interactable Google Maps map on the webpage centered at the given city
* Google Places API
  * Performs an establishment-type search within the bounds of the given city

## Installation Instructions

1) Clone the Github repository.
3) Install Node at [nodejs.org](https://nodejs.org/en), if not already installed.
2) Open VSCode (or preferred IDE) and navigate to the project directory.
4) Install node dependences
```bash
npm install
```
5) Create an .env file. cp .env.example .env
```bash
cp env.example .env
```
6) Open the new .env file and paste the provided Google API key where instructed.
7) Run the server (npm run dev)
```bash
npm run dev
```
Confirm that the server is running at localhost:8080.
8) Open localhost:8080 to view the homepage

## Project Requirements

This project fulfills the capstone requirements for the Web Development pathway of Code:You's Janary 2025 cohort. The requirements fulfilled are listed below:

- [x] Integrate an API into your project.
- [x] Design your project to be visually appealing (color palette, consistent component design, font stack).
- [x] Include at least two HTML pages in your project.
- [x] Include at least one media query to make your site responsive.
- [x] Include at least 3 items from the accepted feature list.

This application includes the following features from the capstone requirements feature list:

| Feature | Difficulty |
| :------- | --------: |
| Analyze data that is stored in arrays, objects, sets or maps and display information about it in your app.     | Easy     |
| Create a function that accepts two or more input parameters and returns a value that is calculated or determined by the inputs.  Basic math functions don’t count (e.g. addition, etc).   | Easy/Intermediate   |
| Visualize data in a user friendly way. (e.g. graph, chart, etc)     | Easy/Intermediate     |
| Create a node.js web server using a modern framework such as Express.js.    | Easy/Intermediate     |
| Implement modern interactive UI features (e.g. table/data sorting, autocomplete, drag-and-drop, calendar-date-picker, etc).   | Intermediate     |

## Use of AI

ChatGPT was used for select portions of this project for both writing segments of JavaScript code and syntax troubleshooting. Lines where AI was used have been clearly encapsulated with "// ChatGPT-assisted //" comments.