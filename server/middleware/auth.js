const { User } = require('../models/User');


let auth = (req, res, next) => {

    // 인증 처리를 하는 곳
    // 1. 클라이언트 쿠키에서 토큰을 가져옴
    let token = req.cookies.x_auth;

    // 2. 토큰을 복호화 한 후 유저를 찾음
    // 3. 유저가 있으면 인증 OK
    //    유저가 없으면 인증 NO!
    User.findByToken(token, (err, user) => {
        if(err) throw err;
        if(!user) return res.json({ isAuth: false, error: true})

        // token과 user 정보를 req에 넣어준 이유? index.js에서 이 정보를 이용하기 위해
        req.token = token;
        req.user = user;
        next();   // middleware에서 다음 단게(req, res)로 넘어갈 수 있게 꼭 적어줘야함, 아니면 middleware에 갇힘
    })
}

module.exports = { auth };