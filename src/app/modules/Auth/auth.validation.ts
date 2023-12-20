import { z } from 'zod';
const loginValidationSchema = z.object({
  body: z.object({}),
});

export const AuthValidation = { loginValidationSchema };
