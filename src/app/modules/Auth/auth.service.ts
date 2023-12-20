import httpStatus from 'http-status';
import AppError from '../../errors/AppErrors';
import { User } from '../user/user.model';
import { TLoginUser } from './auth.interface';
import jwt from 'jsonwebtoken';
import config from '../../config';
//import bcrypt from 'bcrypt';

const loginUser = async (payload: TLoginUser) => {
  //checking if the user is Exist
  // const isUserExist = await User.findOne({ id: payload?.id });
  const user = await User.isUserExistByCustomId(payload.id);
  //console.log(user);//show full user body
  if (!user) {
    throw new AppError(httpStatus.NOT_FOUND, 'This user is not found !');
  }
  // checking if the user is already deleted
  //const isDeleted = isUserExist?.isDeleted;
  const isDeleted = user?.isDeleted;
  if (isDeleted) {
    throw new AppError(httpStatus.FORBIDDEN, 'This user is deleted !');
  }
  // checking if the user is blocked
  //const userStatus = isUserExist?.status;
  const userStatus = user?.status;
  if (userStatus === 'blocked') {
    throw new AppError(httpStatus.FORBIDDEN, 'This user is blocked ! !');
  }
  //checking if the password is correct
  // option-1
  // const isPasswordMatch = await bcrypt.compare(
  //   payload?.password,
  //   isUserExist?.password,
  // );
  //option-2
  if (!(await User.isPasswordMatched(payload?.password, user?.password)))
    throw new AppError(httpStatus.FORBIDDEN, 'Password not matched !');

  // create access token and sent to the client
  const jwtPayload = {
    userId: user,
    role: user.role,
  };

  const accessToken = jwt.sign(jwtPayload, config.jwt_access_secret as string, {
    expiresIn: '10d',
  });

  return { accessToken, needsPasswordChange: user?.needsPasswordChange };
};
export const AuthServices = {
  loginUser,
};
