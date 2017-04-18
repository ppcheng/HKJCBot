const Horse = require('../models/Horse');

exports.renderHorseList = (req, res, next) => {
  Horse
    .find({})
    .limit(25)
    .exec()
    .then((list) => {
      res.render('horseList', {
        title: 'Home',
        horses: list
      });
    })
    .catch(err => next(err));
};
