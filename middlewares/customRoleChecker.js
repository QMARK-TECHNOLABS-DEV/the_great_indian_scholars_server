const customRoleChecker = (roles=[]) => {
    return (req, res, next) => {
        if (roles?.includes(req.user.role)) {
            return next()
        } else {
            return res.status(401).json({ msg: "Unauthorized" })
        }
    }
}

module.exports = {customRoleChecker};