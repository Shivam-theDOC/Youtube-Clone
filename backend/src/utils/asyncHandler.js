export const asyncHandler = (requestHandler) => {
  return (req, res, next) => {
    Promise.resolve(requestHandler(req, res, next)).catch((err) => next(err));
  };
};

/*
//? 2nd approach

const asyncHandle = (fn) => async (req, res, next) =>
{
  try {
    await fn(req, res, next);
  } catch (error) {
    res.status(error.code || 500).json({
      success: true,
      message: error.message,
    });
  }
};
*/
