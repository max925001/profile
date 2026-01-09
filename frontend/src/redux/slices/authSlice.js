import { createAsyncThunk, createSlice } from '@reduxjs/toolkit';
import toast from 'react-hot-toast';
import axiosInstance from '../../helpers/axiosInstance';

const initialState = {
  isLoggedIn: localStorage.getItem('isLoggedIn') === 'true',
  role: localStorage.getItem('role') || '',
  data: JSON.parse(localStorage.getItem('data') || '{}'),
  loading: false,
  error: null,
  searchResult: null,
};

// Auth Thunks (keep as is)
export const createAccount = createAsyncThunk('auth/signup', async (userData, { rejectWithValue }) => {
  try {
    const response = await axiosInstance.post('/auth/signup', userData);
    return response.data;
  } catch (error) {
    const message = error.response?.data?.message || 'Failed to create account';
    toast.error(message);
    return rejectWithValue(message);
  }
});

export const login = createAsyncThunk('auth/login', async (userData, { rejectWithValue }) => {
  try {
    const response = await axiosInstance.post('/auth/login', userData);
    return response.data;
  } catch (error) {
    const message = error.response?.data?.message || 'Failed to login';
    toast.error(message);
    return rejectWithValue(message);
  }
});

export const logout = createAsyncThunk('auth/logout', async (_, { rejectWithValue }) => {
  try {
    const response = await axiosInstance.post('/auth/logout');
    return response.data;
  } catch (error) {
    const message = error.response?.data?.message || 'Failed to logout';
    toast.error(message);
    return rejectWithValue(message);
  }
});

// Profile Fetch
export const getUserData = createAsyncThunk('auth/getUserData', async (_, { rejectWithValue }) => {
  try {
    const response = await axiosInstance.get('/user/me');
    return response.data;
  } catch (error) {
    const message = error.response?.data?.message || 'Failed to fetch user data';
    toast.error(message);
    return rejectWithValue(message);
  }
});

// Skills Thunks
export const addSkill = createAsyncThunk('auth/addSkill', async (skills, { rejectWithValue }) => {
  try {
    const response = await axiosInstance.post('/profile/add-skill', { skills });
    toast.success(response.data.message || 'Skills added successfully');
    return response.data;
  } catch (error) {
    const message = error.response?.data?.message || 'Failed to add skills';
    toast.error(message);
    return rejectWithValue(message);
  }
});

export const updateSkill = createAsyncThunk('auth/updateSkill', async ({ oldSkill, newSkill }, { rejectWithValue }) => {
  try {
    const response = await axiosInstance.put(`/profile/skill/${oldSkill}`, { newSkill });
    toast.success(response.data.message || 'Skill updated successfully');
    return response.data;
  } catch (error) {
    const message = error.response?.data?.message || 'Failed to update skill';
    toast.error(message);
    return rejectWithValue(message);
  }
});

export const deleteSkill = createAsyncThunk('auth/deleteSkill', async (skill, { rejectWithValue }) => {
  try {
    const response = await axiosInstance.delete(`/profile/skill/${encodeURIComponent(skill)}`);
    toast.success(response.data.message || 'Skill deleted successfully');
    return response.data;
  } catch (error) {
    const message = error.response?.data?.message || 'Failed to delete skill';
    toast.error(message);
    return rejectWithValue(message);
  }
});

// Education Thunks
export const addEducation = createAsyncThunk('auth/addEducation', async (newEducation, { rejectWithValue }) => {
  try {
    const response = await axiosInstance.post('/profile/add-education', newEducation);
    toast.success(response.data.message || 'Education added successfully');
    return response.data;
  } catch (error) {
    const message = error.response?.data?.message || 'Failed to add education';
    toast.error(message);
    return rejectWithValue(message);
  }
});

export const updateEducation = createAsyncThunk('auth/updateEducation', async ({ educationId, changes }, { rejectWithValue }) => {
  try {
    const response = await axiosInstance.put(`/profile/education/${educationId}`, changes);
    toast.success(response.data.message || 'Education updated successfully');
    return response.data;
  } catch (error) {
    const message = error.response?.data?.message || 'Failed to update education';
    toast.error(message);
    return rejectWithValue(message);
  }
});

