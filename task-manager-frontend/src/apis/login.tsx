import axios from 'axios';

const API_BASE_URL = 'http://localhost:8080';

interface LoginResponse {
  message: string;
  user?: {
    empId: number;
    employeeName: string;
    designation: string;
  };
  redirectTo?: string;
}

export const loginUser = async (username: bigint, password: bigint): Promise<{ status: number; data: LoginResponse }> => {
  try {
    const response = await axios.post(`${API_BASE_URL}/api/login`, {
      empId: username.toString(),
      password: password.toString(),
    });

    return {
      status: response.status,
      data: response.data
    };
  } catch (error: unknown) {
   //alert(error);
    // If error response exists, return its status and message
    if (axios.isAxiosError(error) && error.response) {
      return {
        status: error.response.status,
        data: error.response.data as LoginResponse,
      };
    }

    // Otherwise, return generic error
    return {
      status: 500,
      data: { message: 'Something went wrong.' },
    };
  }
};
