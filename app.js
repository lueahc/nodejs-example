const express = require('express');
const app = express();
const port = 3000;
const HttpException = require('./HttpException');

//const authRouter = require('./routes/auth');
const userRouter = require('./routes/users');
const postRouter = require('./routes/posts');
const commentRouter = require('./routes/comments');
const categoryRouter = require('./routes/categories');

const sequelize = require('./config/database');
require('./models');
sequelize.sync({
  //force: true, // 모든 테이블 drop
  alter: true // 바뀐 부분에 대해서만 동기화
})

app.use(express.json())

//app.use('/auth', authRouter);
app.use('/users', userRouter);
app.use('/posts', postRouter);
app.use('/comments', commentRouter);
app.use('/categories', categoryRouter);

app.get('/', (req, res) => {
  res.send('Hello World!');
})

app.use((err, req, res, next) => {
  console.log(err);
  if (err instanceof HttpException) {
    return res.status(err.status).send(err);
  }
  return res.status(500).send({
    message: 'Internal Server Error'
  })
})

app.listen(port, async () => {
  console.log(`Example app listening on port ${port}`)
})