'use strict';
const Sequelize = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  const walletUser = sequelize.define('walletUser', {
    isAdmin: {
        type: DataTypes.BOOLEAN,
        allowNull: false,
        defaultValue: false
    },
    lastSyncTime: {
      type: DataTypes.DATE,
      defaultValue: '1000-01-01 00:00:00',
      allowNull: false
    }
  }, {});
  walletUser.associate = function(models) {
    // associations can be defined here
  };
  return walletUser;
};