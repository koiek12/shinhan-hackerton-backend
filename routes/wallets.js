var express = require('express');
const models = require('../models');
var router = express.Router();
const Op = models.Sequelize.Op;

var expenseListWallet = require('../response/expenseListWallet');
var incomeListWallet = require('../response/incomeListWallet');
var incomeListSimple = require('../response/incomeListSimple');
var categorizeList = require('../response/categorizeList');
var chatList = require('../response/chatList');
var budgetList = require('../response/budgetList');
var bymonthList = require('../response/bymonthList');

/* 모든 지갑 목록 */
router.get('/', function(req, res, next) {
  models.wallet.findAll()
  .then( result => {
    console.log("get all wallets");
    res.json(result);
  })
  .catch( error => {
    res.status(500).send(error);
  })
});

/* 지갑 추가 */
router.post('/', function(req, res, next) {
  let body = req.body;
  models.wallet.create({
    name: body.name
  })
  .then( result => {
    console.log("wallet added");
    res.send();
  })
  .catch( error => {
    res.status(500).send(error);
  })
});

/* 지갑에 속한 모든 유저 */
router.get('/:wallet_id/users', function(req, res, next) {
  models.wallet.findOne({where:{id:req.params.wallet_id}})
  .then( wallet => wallet.getUsers())
  .then( users => {
    result = [];
      for(user of users) {
        result.push({
          id: user.dataValues.id,
          name: user.dataValues.name,
          email: user.dataValues.email
        });
      }
      res.send(result);
  })
  .catch( error => {
    console.log("wallet find failed");
    res.status(500).send(error);
  })
});

/* 채팅하기 */
router.post('/:wallet_id/users/:user_id/_chat', function(req, res, next) {
  models.chat.create({
    walletId: req.params.wallet_id, 
    userId: req.params.user_id,
    content: req.body.content,
    time: new Date()
  })
  .then( result => res.json({"status":"ok"}))
  .catch( error => {
    res.status(500).send(error);
  })
});

/* 채팅 목록 */
router.get('/:wallet_id/chats', function(req, res, next) {
  models.wallet.findOne({where:{id:req.params.wallet_id}})
  .then( wallet => wallet.getChats({
    include: [{ model: models.user}],
    limit: req.query.size*1,
    order: [['time', 'DESC']]
  }))
  .then( chats => res.json(chatList(chats)))
  .catch( error => {
    console.log("wallet find failed");
    res.status(500).send(error);
  })
});

/* 초대 API */
router.put('/:wallet_id/users/:user_id', function(req, res, next) {
  models.wallet.findOne({where:{id:req.params.wallet_id}})
  .then( wallet => wallet.addUsers([req.params.user_id]))
  .then( result => res.send({status: "ok"}))
  .catch( error => {
    console.log("wallet find failed");
    res.status(500).send(error);
  })
});

/* 유저 거래정보 싱크 */
router.get('/:wallet_id/users/:user_id/_sync', function(req, res, next) {
  models.walletUser.findOne({
    where:{
      walletId: req.params.wallet_id, 
      userId: req.params.user_id
    }
  })
  .then( walletUser => 
    models.transaction.findAll({
      where:{
        userId:req.params.user_id,
        approveTime: {
          [Op.gte]: walletUser.lastSyncTime
        }
      }
  }))
  .then( transactions => {
    let con = [];
    for(transaction of transactions) {
      con.push({
        walletId: req.params.wallet_id,
        transactionId: transaction.dataValues.id
      });
    }
    return models.walletTransaction.bulkCreate(con);
  })
  .then( result => models.walletUser.findOne({
    where:{
      walletId: req.params.wallet_id, 
      userId: req.params.user_id
    }
  }))
  .then( walletUser => walletUser.update({
    lastSyncTime: new Date().toISOString()
  }))
  .then( result => res.json({status:"ok"}))
  .catch( error => {
    console.log(error);
    res.status(500).send(error);
  })
});

