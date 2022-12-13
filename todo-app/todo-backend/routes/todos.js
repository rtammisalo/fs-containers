const express = require('express')
const { Todo } = require('../mongo')
const redis = require('../redis')
const router = express.Router()

/* GET todos listing. */
router.get('/', async (_, res) => {
  const todos = await Todo.find({})
  res.send(todos)
})

/* POST todo to listing. */
router.post('/', async (req, res) => {
  const todo = await Todo.create({
    text: req.body.text,
    done: false,
  })

  // Update redis
  const added_count = Number(await redis.getAsync('added_todos'))
  await redis.setAsync('added_todos', added_count + 1)

  res.send(todo)
})

const singleRouter = express.Router()

const findByIdMiddleware = async (req, res, next) => {
  const { id } = req.params
  try {
    req.todo = await Todo.findById(id)
    if (!req.todo) return res.sendStatus(404)
    next()
  } catch (error) {
    return res.sendStatus(400)
  }
}

/* DELETE todo. */
singleRouter.delete('/', async (req, res) => {
  await req.todo.delete()
  res.sendStatus(200)
})

singleRouter.get('/', async (req, res) => {
  res.status(200).json(req.todo)
})

singleRouter.put('/', async (req, res) => {
  if ('text' in req.body) req.todo.text = req.body.text
  if ('done' in req.body) req.todo.done = req.body.done
  try {
    await req.todo.save()
    res.sendStatus(200)
  } catch (error) {
    res.sendStatus(400)
  }
})

router.use('/:id', findByIdMiddleware, singleRouter)

module.exports = router
