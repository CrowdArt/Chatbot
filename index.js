const express = require('express');
const bodyParser = require('body-parser');

const app = express();
//const webviews = require('./routes/webviews');


const config = require('./config/keys');
const mongoose = require('mongoose');
mongoose.connect(config.mongoURI, { useNewUrlParser: true });

require('./models/Registration');
require('./models/Demand');
require('./models/Coupons');

app.use(bodyParser.json());
//app.use('/webviews', webviews);

require('./routes/dialogflowRoutes')(app);
require('./routes/fulfillmentRoutes')(app);

const PORT = process.env.PORT || 5000;
app.listen(PORT);