const router = require('express').Router();
const moviesRouter = require('./movies');
const usersRouter = require('./users');
const NotFoundError = require('../errors/NotFoundError');

router.use('/users', usersRouter);
router.use('/movies', moviesRouter);
router.use((req, res, next) => {
  next(new NotFoundError('Страницы не существует'));
});

module.exports = router;
