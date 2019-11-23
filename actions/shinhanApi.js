'use strict';
/*
userId의 lastBankSyncTime 이후의 결제데이터를 가져온다.
*/
const models = require('../models');
const axios = require('axios');
const getDomesticCreditCardUseage = async function(userId) {
    let user = await models.user.findOne({where:{id:userId}})
    let fromDate = user.dataValues.lastBankSyncTime;
    return axios.post('http://10.3.17.61:8081/v1/usecreditcard/searchusefordomestic',{
        dataHeader:{},
        dataBody:{
            nxtQyKey:'',
            inqterm:fromDate,
            bctag:'0'
        }
    })
};
const getOverseasCreditCardUseage = async function(userId) {
    let user = await models.user.findOne({where:{id:userId}})
    let fromDate = user.dataValues.lastBankSyncTime;
    return axios.post('http://10.3.17.61:8081/v1/usecreditcard/searchuseforoverseas',{
        dataHeader:{},
        dataBody:{
            nxtQyKey:'',
            fromdate: fromDate,
            todate:'20190806',
            bctag:'0',
            fmlOCrdC:'0'
        }
    })
};
const getDomesticCheckCardUseage = async function(userId) {
    let user = await models.user.findOne({where:{id:userId}})
    let fromDate = user.dataValues.lastBankSyncTime;
    return axios.post('http://10.3.17.61:8081/v1/usedebitcard/searchusefordomestic',{
        dataHeader:{},
        dataBody:{
            nxtQyKey:'',
            inqterm: fromDate,
            bctag:'0'
        }
    })
};
const getOverseasCheckCardUseage = async function(userId) {
    let user = await models.user.findOne({where:{id:userId}})
    let fromDate = user.dataValues.lastBankSyncTime;
    return axios.post('http://10.3.17.61:8081/v1/usedebitcard/searchuseforoverseas',{
        dataHeader:{},
        dataBody:{
            nxtQyKey:'',
            fromdate: fromDate,
            todate:'20190806',
            bctag:'0'
        }
    });
};
const getTrasactionHistory = async function(userId) {
    let user = await models.user.findOne({where:{id:userId}})
    let fromDate = user.dataValues.lastBankSyncTime;
    let dt = fromDate.getFullYear() + '.' + ("0" + (fromDate.getMonth() + 1)).slice(-2) + '.' + ("0" + fromDate.getDate()).slice(-2)
    return axios.post('http://10.3.17.61:8080/v1/search/transaction/history',{
        dataHeader: {},
        dataBody: {
            serviceCode:'D1110',
            '정렬구분':'1',
            '조회시작일': dt,
            '조회종료일': '2019.09.27',
            '계좌번호':'110-294-129071'
        }
    })
};
module.exports = {getDomesticCreditCardUseage, getOverseasCreditCardUseage, 
    getDomesticCheckCardUseage, getOverseasCheckCardUseage, getTrasactionHistory}