module.exports = result => {
    let totalExpense = 0;
    let list = [];
    for(r of result) {
        totalExpense += r.dataValues.total*1;
        list.push({
            name: r.dataValues.businessType,
            value: r.dataValues.total
        });
    }
    return {
      totalExpense: totalExpense,
      list: list
    };
};