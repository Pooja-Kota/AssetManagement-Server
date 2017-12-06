
const TYPE_OF_MOBILES = ["Tab", "Android", "IOS"];
var mongoose=require('mongoose');
var Schema=mongoose.Schema;
var assetSchema=new Schema({
	 assetId: { type: String, required: true, unique: true },
	deviceId: Number,
	MACId: {type: String, required: true, unique: true},
	Imei1: Number,
	Imei2: Number,
	Imei3: Number,
	status: Boolean,
	type: { type: String, enum: TYPE_OF_MOBILES },
	created_at: { type: Date, default: Date.now },
  updated_at: { type: Date, default: Date.now }
});
var Asset=mongoose.model('asset',assetSchema);
console.log("Asset collection created");
module.exports=Asset;