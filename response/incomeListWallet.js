module.exports = result => {
  let totalIncome = 0;
  let agg = [];
  let incomesPerDay = [];
  let prevDate = "@";
  let dayIncome = 0;
  for(r of result) {
    totalIncome += r.dataValues.amount;
    let date = r.dataValues.approveTime.toISOString().split('T')[0];
    let time = r.dataValues.approveTime.toISOString().split('T')[1];
    if(prevDate !== date) {
      let entry = {
        date: prevDate,
        amount: dayIncome,
        list: []
      };
      for(daydata of agg) 
        entry.list.push(daydata);
      if(entry.list.length) incomesPerDay.push(entry);
      agg = [];
      prevDate = date;
      dayIncome = 0;
    }
    agg.push({
      time: time,
      vendor: r.dataValues.merchantName,
      amount: r.dataValues.amount,
      userId: r.dataValues.userId,
      userName: r.dataValues.user.dataValues.name
    });
    dayIncome += r.dataValues.amount;
  }
  let entry = {
    date: prevDate,
    amount: dayIncome,
    list: []
  };
  for(daydata of agg) 
    entry.list.push(daydata);
  if(entry.list.length) incomesPerDay.push(entry);
  return {
    totalIncome: totalIncome,
    incomesPerDay: incomesPerDay
  };
};