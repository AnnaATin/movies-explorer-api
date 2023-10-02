const allowedCors = [
  'https://api.movies.annatin.nomoredomainsicu.ru',
  'http://api.movies.annatin.nomoredomainsicu.ru',
  'https://movies.annatin.nomoredomainsicu.ru',
  'http://movies.annatin.nomoredomainsicu.ru',
  'http://localhost:3000',
  'http://localhost:4000',
  'localhost:3000',
];

const cors = (request, response, next) => {
  const { origin } = request.headers;
  const { method } = request;
  const DEFAULT_ALLOWED_METHODS = 'GET,HEAD,PUT,PATCH,POST,DELETE';
  const requestHeaders = request.headers['access-control-request-headers'];

  if (allowedCors.includes(origin)) {
    response.header('Access-Control-Allow-Origin', origin);
    response.header('Access-Control-Allow-Credentials', true);
  }

  if (method === 'OPTIONS') {
    response.header('Access-Control-Allow-Methods', DEFAULT_ALLOWED_METHODS);
    response.header('Access-Control-Allow-Headers', requestHeaders);
    return response.end();
  }

  return next();
};

module.exports = cors;
