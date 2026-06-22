class AppError extends Error {
  constructor(message, statusCode = 400, detalhes = null) {
    super(message);
    this.name = 'AppError';
    this.statusCode = statusCode;
    this.detalhes = detalhes;
  }
}

module.exports = AppError;
