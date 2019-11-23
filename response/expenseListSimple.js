module.exports = result => {
  let totalExpense = 0;
  let list = [];
  for(r of result) {
    totalExpense += r.dataValues.amount;
    let date = r.dataValues.approveTime.toISOString().split('T')[0];
    list.push({
      date: date,
      vendor: r.dataValues.merchantName,
      amount: r.dataValues.amount,
      userName: r.dataValues.user.dataValues.name
    });
  }
  return {
    totalExpense: totalExpense,
    list: list
  };
};