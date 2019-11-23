var express = require('express');
const models = require('../models');
var router = express.Router();
const Op = models.Sequelize.Op;

var expenseList = require('../response/expenseList');
var incomeList = require('../response/incomeList');
var categorizeList = require('../response/categorizeList');
var incomeListSimple = require('../response/incomeListSimple');
var expenseListSimple = require('../response/expenseListSimple');

/* 모든 유저목록 */
router.get('/', function(req, res, next) {
  models.user.findAll()
  .then( result => {
    console.log("users get");
    res.json(result);
  })
  .catch( error => {
    console.log(error);
    res.status(500).send(error);
  })
});

/* 아이디로 유저 가져오기 */
router.get('/:id', function(req, res, next) {
  models.user.findOne({where:{id:req.params.id}})
  .then( result => res.json(result))
  .catch( error => {
    res.status(500).send(error);
  })
});

router.get('/:id/wallets', function(req, res, next) {
  models.user.findOne({where:{id:req.params.id}})
  .then( user => user.getWallets())
  .then( wallets => res.json(wallets))
  .catch( error => res.status(500).send(error))
});

/* user_id가 아이디인 유저 추가 */
router.put('/:user_id', function(req, res, next) {
  let body = req.body;
  models.user.create({
    id: req.params.user_id,
    password: body.password,
    name: body.name,
    email: body.email,
    lastSyncTime: body.last_sync_time,
    gender: body.gender,
    budget: body.budget
  })
  .then( result => {
    console.log("user added");
    res.send({"status":"ok"});
  })
  .catch( error => {
    res.status(500).send(error);
  })
});

/* 유저의 일/월단위 개인소비내역 */
router.get('/:user_id/expenses', function(req, res, next) {
  let start = new Date(req.query.start);
  let end = new Date(req.query.end);
  end.setDate(end.getDate()+1);
  models.user.findOne({where:{id:req.params.user_id}})
  .then( user => user.getTransactions({
    where: {
      approveTime: {
        [Op.between]: [start, end]
      },
      type: {
        [Op.in]: ["국내체크", "해외체크", "국내신용", "해외신용"]
      }
    },
    limit: req.query.size*1,
    order: [['approveTime', 'DESC']]
  }))
  .then( result => res.json(expenseList(result)))
  .catch( error => {
    res.status(500).send(error);
  })
});

/* 유저의 일/월단위 개인수입내역 */
router.get('/:user_id/incomes', function(req, res, next) {
  let start = new Date(req.query.start);
  let end = new Date(req.query.end);
  end.setDate(end.getDate()+1);
  models.user.findOne({where:{id:req.params.user_id}})
  .then( user => user.getTransactions({
    where: {
      approveTime: {
        [Op.between]: [start, end]
      },
      type: {
        [Op.in]: ["입금"]
      }
    },
    limit: req.query.size*1,
    order: [['approveTime', 'DESC']]
  }))
  .then( result => res.json(incomeList(result)))
  .catch( error => {
    res.status(500).send(error);
  })
});

/* 유저의 일/월단위 카테고리별 소비량 개인소비내역 */
router.get('/:user_id/expenses/_categorize', function(req, res, next) {
  let start = new Date(req.query.start);
  let end = new Date(req.query.end);
  end.setDate(end.getDate()+1);
  models.user.findOne({where:{id:req.params.user_id}})
  .then( user => user.getTransactions({
    where: {
      approveTime: {
        [Op.between]: [start, end]
      },
      type: {
        [Op.in]: ["국내체크", "해외체크", "국내신용", "해외신용"]
      }
    },
    limit: req.query.size*1,
    attributes: ['businessType', [models.sequelize.fn('SUM', models.sequelize.col('amount')), 'total']],
    group: ['businessType'],
    order: [[models.sequelize.literal('total'), 'DESC']]
  }))
  .then( result => res.json(categorizeList(result)))
  .catch( error => {
    res.status(500).send(error);
  })
});

/* 유저의 수입내역 */
router.get('/:user_id/incomes/_simple', function(req, res, next) {
  let start = new Date(req.query.start);
  let end = new Date(req.query.end);
  end.setDate(end.getDate()+1);
  models.sequelize.query(
    "SELECT date_format(approveTime, '%Y-%m-%d') as date, SUM(t.amount) as amount "+
    "FROM users AS u "+
    "JOIN Transactions AS t ON t.userId = u.id "+
    "WHERE t.type IN ('입금') "+
    "AND u.id = ? " +
    "AND t.approveTime BETWEEN ? AND ? " +
    "GROUP BY date "+
    "ORDER BY date DESC;",
    { replacements: [req.params.user_id, start, end]}
  )
  .then( result => {
    res.json(result[0]);
  })
  .catch( error => {
    console.log(error);
    res.status(500).send(error);
  })
});

/* 유저의 소비내역 */
router.get('/:user_id/expenses/_simple', function(req, res, next) {
  let start = new Date(req.query.start);
  let end = new Date(req.query.end);
  end.setDate(end.getDate()+1);
  models.sequelize.query(
    "SELECT date_format(approveTime, '%Y-%m-%d') as date, SUM(t.amount) as amount "+
    "FROM users AS u "+
    "JOIN Transactions AS t ON t.userId = u.id "+
    "WHERE t.type IN ('국내체크', '해외체크', '국내신용', '해외신용') "+
    "AND u.id = ? " +
    "AND t.approveTime BETWEEN ? AND ? " +
    "GROUP BY date "+
    "ORDER BY date DESC;",
    { replacements: [req.params.user_id, start, end]}
  )
  .then( result => {
    res.json(result[0]);
  })
  .catch( error => {
    console.log(error);
    res.status(500).send(error);
  })
});

/* 유저의 거래목록 추가 */
router.post('/:user_id/transactions', function(req, res, next) {
  models.user.findOne({where:{id:req.params.user_id}})
  .then( user =>
    user.createTransaction({
      type: req.body.type,
      amount: req.body.amount,
      merchantName: req.body.merchant_name,
      approveTime: req.body.approve_time,
      installmentMonth: req.body.installment_month,
      businessType: req.body.business_type
  }))
  .then( result => {
    res.json(result);
  })
  .catch( error => {
    res.status(500).send(error);
  })
});

/* 유저의 거래목록 추가 */
router.post('/:user_id/transactions/_bulk', function(req, res, next) {
  models.user.findOne({where:{id:req.params.user_id}})
  .then( user => user.createTransaction(req.body))
  .then( result => {
    res.json(result);
  })
  .catch( error => {
    res.status(500).send(error);
  })
});

module.exports = router;