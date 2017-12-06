// grab the things we need
var mongoose = require('mongoose');
var Schema = mongoose.Schema;

// create a schema
var userSessionSchema = new Schema({
    username: { type: String, required: true, unique: true },
    token: { type: String, required: true },
    created_at: { type: Date, default: Date.now },
    updated_at: { type: Date, default: Date.now }
});

// the schema is useless so far
// we need to create a model using it
var userSession = mongoose.model('user_session', userSessionSchema);
console.log("UserSession Collection created");
// make this available to our users in our Node applications
module.exports = userSession;