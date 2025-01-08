const express = require('express');
const mongoose = require('mongoose');
const app = express();
const connection = require('./db/db.js');
const router=require('./routes/slot.route.js')

app.use(express.json());

app.use('/api',router);

app.listen(5200, async (req, res) => {
    try {
        await connection;
        console.log("Server is running on 5200")
    } catch (error) {
        console.log(error)
    }
})