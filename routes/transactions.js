var express = require('express');
const models = require('../models');
var router = express.Router();

router.post('/_bulk', function(req, res, next) {
  input = [];
  for(t of req.body) {
    input.push({
      userId: t.userid,
      age: t.age,
      gender: t.gender,
      type: t.type,
      amount: t.amount,
      merchantName: t.merchantName,
      approveTime: t.approveTime,
      businessType: t.businessType
    })
  }
  models.transaction.bulkCreate(input)
  .then( result => {
    console.log("get all transaction");
    res.json(result);
  })
  .catch( error => {
    console.log(error);
    res.status(500).send(error);
  })
});

module.exports = router;