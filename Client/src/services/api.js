import axios from 'axios';

const API_URL = 'http://localhost:8000/api'; // Adjust to your backend URL

export const studentAPI = {
  // Get all students
  getAllStudents: async () => {
    try {
      const response = await axios.get(`${API_URL}/students`);
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  // Get single student
  getStudent: async (id) => {
    try {
      const response = await axios.get(`${API_URL}/students/${id}`);
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  // Update student
  updateStudent: async (id, data, user) => {
    try {
      const response = await axios.put(
        `${API_URL}/students/${id}`, 
        data,
        {
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${user.token}`
          }
        }
      );
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  // Get student activity logs
  getStudentLogs: async (id) => {
    try {
      const response = await axios.get(`${API_URL}/students/${id}/logs`);
      return response.data;
    } catch (error) {
      throw error;
    }
  }
};

export const paymentAPI = {
    updatePayment: async (studentId, paymentData, user) => {
        try {
            const response = await axios.put(
                `${API_URL}/payments/update/${studentId}`,
                paymentData,
                {
                    headers: {
                        'Content-Type': 'application/json',
                        'Authorization': `Bearer ${user.token}` // Include auth token
                    }
                }
            );
            return response.data;
        } catch (error) {
            throw error;
        }
    }
}; 