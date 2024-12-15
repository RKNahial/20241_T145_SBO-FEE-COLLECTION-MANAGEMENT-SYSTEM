import axios from 'axios';

export const updateStudent = async (studentId, updateData) => {
  try {
    const response = await axios.put(`/api/students/${studentId}`, updateData);
    return response.data;
  } catch (error) {
    throw error;
  }
}; 