const Sequelize = require('sequelize');

var sequelize = new Sequelize(
    'dc-prod',
    'root',
    '123456',
    {
      dialect: 'mysql',
      host: '127.0.0.1',
      port: 3306,
      pool: {
        max: 10000,
        min: 0,
        acquire: 80000,
        idle: 30000,
      },
      define: {
        timestamps: true, // 创建日期字段
        paranoid: true,
        underscored: true,
        createdAt: 'created_at',
        updatedAt: 'updated_at',
        deletedAt: 'deleted_at',
      },
      dialectOptions: {
        dateStrings: true,
        typeCast: true,
      },
      timezone: '+08:00',
      logging: false,
    },

        // 仅 SQLite 适用
        // storage: 'path/to/database.sqlite'
);


module.exports = sequelize;
