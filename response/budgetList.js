module.exports = (expenses,ids,uinfo) => {
    let result = [];
    let exists = [];
    for(expense of expenses) {
        exists.push(expense.dataValues.userId);
    }
    for(expense of expenses) {
        result.push({
            userId: expense.dataValues.userId,
            userName: expense.dataValues.user.dataValues.name,
            budget: expense.dataValues.user.dataValues.budget,
            totalExpense: expense.dataValues.total*1,
            gender: expense.dataValues.user.dataValues.gender
        });
    }
    
    for(var i=0;i<ids.length;i++) {
        id = ids[i];
        info = uinfo[i];
        if(!exists.includes(id)) {
            result.push({
                userId: id,
                userName: info.name,
                budget: info.budget,
                totalExpense: 0,
                gender: info.gender
            });
        }
    }
    return result;
};