const movieSchema = require('../models/movie');
const BadRequest = require('../errors/BadRequestError');
const Forbidden = require('../errors/ForbiddenError');
const NotFound = require('../errors/NotFoundError');

module.exports.getMovies = (req, res, next) => {
  const owner = req.user._id;
  movieSchema
    .find({ owner })
    .then((movies) => res.status(200)
      .send(movies))
    .catch(next);
};

module.exports.createMovie = (req, res, next) => {
  const {
    movieId,
    country,
    director,
    duration,
    year,
    description,
    image,
    trailerLink,
    thumbnail,
    nameRU,
    nameEN,
  } = req.body;
  const owner = req.user._id;
  movieSchema
    .create({
      movieId,
      country,
      director,
      duration,
      year,
      description,
      image,
      trailerLink,
      thumbnail,
      owner,
      nameRU,
      nameEN,
    })
    .then((movie) => res.status(201)
      .send(movie))
    .catch((e) => {
      if (e.name === 'ValidationError') {
        next(new BadRequest('При создании фильма переданы некорректные данные.'));
      } else {
        next(e);
      }
    });
};

module.exports.deleteMovie = (req, res, next) => {
  const { movieId } = req.params;

  movieSchema.findById(movieId)
    .then((movie) => {
      if (!movie) {
        throw new NotFound('Фильм с таким _id не найдена.');
      }
      if (req.user._id.toString() === movie.owner.toString()) {
        return movie.deleteOne();
      }
      return next(new Forbidden('Фильм невозможно удалить.'));
    })
    .then((movie) => res.send(movie))
    .catch(next);
};
