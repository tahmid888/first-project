import config from '../../config';
import { TStudent } from '../student/student.interface';
import { TUser } from './user.interface';
import { User } from './user.model';
import { Student } from '../student/student.model';

const createStudentIntoDB = async (password: string, studentData: TStudent) => {
  //create a user object
  const userData: Partial<TUser> = {};
  //if password is not given then use a default password
  userData.password = password || (config.default_password as string);
  //   if (!password) {
  //     userData.password = config.default_password as string;
  //   } else {
  //     userData.password = password;
  //   }
  // set student role
  userData.role = 'student';
  //set manually generated id
  userData.id = '2030100001';

  // create a user
  const newUser = await User.create(userData);

  //create a student
  if (Object.keys(newUser).length) {
    //set id , _id as user
    studentData.id = newUser.id; //embedding id
    studentData.user = newUser._id; //connected to as user <-> student// reference id

    const newStudent = await Student.create(studentData);
    return newStudent;
  }
};
export const UserServices = {
  createStudentIntoDB,
};
