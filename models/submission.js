const mongoose = require('mongoose');

const submissionSchema = new mongoose.Schema({
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "user",
        required: true
    },
    task: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "task",
        required: true
    },
    code: {
        type: String,
        required: true
    },
    explanation: {
        type: String,
        required: true
    },
    marks: {
        type: Number,
        default:0,
        required: true
    },
    status: {
        type: String,
        enum: ["pending", "checked" , "rejected"],
        default: "pending"
    }
}, { timestamps: true });

module.exports = mongoose.model("Submission", submissionSchema);