const User = require("../models/userModel");

module.exports = async (req, res, next) => {
  try {
    const user = await User.findById(req.user.id);
    if (!user) {
      return res.status(404).send({
        success: false,
        message: "User not found",
      });
    }

    if (!user.isAdmin) {
      return res.status(403).send({
        success: false,
        message: "Access denied. Admin authorization required.",
      });
    }

    next();
  } catch (error) {
    return res.status(500).send({
      success: false,
      message: "Authorization check failed",
      error: error.message,
    });
  }
};
