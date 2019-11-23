'use strict';
module.exports = (sequelize, DataTypes) => {
  const user = sequelize.define('user', {
    id: {
      type: DataTypes.STRING,
      primaryKey: true
    },
    password: DataTypes.STRING,
    name: DataTypes.STRING,
    email: DataTypes.STRING,
    gender: DataTypes.ENUM('male','female'),
    budget: DataTypes.BIGINT(8)
  }, {});
  user.associate = function(models) {
    // associations can be defined here
    user.belongsToMany(models.wallet, {through: 'walletUser'});
    user.hasMany(models.transaction);
    user.hasMany(models.chat);
  };
  return user;
};