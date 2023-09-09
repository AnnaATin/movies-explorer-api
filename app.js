require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const { errors } = require('celebrate');
const cookieParser = require('cookie-parser');
const router = require('./routes/index');
const auth = require('./middlewares/auth');
const { createUserValidation, loginValidation } = require('./middlewares/validation');
const { createUser, login, signout } = require('./controllers/users');
const { requestLogger, errorLogger } = require('./middlewares/logger');

const app = express();
app.use(cors({ origin: 'https://movies.annatin.nomoredomainsicu.ru', credentials: true }));
const { PORT = 3000 } = process.env;

mongoose.connect('mongodb://127.0.0.1:27017/bitfilmsdb');

app.use(express.json());
app.use(cookieParser());
app.use(requestLogger);
app.get('/crash-test', () => {
  setTimeout(() => {
    throw new Error('Сервер сейчас упадёт');
  }, 0);
});
app.post('/signup', createUserValidation, createUser);
app.post('/signin', loginValidation, login);
app.post('/signout', signout);
app.use(auth);
app.use(router);
app.use(errorLogger);
app.use(errors());

app.use((e, req, res, next) => {
  const { status = 500, message } = e;
  res.status(status).send({ message: status === 500 ? 'На сервере произошла ошибка' : message });
  next();
});

app.listen(PORT, () => {
  console.log(`Приложение запущено на порту ${PORT}`);
});
