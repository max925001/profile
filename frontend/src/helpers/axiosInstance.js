// src/helpers/axiosInstance.js
import axios from 'axios';

const BASE_URL = "http://localhost:5000/api";


const axiosInstance = axios.create({
  baseURL: BASE_URL,
  withCredentials: true, // important for cookies
});

export default axiosInstance;