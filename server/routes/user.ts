import * as express from 'express';
import * as jwt from 'jsonwebtoken';
import User from '../models/user';

const router = express.Router();

// * GET /users/mypage

// * POST /users/checkemail, 이메일 중복 체크
// client 측에서 email 확인 버튼을 눌렀을 때, server 측에서 유효성 검사 후 send!
router.post('/checkemail', (req, res) => {
  const { email } = req.body;

  User.findOne({
    where: { email }
  })
  // TODO: any 말고 사용하는 방법? ts 찾아보기!
  .then((data: any) => {
    data ? 
    res.status(409).json('존재하는 이메일 입니다.') : 
    res.status(200).json('사용가능한 이메일 입니다.');
  });
})

// * POST /users/checknickname, 닉네임 중복 체크
router.post('/checknickname', (req, res) => {
  const { nickname } = req.body;

  User.findOne({
    where: { nickname }
  })
  .then((data: any) => {
    data? 
    res.status(409).json('존재하는 닉네임 입니다.') :
    res.status(200).json('사용가능한 닉네임 입니다.');
    // client작업: true 면 유저네임 수정하기
  });
})

// * POST /users/signup
router.post('/signup', (req, res) => {
  // user 가 회원가입 했을 때, 회원정보를 db에 저장하도록 구현.
  // 회원가입시 입장권은 불필요~
  const { email, nickname, password } = req.body;

  User.findOne({
    where: { email: email }
  })
  .then((data: any) => {
    data ? res.status(409).send('Already exist user'):
    User.create({
      email: email,
      nickname: nickname,
      password: password,
    })
    .then((data: any) => {
      // console.log('data: ', data);
      // 회원가입시 client 측에서 필요한 데이터가 있는지 상의하기
      res.status(200).json(data); 
    })
  })
})

// * POST /users/login
router.post('/login', (req, res, next) => {
  // NOTE: 자주 발생하는 에러: 타입 추론이 any 로 되어있는 경우, 직접 적어주면 된다.
  const { email, password } = req.body;
  User.findOne({
    where: {
      email: email,
      password: password,
    },
  })
  .then((data: any) => {
    console.log('data: ', data);
    if (!data) {
      return res.status(404).send('unvalid user');
    } else {
      let token = jwt.sign({ data: email, useId: data.id}, 'secret_key');  // *
      res.status(200).json({ 
        userData: {
          id: data.id,
          nickname: data.nickname,
          // username: data.username, 
          // useremail: email,
        },
        token: token, 
      });
    }
  })
  .catch((err: any) => {
    res.status(404).send(err);
  })
});

// * POST /users/sociallogin/google
// * POST /users/sociallogin/kakao
// * POST /users/sociallogin/facebook

export = router;
