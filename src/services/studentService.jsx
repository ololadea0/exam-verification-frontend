import axiosInstance from "./axiosInstance";

const API_BASE_URL = "/students";

// Helper function to extract error message
const getErrorMessage = (error) => {
  const details = error?.response?.data?.details || error?.response?.data?.debug;
  const message =
    error?.response?.data?.message ||
    error.message ||
    "An unknown error occurred.";

  if (details && details !== message) {
    return `${message} Details: ${details}`;
  }

  return message;
};

// Register Student
const registerStudent = async (studentData) => {
  try {
    const response = await axiosInstance.post(
      `${API_BASE_URL}/register`,
      studentData,
    );
    return response.data;
  } catch (error) {
    throw new Error(getErrorMessage(error), { cause: error });
  }
};

// Edit Student
const editStudent = async (id, studentData) => {
  try {
    const response = await axiosInstance.put(
      `${API_BASE_URL}/${id}`,
      studentData,
    );
    return response.data;
  } catch (error) {
    throw new Error(getErrorMessage(error), { cause: error });
  }
};

// Re-register Student Face
const reregisterStudentFace = async (id, faceData) => {
  try {
    const response = await axiosInstance.put(
      `${API_BASE_URL}/${id}/face`,
      faceData,
    );
    return response.data;
  } catch (error) {
    throw new Error(getErrorMessage(error), { cause: error });
  }
};

// Get All Students
const getStudents = async (params = {}) => {
  try {
    const response = await axiosInstance.get(`${API_BASE_URL}`, { params });
    return response.data;
  } catch (error) {
    throw new Error(getErrorMessage(error), { cause: error });
  }
};

// Delete Student
const deleteStudent = async (id) => {
  try {
    const response = await axiosInstance.delete(`${API_BASE_URL}/${id}`);
    return response.data;
  } catch (error) {
    throw new Error(getErrorMessage(error), { cause: error });
  }
};

const studentService = {
  registerStudent,
  editStudent,
  reregisterStudentFace,
  getStudents,
  deleteStudent,
};

export default studentService;
