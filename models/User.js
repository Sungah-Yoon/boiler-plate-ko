const mongoose = require('mongoose');


const userSchema = mongoose.Schema({
    name:{
        type: String,
        maxlength: 50
    },
    email:{
        type: String,
        trim: true,          // trim: space를 없애주는 역할
        unique: 1
    },
    password:{
        type: String,
        minlength: 5
    },
    lastname:{
        type: String,
        maxlength: 50
    },
    role:{        // role을 주는 이유: 어떤 user가 관리자가 될 수도, 일반 user가 될 수도 있기 때문에
        type: Number,
        default: 0
    },
    image: String,   // 사용자의 image
    token: {         // 사용자 본인 확인 수단 -> 유효성 관리
        type: String
    },
    tokenExp:{       // 토큰의 유효기간
        type: Number
    }
})

const User = mongoose.model('User', userSchema) // schema는 model로 감싸주기


module.exports = {User} // User를 다른 곳에서도 쓸 수 있게 export해줌