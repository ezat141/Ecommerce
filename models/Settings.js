const mongoose = require('mongoose');

const settingsSchema = new mongoose.Schema({
    // setting_id: {
    //     type: Number,
    //     required: true,
    //     unique: true

    // },
    setting_name: {
        type: String,
        required: true,
    },
    settings_bodyhome: {
        type: String,
        required: true
    }
});

module.exports = mongoose.model('Setting', settingsSchema);