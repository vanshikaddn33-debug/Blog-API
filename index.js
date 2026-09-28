require("dotenv").config();

const express = require("express");
const connectDB = require("./config/db.js");
const postRoutes = require("./postroutes/routes.js");
const authroutes = require("./authroutes/routes.js");

const app = express();
const port = process.env.PORT || 5001;

connectDB();

//middleware
app.use(express.json());
app.use("/auth", authroutes);
app.use("/posts", postRoutes);


app.get("/", (req,res) => {
    res.send("Blog API is running!!");
})

app.use((req, res) => {
    res.status(404).json({
        message: "Route not found"
    });
});


app.listen(port, ()=> {
     console.log(`Server started on 5001 ${port}`);
})