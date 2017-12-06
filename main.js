//costant files
var config = require('./config');
var appConstants = require('./utils/app_constants');
// mongoose database 
var mongoose = require('mongoose');
mongoose.Promise = require('bluebird');
mongoose.connect(config.mongoUrl);
// mongoose table schemas
var User = require('./collections/user');
var UserSession = require('./collections/user_session');
var Asset = require('./collections/asset');
var AssetUserMapping = require('./collections/asset_user_mapping');
var simCardDetails = require('./collections/sim_card_details');
var wifiDetails = require('./collections/wifi_details');
var locationDetails = require('./collections/location_details');
var appDetails = require('./collections/app_details');
// response object for api json response
var Response = require('./utils/response');
// password hashobject
var pinHash = require('password-hash');

var express = require("express");
var randtoken = require('rand-token');

var bodyParser = require('body-parser');

var app = express();
app.use(bodyParser.json()); // support json encoded bodies


// Generate a 16 character alpha-numeric token:

app.post('/signIn', function (req, res) {
    var user1 = new User(req.body);
    var userName = user1.username;
    var userAsset = new AssetUserMapping(req.body);
    if (userName.endsWith(config.companyDomain)) {
        User.findOne({ "username": user1.username }, function (err, userResult) {
            if (err) throw err;
            // object of all the users
            console.log(userResult);
            if (userResult == null || userResult == undefined) {
                var response = new Response(500, appConstants.not_register_username);
                res.json(response);
            }
            else if (pinHash.verify(user1.pin.toString(), userResult.pin)) {
                Asset.findOne({ "MACId": userAsset.MACId }, function (err, assetResponse) {
                    if (err) throw err;
                    userAsset.assetId = assetResponse.assetId;
                    userAsset.save(function (err, res2) {
                        if (err) throw err;
                    });
                    UserSession.findOne({ "username": userName }, function (err, userResult) {
                        if (err) throw err;
                        var token = '';
                        if (userResult == null || userResult == undefined) {
                            token = randtoken.generate(10);
                            var userSession = new UserSession();
                            userSession.username = userName;
                            userSession.token = token;
                            userSession.save(function (err, res1) {
                                if (err) throw err;
                            });
                        }
                        else {
                            token = userResult.token;
                        }

                        var response = new Response(200, appConstants.user_saved_success, token, assetResponse);
                        res.json(response);
                    });
                });



            }
            else {
                console.log("issues");
                var response = new Response(500, appConstants.invalid_pin);
                res.json(response);
            }

        });
    }
    else {
        console.log("issues");
        var response = new Response(500, appConstants.invalid_username_domain);
        res.json(response);
    }
})

app.post('/signUp', function (req, res) {
	
	
	console.log(req.body);
    var userArray = [];
    var user1 = new User(req.body);
    var userAsset = new AssetUserMapping(req.body);
    User.find({ "username": user1.username }, function (err, users) {
        if (err) throw err;
        // object of all the users
        userArray = users;
        if (!user1.username.endsWith(config.companyDomain)) {
            console.log("issues");
            var response = new Response(500, appConstants.invalid_username_domain);
            res.json(response);
        }
        else if (userArray.length > 0) {
            console.log("issues");
            var response = new Response(500, appConstants.user_exists);
            res.json(response);
        }
        else if (typeof (parseInt(user1.pin)) != 'number' || user1.pin.toString().length != 4) {
            console.log("issues");
            var response = new Response(500, appConstants.invalid_pin_format);
            res.json(response);
        }
        else {
            var hashedPin = pinHash.generate(user1.pin.toString());
            user1.pin = hashedPin;
            user1.save(function (err, res1) {
                if (err) throw err;
            });

            Asset.findOne({ "MACId": userAsset.MACId }, function (err, assetResponse) {
                if (err) throw err;

                userAsset.assetId = assetResponse.assetId;
                userAsset.save(function (err, res2) {
                    if (err) throw err;
                });
                var response = new Response(200, appConstants.user_saved_success, "", assetResponse);
                res.json(response);
                res.end();
            });
        }

    });
})

app.get('/user/:userName', function (req, res) {

    var userName = req.params.userName
    var authorization = req.get(appConstants.auth);
    if (authorization != null && authorization != undefined) {
        UserSession.findOne({ "username": userName }, function (err, userResult) {
            if (err) throw err;

            if (userResult == null || userResult == undefined) {
                var response = new Response(500, appConstants.auth_error);
                res.json(response);
            }
            else if (userResult.token != authorization) {
                var response = new Response(500, appConstants.auth_error);
                res.json(response);
            }
            else {
                User.findOne({ "username": userName }, function (err, userResult) {
                    if (err) throw err;
                    console.log(userResult);
                    var response = new Response(200, appConstants.success, "", userResult);
                    res.json(response);
                });
            }
        });
    }
    else {
        var response = new Response(500, appConstants.auth_error);
        res.json(response);
    }
})

