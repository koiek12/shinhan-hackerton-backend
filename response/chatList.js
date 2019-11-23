module.exports = result => {
    let chatList = [];
    for(chat of result) {
        chatList.push({
            time: chat.dataValues.time,
            content: chat.dataValues.content,
            userId: chat.dataValues.userId,
            userName: chat.dataValues.user.dataValues.name,
            gender: chat.dataValues.user.dataValues.gender,
            age: 18
        });
    }
    return chatList;
};