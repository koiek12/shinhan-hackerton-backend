module.exports = result => {
    let totalExpense = 0;
    let agg = [];
    let expensePerDay = [];
    let prevDate = "@";
    let dayAmount = 0;
    for(r of result) {
      totalExpense += r.dataValues.amount;
      let date = r.dataValues.approveTime.toISOString().split('T')[0];
      let time = r.dataValues.approveTime.toISOString().split('T')[1];
      if(prevDate !== date) {
        let entry = {
          date: prevDate,
          amount: dayAmount,
          list: []
        };
        for(daydata of agg) 
          entry.list.push(daydata);
        if(entry.list.length) expensePerDay.push(entry);
        agg = [];
        prevDate = date;
        dayAmount = 0;
      }
      agg.push({
        time: time,
        vendor: r.dataValues.merchantName,
        amount: r.dataValues.amount
      });
      dayAmount += r.dataValues.amount;
    }
    let entry = {
      date: prevDate,
      amount: dayAmount,
      list: []
    };
    for(daydata of agg) 
      entry.list.push(daydata);
    if(entry.list.length) expensePerDay.push(entry);
    return {
      totalExpense: totalExpense,
      expensePerDay: expensePerDay
    };
};