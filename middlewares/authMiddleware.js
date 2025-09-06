const jwt = require("jsonwebtoken");

module.exports = async (req, res, next) => {
    try {
        const authHeader = req.headers["authorization"];
        if (!authHeader) {
            return res.status(401).send({ message: "No token provided", success: false });
        }

        const token = authHeader.split(" ")[1]; // Bearer <token>

        jwt.verify(token, process.env.JWT_SECRET, (err, decoded) => {
            if (err) {
                if (err.name === "TokenExpiredError") {
                    return res.status(401).send({
                        message: "Token expired",
                        success: false,
                    });
                }
                return res.status(401).send({
                    message: "Auth failed",
                    success: false,
                });
            }

            // Token is valid
            req.user = {id: decoded.id};
            next();
        });

    } catch (error) {
        return res.status(401).send({
            message: "Auth failed",
            success: false,
        });
    }
};