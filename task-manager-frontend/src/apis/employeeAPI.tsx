import axios from 'axios';

type Employee = { id: number; name: string };

const API_BASE_URL = 'http://localhost:8080';

export const getEmployees = async (): Promise<Employee[]> => {
  try {
    const response = await axios.get(`${API_BASE_URL}/api/employees`);
    if (response.status !== 200) throw new Error('Failed to fetch employees');
    const employees: Employee[] = response.data;
    return employees;
  } catch (error) {
    alert(error);
    console.error('Error in getEmployees:', error);
    throw error;
  }
};