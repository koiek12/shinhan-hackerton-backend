const axios = require('axios');
module.export = {
    getDomesticCreditCardUseage: (start, end) => {
        axios.post('http://10.3.17.61:8081/v1/usecreditcard/searchusefordomestic',{
            dataHeader:{},
            dataBody:{
                nxtQyKey:'',
                inqterm:'2019050720190805',
                bctag:'0',
                fmlOCrdC:'0'
            }
        })
        .then( result => console.log(result))
    },
    getOverseasCreditCardUseage: (start, end) => {
        axios.post('http://10.3.17.61:8081/v1/usecreditcard/searchuseforoverseas',{
            dataHeader:{},
            dataBody:{
                nxtQyKey:'',
                fromdate:'20190506',
                todate:'20190806',
                bctag:'0',
                fmlOCrdC:'0'
            }
        })
        .then( result => console.log(result))
    },
    getDomesticCheckCardUseage: (start, end) => {
        axios.post('http://10.3.17.61:8081/v1/usedebitcard/searchusefordomestic',{
            dataHeader:{},
            dataBody:{
                nxtQyKey:'',
                inqterm:'2019050720190805',
                bctag:'0',
                fmlOCrdC:'0'
            }
        })
        .then( result => console.log(result))
    },
    getOverseasCheckCardUseage: (start, end) => {
        axios.post('http://10.3.17.61:8081/v1/usedebitcard/searchuseforoverseas',{
            dataHeader:{},
            dataBody:{
                nxtQyKey:'',
                fromdate:'20190506',
                todate:'20190806',
                bctag:'0',
                fmlOCrdC:'0'
            }
        })
        .then( result => console.log(result))
    },
    getTrasactionHistory: (start, end) => {
        axios.post('http://10.3.17.61:8080/v1/search/transaction/history',{
            dataHeader: {},
            dataBody: {
                serviceCode:'D1110',
                '정렬구분':'1',
                '조회시작일':'2019.09.20',
                '조회종료일': '2019.09.27',
                '계좌번호':'110-294-129071'
            }
        })
        .then( result => console.log(result))
    }
}