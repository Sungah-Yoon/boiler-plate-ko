const express = require('express')
const app = express()
const bodyParser = require('body-parser');
const cookieParser = require('cookie-parser');
const config = require('./config/key');   // 개발환경에 따라 dev.js를 불러올지, prod.js를 불러올지 정함
const { auth } = require('./middleware/auth');
const { User } = require("./models/User");  // User 정보를 저장해야 하므로 User.js를 불러온다
 
// bodyParser에 옵션을 줌
// application/x-www-form-urlencoded 을 분석해서 가져올 수 있게 함
app.use(bodyParser.urlencoded({extended: true}));

// application/json 타입을 분석햇 가져올 수 있게 함
app.use(bodyParser.json());
app.use(cookieParser());

const mongoose = require('mongoose')
mongoose.connect(config.mongoURI).then(() => console.log('MongoDB Connected...'))
.catch(err => console.log(err))


// get method 이용
app.get('/', (req, res) => res.send('Hello World! 안녕하세요:)'))


app.get('/api/hello', (req,res) => {
    res.send("안녕하세요 ~")
})


// register route
// post method 이용
app.post('/api/users/register', (req, res) => {

    // 회원 가입 할 때 필요한 정보들을 client에서 가져오면
    // 그것들을 데이터 베이스에 넣어준다.

        // body-parser를 이용해서 req.body로 client에 보내는 정보를 받아줌
        const user = new User(req.body)

        // user 정보를 save하기 전에 비밀번호를 암호화 시켜야 함 -> mongoose 기능 이용 -> User.js 참고
        user.save((err, userInfo) => {
            // err가 있을 때 전달을 할 때, json 형태로 전달, err 메세지도 함께 전달
            if(err) return res.json({success: false, err})

            // client에게 'status(200):성공했다'를 json형태로 전달
            return res.status(200).json({
                success: true
            })
        })
})


app.post('/api/users/login', (req,res) => {

    // 1. 요청된 이메일을 데이터베이스에서 있는지 찾는다.
    User.findOne({ email: req.body.email }, (err, user) => {
        if(!user){
            return res.json({
                loginSuccess: false,
                message: "제공된 이메일에 해당하는 유저가 없습니다."
            })
        }

        // 2. 요청된 이메일이 데이터베이스에 있다면 비밀번호가 맞는 비밀번호인지 확인

        user.comparePassword(req.body.password, (err, isMatch ) => {

            // method는 user.js에 정의되어 있음
            if(!isMatch)
                return res.json({ loginSuccess: false, message: "비밀번호가 틀렸습니다."})

            // 3. 비밀번호까지 맞다면 토큰을 생성하기
            user.generateToken((err, user) => {
                if(err) return res.status(400).send(err);

                // 토큰을 저장한다. 어디에 ? 쿠키 or 로컬스토리지
                // 쿠키에 하려면 cookie-parser를 깔아야함
                        res.cookie("x_auth", user.token)
                        .status(200)
                        .json({loginSuccess: true, userId: user._id})
            })
        })
    })
})

// role 1 어드민          role 2 특정 부서 어드민
// role 0 -> 일반유저     role 0이 아님 -> 관리자

// auth라는 middleware
app.get('/api/users/auth', auth, (req, res) => {

    // 여기까지 미들웨어를 통과해 왔다는 얘기는 Authentication이 True라는 말.
    res.status(200).json({
        _id: req.user._id,
        isAdmin: req.user.role === 0 ? false : true,
        isAuth: true,
        email: req.user.email,
        name: req.user.name,
        lastname: req.user.lastname,
        role: req.user.role,
        image: req.user.image
    })
})

// logout route
app.get('/api/users/logout', auth, (req, res) => {

    User.findOneAndUpdate({_id: req.user._id},
        { token: "" },
        (err, user) => {
            if(err) return res.json({success:false, err});
            return res.status(200).send({
                success: true
            })
        })
})




const port = 5000

app.listen(port, () => console.log(`Example app listening on port ${port}!`))