const mongoose = require("mongoose");

const userSchema =
    new mongoose.Schema(
        {

            name: {
                type: String,
                required: true
            },

            email: {
                type: String,
                required: true,
                unique: true
            },

            password: {
                type: String,
                required: false
            },

            course: {
                type: String,
                trim: true,
                default: "B.Sc. IT"
            },

            studyYear: {
                type: String,
                trim: true,
                default: "TY"
            }

        },
        {
            timestamps: true
        }
    );

module.exports =
    mongoose.model(
        "User",
        userSchema
    );