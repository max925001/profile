// src/helpers/axiosInstance.js
import axios from 'axios';

const BASE_URL = "https://profile-y2sd.onrender.com/api";


const axiosInstance = axios.create({
  baseURL: BASE_URL,
  withCredentials: true, // important for cookies
});

export default axiosInstance;