/* 가족의 일/월단위 소비내역 */
router.get('/:wallet_id/expenses', async function(req, res, next) {
  let start = new Date(req.query.start);
  let end = new Date(req.query.end);
  end.setDate(end.getDate()+1);
  models.wallet.findOne({where:{id:req.params.wallet_id}})
  .then( wallet => wallet.getTransactions({
    where: {
      approveTime: {
        [Op.between]: [start, end]
      },
      type: {
        [Op.in]: ["국내체크", "해외체크", "국내신용", "해외신용"]
      }
    },
    include: [{ model: models.user}],
    limit: req.query.size*1,
    order: [['approveTime', 'DESC']]
  }))
  .then( result => res.json(expenseListWallet(result)))
  .catch( error => {
    console.log(error);
    res.status(500).send(error);
  })
});

/* 가족의 수입내역 */
router.get('/:wallet_id/incomes/_simple', function(req, res, next) {
  let start = new Date(req.query.start);
  let end = new Date(req.query.end);
  end.setDate(end.getDate()+1);
  start.setHours(start.getHours()-9);
  end.setHours(end.getHours()-9);
  models.sequelize.query(
    "SELECT date_format(t.approveTime, '%Y-%m-%d') as date, SUM(t.amount) as amount "+
    "FROM wallets AS w "+
    "JOIN walletTransactions AS wt ON w.id = wt.walletId "+
    "JOIN Transactions AS t ON t.id = wt.transactionId "+
    "WHERE t.type IN ('입금') "+
    "AND w.id = ? " +
    "AND t.approveTime BETWEEN ? AND ? " +
    "GROUP BY date "+
    "ORDER BY date DESC;",
    { replacements: [req.params.wallet_id, start, end]}
  )
  .then( result => {
    res.json(result[0]);
  })
  .catch( error => {
    console.log(error);
    res.status(500).send(error);
  })
});

/* 가족의 소비내역 */
router.get('/:wallet_id/expenses/_simple', function(req, res, next) {
  let start = new Date(req.query.start);
  let end = new Date(req.query.end);
  end.setDate(end.getDate()+1);
  start.setHours(start.getHours()-9);
  end.setHours(end.getHours()-9);
  models.sequelize.query(
    "SELECT date_format(t.approveTime, '%Y-%m-%d') as date, SUM(t.amount) as amount "+
    "FROM wallets AS w "+
    "JOIN walletTransactions AS wt ON w.id = wt.walletId "+
    "JOIN Transactions AS t ON t.id = wt.transactionId "+
    "WHERE t.type IN ('국내체크', '해외체크', '국내신용', '해외신용') "+
    "AND w.id = ? " +
    "AND t.approveTime BETWEEN ? AND ? " +
    "GROUP BY date "+
    "ORDER BY date DESC;",
    { replacements: [req.params.wallet_id, start, end]}
  )
  .then( result => {
    res.json(result[0]);
  })
  .catch( error => {
    console.log(error);
    res.status(500).send(error);
  })
});

/* 가족의 일/월단위 수입내역 */
router.get('/:wallet_id/incomes', function(req, res, next) {
  let start = new Date(req.query.start);
  let end = new Date(req.query.end);
  end.setDate(end.getDate()+1);
  models.wallet.findOne({where:{id:req.params.wallet_id}})
  .then( wallet => wallet.getTransactions({
    where: {
      approveTime: {
        [Op.between]: [start, end]
      },
      type: {
        [Op.in]: ["입금"]
      }
    },
    include: [{ model: models.user}],
    limit: req.query.size*1,
    order: [['approveTime', 'DESC']]
  }))
  .then( result => res.json(incomeListWallet(result)))
  .catch( error => {
    console.log(error);
    res.status(500).send(error);
  })
});

