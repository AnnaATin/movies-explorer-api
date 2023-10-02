const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const userSchema = require('../models/user');
const BadRequest = require('../errors/BadRequestError');
const Conflict = require('../errors/ConflictError');
const NotFound = require('../errors/NotFoundError');

const SECRET = process.env.NODE_ENV === 'production' ? process.env.JWT_SECRET : 'dev';

module.exports.getUser = (req, res, next) => {
  userSchema.findById(req.user._id)
    .then((user) => {
      if (!user) {
        throw new NotFound('Пользователь по такому _id не найден.');
      }
      res.status(200)
        .send(user);
    })
    .catch((err) => {
      if (err.name === 'CastError') {
        next(BadRequest('Переданы некорректные данные.'));
      } else if (err.message === 'NotFound') {
        next(new NotFound('Пользователь по такому _id не найден.'));
      } else {
        next(err);
      }
    });
};

module.exports.updateUser = (req, res, next) => {
  const { name, email } = req.body;
  userSchema
    .findByIdAndUpdate(
      req.user._id,
      {
        name,
        email,
      },
      {
        new: true,
        runValidators: true,
      },
    )
    .then((user) => {
      if (!user) {
        throw new NotFound('Пользователь по такому _id не найден.');
      }
      res.status(200)
        .send(user);
    })
    .catch((e) => {
      if (e.code === 11000) {
        next(new Conflict('Такой пользователь уже есть.'));
      } else if (e.name === 'ValidationError' || e.name === 'CastError') {
        next(BadRequest('Переданы некорректные данные.'));
      } else {
        next(e);
      }
    });
};

module.exports.createUser = (req, res, next) => {
  const { name, email, password } = req.body;
  bcrypt.hash(password, 10)
    .then((hash) => {
      userSchema
        .create({
          name,
          email,
          password: hash,
        })
        .then(() => res.status(201)
          .send(
            {
              data: {
                name,
                email,
              },
            },
          ))
        .catch((e) => {
          if (e.code === 11000) {
            return next(new Conflict('Такой пользователь уже есть.'));
          }
          if (e.name === 'ValidationError') {
            return next(new BadRequest('Переданы некорректные данные.'));
          }
          return next(e);
        });
    })
    .catch(next);
};
/*
module.exports.login = (req, res, next) => {
  const { email, password } = req.body;
  userSchema.findUserByCredentials(email, password)
    .then((user) => {
      const token = jwt.sign(
        { _id: user._id },
        NODE_ENV === 'production' ? JWT_SECRET : 'my-secret-key',
        { expiresIn: '7d' },
      );
      res
        .cookie('jwt', token, {
          maxAge: (7 * 24 * 60 * 60),
          httpOnly: true,
          samesite: true,
        })
        .send({ token })
        .end();
    })
    .catch(next);
};
*/

module.exports.login = (req, res, next) => {
  const { email, password } = req.body;

  userSchema.findUserByCredentials(email, password)
    .then((user) => {
      const token = jwt.sign({ _id: user._id }, SECRET, { expiresIn: '7d' });
      res.send({ token });
    })
    .catch((err) => next(err));
};
