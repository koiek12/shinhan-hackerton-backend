'use strict';

const axios = require('axios');
const getDomesticCreditCardUseage = function() {
    return axios.post('http://10.3.17.61:8081/v1/usecreditcard/searchusefordomestic',{
        dataHeader:{},
        dataBody:{
            nxtQyKey:'',
            inqterm:'2019050720190805',
            bctag:'0'
        }
    })
};
const getOverseasCreditCardUseage = function() {
    return axios.post('http://10.3.17.61:8081/v1/usecreditcard/searchuseforoverseas',{
        dataHeader:{},
        dataBody:{
            nxtQyKey:'',
            fromdate:'20190506',
            todate:'20190806',
            bctag:'0',
            fmlOCrdC:'0'
        }
    })
};
const getDomesticCheckCardUseage = function() {
    return axios.post('http://10.3.17.61:8081/v1/usedebitcard/searchusefordomestic',{
        dataHeader:{},
        dataBody:{
            nxtQyKey:'',
            inqterm:'2019050720190805',
            bctag:'0'
        }
    })
};
const getOverseasCheckCardUseage = function() {
    return axios.post('http://10.3.17.61:8081/v1/usedebitcard/searchuseforoverseas',{
        dataHeader:{},
        dataBody:{
            nxtQyKey:'',
            fromdate:'20190506',
            todate:'20190806',
            bctag:'0'
        }
    });
};
const getTrasactionHistory = function() {
    return axios.post('http://10.3.17.61:8080/v1/search/transaction/history',{
        dataHeader: {},
        dataBody: {
            serviceCode:'D1110',
            '정렬구분':'1',
            '조회시작일':'2019.09.20',
            '조회종료일': '2019.09.27',
            '계좌번호':'110-294-129071'
        }
    })
};
module.exports = {getDomesticCreditCardUseage, getOverseasCreditCardUseage, 
    getDomesticCheckCardUseage, getOverseasCheckCardUseage, getTrasactionHistory}