/* 가족의 일/월단위 수입내역 */
router.get('/:wallet_id/incomes/_list', function(req, res, next) {
  let start = new Date(req.query.start);
  let end = new Date(req.query.end);
  end.setDate(end.getDate()+1);
  models.wallet.findOne({where:{id:req.params.wallet_id}})
  .then( wallet => wallet.getTransactions({
    where: {
      approveTime: {
        [Op.between]: [start, end]
      },
      type: {
        [Op.in]: ["입금"]
      }
    },
    include: [{ model: models.user}],
    limit: req.query.size*1,
    order: [['approveTime', 'DESC']]
  }))
  .then( result => res.json(incomeListSimple(result)))
  .catch( error => {
    console.log(error);
    res.status(500).send(error);
  })
});

/* 가족의 일/월단위 카테고리별 소비량 개인소비내역 */
router.get('/:wallet_id/expenses/_categorize', function(req, res, next) {
  let start = new Date(req.query.start);
  let end = new Date(req.query.end);
  models.wallet.findOne({where:{id:req.params.wallet_id}})
  .then( wallet => wallet.getTransactions({
    where: {
      approveTime: {
        [Op.between]: [start, end]
      },
      type: {
        [Op.in]: ["국내체크", "해외체크", "국내신용", "해외신용"]
      }
    },
    limit: req.query.size*1,
  }))
  .then( transactions => {
    let ids = [];
    for(transaction of transactions)
      ids.push(transaction.dataValues.id);
    return models.transaction.findAll({
      where: {id: ids},
      attributes: ['businessType', [models.sequelize.fn('SUM', models.sequelize.col('amount')), 'total']],
      group: ['businessType'],
      order: [[models.sequelize.literal('total'), 'DESC']]
    })
  })
  .then( result => res.json(categorizeList(result)))
  .catch( error => {
    console.log("get all wallets failed");
    res.status(500).send(error);
  })
});

/*
가족별 하루 지출비와 예산 내역 조회
*/
router.get('/:wallet_id/_budget', function(req, res, next) {
  let ids = [];
  let uinfo = [];
  models.wallet.findOne({where:{id:req.params.wallet_id}})
  .then( wallet => wallet.getUsers())
  .then( users => {
    for(user of users) {
      ids.push(user.dataValues.id);
      uinfo.push({
        name: user.dataValues.name,
        budget: user.dataValues.budget,
        gender: user.dataValues.gender
      });
    }
    var now = new Date();
    now.setHours(now.getHours()+9);
    var todayStart = new Date(now);
    todayStart.setHours(0,0,0,0);
    todayStart.setHours(todayStart.getHours()+9)
    return models.transaction.findAll({
      where: {
        userId: ids,
        approveTime: {
          [Op.between]: [todayStart, now]
        },
        type: {
          [Op.in]: ["국내체크", "해외체크", "국내신용", "해외신용"]
        }
      },
      attributes: ['userId','user.budget','user.gender',[models.sequelize.fn('SUM', models.sequelize.col('amount')), 'total']],
      include: [{ model: models.user}],
      group: ['userId'],
      order: [[models.sequelize.literal('total'), 'DESC']]
    });
  })
  .then( expenses => res.json(budgetList(expenses, ids, uinfo)))
  .catch( error => {
    console.log(error);
    res.status(500).send(error);
  })
});

/*
가족 월별 지출
*/
router.get('/:wallet_id/expenses/_bymonth', function(req, res, next) {
  models.sequelize.query(
  "SELECT date_format(approveTime, '%Y-%m') as ym, transaction.userId, user.name, SUM(transaction.amount) as sum "+
  "FROM transactions AS transaction "+
  "INNER JOIN walletTransactions AS walletTransaction ON transaction.id = walletTransaction.transactionId "+
  "AND walletTransaction.walletId = :walletId "+
  "LEFT JOIN users AS user ON user.id = transaction.userId "+
  "WHERE transaction.type IN ('국내체크', '해외체크', '국내신용', '해외신용') "+
  "GROUP BY ym, transaction.userId "+
  "ORDER BY transaction.userId ASC;",
  { replacements: { walletId: req.params.wallet_id }})
  .then( result => {
    res.json(bymonthList(result));
  })
  .catch( error => {
    console.log(error);
    res.status(500).send(error);
  })
});
module.exports = router;