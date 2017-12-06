// grab the things we need
var mongoose = require('mongoose');
var Schema = mongoose.Schema;

// create a schema
var appDetails = new Schema({
    applications: [{
        applicationName: String,
        createdTime: { type: Date, default: Date.now },
    }],
    assetId: { type: String, required: true, unique: true },
    created_at: { type: Date, default: Date.now },
    updated_at: { type: Date, default: Date.now }
});

// the schema is useless so far
// we need to create a model using it
var apps = mongoose.model('app_details', appDetails);
console.log("app_details Collection created");
// make this available to our users in our Node applications
module.exports = apps;