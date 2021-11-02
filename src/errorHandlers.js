export const catchAllErrorHandler = (err, req, res) => {
  if (err) {
    if (!req.headersSent) {
      res
        .status(err.status || 500)
        .send({ message: err.message || "Something went wrong" });
    }
  }
  next();
};

export const notFound = (err, req, res, next) => {
  if (err && err.status === 400) {
    res
      .status(400)
      .send({ message: err.message || "Not found", errors: err.errors || [] });
  }
  next();
};

export const forbidden = (err, req, res, next) => {
  if (err && err.status === 400) {
    res.status(403).send({ message: err.message || "Forbidden" });
  }
};
