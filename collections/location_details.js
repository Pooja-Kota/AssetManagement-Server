// grab the things we need
var mongoose = require('mongoose');
var Schema = mongoose.Schema;

// create a schema
var locationDetails = new Schema({
   assetId: { type: String, required: true, unique: true },
    location: [{
        latitude: String,
        longitude: String,
        createdTime: { type: Date, default: Date.now },
    }],
    created_at: { type: Date, default: Date.now },
    updated_at: { type: Date, default: Date.now }
});

// the schema is useless so far
// we need to create a model using it
var location = mongoose.model('location_details', locationDetails);
console.log("location_details Collection created");
// make this available to our users in our Node applications
module.exports = location;