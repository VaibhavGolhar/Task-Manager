import axios from 'axios';

const API_BASE_URL = 'http://localhost:8080';

export const dailyTaskUpdate = async (req: FormData): Promise<{status: number, message: string }> => {
    try {
        console.log('Request in dailyTaskUpdate:', req.get('userId'), req.get('taskId'), req.get('hours'), req.get('remark'));

        const response = await axios.post(`${API_BASE_URL}/api/dailyTaskUpdate`, req, {
            headers: {
            'Content-Type': 'multipart/form-data',
            },
        });

        if (response.status === 200) {
            return { status : 200,  message: 'Task updated successfully' };
        } else {
            return { status : 400, message: 'Failed to update task' };
        }
    } catch (error) {
        console.error('Error in dailyTaskUpdate:', error);
        return { status : 500, message: 'Error occurred while updating task' };
    }

}