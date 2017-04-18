const Horse = require('../models/Horse');

exports.get = (req, res, next) => {
  Horse
    .find({})
    .limit(50)
    .exec()
    .then(list => res.json(list))
    .catch(err => next(err));
};
