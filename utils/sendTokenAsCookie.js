const jwt = require('jsonwebtoken');

module.exports = (userId, res) => {
    const token = jwt.sign({userId}, process.env.JWT_SECREAT, {
        expiresIn: '1y'
    });
    res.cookie('token', token, {
        maxAge: 365 * 24 * 60 * 60 * 1000,
        httpOnly:true,
        sameSite:'none',
        secure:true,
    })
}