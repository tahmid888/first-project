import mongoose from 'mongoose';
import { Student } from './student.model';
import AppError from '../../errors/AppErrors';
import { User } from '../user/user.model';
import httpStatus from 'http-status';
import { TStudent } from './student.interface';
import QueryBuilder from '../../builder/QueryBuilder';
import studentSearchableFields from './student.constant';

const getAllStudentsFromDB = async (query: Record<string, unknown>) => {
  // for searching
  // http://localhost:5000/api/v1/students?searchTerm=rav
  //const queryObj = { ...query }; //copy
  //search
  //const studentSearchableFields = ['email', 'name.firstName', 'presentAddress'];
  // let searchTerm = '';
  // if (query?.searchTerm) {
  //   searchTerm = query?.searchTerm as string;
  // }
  // const searchQuery = Student.find({
  //   $or: studentSearchableFields.map((field) => ({
  //     [field]: { $regex: searchTerm, $options: 'i' },
  //   })),
  // });
  // filtering
  // const excludeFields = ['searchTerm', 'sort', 'limit', 'page', 'fields'];
  // excludeFields.forEach((el) => delete queryObj[el]);
  // //console.log({ query }, { queryObj });
  // const filterQuery = searchQuery
  //   .find(queryObj)
  //   .populate('admissionSemester')
  //   .populate({
  //     path: 'academicDepartment',
  //     populate: {
  //       path: 'academicFaculty',
  //     },
  //   });
  //sort
  //http://localhost:5000/api/v1/students?sort=-email
  // let sort = '-createdAt';
  // if (query.sort) {
  //   sort = query.sort as string;
  // }
  // const sortQuery = filterQuery.sort(sort);
  //limit
  //http://localhost:5000/api/v1/students?limit=2
  // let page = 1;
  // let limit = 1;
  // let skip = 0;
  // if (query.limit) {
  //   limit = Number(query.limit);
  // }
  // pagination
  //http://localhost:5000/api/v1/students?page=1&limit=2
  // if (query.page) {
  //   page = Number(query.page);
  //   skip = (page - 1) * limit;
  // }
  // const paginateQuery = sortQuery.skip(skip);
  // const limitQuery = paginateQuery.limit(limit);
  // fields limiting
  //http://localhost:5000/api/v1/students?fields=name,email
  //let fields = '-__v';
  // fields = 'name,email -> 'name email'
  // if (query.fields) {
  //   fields = (query.fields as string).split(',').join(' ');
  //   console.log({ fields });
  // }
  // const fieldQuery = await limitQuery.select(fields);
  // return fieldQuery;

  const studentQuery = new QueryBuilder(
    Student.find()
      .populate('admissionSemester')
      .populate({
        path: 'academicDepartment',
        populate: {
          path: 'academicFaculty',
        },
      }),
    query,
  )
    .search(studentSearchableFields)
    .filter()
    .sort()
    .paginate()
    .fields();
  const result = await studentQuery.modelQuery;
  return result;
  //http://localhost:5000/api/v1/students?fields=email,gender
  //http://localhost:5000/api/v1/students?searchTerm=rav
  //http://localhost:5000/api/v1/students?searchTerm=rav&email=ravi@example.com
  //http://localhost:5000/api/v1/students?page=1&limit=1
  //http://localhost:5000/api/v1/students?page=1&limit=2&fields=email
  //http://localhost:5000/api/v1/students?sort=-email,dateOfBirth
};

// get single student
const getSingleStudentFromDB = async (id: string) => {
  const result = await Student.findById(id)
    .populate('admissionSemester')
    .populate({
      path: 'academicDepartment',
      populate: {
        path: 'academicFaculty',
      },
    });
  //aggregation
  // const result = await Student.aggregate([
  //   {
  //     $match: { id: id },
  //   },
  // ]);
  return result;
};

//update
const updateStudentIntoDB = async (id: string, payload: Partial<TStudent>) => {
  const { name, guardian, localGuardian, ...remainingStudentData } = payload;

  const modifiedUpdatedData: Record<string, unknown> = {
    ...remainingStudentData,
  };

  /*
    guardain: {
      fatherOccupation:"Teacher"
    }

    guardian.fatherOccupation = Teacher

    name.firstName = 'Mezba'
    name.lastName = 'Abedin'
  */

  if (name && Object.keys(name).length) {
    for (const [key, value] of Object.entries(name)) {
      modifiedUpdatedData[`name.${key}`] = value;
    }
  }
  if (guardian && Object.keys(guardian).length) {
    for (const [key, value] of Object.entries(guardian)) {
      modifiedUpdatedData[`guardian.${key}`] = value;
    }
  }
  if (localGuardian && Object.keys(localGuardian).length) {
    for (const [key, value] of Object.entries(localGuardian)) {
      modifiedUpdatedData[`localGuardian.${key}`] = value;
    }
  }

  const result = await Student.findByIdAndUpdate(id, modifiedUpdatedData, {
    new: true,
    runValidators: true,
  });
  return result;
};

// Delete
const deleteStudentFromDB = async (id: string) => {
  const session = await mongoose.startSession();
  try {
    session.startTransaction();

    //const result = await Student.updateOne({ id }, { isDeleted: true });
    const deletedStudent = await Student.findByIdAndUpdate(
      id,
      { isDeleted: true },
      { new: true, session },
    ); //find out generated id by findOneAndUpdate
    if (!deletedStudent) {
      throw new AppError(httpStatus.BAD_REQUEST, 'Failed to delete student');
    }

    // get user_id for deletedStudent
    const userId = deletedStudent.user;
    const deletedUser = await User.findByIdAndUpdate(
      //  { id },
      userId,
      { isDeleted: true },
      { new: true, session },
    ); //find out generated id by findOneAndUpdate
    if (!deletedUser) {
      throw new AppError(httpStatus.BAD_REQUEST, 'Failed to delete user');
    }
    await session.commitTransaction();
    await session.endSession();

    return deletedStudent;
  } catch (err) {
    await session.abortTransaction();
    await session.endSession();
    throw new Error('Failed to delete student');
  }
};
export const StudentServices = {
  getAllStudentsFromDB,
  getSingleStudentFromDB,
  deleteStudentFromDB,
  updateStudentIntoDB,
};
