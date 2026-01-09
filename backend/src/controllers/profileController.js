import User from '../models/User.js';
import axios from 'axios';
import { fetchAndStoreGitHubData } from '../services/githubService.js';


const cleanUserResponse = (user) => ({
  id: user._id.toString(),
  name: user.name,
  email: user.email,
  githubUsername: user.githubUsername,
  profile: user.profile || {},
  createdAt: user.createdAt.toISOString(),
  updatedAt: user.updatedAt.toISOString(),
});

export const updateProfile = async (req, res) => {
  try {
    const userId = req.user._id;
    const updates = req.body;

    if (!updates || Object.keys(updates).length === 0) {
      return res.status(400).json({
        success: false,
        message: 'No update data provided',
      });
    }

    const updateOps = {};
    let shouldRefreshGithub = false;

 
    if (updates.name !== undefined) {
      updateOps.name = updates.name.trim();
    }

    if (updates.email !== undefined) {
      const newEmail = updates.email.toLowerCase().trim();
      const existing = await User.findOne({
        email: newEmail,
        _id: { $ne: userId },
      });
      if (existing) {
        return res.status(409).json({ success: false, message: 'Email already in use' });
      }
      updateOps.email = newEmail;
    }

    
    if (updates.githubUsername !== undefined) {
      const newUsername = updates.githubUsername.trim();

      
      try {
        await axios.get(`https://api.github.com/users/${newUsername}`, {
          headers: { 'User-Agent': 'Profile-Playground-App' },
        });

        updateOps.githubUsername = newUsername;
        shouldRefreshGithub = true; 
      } catch (err) {
        if (err.response?.status === 404) {
          return res.status(400).json({ success: false, message: 'GitHub username does not exist' });
        }
        return res.status(503).json({ success: false, message: 'GitHub validation unavailable' });
      }
    }

    
    if (updates.profile) {
      const fields = ['education', 'skills', 'projects', 'work', 'links'];
      fields.forEach((field) => {
        if (updates.profile[field] !== undefined) {
          if (['education', 'skills', 'projects', 'work'].includes(field) && !Array.isArray(updates.profile[field])) {
            return res.status(400).json({ success: false, message: `${field} must be an array` });
          }
          if (field === 'links' && typeof updates.profile[field] !== 'object') {
            return res.status(400).json({ success: false, message: 'links must be an object' });
          }
          updateOps[`profile.${field}`] = updates.profile[field];
        }
      });
    }

    if (Object.keys(updateOps).length === 0) {
      return res.status(400).json({ success: false, message: 'No valid fields to update' });
    }

    // Apply update
    const updatedUser = await User.findByIdAndUpdate(
      userId,
      { $set: updateOps },
      { new: true, runValidators: true }
    ).select('-password');

    if (!updatedUser) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }

    
    if (shouldRefreshGithub) {
      try {
        await fetchAndStoreGitHubData(userId);
        const refreshedUser = await User.findById(userId).select('-password');
        return res.json({
          success: true,
          message: 'Profile updated successfully (GitHub data refreshed)',
          user: cleanUserResponse(refreshedUser),
        });
      } catch (fetchErr) {
        console.error('GitHub refresh failed:', fetchErr);
      
        return res.status(200).json({
          success: true,
          message: 'Profile updated successfully (GitHub refresh failed)',
          user: cleanUserResponse(updatedUser),
        });
      }
    }

   
    res.json({
      success: true,
      message: 'Profile updated successfully',
      user: cleanUserResponse(updatedUser),
    });
  } catch (err) {
    console.error('Update error:', err);
    res.status(500).json({ success: false, message: 'Server error during update' });
  }
};


