import axios from 'axios';

const API_BASE_URL = 'http://localhost:8080';

type task = {
    department: string;
    taskHead: string;
    task: string;
    assignToId: string[];
    assignById: string;
    priority: string;
    fromDate: string;
    toDate: string;
    estHours: string;
};

export const assignTask = async (req: task): Promise<{status:number, taskId : number[]}> => {
  const { department, taskHead, task, assignToId, assignById, priority, fromDate, toDate, estHours } = req;
  const insertedTaskIds = [];


  try{

      const result = await axios.post(`${API_BASE_URL}/api/assignTask`, {
          TaskTypeId: null,
          TaskDesc: task,
          DeptId: department,
          AssignToId: assignToId,
          AssignById: assignById,
          Priority: priority.toLowerCase(),
          TaskCreateDate: new Date(),
          fromDate: fromDate,
          FromTime: toDate,
          toDate: toDate,
          EndTime: toDate,
          EstimateHrs: estHours,
          Remark: taskHead,
          ActualEndDate: null,
          ActualEndTime: null,
          CreatedBy: assignById,
          CreatedByDate: new Date(),
          Status: 'new'
      });
      insertedTaskIds.push(result.data.taskId || null);
  } 
  catch (error) {
      console.error('Error in assignTask:', error);
      alert(error);
      throw error;
  }

  return { status: 201, taskId: insertedTaskIds };
};