export const deleteEducation = createAsyncThunk('auth/deleteEducation', async (educationId, { rejectWithValue }) => {
  try {
    const response = await axiosInstance.delete(`/profile/education/${educationId}`);
   
    return response.data;
  } catch (error) {
    const message = error.response?.data?.message || 'Failed to delete education';
    toast.error(message);
    return rejectWithValue(message);
  }
});

// Links Thunk (update only, since object)
export const updateLinks = createAsyncThunk('auth/updateLinks', async (newLinks, { rejectWithValue }) => {
  try {
    const response = await axiosInstance.put('/profile/update-links', newLinks);
    toast.success(response.data.message || 'Links updated successfully');
    return response.data;
  } catch (error) {
    const message = error.response?.data?.message || 'Failed to update links';
    toast.error(message);
    return rejectWithValue(message);
  }
});

// Projects and Work Thunks (keep as is from previous)
export const addProject = createAsyncThunk('auth/addProject', async (newProject, { rejectWithValue }) => {
  try {
    const response = await axiosInstance.post('/profile/projects', newProject);
    toast.success(response.data.message || 'Project added successfully');
    return response.data;
  } catch (error) {
    const message = error.response?.data?.message || 'Failed to add project';
    toast.error(message);
    return rejectWithValue(message);
  }
});

export const updateProject = createAsyncThunk('auth/updateProject', async ({ projectId, changes }, { rejectWithValue }) => {
  try {
    const response = await axiosInstance.patch(`/profile/projects/${projectId}`, changes);
    toast.success(response.data.message || 'Project updated successfully');
    return response.data;
  } catch (error) {
    const message = error.response?.data?.message || 'Failed to update project';
    toast.error(message);
    return rejectWithValue(message);
  }
});

export const deleteProject = createAsyncThunk('auth/deleteProject', async (projectId, { rejectWithValue }) => {
  try {
    const response = await axiosInstance.delete(`/profile/projects/${projectId}`);
   
    return response.data;
  } catch (error) {
    const message = error.response?.data?.message || 'Failed to delete project';
    toast.error(message);
    return rejectWithValue(message);
  }
});

export const addWork = createAsyncThunk('auth/addWork', async (newWork, { rejectWithValue }) => {
  try {
    const response = await axiosInstance.post('/profile/work', newWork);
    toast.success(response.data.message || 'Work added successfully');
    return response.data;
  } catch (error) {
    const message = error.response?.data?.message || 'Failed to add work';
    toast.error(message);
    return rejectWithValue(message);
  }
});

export const updateWork = createAsyncThunk('auth/updateWork', async ({ workId, changes }, { rejectWithValue }) => {
  try {
    const response = await axiosInstance.patch(`/profile/work/${workId}`, changes);
    toast.success(response.data.message || 'Work updated successfully');
    return response.data;
  } catch (error) {
    const message = error.response?.data?.message || 'Failed to update work';
    toast.error(message);
    return rejectWithValue(message);
  }
});

export const deleteWork = createAsyncThunk('auth/deleteWork', async (workId, { rejectWithValue }) => {
  try {
    const response = await axiosInstance.delete(`/profile/work/${workId}`);
    
    return response.data;
  } catch (error) {
    const message = error.response?.data?.message || 'Failed to delete work';
    toast.error(message);
    return rejectWithValue(message);
  }
});

export const searchSkill = createAsyncThunk('auth/searchSkill', async (skillQuery, { rejectWithValue }) => {
  try {
    if (!skillQuery) {
      // Empty query → return normal user data (handled in component)
      return { hasSkill: null, searchedSkill: '', message: '' };
    }
    const response = await axiosInstance.get(`/profile/search-skill?skill=${encodeURIComponent(skillQuery)}`);
    return response.data;
  } catch (error) {
    const message = error.response?.data?.message || 'Search failed';
    toast.error(message);
    return rejectWithValue(message);
  }
});

