const express   = require('express');

const ViewCtrl = require('../controllers/view');

module.exports = (app, prefix) => {
  const router = express.Router();

  router.get('/', ViewCtrl.renderHorseList);

  app.use(`${prefix ? '/'.concat(prefix) : ''}/horses`, router);
};
