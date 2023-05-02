import type { ErrorRequestHandler } from 'express'

const errorHandler: ErrorRequestHandler = (err,req,res,next) => {
    let statusCode = 500;
    let data = {
        message: 'Internal server error',
        originalError: err.message
    }
    return res.status(statusCode).json(data);
}

export default errorHandler