const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(createAccount.fulfilled, (state, action) => {
        if (action.payload.user) {
          localStorage.setItem('data', JSON.stringify(action.payload.user));
          localStorage.setItem('isLoggedIn', 'true');
          localStorage.setItem('role', action.payload.user.role || '');
          state.isLoggedIn = true;
          state.data = action.payload.user;
          state.role = action.payload.user.role || '';
        }
      })
      .addCase(login.fulfilled, (state, action) => {
        if (action.payload.user) {
          localStorage.setItem('data', JSON.stringify(action.payload.user));
          localStorage.setItem('isLoggedIn', 'true');
          localStorage.setItem('role', action.payload.user.role || '');
          state.isLoggedIn = true;
          state.data = action.payload.user;
          state.role = action.payload.user.role || '';
        }
      })
      .addCase(logout.fulfilled, (state) => {
        localStorage.clear();
        state.isLoggedIn = false;
        state.data = {};
        state.role = '';
      })
      .addCase(getUserData.fulfilled, (state, action) => {
        if (action.payload.user) {
          localStorage.setItem('data', JSON.stringify(action.payload.user));
          state.data = action.payload.user;
        }
      })
      .addCase(addSkill.fulfilled, (state, action) => {
        if (action.payload.user) {
          localStorage.setItem('data', JSON.stringify(action.payload.user));
          state.data = action.payload.user;
        }
      })
      .addCase(updateSkill.fulfilled, (state, action) => {
        if (action.payload.user) {
          localStorage.setItem('data', JSON.stringify(action.payload.user));
          state.data = action.payload.user;
        }
      })
      .addCase(deleteSkill.fulfilled, (state, action) => {
        if (action.payload.user) {
          localStorage.setItem('data', JSON.stringify(action.payload.user));
          state.data = action.payload.user;
        }
      })
      .addCase(addEducation.fulfilled, (state, action) => {
        if (action.payload.user) {
          localStorage.setItem('data', JSON.stringify(action.payload.user));
          state.data = action.payload.user;
        }
      })
      .addCase(updateEducation.fulfilled, (state, action) => {
        if (action.payload.user) {
          localStorage.setItem('data', JSON.stringify(action.payload.user));
          state.data = action.payload.user;
        }
      })
      .addCase(deleteEducation.fulfilled, (state, action) => {
        if (action.payload.user) {
          localStorage.setItem('data', JSON.stringify(action.payload.user));
          state.data = action.payload.user;
        }
      })
      .addCase(updateLinks.fulfilled, (state, action) => {
        if (action.payload.user) {
          localStorage.setItem('data', JSON.stringify(action.payload.user));
          state.data = action.payload.user;
        }
      })
      .addCase(addProject.fulfilled, (state, action) => {
        if (action.payload.user) {
          localStorage.setItem('data', JSON.stringify(action.payload.user));
          state.data = action.payload.user;
        }
      })
      .addCase(updateProject.fulfilled, (state, action) => {
        if (action.payload.user) {
          localStorage.setItem('data', JSON.stringify(action.payload.user));
          state.data = action.payload.user;
        }
      })
      .addCase(deleteProject.fulfilled, (state, action) => {
        if (action.payload.user) {
          localStorage.setItem('data', JSON.stringify(action.payload.user));
          state.data = action.payload.user;
        }
      })
      .addCase(addWork.fulfilled, (state, action) => {
        if (action.payload.user) {
          localStorage.setItem('data', JSON.stringify(action.payload.user));
          state.data = action.payload.user;
        }
      })
      .addCase(updateWork.fulfilled, (state, action) => {
        if (action.payload.user) {
          localStorage.setItem('data', JSON.stringify(action.payload.user));
          state.data = action.payload.user;
        }
      })
      .addCase(deleteWork.fulfilled, (state, action) => {
        if (action.payload.user) {
          localStorage.setItem('data', JSON.stringify(action.payload.user));
          state.data = action.payload.user;
        }
      })
       .addCase(searchSkill.fulfilled, (state, action) => {
        state.searchResult = action.payload; // Store search result
})
      // Global loading/error handlers
      .addMatcher((action) => action.type.endsWith('/pending'), (state) => {
        state.loading = true;
        state.error = null;
      })
      .addMatcher((action) => action.type.endsWith('/fulfilled'), (state) => {
        state.loading = false;
      })
      .addMatcher((action) => action.type.endsWith('/rejected'), (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
     
  },
});

export default authSlice.reducer;