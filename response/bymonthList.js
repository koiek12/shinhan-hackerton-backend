module.exports = bymon => {
    let result = {};
    for(data of bymon[0]) {
        result[data.name] = new Array(12);
        result[data.name].fill(0);
    }
    for(data of bymon[0]) {
        let idx = parseInt(data.ym.split('-')[1]) - 1;
        result[data.name][idx] = data.sum;
    }
    let resultList = [];
    for(key in result) {
        resultList.push({
            userId: key,
            list: result[key]
        });
    }
    return resultList;
};