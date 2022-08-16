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
     nickname: {
       type: Sequelize.STRING,
       comment: '用户昵称',
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
     rate: {
       type: Sequelize.DECIMAL(16, 2),
       comment: '发币比例',
     },
     pwd: {
       type: Sequelize.STRING,
       set(val) {
         const salt = bcrypt.genSaltSync(12);
         const pwd = bcrypt.hashSync(val, salt);
         this.setDataValue('pwd', pwd);
       },
       comment: '登录密码',
     },
     paypassword: {
       type: Sequelize.STRING,
       set(val) {
         const salt = bcrypt.genSaltSync(10);
         const pwd = bcrypt.hashSync(val, salt);
         this.setDataValue('password', pwd);
       },
       comment: '支付密码',
     },
     openid: {
       type: Sequelize.STRING,
       comment: '微信用户id',
     }, // 微信用户id
     status: {
       // 状态
       type: Sequelize.SMALLINT,
       defaultValue: 1, // 1待审核 2审核通过 3审核失败 4停用
       comment: '用户状态',
     },
     interest: {
       type: Sequelize.DECIMAL(30, 18).UNSIGNED,
       defaultValue: 0,
       allowNull: false,
       comment: '公司质押利息',
     },
    //  companyGas: {
    //    type: Sequelize.DECIMAL(30, 18),
    //    allowNull: false,
    //    defaultValue: 0,
    //    comment: '公司支付GAS费',
    //  },
     companyGasInterest: {
       type: Sequelize.DECIMAL(30, 18).UNSIGNED,
       allowNull: false,
       defaultValue: 0,
       comment: '公司支付GAS费利息',
     },
     sector: {
       type: Sequelize.DECIMAL(16, 8),
       defaultValue: 0,
       comment: '当前存力/GB',
     },
     pledgeType: {
       type: Sequelize.INTEGER,
       defaultValue: 2,
       comment: '1: 公司抵押 2 个人抵押',
     }, // 用户唯一编码
     username: {
       type: Sequelize.STRING,
       comment: '用户名',
     },
     description: {
       type: Sequelize.STRING,
       comment: '描述',
     }, // 描述
     card: {
       type: Sequelize.STRING,
       comment: '身份证号',
     }, // 证件号码
     profit: {
       type: Sequelize.DECIMAL(30, 18),
       defaultValue: 0,
       comment: '冻结收益',
     },
     borrow: {
       type: Sequelize.DECIMAL(10, 4).UNSIGNED,
       allowNull: false,
       defaultValue: 0,
       comment: '借贷金额',
     },
     borrowInterest: {
       type: Sequelize.DECIMAL(10, 4).UNSIGNED,
       allowNull: false,
       defaultValue: 0,
       comment: '借贷金额利息',
     },
     totalProfit: {
       type: Sequelize.DECIMAL(30, 18),
       defaultValue: 0,
       comment: '总收益',
     },
     withdrawal: {
       // 自动提现标识
       type: Sequelize.DECIMAL(30, 18),
       defaultValue: 0, // 1不自动提现 2自动提现
       comment: '提现金额',
     },
     usdtWithdrawal: {
       // 自动提现标识
       type: Sequelize.DECIMAL(12, 4).UNSIGNED,
       allowNull: false,
       defaultValue: 0, // 1不自动提现 2自动提现
       comment: 'USDT金额',
     },
     wallet: {
       type: Sequelize.STRING,
       unique: true,
       comment: 'FIL 充值钱包地址',
     },
     usdtWallet: {
       type: Sequelize.STRING,
       unique: true,
       comment: 'USDT 充值钱包地址',
     },
     freezePledge: {
       type: Sequelize.DECIMAL(30, 18),
       defaultValue: 0,
       comment: 'm12系列产品冻结金额',
     },
     agentId: {
       type: Sequelize.INTEGER,
       allowNull: false,
       comment: '用户所属经销商',
     },
     source: {
       type: Sequelize.INTEGER.UNSIGNED,
       allowNull: false,
       defaultValue: 1,
       comment: '1. 国内 2.国外用户',
     },
     isDistributor: {
       type: Sequelize.INTEGER,
       comment: '1:普通用户，2:分销商',
     },
     distributor: {
       type: Sequelize.INTEGER,
       comment: '用户所属分销商',
     },
     miner: {
       type: Sequelize.INTEGER,
       allowNull: false,
       defaultValue: 0,
       comment: '0. 非独立节点用户 1.独立节点用户 2.独立接口 + 订单用户',
     },
     platform: {
       type: Sequelize.INTEGER,
       allowNull: false,
       defaultValue: 1,
       comment: '平台：1.DC 2.上轩',
     },
     country: {
       type: Sequelize.STRING,
       comment: '国家',
     },
     countryCode: {
       type: Sequelize.STRING,
       comment: '国家码',
     },
     migrateArrears: {
       type: Sequelize.DECIMAL(30, 18),
       defaultValue: 0,
       comment: '迁移费欠款，单位FIL',
     },
     migrateArrearsSupplement: {
       type: Sequelize.DECIMAL(30, 18),
       defaultValue: 0,
       comment: '补缴迁移费欠款，单位FIL',
     },
   },
   {
     sequelize,
     tableName: 'user',
   },
 );

 
 module.exports = {
   User,
 };
 