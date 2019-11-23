'use strict';
module.exports = (sequelize, DataTypes) => {
  const transaction = sequelize.define('transaction', {
    type: DataTypes.ENUM('국내체크', '해외체크', '국내신용', '해외신용', '입금', '출금'),
    amount: DataTypes.BIGINT(8),
    merchantName: DataTypes.STRING,
    approveTime: DataTypes.DATE,
    businessType: DataTypes.ENUM('쇼핑', '식비', '월급', '보험금', '공과금비', '용돈', '교육비', '저축', '경조사', '택시', '주차장', '기타')
  }, {});
  transaction.associate = function(models) {
    // associations can be defined here
    transaction.belongsTo(models.user, {foreignKey: 'userId'});
    transaction.belongsToMany(models.wallet, {through: 'walletTransaction'});
  };
  return transaction;
};