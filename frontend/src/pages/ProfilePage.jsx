import React, { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import {
  getUserData,
  addSkill,
  deleteSkill,
  addEducation,
  updateEducation,
  deleteEducation,
  updateLinks,
  addProject,
  updateProject,
  deleteProject,
  addWork,
  updateWork,
  deleteWork,
} from '../redux/slices/authSlice';
import toast from 'react-hot-toast';
import Header from '../components/Header';
import Footer from '../components/Footer';

const ProfilePage = () => {
  const dispatch = useDispatch();
  const { data: user, loading: profileLoading, searchResult, loading: searchLoading } = useSelector((state) => state.auth);

  // Modal state
  const [modalOpen, setModalOpen] = useState(false);
  const [modalType, setModalType] = useState('');
  const [currentItem, setCurrentItem] = useState(null);
  const [formData, setFormData] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false); // For modal submit/add/edit

  // Per-item deleting state for delete buttons
  const [deletingProjects, setDeletingProjects] = useState(new Set());
  const [deletingWork, setDeletingWork] = useState(new Set());
  const [deletingEducation, setDeletingEducation] = useState(new Set());

  useEffect(() => {
    if (!user || Object.keys(user).length === 0) {
      dispatch(getUserData());
    }
  }, [dispatch, user]);

  const handleOpenModal = (type, item = null) => {
    setModalType(type);
    setCurrentItem(item);

    if (type === 'updateLinks') {
      setFormData(user.profile.links || { github: '', linkedin: '', portfolio: '' });
    } else if (type === 'addSkill') {
      setFormData({ skills: '' });
    } else if (type === 'editProject' && item) {
      setFormData({
        title: item.title || '',
        description: item.description || '',
        link: item.link || '',
        repoLink: item.repoLink || '',
        skills: item.skills?.join(', ') || '',
      });
    } else if (type === 'editWork' && item) {
      setFormData({
        title: item.title || '',
        company: item.company || '',
        duration: item.duration || '',
        description: item.description || '',
      });
    } else if (type === 'editEducation' && item) {
      setFormData({
        degree: item.degree || '',
        institution: item.institution || '',
        year: item.year || '',
      });
    } else {
      setFormData(item || getDefaultFormData(type));
    }
    setModalOpen(true);
  };

  const getDefaultFormData = (type) => {
    if (type === 'addEducation' || type === 'editEducation') return { degree: '', institution: '', year: '' };
    if (type === 'addProject' || type === 'editProject') return { title: '', description: '', link: '', repoLink: '', skills: '' };
    if (type === 'addWork' || type === 'editWork') return { title: '', company: '', duration: '', description: '' };
    return {};
  };

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      if (modalType === 'addSkill') {
        const input = formData.skills || '';
        const skillsArray = input.split(',').map(s => s.trim()).filter(s => s !== '');
        if (skillsArray.length === 0) {
          toast.error('Please enter at least one skill');
          return;
        }
        await dispatch(addSkill(skillsArray)).unwrap();
      } 
      else if (modalType === 'deleteSkill') {
        await dispatch(deleteSkill(currentItem)).unwrap();
      } 
      else if (modalType === 'addEducation') {
        await dispatch(addEducation({
          degree: formData.degree,
          institution: formData.institution,
          year: formData.year,
        })).unwrap();
      } 
      else if (modalType === 'editEducation') {
        await dispatch(updateEducation({
          educationId: currentItem._id,
          changes: { degree: formData.degree, institution: formData.institution, year: formData.year }
        })).unwrap();
      } 
      else if (modalType === 'updateLinks') {
        await dispatch(updateLinks(formData)).unwrap();
      } 
      else if (modalType === 'addProject') {
        const projectSkills = formData.skills ? formData.skills.split(',').map(s => s.trim()) : [];
        await dispatch(addProject({
          title: formData.title,
          description: formData.description,
          link: formData.link,
          repoLink: formData.repoLink,
          skills: projectSkills,
        })).unwrap();
      } 
      else if (modalType === 'editProject') {
        const projectSkills = formData.skills ? formData.skills.split(',').map(s => s.trim()) : [];
        await dispatch(updateProject({
          projectId: currentItem._id,
          changes: {
            title: formData.title,
            description: formData.description,
            link: formData.link,
            repoLink: formData.repoLink,
            skills: projectSkills,
          }
        })).unwrap();
      } 
      else if (modalType === 'addWork') {
        await dispatch(addWork({
          title: formData.title,
          company: formData.company,
          duration: formData.duration,
          description: formData.description,
        })).unwrap();
      } 
      else if (modalType === 'editWork') {
        await dispatch(updateWork({
          workId: currentItem._id,
          changes: {
            title: formData.title,
            company: formData.company,
            duration: formData.duration,
            description: formData.description,
          }
        })).unwrap();
      }

      setModalOpen(false);
      setFormData({});
    } catch (err) {
      console.error('Error in submit:', err);
    } finally {
      setIsSubmitting(false);
    }
  };

  // Direct delete for Project
  const handleDirectDeleteProject = async (projectId) => {
    setDeletingProjects(prev => new Set([...prev, projectId]));
    try {
      await dispatch(deleteProject(projectId)).unwrap();
      toast.success('Project deleted successfully');
    } catch (err) {}
    setDeletingProjects(prev => {
      const newSet = new Set(prev);
      newSet.delete(projectId);
      return newSet;
    });
  };

  // Direct delete for Work
  const handleDirectDeleteWork = async (workId) => {
    setDeletingWork(prev => new Set([...prev, workId]));
    try {
      await dispatch(deleteWork(workId)).unwrap();
      toast.success('Work experience deleted successfully');
    } catch (err) {}
    setDeletingWork(prev => {
      const newSet = new Set(prev);
      newSet.delete(workId);
      return newSet;
    });
  };

  // Direct delete for Education
  const handleDirectDeleteEducation = async (educationId) => {
    setDeletingEducation(prev => new Set([...prev, educationId]));
    try {
      await dispatch(deleteEducation(educationId)).unwrap();
      toast.success('Education deleted successfully');
    } catch (err) {}
    setDeletingEducation(prev => {
      const newSet = new Set(prev);
      newSet.delete(educationId);
      return newSet;
    });
  };

  // Initial loading only
  if (profileLoading && !user) {
    return (
      <>
        <Header />
        <div className="min-h-screen bg-gray-900 flex items-center justify-center">
          <div className="text-center">
            <div className="relative">
              <div className="w-16 h-16 rounded-full border-4 border-gray-700"></div>
              <div className="absolute top-0 left-0 w-16 h-16 rounded-full border-4 border-orange-500 border-t-transparent animate-spin"></div>
            </div>
            <p className="mt-6 text-gray-400 text-lg font-medium">Loading your profile...</p>
          </div>
        </div>
      </>
    );
  }

  if (!user || Object.keys(user).length === 0) {
    return (
      <>
        <Header />
        <div className="min-h-screen flex items-center justify-center bg-gray-900 text-white">No data found</div>
      </>
    );
  }

  const hasLinks = user.profile.links && (user.profile.links.github || user.profile.links.linkedin || user.profile.links.portfolio);

  return (
    <div className="flex flex-col min-h-screen bg-gray-900">
      <Header />

      {/* Search Loading - Below Header */}
      {searchLoading && (
        <div className="bg-gray-800 py-4 border-b border-gray-700">
          <div className="max-w-6xl mx-auto px-4 text-center">
            <div className="inline-flex items-center gap-3">
              <div className="w-5 h-5 rounded-full border-2 border-orange-500 border-t-transparent animate-spin"></div>
              <span className="text-gray-300">Searching skill...</span>
            </div>
          </div>
        </div>
      )}

      {/* Main Content */}
      <main className="grow text-white p-4 md:p-8">
        {/* Search Result */}
        {searchResult?.searchedSkill && !searchLoading && (
          <div className="py-16 px-4">
            <div className="max-w-4xl mx-auto text-center">
              <h2 className="text-4xl font-bold text-white mb-8">Skill Search Result</h2>
              <div className={`inline-block p-10 rounded-2xl text-2xl font-medium shadow-2xl ${
                searchResult.hasSkill 
                  ? 'bg-green-900/40 text-green-400 border-4 border-green-600' 
                  : 'bg-red-900/40 text-red-400 border-4 border-red-600'
              }`}>
                {searchResult.message}
              </div>
              <p className="mt-10 text-gray-400 text-lg">
                Clear the search bar to view your full profile
              </p>
            </div>
          </div>
        )}

        {/* Normal Profile */}
        {(!searchResult || !searchResult.searchedSkill) && (
          <div className="max-w-6xl mx-auto space-y-8">
            {/* User Info */}
            <div className="bg-gray-800 p-6 rounded-lg shadow-lg">
              <h2 className="text-2xl font-bold mb-4">User Information</h2>
              <p><strong>Name:</strong> {user.name}</p>
              <p><strong>Email:</strong> {user.email}</p>
              <p><strong>GitHub Username:</strong> {user.githubUsername}</p>
              <p><strong>Created At:</strong> {new Date(user.createdAt).toLocaleDateString()}</p>
            </div>

            {/* GitHub Data */}
            {user.profile.githubData && (
              <div className="bg-gray-800 p-6 rounded-lg shadow-lg">
                <h2 className="text-2xl font-bold mb-4">GitHub Profile</h2>
                <div className="flex flex-col md:flex-row items-center gap-6">
                  {user.profile.githubData.avatarUrl ? (
                    <img src={user.profile.githubData.avatarUrl} alt="Avatar" className="w-32 h-32 rounded-full" />
                  ) : (
                    <div className="w-32 h-32 bg-gray-700 rounded-full flex items-center justify-center">
                      <span className="text-4xl text-gray-400">👤</span>
                    </div>
                  )}
                  <div>
                    <p><strong>Name:</strong> {user.profile.githubData.name || 'N/A'}</p>
                    <p><strong>Bio:</strong> {user.profile.githubData.bio || 'No bio'}</p>
                    <p><strong>Company:</strong> {user.profile.githubData.company || 'N/A'}</p>
                    <p><strong>Location:</strong> {user.profile.githubData.location || 'N/A'}</p>
                    <p><strong>Followers:</strong> {user.profile.githubData.followers}</p>
                    <p><strong>Following:</strong> {user.profile.githubData.following}</p>
                    <p><strong>Public Repos:</strong> {user.profile.githubData.publicRepos}</p>
                    <p><strong>Total Stars:</strong> {user.profile.githubData.totalStars}</p>
                  </div>
                </div>
              </div>
            )}

            {/* Links */}
            <div className="bg-gray-800 p-6 rounded-lg shadow-lg">
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-2xl font-bold">Links</h2>
                <button 
                  onClick={() => handleOpenModal('updateLinks')} 
                  disabled={isSubmitting}
                  className="bg-orange-500 hover:bg-orange-600 disabled:bg-orange-700 text-white px-4 py-2 rounded transition"
                >
                  {hasLinks ? 'Edit Links' : 'Add Links'}
                </button>
              </div>
              {hasLinks ? (
                <div className="space-y-2">
                  {user.profile.links.github && <p><strong>GitHub:</strong> <a href={user.profile.links.github} target="_blank" rel="noopener noreferrer" className="text-orange-500 hover:underline">{user.profile.links.github}</a></p>}
                  {user.profile.links.linkedin && <p><strong>LinkedIn:</strong> <a href={user.profile.links.linkedin} target="_blank" rel="noopener noreferrer" className="text-orange-500 hover:underline">{user.profile.links.linkedin}</a></p>}
                  {user.profile.links.portfolio && <p><strong>Portfolio:</strong> <a href={user.profile.links.portfolio} target="_blank" rel="noopener noreferrer" className="text-orange-500 hover:underline">{user.profile.links.portfolio}</a></p>}
                </div>
              ) : (
                <p>No links added</p>
              )}
            </div>

            {/* Skills */}
            <div className="bg-gray-800 p-6 rounded-lg shadow-lg">
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-2xl font-bold">Skills</h2>
                <button 
                  onClick={() => handleOpenModal('addSkill')} 
                  disabled={isSubmitting}
                  className="bg-orange-500 hover:bg-orange-600 disabled:bg-orange-700 text-white px-4 py-2 rounded transition"
                >
                  Add Skills
                </button>
              </div>
              {user.profile.skills && user.profile.skills.length > 0 ? (
                <div className="flex flex-wrap gap-3">
                  {user.profile.skills.map((skill) => (
                    <div key={skill} className="relative bg-gray-700 px-4 py-2 rounded-full flex items-center group">
                      <span className="pr-6">{skill}</span>
                      <button
                        onClick={() => handleOpenModal('deleteSkill', skill)}
                        disabled={isSubmitting}
                        className="absolute right-1 top-1/2 -translate-y-1/2 text-red-400 opacity-0 group-hover:opacity-100 transition-opacity text-lg font-bold"
                      >
                        ×
                      </button>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-gray-400">No skills added yet</p>
              )}
            </div>

            {/* Education */}
            <div className="bg-gray-800 p-6 rounded-lg shadow-lg">
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-2xl font-bold">Education</h2>
                <button 
                  onClick={() => handleOpenModal('addEducation')} 
                  disabled={isSubmitting}
                  className="bg-orange-500 hover:bg-orange-600 disabled:bg-orange-700 text-white px-4 py-2 rounded transition"
                >
                  Add Education
                </button>
              </div>
              {user.profile.education?.length > 0 ? (
                <div className="space-y-4">
                  {user.profile.education.map((edu) => (
                    <div key={edu._id} className="bg-gray-700 p-4 rounded">
                      <p><strong>Degree:</strong> {edu.degree}</p>
                      <p><strong>Institution:</strong> {edu.institution}</p>
                      <p><strong>Year:</strong> {edu.year}</p>
                      <div className="flex gap-2 mt-2">
                        <button 
                          onClick={() => handleOpenModal('editEducation', edu)} 
                          disabled={isSubmitting}
                          className="bg-orange-500 hover:bg-orange-600 disabled:bg-orange-700 text-white px-4 py-2 rounded transition"
                        >
                          Edit
                        </button>
                        <button 
                          onClick={() => handleDirectDeleteEducation(edu._id)} 
                          disabled={deletingEducation.has(edu._id)}
                          className="bg-red-500 hover:bg-red-600 disabled:bg-red-700 text-white px-4 py-2 rounded transition"
                        >
                          {deletingEducation.has(edu._id) ? 'Deleting...' : 'Delete'}
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-gray-400">No education added</p>
              )}
            </div>

            {/* Projects */}
            <div className="bg-gray-800 p-6 rounded-lg shadow-lg">
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-2xl font-bold">Projects</h2>
                <button 
                  onClick={() => handleOpenModal('addProject')} 
                  disabled={isSubmitting}
                  className="bg-orange-500 hover:bg-orange-600 disabled:bg-orange-700 text-white px-4 py-2 rounded transition"
                >
                  Add Project
                </button>
              </div>
              {user.profile.projects?.length > 0 ? (
                <div className="space-y-4">
                  {user.profile.projects.map((proj) => (
                    <div key={proj._id} className="bg-gray-700 p-4 rounded">
                      <p><strong>Title:</strong> {proj.title}</p>
                      <p><strong>Description:</strong> {proj.description}</p>
                      <p><strong>Link:</strong> {proj.link ? <a href={proj.link} className="text-orange-500 hover:underline" target="_blank" rel="noopener noreferrer">{proj.link}</a> : 'N/A'}</p>
                      <p><strong>Repo Link:</strong> {proj.repoLink ? <a href={proj.repoLink} className="text-orange-500 hover:underline" target="_blank" rel="noopener noreferrer">{proj.repoLink}</a> : 'N/A'}</p>
                      <p><strong>Skills:</strong> {proj.skills?.join(', ') || 'None'}</p>
                      <div className="flex gap-2 mt-2">
                        <button 
                          onClick={() => handleOpenModal('editProject', proj)} 
                          disabled={isSubmitting}
                          className="bg-orange-500 hover:bg-orange-600 disabled:bg-orange-700 text-white px-4 py-2 rounded transition"
                        >
                          Edit
                        </button>
                        <button 
                          onClick={() => handleDirectDeleteProject(proj._id)} 
                          disabled={deletingProjects.has(proj._id)}
                          className="bg-red-500 hover:bg-red-600 disabled:bg-red-700 text-white px-4 py-2 rounded transition"
                        >
                          {deletingProjects.has(proj._id) ? 'Deleting...' : 'Delete'}
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-gray-400">No projects added</p>
              )}
            </div>

            {/* Work */}
            <div className="bg-gray-800 p-6 rounded-lg shadow-lg">
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-2xl font-bold">Work Experience</h2>
                <button 
                  onClick={() => handleOpenModal('addWork')} 
                  disabled={isSubmitting}
                  className="bg-orange-500 hover:bg-orange-600 disabled:bg-orange-700 text-white px-4 py-2 rounded transition"
                >
                  Add Work
                </button>
              </div>
              {user.profile.work?.length > 0 ? (
                <div className="space-y-4">
                  {user.profile.work.map((work) => (
                    <div key={work._id} className="bg-gray-700 p-4 rounded">
                      <p><strong>Title:</strong> {work.title}</p>
                      <p><strong>Company:</strong> {work.company}</p>
                      <p><strong>Duration:</strong> {work.duration || 'N/A'}</p>
                      <p><strong>Description:</strong> {work.description}</p>
                      <div className="flex gap-2 mt-2">
                        <button 
                          onClick={() => handleOpenModal('editWork', work)} 
                          disabled={isSubmitting}
                          className="bg-orange-500 hover:bg-orange-600 disabled:bg-orange-700 text-white px-4 py-2 rounded transition"
                        >
                          Edit
                        </button>
                        <button 
                          onClick={() => handleDirectDeleteWork(work._id)} 
                          disabled={deletingWork.has(work._id)}
                          className="bg-red-500 hover:bg-red-600 disabled:bg-red-700 text-white px-4 py-2 rounded transition"
                        >
                          {deletingWork.has(work._id) ? 'Deleting...' : 'Delete'}
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-gray-400">No work experience added</p>
              )}
            </div>
          </div>
        )}
      </main>

      {/* Modal */}
      {modalOpen && (
        <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 px-4">
          <div className="bg-gray-800 p-6 rounded-lg shadow-xl w-full max-w-md relative">
            <button onClick={() => setModalOpen(false)} className="absolute top-3 right-3 text-gray-400 hover:text-white text-2xl">×</button>

            <h2 className="text-2xl font-bold mb-6 text-center">
              {modalType === 'addSkill' ? 'Add Skills' :
               modalType === 'deleteSkill' ? 'Confirm Delete Skill' :
               modalType === 'updateLinks' ? 'Update Links' :
               modalType.includes('add') ? 'Add' : 'Edit'} {modalType.replace(/addSkill|deleteSkill|updateLinks|add|edit|delete/, '').trim()}
            </h2>

            {modalType === 'deleteSkill' ? (
              <div className="text-center space-y-4">
                <p>Are you sure you want to remove <strong>"{currentItem}"</strong>?</p>
                <div className="flex justify-center gap-4">
                  <button 
                    onClick={handleSubmit} 
                    disabled={isSubmitting}
                    className="bg-red-500 hover:bg-red-600 disabled:bg-red-700 text-white px-6 py-2 rounded transition"
                  >
                    {isSubmitting ? 'Deleting...' : 'Yes, Delete'}
                  </button>
                  <button onClick={() => setModalOpen(false)} className="bg-gray-600 hover:bg-gray-700 text-white px-6 py-2 rounded">Cancel</button>
                </div>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-4">
                {modalType === 'addSkill' && (
                  <div>
                    <label className="block text-sm font-medium mb-2">Enter skills (comma separated)</label>
                    <input name="skills" value={formData.skills || ''} onChange={handleChange} placeholder="React, Node.js, MongoDB" className="w-full p-3 bg-gray-700 text-white rounded focus:outline-none focus:ring-2 focus:ring-orange-500" required />
                    <p className="text-xs text-gray-400 mt-2">Separate with commas</p>
                  </div>
                )}
                {modalType.includes('Education') && (
                  <>
                    <input name="degree" value={formData.degree || ''} onChange={handleChange} placeholder="Degree" className="w-full p-3 bg-gray-700 text-white rounded focus:outline-none focus:ring-2 focus:ring-orange-500" required />
                    <input name="institution" value={formData.institution || ''} onChange={handleChange} placeholder="Institution" className="w-full p-3 bg-gray-700 text-white rounded focus:outline-none focus:ring-2 focus:ring-orange-500" required />
                    <input name="year" value={formData.year || ''} onChange={handleChange} placeholder="Year" className="w-full p-3 bg-gray-700 text-white rounded focus:outline-none focus:ring-2 focus:ring-orange-500" required />
                  </>
                )}
                {modalType === 'updateLinks' && (
                  <>
                    <input name="github" value={formData.github || ''} onChange={handleChange} placeholder="GitHub URL" className="w-full p-3 bg-gray-700 text-white rounded focus:outline-none focus:ring-2 focus:ring-orange-500" />
                    <input name="linkedin" value={formData.linkedin || ''} onChange={handleChange} placeholder="LinkedIn URL" className="w-full p-3 bg-gray-700 text-white rounded focus:outline-none focus:ring-2 focus:ring-orange-500" />
                    <input name="portfolio" value={formData.portfolio || ''} onChange={handleChange} placeholder="Portfolio URL" className="w-full p-3 bg-gray-700 text-white rounded focus:outline-none focus:ring-2 focus:ring-orange-500" />
                  </>
                )}
                {(modalType === 'addProject' || modalType === 'editProject') && (
                  <>
                    <input name="title" value={formData.title || ''} onChange={handleChange} placeholder="Title" className="w-full p-3 bg-gray-700 text-white rounded focus:outline-none focus:ring-2 focus:ring-orange-500" required />
                    <textarea name="description" value={formData.description || ''} onChange={handleChange} placeholder="Description" rows="4" className="w-full p-3 bg-gray-700 text-white rounded focus:outline-none focus:ring-2 focus:ring-orange-500" required />
                    <input name="link" value={formData.link || ''} onChange={handleChange} placeholder="Live Link" className="w-full p-3 bg-gray-700 text-white rounded focus:outline-none focus:ring-2 focus:ring-orange-500" />
                    <input name="repoLink" value={formData.repoLink || ''} onChange={handleChange} placeholder="Repo Link" className="w-full p-3 bg-gray-700 text-white rounded focus:outline-none focus:ring-2 focus:ring-orange-500" />
                    <input name="skills" value={formData.skills || ''} onChange={handleChange} placeholder="Skills (comma separated)" className="w-full p-3 bg-gray-700 text-white rounded focus:outline-none focus:ring-2 focus:ring-orange-500" />
                  </>
                )}
                {(modalType === 'addWork' || modalType === 'editWork') && (
                  <>
                    <input name="title" value={formData.title || ''} onChange={handleChange} placeholder="Job Title" className="w-full p-3 bg-gray-700 text-white rounded focus:outline-none focus:ring-2 focus:ring-orange-500" required />
                    <input name="company" value={formData.company || ''} onChange={handleChange} placeholder="Company" className="w-full p-3 bg-gray-700 text-white rounded focus:outline-none focus:ring-2 focus:ring-orange-500" required />
                    <input name="duration" value={formData.duration || ''} onChange={handleChange} placeholder="Duration" className="w-full p-3 bg-gray-700 text-white rounded focus:outline-none focus:ring-2 focus:ring-orange-500" />
                    <textarea name="description" value={formData.description || ''} onChange={handleChange} placeholder="Description" rows="4" className="w-full p-3 bg-gray-700 text-white rounded focus:outline-none focus:ring-2 focus:ring-orange-500" required />
                  </>
                )}

                <button 
                  type="submit" 
                  disabled={isSubmitting}
                  className="w-full py-3 bg-orange-500 hover:bg-orange-600 disabled:bg-orange-700 text-white font-semibold rounded transition"
                >
                  {isSubmitting 
                    ? (modalType.includes('add') ? 'Adding...' : 'Updating...') 
                    : (modalType === 'addSkill' ? 'Add Skills' : modalType.includes('add') ? 'Add' : 'Update')
                  }
                </button>
              </form>
            )}
          </div>
        </div>
      )}

      <Footer />
    </div>
  );
};

export default ProfilePage;