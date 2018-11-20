'use strict';
const dialogflow = require('dialogflow');
const structjson = require('./structjson');
const config = require('../config/keys');
const mongoose = require('mongoose');
const googleAuth = require('google-oauth-jwt');

const projectID = config.googleProjectID;
const sessionId = config.dialogflowSessionID;
const languageCode = config.dialogflowSessionLanguageCode;

const credentials = {
    client_email: config.googleClientEmail,
    private_key: config.googlePrivateKey
};

//initialize session client.  Instantiate a DialogFlow client.
const sessionClient = new dialogflow.SessionsClient({projectID, credentials});
// Define session path
const sessionPath = sessionClient.sessionPath(projectID, sessionId);

const Registration = mongoose.model('registration');

module.exports = {
    getToken: async function() {
        return new Promise((resolve) => {
            googleAuth.authenticate(
                {
                    email: config.googleClientEmail,
                    key: config.googlePrivateKey,
                    scopes: ['https://www.googleapis.com/auth/cloud-platform']
                }, (err, token) => {
                resolve(token);
            });
        });
    },
    
    textQuery: async function (text, userID, parameters = {}) { 
        let self = module.exports;
        let sessionPath = sessionClient.sessionPath(projectID, sessionId + userID);

        // The text query request.
        const request = {
            session: sessionPath,
            queryInput: {
                text: {
                    text: text,
                    languageCode: languageCode
                },
            },
            queryParams: {
                payload: {
                    data: parameters
                }
            }
        }; 
    
        // Send request and log result
        let responses = await sessionClient.detectIntent(request);
        responses = await self.handleAction(responses);
        return responses;
    },
    
    eventQuery: async function (event, userID, parameters = {}) {
        let self = module.exports; 
        let sessionPath = sessionClient.sessionPath(projectID, sessionId + userID);
        // The text query request.
        const request = {
            session: sessionPath,
            queryInput: {
                text: {
                    name: event,
                    parameters: structjson.jsonToStructProto(parameters),//Dialogflow's v2 API uses gRPC. You'll need a jsonToStructProto method to convert your JavaScript object to a proto struct.
                    languageCode: languageCode,
                },
            }
        };

        let responses = await sessionClient.detectIntent(request);
        responses = await self.handleAction(responses);
        return responses;
    },

    handleAction: function (responses){
        let self = module.exports;
        let queryResult = responses[0].queryResult;

        switch (queryResult.action) {
            case 'recommend search - yes':
                if (queryResult.allRequiredParamsPresent) {
                    self.saveRegistration(queryResult.parameters.fields);
                }

                break;
        }

        return responses;
    },

    saveRegistration: async function(fields) {
        const registration = new Registration({
            name: fields.name.stringValue,
            address: fields.address.stringValue,
            phone: fields.phone.stringValue,
            email: fields.email.stringValue,
            dateSent: Date.now()
        });
        try {
            let reg = await registration.save();
        } catch {
            console.log(err);
        }
    }
}