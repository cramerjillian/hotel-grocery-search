"use strict"

const express = require("express");
const cors = require("cors");
require("dotenv").config();
const app = express();
const port = 8080;

const corsOptions = {
    origin: [`http://localhost:${port}`]
};


app.use(cors());
app.use(cors(corsOptions));
app.use(express.static("./public"));
app.use(express.json());
app.use(express.urlencoded({extended: false}));

// AI //
app.get("/api/key", (req, res) => {
    res.json({ apiKey: process.env.GOOGLE_API_KEY });
});
// AI //

app.listen(port, () => {
    console.log(`Server is running http://localhost:${port}`);
    console.log("Press Ctrl+C to end this process.");
});