import axios from 'axios';

type Employee = { id: number; name: string; designation: string; newTasks: string[]; inProgressTasks: string[]; submittedTasks: string[]; completedTasks: string[]; };

const API_BASE_URL = 'http://localhost:8080';

export const getDepartmentEmployees = async (departmentName: string): Promise<Employee[]> => {
  try {
    const response = await axios.post(`${API_BASE_URL}/api/getDepartmentEmployees`, { departmentName });
    if (response.status !== 200) throw new Error('Failed to fetch employees');
    const employees: Employee[] = response.data;
    //console.log('Fetched employees:', employees);
    return employees;
  } catch (error) {
    alert(error);
    console.error('Error in getEmployees:', error);
    throw error;
  }
};