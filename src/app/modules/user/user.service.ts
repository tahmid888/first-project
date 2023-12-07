import config from '../../config';
import { TStudent } from '../student/student.interface';
import { TUser } from './user.interface';
import { User } from './user.model';
import { Student } from '../student/student.model';
import { AcademicSemester } from '../academicSemester/academicSemester.model';
import { generateStudentId } from './user.utils';
import mongoose from 'mongoose';
import AppError from '../../errors/AppErrors';
import httpStatus from 'http-status';

const createStudentIntoDB = async (password: string, payload: TStudent) => {
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

  // find academic semester info
  const admissionSemester = await AcademicSemester.findById(
    payload.admissionSemester,
  );

  const session = await mongoose.startSession(); // more than 2 database write operation then use transaction

  try {
    session.startTransaction();
    //set generated id
    userData.id = await generateStudentId(admissionSemester);

    // create a user(transaction-1)
    const newUser = await User.create([userData], { session }); //array-> for transaction
    //const newUser = await User.create(userData);//object

    //create a student
    //if (Object.keys(newUser).length) {
    if (!newUser.length) {
      throw new AppError(httpStatus.BAD_REQUEST, 'Failed to create user');
    }

    //set id , _id as user
    // payload.id = newUser.id; //embedding id
    //payload.user = newUser._id; //connected to as user <-> student// reference id
    payload.id = newUser[0].id;
    payload.user = newUser[0]._id;

    //create a student(transaction-2)
    //const newStudent = await Student.create(payload);
    const newStudent = await Student.create([payload], { session });

    if (!newStudent.length) {
      throw new AppError(httpStatus.BAD_REQUEST, 'Failed to create student');
    }
    await session.commitTransaction(); //permanently saved data in DB
    await session.endSession();
    return newStudent;
  } catch (err) {
    await session.abortTransaction();
    await session.endSession();
    //throw new Error(err);
    throw new Error('Failed to delete student');
  }
};
export const UserServices = {
  createStudentIntoDB,
};
