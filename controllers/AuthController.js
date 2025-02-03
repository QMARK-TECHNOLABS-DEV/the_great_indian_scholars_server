const Admin = require("../models/AdminModel")
const Employee = require("../models/EmployeeModel")
const Student = require("../models/StudentModel");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const { generateAccessToken, generateRefreshToken } = require("../middlewares/tokenMiddlewares");
const authCtrl = {};


// Authentication method for Admin/Employee/Student;
authCtrl.Login = async (req, res) => {
    const email = req.body.email;
    console.log("email", email)
    console.log("password", req.body.password)
    // console.log("req.body", req.body)

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) return res.status(400).json({ msg: "Invalid Email format" });

    try {
        const emailCaseRegex = new RegExp(email, 'i')

        const admin = await Admin.findOne({ email: emailCaseRegex }).lean();
        const employee = await Employee.findOne({ email: emailCaseRegex }).lean();
        const student = await Student.findOne({ email: emailCaseRegex }).lean();

        let user;

        if (admin) {
            user = admin;
        } else if (employee) {
            if (employee?.isActive === false) {
                return res.status(401).json({ msg: "Blocked User" })
            }
            user = employee;
        } else if (student) {
            if (student?.isActive === false) {
                return res.status(401).json({ msg: "Blocked User" })
            }
            user = student;
        } else {
            return res.status(400).json({ msg: "Invalid email or password" })
        }

        if (!user.password) return res.status(400).json({ msg: "Invalid email or password" })

        const isValidPassword = await bcrypt.compare(req.body.password, user.password);
        if (!isValidPassword) return res.status(400).json({ msg: "Invalid email or password" });

        const accessToken = generateAccessToken({ userId: user._id, role: user.role })

        const refreshToken = generateRefreshToken({ userId: user._id, role: user.role })

        const { password, ...userInfo } = user;

        res.status(200).json({ userInfo, accessToken, refreshToken })

    } catch (error) {
        console.error(error)
        res.status(500).json({ msg: "Something went wrong" })
    }
}

//Regenerate Access Token using Refresh Token;
authCtrl.regenerateAccessToken = async (req, res) => {
    const refreshToken = req.body.refreshToken;
    // console.log("therefreshToken", req.body.refreshToken)

    if (typeof refreshToken !== 'string') return res.status(401).json({ msg: "No refresh token" })

    jwt.verify(refreshToken, process.env.REFRESH_TOKEN_SECRET, (err, user) => {
        if (err) return res.status(401).json({ msg: "invalid refresh token" })

        const accessToken = generateAccessToken({ userId: user?.userId, role: user?.role });
        const refreshToken = generateRefreshToken({ userId: user?.userId, role: user?.role })

        res.status(200).json({ accessToken, refreshToken });
    })

}

//Terminate session by deleting tokens in frontend;

authCtrl.Logout = async (req, res) => {

    try {
        res.status(200).json({ msg: "logged out", userInfo: null, accessToken: null, refreshToken: null })
    } catch (error) {
        console.error(error)
        res.status(500).json({ msg: "Something went wrong" })
    }

}


module.exports = authCtrl;