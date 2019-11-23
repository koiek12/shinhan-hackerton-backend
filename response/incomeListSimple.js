module.exports = result => {
  let totalIncome = 0;
  let list = [];
  for(r of result) {
    totalIncome += r.dataValues.amount;
    let date = r.dataValues.approveTime.toISOString().split('T')[0];
    list.push({
      date: date,
      vendor: r.dataValues.merchantName,
      amount: r.dataValues.amount,
      userName: r.dataValues.user.dataValues.name
    });
  }
  return {
    totalIncome: totalIncome,
    list: list
  };
};