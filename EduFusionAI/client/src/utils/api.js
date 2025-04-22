import { mockApiRequest } from "../mock/mockApi";

// Use mock API for now
const useMockApi = true;

// Actual API request function
export const apiRequest = async (endpoint, method = "GET", data = null) => {
  try {
    // Use mock API for development/demo
    if (useMockApi) {
      return await mockApiRequest(endpoint, method, data);
    }
    
    // Configure the request
    const config = {
      method,
      headers: {
        "Content-Type": "application/json",
      },
    };
    
    // Add token if available
    const storedUser = localStorage.getItem("user");
    if (storedUser) {
      const { token } = JSON.parse(storedUser);
      if (token) {
        config.headers["Authorization"] = `Bearer ${token}`;
      }
    }
    
    // Add request body if data is provided
    if (data) {
      config.body = JSON.stringify(data);
    }
    
    // Make the request
    const response = await fetch(`/api${endpoint}`, config);
    const responseData = await response.json();
    
    if (!response.ok) {
      throw new Error(responseData.message || "An error occurred");
    }
    
    return responseData;
  } catch (error) {
    console.error("API Error:", error);
    throw error;
  }
};

// Helper functions for common API operations
export const fetchExams = async (role) => {
  try {
    const response = await apiRequest("/exams");
    return response.exams || [];
  } catch (error) {
    console.error("Error fetching exams:", error);
    return [];
  }
};

export const fetchActiveExams = async () => {
  try {
    const response = await apiRequest("/exams/active");
    return response.exams || [];
  } catch (error) {
    console.error("Error fetching active exams:", error);
    return [];
  }
};

export const createExam = async (examData) => {
  try {
    const response = await apiRequest("/exams", "POST", examData);
    return response.exam;
  } catch (error) {
    console.error("Error creating exam:", error);
    throw error;
  }
};

export const enrollInExam = async (examId) => {
  try {
    const userData = JSON.parse(localStorage.getItem("user") || "{}");
    const response = await apiRequest("/enrollments", "POST", {
      examId,
      studentId: userData.id,
    });
    return response.enrollment;
  } catch (error) {
    console.error("Error enrolling in exam:", error);
    throw error;
  }
};

export const startExam = async (enrollmentId) => {
  try {
    const response = await apiRequest(`/enrollments/${enrollmentId}/start`, "POST");
    return response.enrollment;
  } catch (error) {
    console.error("Error starting exam:", error);
    throw error;
  }
};

export const completeExam = async (enrollmentId, completionPercentage = 100) => {
  try {
    const response = await apiRequest(
      `/enrollments/${enrollmentId}/complete`, 
      "POST", 
      { completionPercentage }
    );
    return response.enrollment;
  } catch (error) {
    console.error("Error completing exam:", error);
    throw error;
  }
};

export const getAlertsForExam = async (examId) => {
  try {
    const response = await apiRequest(`/alerts/exam/${examId}`);
    return response.alerts || [];
  } catch (error) {
    console.error("Error fetching alerts:", error);
    return [];
  }
};

export const updateAlertStatus = async (alertId, status) => {
  try {
    const response = await apiRequest(`/alerts/${alertId}`, "PATCH", { status });
    return response.alert;
  } catch (error) {
    console.error("Error updating alert:", error);
    throw error;
  }
};

export const getEnrollmentsForExam = async (examId) => {
  try {
    const response = await apiRequest(`/enrollments/exam/${examId}`);
    return response.students || [];
  } catch (error) {
    console.error("Error fetching enrollments:", error);
    return [];
  }
};

export const endExam = async (examId) => {
  try {
    const response = await apiRequest(`/exams/${examId}/end`, "POST");
    return response.exam;
  } catch (error) {
    console.error("Error ending exam:", error);
    throw error;
  }
};

export const getQuestionsForExam = async (examId) => {
  try {
    const response = await apiRequest(`/exams/${examId}/questions`);
    return response.questions || [];
  } catch (error) {
    console.error("Error fetching questions:", error);
    return [];
  }
};

export const getStudentsForExam = async (examId) => {
  try {
    const response = await apiRequest(`/enrollments/exam/${examId}`);
    return response.students || [];
  } catch (error) {
    console.error("Error fetching students:", error);
    return [];
  }
};

export const getMonitoringDataForStudent = async (examId, studentId) => {
  try {
    const response = await apiRequest(`/monitoring/${examId}/student/${studentId}`);
    return response.monitoringData;
  } catch (error) {
    console.error("Error fetching monitoring data:", error);
    throw error;
  }
};
