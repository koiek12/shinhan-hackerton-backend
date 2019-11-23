'use strict';
module.exports = (sequelize, DataTypes) => {
  const wallet = sequelize.define('wallet', {
    name: DataTypes.STRING
  }, {});
  wallet.associate = function(models) {
    // associations can be defined here
    wallet.belongsToMany(models.user, {through: 'walletUser'});
    wallet.belongsToMany(models.transaction, {through: 'walletTransaction'});
    wallet.hasMany(models.chat);
  };
  return wallet;
};