const router = require('koa-router')();
const { userD, User } = require('../sequelize/user')
const XLSX = require('xlsx');
const { createToken, verifyToken } = require('../service/jwt');

router.prefix('/user')

router.get('/', function (ctx, next) {
    ctx.body = 'this is a users response!'
})

/**
 * 成功的返回
 * @param {*} ctx
 * @param {*} data 数据
 */
function success(ctx, data = {}, message = '') {
    ctx.body = {
        message,
        data,
        code: 1
    }
}

/**
 * 失败的返回
 * @param {*} ctx
 * @param {*} data 数据
 */
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
 * ---------------------------------------------------------------------- 接口示例
 */

/**
 * 登陆
 */
router.post('/login', async function (ctx, next) {
    console.log(ctx.request.body);
    const body =  ctx.request.body
    const  param = {
        userName: body.userName,
        pwd: body.pwd
    }
    let res = await User.findOne({
        where: param,
    });
    if (res) {
        const data = {
            id: res.id,
            userName: res.userName,
            token: createToken({id: res.id})
        }
        success(ctx, data)
    } else {
        fail(ctx, '用户名或密码错误')
    }
})

/**
 * token测试
 */
router.get('/tokenTest', auth(), async function (ctx, next) {
    success(ctx, ctx.request.header)
})


/**
 * 列表
 */
router.get('/getList', async function (ctx, next) {
    let res = await User.findAndCountAll({
        limit: 10,
        offset: 0,
        logging: true
    });
    if (res) {
        success(ctx, res)
    } else {
        ctx.body = "没有数据";
    }
})


/**
 * 用户详情
 */
router.get('/getUser', async function (ctx, next) {
    console.log(ctx.request.query);
    const id = ctx.request.query.id;
    const res = await User.findOne({
        where: {
            id: id
        }
    });
    if (!res) {
        return fail(ctx, '该用户不存在')
    }
    success(ctx, res)
})


/**
 * 删除
 */
router.post('/del', async function (ctx, next) {
    console.log(ctx.request.body);
    let id = ctx.request.body.id;
    let ids = id.split(',');

    const res = await User.destroy({
        where: {
            id: ids
        }
    })
    if (res) {
        success(ctx, res, '删除成功')
    } else {
        ctx.body = "没有数据";
    }
})

/**
 * 增加
 */
router.post('/register', async function (ctx, next) {
    let reqData = ctx.request.body;
    const res = await User.create(reqData)
    if (res) {
        ctx.body = {code: 0, data: res, msg: "请求成功！"};
    } else {
        ctx.body = "没有数据";
    }
})

/**
 * 更新
 */
router.post('/update', async function (ctx, next) {
    let reqData = ctx.request.body;
    let id = reqData.id;
    let row = await User.findone({
        where: {
            id: id
        }
    });
    if (!row) {
        return fail(ctx, '该用户不存在')
    }
    delete reqData.id
    let result = await User.update(reqData, {
        where: {
            id: id
        }
    });
    if (result) {
        success(ctx, result, '更新成功')
        // ctx.body = { code: 1, data: result, msg: "请求成功！" };
    } else {
        fail(ctx, '更新失败')
        // ctx.body = { code: 0, data: result, errorMsg: "数据没有变化！" };
    }
})

/**
 * 导出excel
 */
router.get('/export', async function (ctx, next) {
    // 查出数据
    const data = await User.findAll({
        attributes: [
            'id',
            'userName',
            'openId',
            'email',
            'description',
            'status'
        ],
        limit: 10,
        offset: 0,
        raw: true
    });
    // 表头中文
    const headerDis = {id: '用户id', userName: '用户名', openId: 'openId', email: '邮箱', description: '描述',status: '状态'}
    // 表头字段
    const header = [
        'id',
        'userName',
        'openId',
        'email',
        'description',
        'status',
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
    sheet['!cols'] = Array.from({length: 17}, (v, i) => ({wch: 18, size: 14}));
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
    XLSX.utils.book_append_sheet(wb, sheet, `测试sheet2`);
    /**
     * 工作簿生成文件
     */
    const excelBuffer = XLSX.write(wb, {
        type: 'buffer',
    });
    /**
     * 设置下载头和文件名
     */
    ctx.set('Content-Disposition', `attachment; filename=${encodeURIComponent('测试')}.xlsx`);
    ctx.body = excelBuffer
})


module.exports = router;
