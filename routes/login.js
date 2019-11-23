var express = require('express');
const models = require('../models');
var router = express.Router();
const Op = models.Sequelize.Op;
const shinhanApi = require('../actions/shinhanApi');

shinhanApi.getDomesticCreditCardUseage;

/* login */
router.post('/', function(req, res, next) {
  models.user.findOne({where:{id:req.body.userId}})
  .then( user => {
    if(user.dataValues.password == req.body.password) {
        res.json({status:"okay"});
    } else {
        res.json({status:"fail"});
    }
  })
  .catch( error => {
    res.status(500).send(error);
  })
});

module.exports = router;