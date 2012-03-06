var TwilioClient = require('./node-twilio').RestClient;
var config = require("./config");
var client = new TwilioClient(config.twilio.sid, config.twilio.authToken);

var base64urlencode = function(str) {
    var newStr = new Buffer(str).toString("base64");
    newStr = newStr.replace(/\+/gi, "-");
    newStr = newStr.replace(/\//gi, "_");
    newStr = newStr.replace(/=/gi, "");
    return newStr;
};
function randomString(string_length, chars) {

    var chars;
    var randomstring = '';
    for(var i = 0; i < string_length; i++) {
        var rnum = Math.floor(Math.random() * chars.length);
        randomstring += chars.substring(rnum, rnum + 1);
    }
    return randomstring;
};

var twilioAccount = {};

module.exports = {

    createApp : function(projId, appUrl, cb) {

        function errHandler(err) {
            cb(null)

        };

        function successHandler(data) {
            cb({
                appId : data.sid
            });
        };


        client.apiCall("POST", "/Applications", {
            params : "FriendlyName=" + projId + "&VoiceUrl=http://" + appUrl + "/additional.php"
        }, successHandler, errHandler);
    },
    addAccount : function(cb) {
        client.apiCall("POST", "/2010-04-01/Accounts.json", {
            params : ""
        }, function(response) {
            cb({
                "sid" : response.sid,
                "token" : response.auth_token
            });
        }, function(err) {
            cb(null);
        }, true);
    },
    checkCallerId : function(callerId, cb) {

        function errHandler(err) {
            cb(false)

        };

        function successHandler(data) {
            if(data && data.outgoing_caller_ids && typeof (data.outgoing_caller_ids.length) === "number") {
                for(var i = 0; i < data.outgoing_caller_ids.length; i++) {
                    if(data.outgoing_caller_ids[i].phone_number === callerId) {
                        cb(true);
                        return;
                    }
                }
                cb(false);
            } else {
                cb(false);
            }
        };


        client.apiCall("GET", "/OutgoingCallerIds", null, successHandler, errHandler);

    },
    deleteApp : function(AppId) {
        function resHandler(data) {
        };


        client.apiCall("DELETE", "/Applications/" + AppId, {}, resHandler, resHandler);
    },
    allApps : function(cb) {

        function errHandler(err) {
            cb(null)

        };

        function successHandler(data) {
            cb(data.applications || []);
            //may only return first page
        };


        client.apiCall("GET", "/Applications", null, successHandler, errHandler);
    },
    verifyPhone : function(twilioAccount, phoneNumber, cb) {

        var client = new TwilioClient(twilioAccount.sid, twilioAccount.token);
        client.addOutgoingCallerId("+1" + phoneNumber, {"FriendlyName": "user"}, function(callerResponse) {
            cb(callerResponse.validation_code);
        }, function() {
            cb(null);
        });
    },
    handleRequest : function(req, res, next) {

        if(!req.project) {
            console.log("Project not loaded for Twilio Token Request");
            res.send(500);
            return;
        }

        var twilioAccountSid = req.param("token");
        req.project.getTwilioAccount(twilioAccountSid, function(account) {
            if(!account) {
                console.log("AccountSid not passed for Twilio Token Request");
                res.send(500);
                return;
            }
            var twilioAccountToken = account.token;
            console.log(twilioAccountSid + " + " + twilioAccountToken);

            var replaceTokens = function(str) {
                return str.replace(/initme_twilio_appSid/ig, req.project.twilioSid).replace(/initme_twilio_accountSid/ig, twilioAccountSid || "");
            };
            var payload = {
                scope : replaceTokens(req.body['scope']),
                iss : replaceTokens(req.body['iss']),
                exp : parseInt(req.body['exp'])
            };

            console.log(payload);

            var crypto = require("crypto");
            var hmac = crypto.createHmac("sha256", twilioAccountToken)
            var algBytes = base64urlencode(JSON.stringify({
                typ : 'JWT',
                alg : 'HS256'
            }));
            var jsonBytes = base64urlencode(JSON.stringify(payload));

            var stringToSign = algBytes + "." + jsonBytes;
            hmac.update(stringToSign);

            var signatureValue = hmac.digest("base64").replace(/\//gi, "_").replace(/\+/gi, "-").replace(/=/gi, "");
            var token = algBytes + "." + jsonBytes + "." + signatureValue;

            res.send(token);
        });
    }
}