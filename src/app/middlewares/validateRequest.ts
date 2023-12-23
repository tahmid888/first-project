import { NextFunction, Request, Response } from 'express';
import { AnyZodObject } from 'zod';
import catchAsync from '../utils/catchAsync';

// validation using zod
const validateRequest = (schema: AnyZodObject) => {
  return catchAsync(async (req: Request, res: Response, next: NextFunction) => {
    //try {
    //validation check(zod)
    // if all ok then pass it to next()
    await schema.parseAsync({
      body: req.body,
      cookies: req.cookies,
    });
    next();
    // } catch (err) {
    //   next(err);
    // })
  });
};
export default validateRequest;
