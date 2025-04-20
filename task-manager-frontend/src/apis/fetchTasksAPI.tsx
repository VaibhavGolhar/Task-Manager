import axios from 'axios';

const API_BASE_URL = 'http://localhost:8080';

type Task = {
    taskId: string;
    department: string;
    taskHead: string;
    task: string;
    assignToId: string;
    assignById: string;
    assignByName: string;
    assignByDesignation: string;
    priority: string;
    fromDate: string;
    toDate: string;
    estHours: string;
    status:string;
};

export const fetchTasks = async (empId: string): Promise<Task[]> => {
    try {
        const response = await axios.post(`${API_BASE_URL}/api/fetchTasks`, { empId });
        //console.log('Fetched tasks:', response.data.tasks);
        return response.data.tasks;
    } catch (error) {
        console.error('Error fetching tasks:', error);
        return [];
    }
}