// Add new project to the user's profile.projects array
export const addProject = async (req, res) => {
  try {
    const userId = req.user._id;
    const newProject = req.body; // Expected: { title, description, links?, skills }

    console.log("Received project data:", newProject); // Debugging

    // Required fields validation
    const requiredFields = ['title', 'description', 'skills'];
    const missingFields = requiredFields.filter(field => !newProject[field] || 
      (field === 'skills' && (!Array.isArray(newProject.skills) || newProject.skills.length === 0)));

    if (missingFields.length > 0) {
      return res.status(400).json({
        success: false,
        message: `Missing required project fields: ${missingFields.join(', ')}. All are mandatory.`,
      });
    }

    // Optional: additional type & content validation
    if (typeof newProject.title !== 'string' || newProject.title.trim() === '') {
      return res.status(400).json({ success: false, message: 'Title must be a non-empty string' });
    }

    if (typeof newProject.description !== 'string' || newProject.description.trim() === '') {
      return res.status(400).json({ success: false, message: 'Description must be a non-empty string' });
    }

    if (!Array.isArray(newProject.skills) || newProject.skills.length === 0) {
      return res.status(400).json({ success: false, message: 'Skills must be a non-empty array of strings' });
    }

    // Optional fields (links can be empty array or undefined)
    const projectToAdd = {
      title: newProject.title.trim(),
      description: newProject.description.trim(),
      links: Array.isArray(newProject.links) ? newProject.links : [],
      skills: newProject.skills.map(s => s.trim()), // clean up
    };

    // Push to array
    const updatedUser = await User.findByIdAndUpdate(
      userId,
      { $push: { 'profile.projects': projectToAdd } },
      { new: true, runValidators: true }
    ).select('-password');

    if (!updatedUser) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }

    // Return same response shape as signup/login
    res.status(201).json({
      success: true,
      message: 'Project added successfully',
      user: {
        id: updatedUser._id,
        name: updatedUser.name,
        email: updatedUser.email,
        githubUsername: updatedUser.githubUsername,
        profile: updatedUser.profile || {},
        createdAt: updatedUser.createdAt,
      }
    });
  } catch (err) {
    console.error('Add project error:', err);
    res.status(500).json({
      success: false,
      message: 'Server error while adding project',
      error: process.env.NODE_ENV === 'development' ? err.message : undefined
    });
  }
};

// Update existing project by ID
export const updateProject = async (req, res) => {
  try {
    const userId = req.user._id;
    const projectId = req.params.projectId;
    const changes = req.body;

    if (Object.keys(changes).length === 0) {
      return res.status(400).json({ success: false, message: 'No changes provided' });
    }

    // Build positional update
    const updateFields = {};
    Object.keys(changes).forEach(key => {
      updateFields[`profile.projects.$.${key}`] = changes[key];
    });

    const updatedUser = await User.findOneAndUpdate(
      { _id: userId, 'profile.projects._id': projectId },
      { $set: updateFields },
      { new: true, runValidators: true }
    ).select('-password');

    if (!updatedUser) {
      return res.status(404).json({ success: false, message: 'Project or user not found' });
    }

    res.json({
      success: true,
      message: 'Project updated successfully',
      user: {
        id: updatedUser._id,
        name: updatedUser.name,
        email: updatedUser.email,
        githubUsername: updatedUser.githubUsername,
        profile: updatedUser.profile || {},
        createdAt: updatedUser.createdAt
      }
    });
  } catch (err) {
    console.error('Update project error:', err);
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

// Delete project by ID
export const deleteProject = async (req, res) => {
  try {
    const userId = req.user._id;
    const projectId = req.params.projectId;

    const updatedUser = await User.findByIdAndUpdate(
      userId,
      { $pull: { 'profile.projects': { _id: projectId } } },
      { new: true }
    ).select('-password');

    if (!updatedUser) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }

    // Check if pull actually removed something
    if (req.user.profile.projects.length === updatedUser.profile.projects.length) {
      return res.status(404).json({ success: false, message: 'Project not found' });
    }

    res.json({
      success: true,
      message: 'Project deleted successfully',
      user: {
        id: updatedUser._id,
        name: updatedUser.name,
        email: updatedUser.email,
        githubUsername: updatedUser.githubUsername,
        profile: updatedUser.profile || {},
        createdAt: updatedUser.createdAt,
      }
    });
  } catch (err) {
    console.error('Delete project error:', err);
    res.status(500).json({ success: false, message: 'Server error during project delete' });
  }
};



// Add new work experience
export const addWork = async (req, res) => {
  try {
    const userId = req.user._id;
    const newWork = req.body;
    console.log(userId)

    console.log("Received work data:", newWork);

    // Required fields validation
    const required = ['title', 'company', 'description'];
    const missing = required.filter(field => !newWork[field] || newWork[field].trim() === '');

    if (missing.length > 0) {
      return res.status(400).json({
        success: false,
        message: `Missing required fields: ${missing.join(', ')}`,
      });
    }

    const workToAdd = {
      title: newWork.title.trim(),
      company: newWork.company.trim(),
      description: newWork.description.trim(),
      duration: newWork.duration ? newWork.duration.trim() : '', // optional
    };

    const updatedUser = await User.findByIdAndUpdate(
      userId,
      { $push: { 'profile.work': workToAdd } },
      { new: true, runValidators: true }
    ).select('-password');

    if (!updatedUser) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }

    res.status(201).json({
      success: true,
      message: 'Work experience added successfully',
      user: {
        id: updatedUser._id,
        name: updatedUser.name,
        email: updatedUser.email,
        githubUsername: updatedUser.githubUsername,
        profile: updatedUser.profile || {},
        createdAt: updatedUser.createdAt,
      }
    });
  } catch (err) {
    console.error('Add work error:', err);
    res.status(500).json({ success: false, message: 'Server error while adding work experience' });
  }
};

