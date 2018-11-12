const express = require('express');
const bodyParser = require('body-parser');

const app = express();
//const webviews = require('./routes/webviews');


const config = require('./config/keys');

app.use(bodyParser.json());
//app.use('/webviews', webviews);

require('./routes/dialogflowRoutes')(app);

const PORT = process.env.PORT || 5000;
app.listen(PORT);