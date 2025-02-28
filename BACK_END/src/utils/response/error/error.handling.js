

export const asyncHandler = (fn) => {
    return (req, res, next) => {
      fn(req, res, next).catch(error => {
        error.cause = 500;
                return next(error);
        } )
    }
}
export const globalErrorHandling = (error, req, res, next) => { 
    if (process.env.MOOD == "DEV") {
      return res
        .status(error.cause || 400)
        .json({ message: error.message, error, stack: error.stack });
    }
    //process.env.MOOD == "PROD"
    return res.status(error.cause || 400).json({ message: error.message });
};