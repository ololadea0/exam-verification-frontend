import axiosInstance from "./axiosInstance";

const API_BASE_URL = "/courses";

const getErrorMessage = (error) => {
  return (
    error?.response?.data?.message ||
    error.message ||
    "An unknown error occurred."
  );
};

const getCourses = async (params = {}) => {
  try {
    const response = await axiosInstance.get(API_BASE_URL, { params });
    return response.data;
  } catch (error) {
    throw new Error(getErrorMessage(error), { cause: error });
  }
};

const createCourse = async (courseData) => {
  try {
    const response = await axiosInstance.post(API_BASE_URL, courseData);
    return response.data;
  } catch (error) {
    throw new Error(getErrorMessage(error), { cause: error });
  }
};

const deleteCourse = async (id) => {
  try {
    const response = await axiosInstance.delete(`${API_BASE_URL}/${id}`);
    return response.data;
  } catch (error) {
    throw new Error(getErrorMessage(error), { cause: error });
  }
};

const courseService = { getCourses, createCourse, deleteCourse };

export default courseService;
