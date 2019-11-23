var express = require('express');
const models = require('../models');
var router = express.Router();
const Op = models.Sequelize.Op;
const shinhanApi = require('../actions/shinhanApi');

/* login */
router.post('/', function(req, res, next) {
  models.user.findOne({where:{id:req.body.userId}})
  .then( async user => {
    if(user.dataValues.password == req.body.password) {
        res.json({status:"okay"});
        let domesticCredit = await shinhanApi.getDomesticCreditCardUseage(req.body.userId);
        let domesticCheck = await shinhanApi.getDomesticCheckCardUseage(req.body.userId);
        let overseasCredit = await shinhanApi.getOverseasCreditCardUseage(req.body.userId);
        let overseasCheck = await shinhanApi.getOverseasCheckCardUseage(req.body.userId);
        let transactionHistory = await shinhanApi.getTrasactionHistory(req.body.userId);

        models.transaction.bulkCreate(
          domesticCreditToTransaction(req.body.userId, domesticCredit.data)
          );
        models.transaction.bulkCreate(
          domesticCheckToTransaction(req.body.userId, domesticCheck.data)
          );
        models.transaction.bulkCreate(
          overseasCreditToTransaction(req.body.userId, overseasCredit.data)
          );
        models.transaction.bulkCreate(
          overseasCheckToTransaction(req.body.userId, overseasCheck.data)
          );
        models.transaction.bulkCreate(
          transactionHistoryToTransaction(req.body.userId, transactionHistory.data)
          );
        
    } else {
        res.json({status:"fail"});
    }
  })
  .catch( error => {
    res.status(500).send(error);
  })
});

const currency = function(countryCode) {
  return 1000;
}


const domesticCreditToTransaction = function(userId, data) {
  let list = data.dataBody.grp001;
  let result = []
  for(src of list) {
    result.push({
      userId: userId,
      type: '국내신용',
      amount: parseInt(src.aprvamt,10),
      merchantName: src.retlname,
      approveTime: new Date(src.aprvtime.replace(
        /^(\d{4})(\d\d)(\d\d)(\d\d)(\d\d)(\d\d)$/,
        '$4:$5:$6 $2/$3/$1')),
      businessType: "기타"
    })
  }
  return result;
}

const domesticCheckToTransaction = function(userId, data) {
  let list = data.dataBody.grp001;
  let result = []
  for(src of list) {
    result.push({
      userId: userId,
      type: '국내체크',
      amount: parseInt(src.aprvamt,10),
      merchantName: src.retlname,
      approveTime: new Date(src.aprvtime.replace(
        /^(\d{4})(\d\d)(\d\d)(\d\d)(\d\d)(\d\d)$/,
        '$4:$5:$6 $2/$3/$1')),
      businessType: "기타"
    })
  }
  return result;
}

const overseasCreditToTransaction = function(userId, data) {
  let list = data.dataBody.grp001;
  let result = []
  for(src of list) {
    result.push({
      userId: userId,
      type: '해외신용',
      amount: parseInt(src.aprvamt,10) * currency(src.loaTel),
      merchantName: src.retlname,
      approveTime: new Date(src.aprvtime.slice(0, 4), src.aprvtime.slice(4, 6) - 1, src.aprvtime.slice(6, 8),
      src.aprvtime.slice(8, 10), src.aprvtime.slice(10, 12), src.aprvtime.slice(12, 14)),
      businessType: src.ryCd
    })
  }
  return result;
}

const overseasCheckToTransaction = function(userId, data) {
  let list = data.dataBody.grp001;
  let result = []
  for(src of list) {
    result.push({
      userId: userId,
      type: '해외체크',
      amount: parseInt(src.apva,10) * currency(src.currency),
      merchantName: src.mctNm,
      approveTime: new Date(src.apvDt.slice(0, 4), src.apvDt.slice(4, 6) - 1, src.apvDt.slice(6, 8),
      src.apvDt.slice(8, 10), src.apvDt.slice(10, 12), src.apvDt.slice(12, 14)),
      businessType: src.ryCd
    })
  }
  return result;
}

const transactionHistoryToTransaction = function(userId, data) {
  let list = data.dataBody.거래내역;
  let result = []
  for(src of list) {
    result.push({
      userId: userId,
      type: (src.입지구분 == 1) ? '입금' : '출금',
      amount: (src.입지구분 == 1) ? parseInt(src.입금,10) : parseInt(src.출금,10),
      merchantName: src.거래점,
      approveTime: new Date(data.dataBody.조회일자.slice(0, 4), data.dataBody.조회일자.slice(4, 6) - 1, data.dataBody.조회일자.slice(6, 8)),
      businessType: "기타"
    })
  }
  return result;
}

module.exports = router;