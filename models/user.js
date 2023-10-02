const validator = require('validator');
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const Unauthorized = require('../errors/UnauthorizedError');

const userSchema = new mongoose.Schema({
  name: {
    type: String,
    minlength: 2,
    maxlength: 30,
    required: true,
  },
  password: {
    type: String,
    required: true,
    select: false,
  },
  email: {
    unique: true,
    type: String,
    required: true,
    validate: {
      validator: (email) => validator.isEmail(email),
      message: 'Неверный адрес почты',
    },
  },
});

userSchema.statics.findUserByCredentials = function _(email, password) {
  return this.findOne({ email }).select('+password')
    .then((user) => {
      if (!user) return Promise.reject(new Unauthorized('Неверный адрес почты или пароль'));
      return bcrypt.compare(password, user.password)
        .then((matched) => {
          if (!matched) return Promise.reject(new Unauthorized('Неверный адрес почты или пароль'));
          return user;
        });
    });
};

module.exports = mongoose.model('user', userSchema);
