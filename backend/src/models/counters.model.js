"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var mongoose_1 = require("mongoose");
var counterSchema = new mongoose_1.Schema({
    _id: { type: String, required: true },
    sequence: { type: Number, default: 100 }, // Start at 100 for USR101, MTR101, etc.
});
exports.default = mongoose_1.default.model("Counter", counterSchema);