app.get('/asset/getAssetId/:macId', function (req, res) {

    var macId = req.params.macId

    Asset.findOne({ "MACId": macId }, function (err, result) {
        if (err) throw err;
        if (result == null || result == undefined) {
            var response = new Response(500, appConstants.auth_error);
            res.json(response);
        }
        else {
            console.log(result);
            var response = new Response(200, appConstants.success, "", result);
            res.json(response);
        }

    });
})

app.get('/asset', function (req, res) {
    //Asset.find({}, null, {limit:10}, { sort: { "created_at": -1 } }, function (err, asset) {
    Asset.find({}).sort({ "created_at": -1 }).limit(1).exec(function (err, asset) {
        if (err) throw err;
        console.log("1 " + asset);
        var defaultString = 'IM-Asset-';
        var id = asset[0].assetId.substr(9);
        var intId = parseInt(id, 10);
        var assetId = defaultString + "Tab-" + (intId + 1);
        console.log("2 " + assetId);
        res.json(assetId);
        res.end();
    });
});

app.post('/asset/create', function (req, res) {
    var assetRequestObject = new Asset(req.body);
    Asset.findOne({ "type": assetRequestObject.type }).sort({ "created_at": -1 }).limit(1).exec(function (err, assetResponseObject) {
        if (err) throw err;
        console.log("1 " + assetResponseObject);

        if (assetResponseObject != null && assetResponseObject != undefined) {
            var defaultString = 'IM-Asset-' + assetResponseObject.type + '-';
            var id = assetResponseObject.assetId.substr(defaultString.length);
            var intId = parseInt(id, 10);
            var assetId = defaultString + (intId + 1);
            assetRequestObject.assetId = assetId;
            assetRequestObject.save(function (err, res1) {
                if (err) throw err;
                var response = new Response(200, appConstants.success, "", res1);
                res.json(response);
                res.end();
            });

        }
        else {
            var defaultString = 'IM-Asset-' + assetRequestObject.type + '-' + 1;
            assetRequestObject.assetId = defaultString;
            assetRequestObject.save(function (err, res1) {
                if (err) throw err;
                var response = new Response(200, appConstants.success, "", res1);
                res.json(response);
                res.end();
            });

        }

    });
});

app.post('/locationDetails', function (req, res) {
    var location = new locationDetails(req.body);
    locationDetails.findOne({ "assetId": location.assetId }, function (err, locationResult) {
        if (err) throw err;
        console.log("1 " + location);
        if (locationResult != null && locationResult != undefined) {
            locationDetails.findByIdAndUpdate(
                locationResult._id,
                { $push: { "location": location.location[0] } },
                { safe: true },
                function (err, model) {
                    if (err) throw err;
                    console.log(model);
                    var response = new Response(200, appConstants.success, "", model);
                    res.json(response);
                    res.end();
                }
            );

        }
        else {
            location.save(function (err, res1) {
                if (err) throw err;
                var response = new Response(200, appConstants.success, "", res1);
                res.json(response);
                res.end();
            });
        }

    });
});

app.post('/wifiDetails', function (req, res) {
    var wifiRequestObject = new wifiDetails(req.body);
    wifiDetails.findOne({ "assetId": wifiRequestObject.assetId }, function (err, wifiResultObject) {
        if (err) throw err;
        console.log("1 " + wifiResultObject);
        if (wifiResultObject != null && wifiResultObject != undefined) {
            wifiDetails.findByIdAndUpdate(
                wifiResultObject._id,
                { $push: { "wifi": wifiRequestObject.wifi[0] } },
                { safe: true },
                function (err, model) {
                    if (err) throw err;
                    console.log(model);
                    var response = new Response(200, appConstants.success, "", model);
                    res.json(response);
                    res.end();
                }
            );

        }
        else {
            wifiRequestObject.save(function (err, res1) {
                if (err) throw err;
                var response = new Response(200, appConstants.success, "", res1);
                res.json(response);
                res.end();
            });
        }

    });
});

