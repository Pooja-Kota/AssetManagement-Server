var mongoose=require('mongoose');
var Schema=mongoose.Schema;
var assetUserSchema=new Schema({
	username: { type: String, required: true },
	MACId: {type: String, required: true},
	createdTime:  { type: Date, default: Date.now,required: true, unique: true   }
});
var assetUser=mongoose.model('asset_user',assetUserSchema);
console.log("Asset user mapping created");
module.exports = assetUser;