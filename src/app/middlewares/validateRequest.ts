import { NextFunction, Request, Response } from 'express';
import { AnyZodObject } from 'zod';

// validation using zod
const validateRequest = (schema: AnyZodObject) => {
  return async (req: Request, res: Response, next: NextFunction) => {
    try {
      //validation check(zod)
      // if all ok then pass it to next()
      await schema.parseAsync({
        body: req.body,
      });
      next();
    } catch (err) {
      next(err);
    }
  };
};
export default validateRequest;
