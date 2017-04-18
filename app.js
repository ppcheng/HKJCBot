const path         = require('path');
const logger       = require('morgan');
const express      = require('express');
const Promise      = require('bluebird');
const mongoose     = require('mongoose');
const bodyParser   = require('body-parser');
const compression  = require('compression');
const errorHandler = require('errorhandler');

const app = express();

/**
 * MongoDB Setup
 */
mongoose.Promise = Promise;
mongoose
  .connect('mongodb://localhost:27017/hkjc-horse-racing')
  .then(() => {
    console.log('Successfully connect to the specified mongo instance.');
  })
  .catch((err) => {
    console.error(err);
    process.exit();
  });

/**
 * Express Setup
 */
app.set('port', process.env.PORT || 8080);
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'pug');

app.enable('trust proxy');
app.disable('x-powered-by');
app.disable('etag');

app.use(compression());
app.use(logger('dev'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

/**
 * Routes Setup
 */
app.get('/', (req, res) => res.sendStatus(200));

require('./routes/view')(app);
require('./routes/horse')(app, 'api');

app.use(errorHandler());

app.listen(app.get('port'), () => {
  console.log(`App is running at localhost:${app.get('port')}`);
});
