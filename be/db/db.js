const express = require('express');
const mongoose = require('mongoose');
const dotenv = require('dotenv');

dotenv.config();



const connection = mongoose.connect(process.env.MONGO_URL)
    .then(() => console.log("DB connected successfully")).catch((err) => {
        console.log(err)
    })


module.exports = connection;