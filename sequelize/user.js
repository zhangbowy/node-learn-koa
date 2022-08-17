const db = require('./db');

/**
 * 用户表
 */
 const dayjs = require('dayjs');
 const bcrypt = require('bcryptjs');
 const { Sequelize, Model } = require('sequelize');

 const sequelize = require('./db');

 const { Op } = Sequelize;

 // 定义模型
 class User extends Model {
   static async findetail(uid) {
     return this.findOne({
       where: { id: uid },
     });
   }

   static async getDetail(param, option) {
     const res = await this.findOne({
       where: param,
       ...option,
     });
     return res;
   }


   static async findUserByName(username) {
     const user = await User.findOne({
       where: {
         username,
       },
     });
     return user;
   }

   /**
    * @description:
    */
   static async findPage(req) {
     const where = {};

     if (req.tel) {
       where.tel = req.tel;
     }

     if (req.card) {
       where.card = {
         [Op.like]: `%${req.card}%`,
       };
     }

     if (req.username) {
       where.username = {
         [Op.like]: `%${req.username}%`,
       };
     }

     if (req.agentId) {
       where.agentId = req.agentId;
     }

     if (req.source) {
       where.source = req.source;
     }

     if (req.email) {
       where.email = {
         [Op.like]: `%${req.email}%`,
       };
     }

     if (req.status) {
       where.status = req.status;
     }

     if (req.platform) {
       where.platform = req.platform;
     }

     if (typeof req.distributor === 'number') {
       where.distributor = req.distributor;
     }

     if (req.created_at && Array.isArray(req.created_at) && req.created_at.length === 2) {
       let [startAt, endAt] = req.created_at;
       startAt = dayjs(startAt).startOf('day').format('YYYY-MM-DD HH:mm:ss');
       endAt = dayjs(endAt).endOf('day').format('YYYY-MM-DD HH:mm:ss');
       where.created_at = {
         [Op.between]: [startAt, endAt],
       };
     }

     const findOption = {
       attributes: [
         'id',
         'nickname',
         'tel',
         'email',
         'pledgeType',
         'username',
         'status',
         'card',
         'agentId',
         'miner',
         'country',
         'countryCode',
         'created_at',
         [
           Sequelize.literal(
             'IF(`User`.distributor = 0, \'未处理\', (SELECT nickname FROM `user` u WHERE u.id = `User`.distributor))',
           ),
           'distributor',
         ],
       ],
       where,
       order: [['created_at', 'DESC']],
       include: [
         {
           association: agentAssociation,
           attributes: ['nickname', 'company'],
         },
       ],
     };

     if (req.limit && req.page) {
       findOption.limit = req.limit;
       findOption.offset = (req.page - 1) * req.limit;
     }

     return User.findAndCountAll(findOption);
   }

   static async getSUMSector() {
     const param = {};
     return User.findOne({
       attributes: [[Sequelize.fn('SUM', Sequelize.col('sector')), 'sector']],
       where: param,
     });
   }

   /**
    *统计总人数
    * @param status
    * @returns {Promise<any>}
    */
   static async findCount(param, today) {
     if (today) {
       param[Op.and] = [
         sequelize.where(
           sequelize.fn('TO_DAYS', sequelize.col('created_at')),
           '=',
           sequelize.fn('TO_DAYS', new Date()),
         ),
       ];
     }
     return User.count({
       where: param,
     });
   }

   /**
    * 通过id获取用户信息
    * @param {*} id 用户id
    * @param {*} attributes 字段属性
    * @returns {Promise<User>}
    */
   static async findUserById({ uid, attributes }) {
     const result = await this.findByPk(uid, {
       attributes,
       raw: true,
     });
     return result;
   }

   /**
    * 更新用户
    * @param {Object} params
    * @param {Object} where
    * @param {Any} transaction
    * @returns
    */
   static async modify(params, where, transaction) {
     const result = await this.update(params, {
       where,
       transaction,
     });
     return result;
   }

   /**
    * id获取用户信息
    * @param {number} id
    */
   static getUserById(id = 0) {
     return User.findOne({
       where: {
         id,
       },
       attributes: [
         'id',
         'withdrawal',
         'usdtWithdrawal',
         'agentId',
         'pledgeType',
         'nickname',
         'tel',
         'source',
       ],
       include: [
         {
           association: agentAssociation,
           attributes: ['id', 'extendCard'],
         },
       ],
       raw: true,
       nest: true,
     });
   }
 }

 User.init(
   {
     id: {
       type: Sequelize.INTEGER,
       primaryKey: true, // 主键
       autoIncrement: true, // 主键自增长
     },
     email: {
       type: Sequelize.STRING,
       comment: '用户邮箱',
     },
     tel: {
       type: Sequelize.STRING,
       unique: true,
       comment: '用户手机号',
     },
     pwd: {
       type: Sequelize.STRING,
       set(val) {
         // const salt = bcrypt.genSaltSync(12);
         // const pwd = bcrypt.hashSync(val, salt);
         // this.setDataValue('pwd', pwd);
       },
       comment: '登录密码',
     },
     openId: {
       type: Sequelize.STRING,
       comment: '微信用户id',
     }, // 微信用户id
     status: {
       // 状态
       type: Sequelize.SMALLINT,
       defaultValue: 1, // 1待审核 2审核通过 3审核失败 4停用
       comment: '用户状态',
     },
     userName: {
       type: Sequelize.STRING,
       comment: '用户名',
     },
     description: {
       type: Sequelize.STRING,
       comment: '描述',
     }, // 描述
   },
   {
     sequelize,
     tableName: 'user_copy',
   },
 );


 module.exports = {
   User,
 };
