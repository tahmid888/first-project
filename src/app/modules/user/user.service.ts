import { object } from 'joi';
import config from '../../config';
import { TStudent } from '../student/student.interface';
import { NewUser } from './user.interface';
import { User } from './user.model';

const createStudentIntoDB = async (password: string, studentData: TStudent) => {
  //create a user object
  const user: NewUser = {};
  //if password is not given then use a default password
  user.password = password || (config.default_password as string);
  //   if (!password) {
  //     user.password = config.default_password as string;
  //   } else {
  //     user.password = password;
  //   }
  // set student role
  user.role = 'student';
  //set manually generated id
  user.id = '2030100001';

  // create a user
  const result = await User.create(user);

  //create a student
  if (Object.keys(result).length) {
    //set id , _id as user
    studentData.id = result.id;
    studentData.user = result._id;
  }

  return result;
};
export const UserServices = {
  createStudentIntoDB,
};
