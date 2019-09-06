const db = require('./db');
const Sequelize = require('sequelize');

let user = db.define('admin',{
    id:{
        type: Sequelize.INTEGER,
        autoIncrement: true,
        primaryKey:true,
        comment:"主键"
    },
    admin_user:{
        type:Sequelize.STRING
    },
    admin_psd:{
        type:Sequelize.STRING
    }
},
{
    timestamps: false,
    freezeTableName: true
}

)
module.exports = user;