// Update specific work experience by ID
export const updateWork = async (req, res) => {
  try {
    const userId = req.user._id;
    const workId = req.params.workId;
    const changes = req.body;
    console.log(workId)

    if (Object.keys(changes).length === 0) {
      return res.status(400).json({ success: false, message: 'No changes provided' });
    }

    // Validate required fields if they're being updated
    if (changes.title !== undefined && changes.title.trim() === '') {
      return res.status(400).json({ success: false, message: 'Title cannot be empty' });
    }
    if (changes.company !== undefined && changes.company.trim() === '') {
      return res.status(400).json({ success: false, message: 'Company cannot be empty' });
    }
    if (changes.description !== undefined && changes.description.trim() === '') {
      return res.status(400).json({ success: false, message: 'Description cannot be empty' });
    }

    const updateFields = {};
    Object.keys(changes).forEach(key => {
      updateFields[`profile.work.$.${key}`] = changes[key].trim();
    });

    const updatedUser = await User.findOneAndUpdate(
      { _id: userId, 'profile.work._id': workId },
      { $set: updateFields },
      { new: true, runValidators: true }
    ).select('-password');

    if (!updatedUser) {
      return res.status(404).json({ success: false, message: 'Work experience or user not found' });
    }

    res.json({
      success: true,
      message: 'Work experience updated successfully',
      user: {
        id: updatedUser._id,
        name: updatedUser.name,
        email: updatedUser.email,
        githubUsername: updatedUser.githubUsername,
        profile: updatedUser.profile || {},
        createdAt: updatedUser.createdAt,
      }
    });
  } catch (err) {
    console.error('Update work error:', err);
    res.status(500).json({ success: false, message: 'Server error while updating work' });
  }
};

