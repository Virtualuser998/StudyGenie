const express = require("express");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const User = require("../models/User");
const authMiddleware = require("../middleware/authMiddleware");
const router = express.Router();

const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const escapeRegex = (value) => value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
const jwtSigningKey = () => process.env.JWT_SECRET || process.env.SESSION_SECRET;

// REGISTER

router.post(
    "/register",
    async (req, res) => {

        try {

            const {
                name,
                email,
                password
            } = req.body;

            const cleanName = typeof name === "string" ? name.trim() : "";
            const cleanEmail = typeof email === "string" ? email.trim().toLowerCase() : "";

            if (
                !cleanName ||
                !cleanEmail ||
                typeof password !== "string"
            ) {

                return res
                    .status(400)
                    .json({
                        message:
                            "All fields are required"
                    });

            }

            if (cleanName.length < 2 || cleanName.length > 80 || !emailPattern.test(cleanEmail)) {
                return res.status(400).json({
                    message: "Enter a valid name and email address"
                });
            }

            if (password.length < 8) {
                return res.status(400).json({
                    message: "Password must be at least 8 characters"
                });
            }


            const existingUser =
                await User.findOne({
                    email: {
                        $regex: `^${escapeRegex(cleanEmail)}$`,
                        $options: "i"
                    }
                });


            if (existingUser) {

                return res
                    .status(400)
                    .json({
                        message:
                            "Email already registered"
                    });

            }


            const hashedPassword =
                await bcrypt.hash(
                    password,
                    10
                );


            const newUser =
                new User({
                    name: cleanName,
                    email: cleanEmail,
                    password:
                        hashedPassword
                });


            await newUser.save();


            res
                .status(201)
                .json({
                    message:
                        "Registration Successful"
                });


        } catch (error) {

            console.log(error);

            res
                .status(500)
                .json({
                    message:
                        "Server Error"
                });

        }

    }
);


// LOGIN

router.post(
    "/login",
    async (req, res) => {

        try {

            const {
                email,
                password
            } = req.body;

            if (
                typeof email !== "string" ||
                !emailPattern.test(email.trim()) ||
                typeof password !== "string" ||
                !password
            ) {
                return res.status(400).json({
                    message: "Enter a valid email and password"
                });
            }

            const user =
                await User.findOne({
                    email: {
                        $regex: `^${escapeRegex(email.trim())}$`,
                        $options: "i"
                    }
                });


            if (!user) {

                return res
                    .status(404)
                    .json({
                        message:
                            "User not found"
                    });

            }


            const passwordMatch =
                await bcrypt.compare(
                    password,
                    user.password
                );


            if (!passwordMatch) {

                return res
                    .status(401)
                    .json({
                        message:
                            "Invalid password"
                    });

            }


            const secret = jwtSigningKey();
            if (!secret) {
                return res.status(503).json({
                    message: "Authentication is not configured"
                });
            }

            const token =
                jwt.sign(
                    {
                        id: user._id
                    },
                    secret,
                    {
                        expiresIn: "1d"
                    }
                );


            res.json({

                message:
                    "Login Successful",

                token,

                user: {
                    id: user._id,
                    name: user.name,
                    email: user.email,
                    course: user.course || "B.Sc. IT",
                    studyYear: user.studyYear || "TY"
                }

            });


        } catch (error) {

            console.log(error);

            res
                .status(500)
                .json({
                    message:
                        "Server Error"
                });

        }

    }
);

router.get("/me", authMiddleware, async (req, res) => {
    try {
        const user = await User.findById(req.user.id).select("-password");
        if (!user) {
            return res.status(404).json({ message: "Account not found" });
        }

        return res.json({
            user: {
                id: user._id,
                name: user.name,
                email: user.email,
                course: user.course || "B.Sc. IT",
                studyYear: user.studyYear || "TY"
            }
        });
    } catch (error) {
        console.error("Profile fetch failed:", error.message);
        return res.status(500).json({ message: "Could not load your profile" });
    }
});

router.patch("/me", authMiddleware, async (req, res) => {
    try {
        const updates = {};
        const { name, email, course, studyYear } = req.body;

        if (name !== undefined) {
            const cleanName = typeof name === "string" ? name.trim() : "";
            if (cleanName.length < 2 || cleanName.length > 80) {
                return res.status(400).json({ message: "Name must be between 2 and 80 characters" });
            }
            updates.name = cleanName;
        }

        if (email !== undefined) {
            const cleanEmail = typeof email === "string" ? email.trim().toLowerCase() : "";
            if (!emailPattern.test(cleanEmail)) {
                return res.status(400).json({ message: "Enter a valid email address" });
            }
            const existingUser = await User.findOne({
                email: {
                    $regex: `^${escapeRegex(cleanEmail)}$`,
                    $options: "i"
                },
                _id: { $ne: req.user.id }
            });
            if (existingUser) {
                return res.status(409).json({ message: "Email already registered" });
            }
            updates.email = cleanEmail;
        }

        if (course !== undefined) {
            if (typeof course !== "string" || course.trim().length > 80) {
                return res.status(400).json({ message: "Course must be 80 characters or fewer" });
            }
            updates.course = course.trim();
        }

        if (studyYear !== undefined) {
            if (typeof studyYear !== "string" || studyYear.trim().length > 40) {
                return res.status(400).json({ message: "Study year must be 40 characters or fewer" });
            }
            updates.studyYear = studyYear.trim();
        }

        if (!Object.keys(updates).length) {
            return res.status(400).json({ message: "No profile changes were provided" });
        }

        const user = await User.findByIdAndUpdate(
            req.user.id,
            { $set: updates },
            { new: true, runValidators: true }
        ).select("-password");

        if (!user) {
            return res.status(404).json({ message: "Account not found" });
        }

        return res.json({
            message: "Profile updated",
            user: {
                id: user._id,
                name: user.name,
                email: user.email,
                course: user.course || "B.Sc. IT",
                studyYear: user.studyYear || "TY"
            }
        });
    } catch (error) {
        console.error("Profile update failed:", error.message);
        if (error.code === 11000) {
            return res.status(409).json({ message: "Email already registered" });
        }
        return res.status(500).json({ message: "Could not update your profile" });
    }
});


module.exports = router;