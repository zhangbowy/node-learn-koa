const router = require('koa-router')()

/**
 * 模板渲染
 */
router.get('/', async (ctx, next) => {
  await ctx.render('index', {
    title: 'Hello Koa 2!',
     name: '张博'
  })
})

/**
 * 字符串
 */
router.get('/string', async (ctx, next) => {
  ctx.body = 'koa2 string'
})

/**
 * json返回
 */
router.get('/json', async (ctx, next) => {
  ctx.body = {
    title: 'koa2 json'
  }
})

module.exports = router
