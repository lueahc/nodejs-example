const jwt = require('jsonwebtoken');
require('dotenv').config();
const HttpException = require('../HttpException');

const authenticateToken = (req, res, next) => {
    const authHeader = req.headers.authorization;
    const token = authHeader && authHeader.split(' ')[1];

    if (!token) {
        //return res.status(401).send('Header에 JWT 토큰을 넣어야 합니다.');
        throw new HttpException(401, 'Header에 JWT 토큰을 넣어야 합니다.');
    }

    jwt.verify(token, process.env.JWT_SECRET_KEY, (err, user) => {
        if (err) {
            const { name } = err;
            if (name === 'JsonWebTokenError') {
                throw new HttpException(401, '잘못된 토큰입니다.');
            }
            if (name === 'TokenExpiredError') {
                throw new HttpException(401, '유효기간이 만료된 토큰입니다.');
            }

            return res.status(401).send(err);
        }

        req.user = user;
        next();
    });
}

module.exports = authenticateToken;