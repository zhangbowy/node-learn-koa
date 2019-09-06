const Sequelize = require('sequelize');

var sequelize = new Sequelize(
    'zhangbo',
    'root',
    'wy1314',
    {
        host: 'localhost',
        dialect: 'mysql',
        pool: {
            max: 5,
            min: 0,
            idle: 10000
        },

        // 仅 SQLite 适用
        // storage: 'path/to/database.sqlite'
});


module.exports = sequelize;
