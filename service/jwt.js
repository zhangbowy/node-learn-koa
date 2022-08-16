const jwt = require('jsonwebtoken'); // 令牌

const _secretKey = 'zhangbo'
const _expiresIn = 60 * 60 * 24 * 30// 30d
module.exports = {
    verifyToken(token) {
        try {
          jwt.verify(token, _secretKey); // 校验令牌
          return true;
        } catch (error) {
          return false;
        }
      },

    createToken(data) {
        const token = jwt.sign(
            data,
            _secretKey,
            {
              expiresIn: _expiresIn,
            },
          );
        return token
    }
}  
  
  
