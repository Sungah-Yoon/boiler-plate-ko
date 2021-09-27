const express = require('express')
const app = express()
const port = 5000
const bodyParser = require('body-parser');

const config = require('./config/key');   // 개발환경에 따라 dev.js를 불러올지, prod.js를 불러올지 정함

const { User } = require("./models/User");  // User 정보를 저장해야 하므로 User.js를 불러온다
 
// bodyParser에 옵션을 줌
// application/x-www-form-urlencoded 을 분석해서 가져올 수 있게 함
app.use(bodyParser.urlencoded({extended: true}));

// application/json 타입을 분석햇 가져올 수 있게 함
app.use(bodyParser.json());

const mongoose = require('mongoose')
mongoose.connect(config.mongoURI).then(() => console.log('MongoDB Connected...'))
.catch(err => console.log(err))


// get method 이용
app.get('/', (req, res) => res.send('Hello World! 안녕하세요:)'))


// post method 이용
app.post('/register', (req, res) => {

    // 회원 가입 할 때 필요한 정보들을 client에서 가져오면
    // 그것들을 데이터 베이스에 넣어준다.

        // body-parser를 이용해서 req.body로 client에 보내는 정보를 받아줌
        const user = new User(req.body) 

        user.save((err, userInfo) => {
            // err가 있을 때 전달을 할 때, json 형태로 전달, err 메세지도 함께 전달
            if(err) return res.json({success: false, err})
            // client에게 'status(200):성공했다'를 json형태로 전달
            return res.status(200).json({
                success: true
            })
        })

})




app.listen(port, () => console.log(`Example app listening on port ${port}!`))