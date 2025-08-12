const jwt = require("jsonwebtoken");
require("dotenv").config();

const verifyAccessToken = async (req,res,next) => {
    try{
        const authHeader = req.headers["authorization"];

        if (!authHeader || !authHeader.startsWith("Bearer ")) {
            return res.status(401).json({ message: "No or invalid Authorization header" });
        }

        const token = authHeader.split(" ")[1]; 

        const decoded = jwt.verify(token, process.env.ACCESS_TOKEN_SECRET);
        req.user = decoded;
        next();
    }
    catch(error){
        console.error("Error verifying access token:", error);
        res.status(401).json({ error: "Unauthorized" });
    }
}

module.exports = {verifyAccessToken};