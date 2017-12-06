// grab the things we need
var mongoose = require('mongoose');
var Schema = mongoose.Schema;

// create a schema
var simDetails = new Schema({
   assetId: { type: String, required: true, unique: true },
    sim: [{
        deviceID: String,
        carrierName: String,
        datanetworkType: String,
        simState: String,
        dataState: String,
        networkRoaming: String,
        createdTime: { type: Date, default: Date.now },
    }],
    created_at: { type: Date, default: Date.now },
    updated_at: { type: Date, default: Date.now }
});

// the schema is useless so far
// we need to create a model using it
var sim = mongoose.model('sim_details', simDetails);
console.log("sim_details Collection created");
// make this available to our users in our Node applications
module.exports = sim;