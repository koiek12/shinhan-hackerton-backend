'use strict';
module.exports = (sequelize, DataTypes) => {
  const chat = sequelize.define('chat', {
    content: DataTypes.STRING,
    time: DataTypes.DATE
  }, {});
  chat.associate = function(models) {
    // associations can be defined here
    chat.belongsTo(models.user, {foreignKey: 'userId'});
    chat.belongsTo(models.wallet, {foreignKey: 'walletId'});
  };
  return chat;
};