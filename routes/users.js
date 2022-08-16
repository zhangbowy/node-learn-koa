const router = require('koa-router')();
const { userD, User } = require('../sequelize/user')
const XLSX = require('xlsx');
const { createToken, verifyToken } = require('../service/jwt');

router.prefix('/user')

router.get('/', function (ctx, next) {
  ctx.body = 'this is a users response!'
})

function success(ctx, data = {}) {
  ctx.body = {
    message: '',
    data,
    code: 1
  }
}

function fail(ctx, message = '') {
  ctx.body = {
    message,
    data: null,
    code: 0
  }
}


/**
 * created by zhangbo on 2022/08/16
 * 鉴权中间件函数
 * @returns 
 */
function auth() {
  return (ctx, next) => {
    const token = ctx.request.header.token 
    console.log(token);
    const isAuth = verifyToken(token);
    if (isAuth) {
        return next()
    }
    return fail(ctx, '未登录')
  }
}

/**
 * ----------------------------------------------------------------------
 */


/**
 * 登陆
 */
 router.post('/login', async function (ctx, next) {
  console.log(ctx.request.body);
  let res = await User.findOne({
    where: {

    },
    limit: 10,
    offset: 0,
  });

  if (res) {
    const data =  {
      id: res.id,
      username: res.username,
      token: createToken({id: res.id})
    }
    success(ctx, data)
  }
})

/**
 * 登陆
 */
 router.get('/tokenTest',auth(), async function (ctx, next) {
    success(ctx, ctx.request.header)
})



/**
 * 列表
 */
router.get('/getList', async function (ctx, next) {
  let res = await User.findAndCountAll({
    limit: 10,
    offset: 0,
  });
  if (res) {
    success(ctx, res)
    // ctx.body = res;
  }
  else {
    ctx.body = "没有数据";
  }
})


/**
 * 用户详情
 */
router.get('/getUser', async function (ctx, next) {
  console.log(ctx.request.query);
  let id = ctx.request.query.id;
  const res1 = await User.findOne({
    where: {
      id: id
    }
  });
  success(ctx, res1)
})


/**
 * 删除
 */
router.get('/delUser', async function (ctx, next) {
  console.log(ctx.request.query);
  let id = ctx.request.query.id;
  let ids = id.split(',');

  const res1 = await userDb.destroy({
    where: {
      id: ids
    }
  })
  if (res1) {
    ctx.body = { code: 0, data: res1, msg: "请求成功！" };
  }
  else {
    ctx.body = "没有数据";
  }
})

/**
 * 增加
 */
router.get('/register', async function (ctx, next) {
  let reqData = ctx.request.query;
  let _params = {};
  _params.admin_user = reqData.admin_user;
  _params.admin_psd = reqData.admin_psd;
  const res1 = await userDb.create(_params)
  if (res1) {
    ctx.body = { code: 0, data: res1, msg: "请求成功！" };
  }
  else {
    ctx.body = "没有数据";
  }
})

/**
 * 更新
 */
router.get('/update', async function (ctx, next) {
  let reqData = ctx.request.query;
  let id = reqData.id;
  let row = await userDb.findAll({
    where: {
      id: id
    }
  });
  let updateList = {};
  for (let k in row[0].dataValues) {
    updateList[k] = reqData[k]
  }
  console.log(updateList, "updateList-");
  let result = await userDb.update(updateList, {
    where: {
      id: id
    }
  });
  if (result > 0) {
    ctx.body = { code: 1, data: result, msg: "请求成功！" };
  }
  else {
    ctx.body = { code: 0, data: result, errorMsg: "数据没有变化！" };
  }
})

/**
 * 导出excel
 */
router.get('/export', async function (ctx, next) {
  const data = await User.findAll({
    limit: 10,
    offset: 0,
    raw: true
  });
  const headerDis = []
  const header = [
    'nickname',
    'id'
  ]
  /**
   * json对象转sheet
   */
  const sheet = XLSX.utils.json_to_sheet([headerDis, ...data], {
    header,
    skipHeader: true,
  });
  /**
   * 表格样式设置
   */
  sheet['!cols'] = Array.from({ length: 17 }, (v, i) => ({ wch: 18, size: 14 }));
  /**
   * 新建工作簿
   */
  const wb = XLSX.utils.book_new();
  /**
   * 向工作簿增加一个工作表(sheet)
   * @param {wb} 工作簿对象
   * @param {sheet} 工作表对象
   * @param {name} 当前工作表名称
   */
  XLSX.utils.book_append_sheet(wb, sheet, `测试sheet`);
  /**
   * 工作簿生成文件
   */
  const excelBuffer =  XLSX.write(wb, {
    type: 'buffer',
  });
  ctx.set('Content-Disposition', `attachment; filename=${encodeURIComponent('测试')}.xlsx`);
  ctx.body = excelBuffer
})


module.exports = router;
