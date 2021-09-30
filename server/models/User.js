const mongoose = require('mongoose');
const bcrypt = require('bcrypt');
const saltRounds = 10  // 10자리인 salt
const jwt = require('jsonwebtoken');


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


// user 정보를 'save'하기 전(pre)에 function을 줘서 암호화 처리를 해 줌
// next라는 parameter를 이용해 암호화가 끝나면 next function으로 index.js/user.save를 실행하도록 보냄
userSchema.pre('save', function( next ){

    var user = this;   // const userSchema를 가리킴
    if(user.isModified('password')){
        // 비밀번호를 암호화 시킨다.
        // salt를 이용해서 비밀번호를 암호화 해야함 <- salt 먼저 생성해야(genSalt) <- saltRounds 설정(salt가 몇글자인지를 결정)
        // callback function
        bcrypt.genSalt(saltRounds, function(err, salt) {
            if(err) return next(err)

            // user.pw; 직접 입력된 비밀번호, hash; 암호화된 비밀번호
            bcrypt.hash(user.password, salt, function(err, hash) {
                if(err) return next(err)
                user.password = hash
                next() // 암호화 끝났으므로 save로 돌아감
            });
        });
    } else{
        next()
    }
})


userSchema.methods.comparePassword = function(plainPassword, cb) {

    //plainPassword 1234567  vs  암호화된 비밀번호
    bcrypt.compare(plainPassword, this.password, function(err, isMatch) {
        if(err) return cb(err);
        cb(null, isMatch)   // null; err가 없다. isMatch = true
    })
}

userSchema.methods.generateToken = function(cb) {

    var user = this;

    //jsonwebtoken을 이용해서 token을 생성하기

    var token = jwt.sign(user._id.toHexString(), 'secretToken')
    // 두개(user._id + 'secretToken')를 합쳐서 token을 만듦
    // token을 해석을 할 때, 'secretToken'을 넣으면 user._id가 나옴 -> 'secretToken'을 기억해둬야함
    
    user.token = token
    user.save(function(err, user) {
        if(err) return cb(err)
        cb(null, user)  // err는 null이고 user정보만 다시 전달해주면 됨
    })
}

userSchema.statics.findByToken = function(token, cb){
    var user = this;

    // 토큰을 decode 한다.
    jwt.verify(token, 'secretToken', function(err, decoded) {
        // 유저 아이디를 이용해서 유저를 찾은 다음에
        // 클라이언트에서 가져온 token과 DB에 보관된 토큰이 일치하는지 확인

        user.findOne({"_id": decoded, "token": token}, function(err, user){

            if(err) return cb(err);
            cb(null, user)
        })
    })
}


const User = mongoose.model('User', userSchema) // schema는 model로 감싸주기


module.exports = { User } // User를 다른 곳에서도 쓸 수 있게 export해줌