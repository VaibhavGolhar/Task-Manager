import axios from 'axios';
const API_BASE_URL = 'http://localhost:8080';

export const updateTask = async (taskId: number, newStatus: string) => {
    try {
        const response = await axios.post(`${API_BASE_URL}/api/updateTask`, { taskId, newStatus });
        if(response.status !== 200) {
            alert('Failed to update task, please try again later.');
        }
        console.log(response.data.message);
        return "ok";
    } catch (error) {
        console.error('Error updating task:', error);
        throw error;
    }
}