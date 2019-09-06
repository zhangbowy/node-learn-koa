const router = require('koa-router')();
const  userDb = require('../sequelize/user')

router.prefix('/users')

router.get('/', function (ctx, next) {
  ctx.body = 'this is a users response!'
})

router.get('/getList', async function (ctx, next) {

  let res = await userDb.findAll();
  if(res)
  {
    ctx.body = res;
  }
  else
  {
    ctx.body = "没有数据";
  }
})
router.get('/getUser', async function (ctx, next) {
  console.log(ctx.request.query);
  let id = ctx.request.query.id;
   const res1 = await userDb.findAll({
    where:{
      id:id
    }
  });
  if(res1.length>0)
  {
    ctx.body = {code:0,data:res1,msg:"请求成功！"};
  }
  else
  {
    ctx.body = "没有数据";
  }
})
router.get('/delUser', async function (ctx, next) {
  console.log(ctx.request.query);
  let id = ctx.request.query.id;
  let ids = id.split(',');

  const  res1 = await userDb.destroy({
    where:{
      id:ids
    }
  })
  if(res1)
  {
    ctx.body = {code:0,data:res1,msg:"请求成功！"};
  }
  else
  {
    ctx.body = "没有数据";
  }
})
router.get('/register', async function (ctx, next) {
  let reqData = ctx.request.query;
  let _params = {};
      _params.admin_user = reqData.admin_user;
      _params.admin_psd = reqData.admin_psd;
  const  res1 = await userDb.create(_params)
  if(res1)
  {
    ctx.body = {code:0,data:res1,msg:"请求成功！"};
  }
  else
  {
    ctx.body = "没有数据";
  }
})
router.get('/update', async function (ctx, next) {
  let reqData = ctx.request.query;
  let id  = reqData.id;
  let row = await userDb.findAll({
       where:{
         id:id
       }
   });
  let updateList = {};
  for(let k in row[0].dataValues)
  {
    updateList[k] = reqData[k]
  }
  console.log(updateList,"updateList-");
  let result = await userDb.update(updateList,{
      where:{
        id:id
      }
  });
  if(result>0)
  {
    ctx.body = {code:1,data:result,msg:"请求成功！"};
  }
  else
  {
    ctx.body = {code:0,data:result,errorMsg:"数据没有变化！"};
  }
})
module.exports = router;
