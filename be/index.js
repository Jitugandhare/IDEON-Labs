const express = require('express');
const app = express();
const connection = require('./db/db.js');
const cors = require('cors');
const adminRoutes = require('./routes/admin.js');
const userRoutes = require('./routes/user.js');
const dotenv = require('dotenv');

dotenv.config();

app.use(express.json());
app.use(cors());


app.use('/api/admin', adminRoutes);
app.use('/api/user', userRoutes);



app.listen(8000, async (req, res) => {
    try {
        await connection;
        console.log("Server is running on 8000")
    } catch (error) {
        console.log(error)
    }
})