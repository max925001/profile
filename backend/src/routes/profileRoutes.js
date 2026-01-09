// src/routes/profileRoutes.js
import express from 'express';
import protect from '../middleware/auth.js';
import { addEducation, addProject, addSkill, addWork, deleteEducation, deleteProject, deleteSkill, deleteWork, searchSkill, updateEducation, updateLinks, updateProfile, updateProject, updateSkill, updateWork } from '../controllers/profileController.js';

const router = express.Router();

// PATCH for partial updates (as per PDF: update)
router.patch('/', protect, updateProfile);
router.post('/projects', protect, addProject); 
router.patch('/projects/:projectId', protect, updateProject);
router.delete('/projects/:projectId', protect, deleteProject);
router.post('/work', protect, addWork);
router.patch('/work/:workId', protect, updateWork);
router.delete('/work/:workId', protect, deleteWork);
router.post('/add-skill', protect, addSkill);
router.put('/skill/:oldSkill', protect, updateSkill);
router.delete('/skill/:skill', protect, deleteSkill);

router.post('/add-education', protect, addEducation);
router.put('/education/:educationId', protect, updateEducation);
router.delete('/education/:educationId', protect, deleteEducation);
router.put('/update-links', protect, updateLinks);
router.get('/search-skill', protect, searchSkill);

export default router;