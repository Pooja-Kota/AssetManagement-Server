// grab the things we need
var mongoose = require('mongoose');
var Schema = mongoose.Schema;

// create a schema
var wifiDetails = new Schema({
    wifi: [{
        wifiName: String,
        createdTime: { type: Date, default: Date.now },
    }],
    assetId: { type: String, required: true, unique: true },
    created_at: { type: Date, default: Date.now },
    updated_at: { type: Date, default: Date.now }
});

// the schema is useless so far
// we need to create a model using it
var wifi = mongoose.model('wifi_details', wifiDetails);
console.log("wifi_details Collection created");
// make this available to our users in our Node applications
module.exports = wifi;