// Delete specific work experience by ID
export const deleteWork = async (req, res) => {
  try {
    const userId = req.user._id;
    const workId = req.params.workId;
    console.log(workId)

    const updatedUser = await User.findByIdAndUpdate(
      userId,
      { $pull: { 'profile.work': { _id: workId } } },
      { new: true }
    ).select('-password');

    if (!updatedUser) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }

    // Check if it was actually removed
    const stillExists = updatedUser.profile.work.some(w => w._id.toString() === workId);
    if (stillExists) {
      return res.status(404).json({ success: false, message: 'Work experience not found' });
    }

    res.json({
      success: true,
      message: 'Work experience deleted successfully',
      user: {
        id: updatedUser._id,
        name: updatedUser.name,
        email: updatedUser.email,
        githubUsername: updatedUser.githubUsername,
        profile: updatedUser.profile || {},
        createdAt: updatedUser.createdAt,
      }
    });
  } catch (err) {
    console.error('Delete work error:', err);
    res.status(500).json({ success: false, message: 'Server error while deleting work' });
  }
};


// Add skill - POST /user/add-skill (body: {skill: string})
export const addSkill = async (req, res) => {
  try {
    const userId = req.user._id;
    const { skills } = req.body;

    if (!skills || !Array.isArray(skills) || skills.length === 0) {
      return res.status(400).json({ success: false, message: 'Skills array is required' });
    }

    const trimmedSkills = skills.map(s => s.trim()).filter(s => s !== '');

    if (trimmedSkills.length === 0) {
      return res.status(400).json({ success: false, message: 'No valid skills provided' });
    }

    const updatedUser = await User.findByIdAndUpdate(
      userId,
      { $addToSet: { 'profile.skills': { $each: trimmedSkills } } }, // $addToSet avoids duplicates
      { new: true, runValidators: true }
    ).select('-password');

    if (!updatedUser) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }

    res.status(201).json({
      success: true,
      message: 'Skills added successfully',
      user: {
        id: updatedUser._id,
        name: updatedUser.name,
        email: updatedUser.email,
        githubUsername: updatedUser.githubUsername,
        profile: updatedUser.profile || {},
        createdAt: updatedUser.createdAt
      }
    });
  } catch (err) {
    console.error('Add skills error:', err);
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

// Update skill - PUT /user/skill/:oldSkill (body: {newSkill: string})
export const updateSkill = async (req, res) => {
  try {
    const userId = req.user._id;
    const oldSkill = req.params.oldSkill;
    const { newSkill } = req.body;

    if (!newSkill || newSkill.trim() === '') {
      return res.status(400).json({ success: false, message: 'New skill is required' });
    }

    const updatedUser = await User.findOneAndUpdate(
      { _id: userId, 'profile.skills': oldSkill },
      { $set: { 'profile.skills.$': newSkill.trim() } },
      { new: true, runValidators: true }
    ).select('-password');

    if (!updatedUser) {
      return res.status(404).json({ success: false, message: 'Skill or user not found' });
    }

    res.json({
      success: true,
      message: 'Skill updated successfully',
      user: updatedUser,
    });
  } catch (err) {
    console.error('Update skill error:', err);
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

// Delete skill - DELETE /user/skill/:skill
export const deleteSkill = async (req, res) => {
  try {
    const userId = req.user._id;
    const skill = req.params.skill?.trim();

    if (!skill) {
      return res.status(400).json({ success: false, message: 'Skill name is required' });
    }

    // Pull the skill from the array
    const updatedUser = await User.findByIdAndUpdate(
      userId,
      { $pull: { 'profile.skills': skill } },
      { new: true } // This returns the UPDATED document
    ).select('-password');

    if (!updatedUser) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }

    // Now check if the skill was actually removed
    // Compare lengths or check if it's still in the array
    const wasRemoved = !updatedUser.profile.skills.includes(skill);

    if (!wasRemoved) {
      return res.status(404).json({ success: false, message: 'Skill not found' });
    }

    res.json({
      success: true,
      message: 'Skill deleted successfully',
      user: {
        id: updatedUser._id,
        name: updatedUser.name,
        email: updatedUser.email,
        githubUsername: updatedUser.githubUsername,
        profile: updatedUser.profile || {},
        createdAt: updatedUser.createdAt
      }
    });
  } catch (err) {
    console.error('Delete skill error:', err);
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

// Add education - POST /user/add-education (body: {degree, institution, year})
export const addEducation = async (req, res) => {
  try {
    const userId = req.user._id;
    const { degree, institution, year } = req.body;

    if (!degree || !institution || !year) {
      return res.status(400).json({ success: false, message: 'All fields required: degree, institution, year' });
    }

    const newEducation = { degree: degree.trim(), institution: institution.trim(), year: year.trim() };

    const updatedUser = await User.findByIdAndUpdate(
      userId,
      { $push: { 'profile.education': newEducation } },
      { new: true, runValidators: true }
    ).select('-password');

    if (!updatedUser) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }

    res.status(201).json({
      success: true,
      message: 'Education added successfully',
      user: updatedUser,
    });
  } catch (err) {
    console.error('Add education error:', err);
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

// Update education - PUT /user/education/:educationId (body: changes object)
export const updateEducation = async (req, res) => {
  try {
    const userId = req.user._id;
    const educationId = req.params.educationId;
    const changes = req.body;

    if (Object.keys(changes).length === 0) {
      return res.status(400).json({ success: false, message: 'No changes provided' });
    }

    const updateFields = {};
    Object.keys(changes).forEach(key => {
      updateFields[`profile.education.$.${key}`] = changes[key].trim();
    });

    const updatedUser = await User.findOneAndUpdate(
      { _id: userId, 'profile.education._id': educationId },
      { $set: updateFields },
      { new: true, runValidators: true }
    ).select('-password');

    if (!updatedUser) {
      return res.status(404).json({ success: false, message: 'Education or user not found' });
    }

    res.json({
      success: true,
      message: 'Education updated successfully',
      user: updatedUser,
    });
  } catch (err) {
    console.error('Update education error:', err);
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

// Delete education - DELETE /user/education/:educationId
export const deleteEducation = async (req, res) => {
  try {
    const userId = req.user._id;
    const educationId = req.params.educationId;

    const updatedUser = await User.findByIdAndUpdate(
      userId,
      { $pull: { 'profile.education': { _id: educationId } } },
      { new: true }
    ).select('-password');

    if (!updatedUser) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }

    res.json({
      success: true,
      message: 'Education deleted successfully',
      user: updatedUser,
    });
  } catch (err) {
    console.error('Delete education error:', err);
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

// Update links - PUT /user/update-links (body: {github, linkedin, portfolio})
export const updateLinks = async (req, res) => {
  try {
    const userId = req.user._id;
    const { github, linkedin, portfolio } = req.body;

    const changes = {};
    if (github !== undefined) changes['profile.links.github'] = github.trim();
    if (linkedin !== undefined) changes['profile.links.linkedin'] = linkedin.trim();
    if (portfolio !== undefined) changes['profile.links.portfolio'] = portfolio.trim();

    if (Object.keys(changes).length === 0) {
      return res.status(400).json({ success: false, message: 'No changes provided' });
    }

    const updatedUser = await User.findByIdAndUpdate(
      userId,
      { $set: changes },
      { new: true, runValidators: true }
    ).select('-password');

    if (!updatedUser) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }

    res.json({
      success: true,
      message: 'Links updated successfully',
      user: updatedUser,
    });
  } catch (err) {
    console.error('Update links error:', err);
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

// GET /profile/search-skill?skill=react
export const searchSkill = async (req, res) => {
  try {
    const userId = req.user._id;
    const { skill } = req.query;

    const user = await User.findById(userId).select('profile.skills');

    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }

    const skills = user.profile.skills || [];

    // Case-insensitive search
    const normalizedSkill = skill?.trim().toLowerCase();
    const found = skills.some(s => s.toLowerCase() === normalizedSkill);

    res.json({
      success: true,
      hasSkill: found,
      searchedSkill: skill?.trim() || '',
      message: found 
        ? `Yes, "${skill.trim()}" is present in your skills`
        : `No, "${skill.trim()}" skill is not present`
    });
  } catch (err) {
    console.error('Search skill error:', err);
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

