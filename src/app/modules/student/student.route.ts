import express from 'express';
import { StudentControllers } from './student.contoller';

const router = express.Router();

router.get('/', StudentControllers.getAllStudents);
router.get('/:studentId', StudentControllers.getSingleStudent);
router.delete('/:studentId', StudentControllers.deleteStudent);

export const StudentRoutes = router;