app.post('/simCardDetails', function (req, res) {
    var simCardRequestObject = new simCardDetails(req.body);
    simCardDetails.findOne({ "assetId": simCardRequestObject.assetId }, function (err, simCardResultObject) {
        if (err) throw err;
        console.log("1 " + location);
        if (simCardResultObject != null && simCardResultObject != undefined) {
            simCardDetails.findByIdAndUpdate(
                simCardResultObject._id,
                { $push: { "sim": simCardRequestObject.sim[0] } },
                { safe: true },
                function (err, model) {
                    if (err) throw err;
                    console.log(model);
                    var response = new Response(200, appConstants.success, "", model);
                    res.json(response);
                    res.end();
                }
            );
        }
        else {
            simCardRequestObject.save(function (err, res1) {
                if (err) throw err;
                var response = new Response(200, appConstants.success, "", res1);
                res.json(response);
                res.end();
            });
        }

    });
});

app.post('/appDetails', function (req, res) {
    var appDetailsRequestObject = new appDetails(req.body);
    appDetails.findOne({ "assetId": appDetailsRequestObject.assetId }, function (err, appDetailsResponseObject) {
        if (err) throw err;
        console.log("1 " + location);
        if (appDetailsResponseObject != null && appDetailsResponseObject != undefined) {
            appDetails.findByIdAndUpdate(
                appDetailsResponseObject._id,
                { $push: { "applications": appDetailsRequestObject.applications[0] } },
                { safe: true },
                function (err, model) {
                    if (err) throw err;
                    console.log(model);
                    var response = new Response(200, appConstants.success, "", model);
                    res.json(response);
                    res.end();
                }
            );

        }
        else {
            appDetailsRequestObject.save(function (err, res1) {
                if (err) throw err;
                var response = new Response(200, appConstants.success, "", res1);
                res.json(response);
                res.end();
            });
        }

    });
});

app.get('/locationDetails/:assetId/:limit', function (req, res) {
    var assetId = req.params.assetId
    var limit = req.params.limit
    locationDetails.findOne({ "assetId": assetId }, { 'location': { $slice: -limit } }).exec(function (err, locationResponseObject) {
        if (err) throw err;
        if (locationResponseObject != null && locationResponseObject != undefined) {
            console.log("1 " + locationResponseObject);
            locationResponseObject.location.reverse();
            var response = new Response(200, appConstants.success, "", locationResponseObject);
            res.json(response);
            res.end();
        } else {
            var response = new Response(200, appConstants.success, "", "");
            res.json(response);
            res.end();
        }

    });
});

app.get('/simDetails/:assetId/:limit', function (req, res) {
    var assetId = req.params.assetId
    simCardDetails.find({ "assetId": assetId }, { 'sim': { $slice: -limit } }).exec(function (err, simDetailsResponseObject) {
        if (err) throw err;
        if (simDetailsResponseObject != null && simDetailsResponseObject != undefined) {
            console.log("1 " + simDetailsResponseObject);
            simDetailsResponseObject.sim.reverse();
            var response = new Response(200, appConstants.success, "", simDetailsResponseObject);
            res.json(response);
            res.end();
        } else {
            var response = new Response(200, appConstants.success, "", "");
            res.json(response);
            res.end();
        }
    });
});

app.get('/appDetails/:assetId/:limit', function (req, res) {
    var assetId = req.params.assetId
    appDetails.find({ "assetId": assetId }, { 'applications': { $slice: -limit } }).exec(function (err, appDetailsResponseObject) {
        if (err) throw err;
        if (appDetailsResponseObject != null && appDetailsResponseObject != undefined) {
            console.log("1 " + appDetailsResponseObject);
            appDetailsResponseObject.applications.reverse();
            var response = new Response(200, appConstants.success, "", appDetailsResponseObject);
            res.json(response);
            res.end();
        } else {
            var response = new Response(200, appConstants.success, "", "");
            res.json(response);
            res.end();
        }
    });
});

app.get('/wifiDetails/:assetId/:limit', function (req, res) {
    var assetId = req.params.assetId
    var limit = req.params.limit

    wifiDetails.findOne({ "assetId": assetId }, { 'wifi': { $slice: -limit } }).exec(function (err, wifiResponseObject) {
        if (err) throw err;

        if (wifiResponseObject != null && wifiResponseObject != undefined) {
            console.log("1 " + wifiResponseObject);
            wifiResponseObject.wifi.reverse();
            var response = new Response(200, appConstants.success, "", wifiResponseObject);
            res.json(response);
            res.end();
        } else {
            var response = new Response(200, appConstants.success, "", "");
            res.json(response);
            res.end();
        }
    });
});

var server = app.listen(8080, function () {

    var host = server.address().address
    var port = server.address().port

    console.log("Example app listening at http://%s:%s", host, port)
})


