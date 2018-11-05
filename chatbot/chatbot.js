'use strict';
const dialogflow = require('dialogflow');
const structjson = require('./structjson');
const config = require('../config/keys');

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
const sessionPath = sessionClient.sessionPath(config.googleProjectID, config.dialogflowSessionID);

module.exports = {
    textQuery: async function (text, parameters = {}) {
        let self = module.exports; 
        let sessionPath = sessionClient.sessionPath(projectID, sessionId);

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
    
    eventQuery: async function (event, parameters = {}) {
        let self = module.exports; 
        let sessionPath = sessionClient.sessionPath(projectID, sessionId);
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
        return responses;
    }
}