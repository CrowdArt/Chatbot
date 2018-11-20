const {WebhookClient} = require('dialogflow-fulfillment');

const mongoose = require('mongoose');
const Demand = mongoose.model('demand');

module.exports = app => {
    app.post('./', async(req, res) => {
        const agent = new WebhookClient({ request: req, response: res });

        function eatingoutSearch(agent) {
            agent.add('Welcome to eating out fulfillment!');
        }

        function learn(agent) {
            Demand.findOne({'course': agent.parameters.courses}, function(err, course) {
                if (course != null ){
                    course.counter++;
                    course.save();
                } else {
                    const demand = new Demand({course: agent.parameters.courses});
                    demand.save();
                }
            });
            let responseText = `You want to learn about ${agent.parameters.courses}.
                    Here is a link to all of my courses: https://www.udemy.com`;

            let coupon = await Coupon.findOne({'course': agent.parameters.courses});
            if (coupon != null) {
                responseText = `You want to learn about ${agent.parameters.courses}.
                    Here is the link to the course: ${coupon.link}`;
            }
            agent.add(responseText);
        }

        function fallback(agent) {
            agent.add('I didnt understand.');
            agent.add('I am sorry, can you try again?');
        }
        let intentMap = new Map();
        intentMap.set('eatingoutSearch', eatingoutSearch);
        intentMap.set('learn course', learn);
        intentMap.set('Default Fallback Intent', fallback);

        agent.handleRequest(intentMap);
    });
}