const express   = require('express');

const HorseCtrl = require('../controllers/horse');

module.exports = (app, prefix) => {
  const router = express.Router();

  router.get('/', HorseCtrl.get);

  app.use(`${prefix ? '/'.concat(prefix) : ''}/horses`, router);
};
