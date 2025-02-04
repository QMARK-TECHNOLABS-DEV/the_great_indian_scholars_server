const adminCheckMiddleware = async (req, res, next) => {
    if (["super admin", "admin", "leader"].includes(req.user.role)) {
        next()
    } else {
        return res.status(401).json({ msg: "Unauthorized" })
    }
}

module.exports = adminCheckMiddleware;