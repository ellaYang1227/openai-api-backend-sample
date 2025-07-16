const successHandle = (res, response) => {
  res.status(200).json({
    status: true,
    response
  });
};

module.exports = successHandle;