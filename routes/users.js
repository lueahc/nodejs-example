const express = require('express');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcrypt');
const router = express.Router();
const { body, validationResult } = require('express-validator');
require('dotenv').config();
const { User } = require('../models');
const authenticateToken = require('../middlewares/authenticateToken');
const HttpException = require('../HttpException');
const asyncHandler = require('../utils/asyncHandler');



// 회원가입
router.post('/sign-up',
    body('email')
        .isEmail()
        .withMessage('이메일 형태')
        .bail(),
    body('password')
        .isLength({ min: 8, max: 15 })
        .withMessage('비밀번호 8자 이상 15자 이하'),
    asyncHandler(async (req, res) => {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            console.log(errors);
            throw new HttpException(400, 'Validation Error');
        }

        const { email, password } = req.body;

        let blank_pattern = /[\s]/g;
        if (blank_pattern.test(email) == true || blank_pattern.test(password) == true) {
            throw new HttpException(400, '이메일과 비밀번호에 공백이 포함될 수 없습니다.');
        }

        const user = await User.findOne({ where: { email } });
        if (user) throw new HttpException(409, '중복된 이메일입니다.');

        const saltRounds = 10;
        const hashedPassword = await bcrypt.hash(password, saltRounds);

        const savedUser = await User.create({
            email,
            password: hashedPassword
        });

        return res.status(201).send(savedUser.dataValues.email);
    }))



// 로그인
router.post('/sign-in', asyncHandler(async (req, res) => {
    const { email, password } = req.body;

    const user = await User.findOne({ where: { email } });
    if (!user) throw new HttpException(401, '존재하지 않는 이메일입니다.');

    const isPasswordValid = await bcrypt.compare(password, user.dataValues.password);
    if (!isPasswordValid) throw new HttpException(401, '비밀번호가 일치하지 않습니다.');

    const accessToken = jwt.sign({ id: user.dataValues.id }, process.env.JWT_SECRET_KEY, {
        //expiresIn: "10s"
    });

    return res.status(200).send({ accessToken });
}))



// 내 정보 조회
router.get('/', authenticateToken, asyncHandler(async (req, res) => {
    const id = req.user.id;

    const user = await User.findOne({ where: { id } });

    return res.status(200).send({
        email: user.dataValues.email,
        createdAt: user.dataValues.createdAt
    });
}))

module.exports = router;