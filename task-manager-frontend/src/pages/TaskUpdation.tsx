import { Preferences } from '@capacitor/preferences';
import {
  IonPage, IonHeader, IonToolbar, IonTitle, IonContent, IonItem, IonLabel,
  IonSelect, IonSelectOption, IonInput, IonTextarea, IonButton,
  IonGrid, IonRow, IonCol,
  IonBackButton,
  IonButtons
} from '@ionic/react';
import React, { useState, useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import { dailyTaskUpdate } from '../apis/dailyTaskUpdateAPI';
import { updateTask } from '../apis/updateTaskAPI';
import { fetchTasks } from '../apis/fetchTasksAPI';

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

const DailyTaskUpdate: React.FC = () => {
  const location = useLocation();
  const [taskId, setTaskId] = useState<string | null>(null);
  const [task, setTask] = useState('');
  const [status, setStatus] = useState('');
  const [file, setFile] = useState<File | null>(null);
  const [estHours, setEstHours] = useState<string | null>(null);
  const [hours, setHours] = useState('');
  const [remark, setRemark] = useState('');
  const [fromDate, setFromDate] = useState<string | null>(null);
  const [toDate, setToDate] = useState<string | null>(null);
  const userId = React.useRef<string | null>(null);

  // Extract taskId from query parameters
  useEffect(() => {
    const queryParams = new URLSearchParams(location.search);
    const id = queryParams.get('taskId');
    setTaskId(id);

    if (id) {
      // Fetch task details from sessionStorage
      const storedTasks = sessionStorage.getItem('tasks');
      if (storedTasks) {
        const tasks = JSON.parse(storedTasks);
        const selectedTask = tasks.find((t: Task) => t.taskId === id);
        console.log('Selected Task:', selectedTask);
        if (selectedTask) {
          setTask(selectedTask.taskHead);
          setFromDate(selectedTask.fromDate);
          setToDate(selectedTask.toDate);
          setEstHours(selectedTask.estHours);
        }
      }
    }

    const fetchUserId = async () => {
        const { value } = await Preferences.get({ key: 'user' });
        if (value) {
            const user = JSON.parse(value);
            userId.current = user.empId;
        }
    }
    fetchUserId();
  }, [location.search]);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files?.length) setFile(e.target.files[0]);
  };

  const formatDate = (isoString: string) => {
    const date = new Date(isoString);
    return date.toLocaleDateString('en-GB'); // e.g., "06/04/2025"
  };

  

    const handleSubmit = async () => {
        if (!userId.current || !taskId) {
            console.error('User ID or Task ID is missing');
            return;
        }

        const formData = new FormData();
        formData.append('userId', userId.current);
        formData.append('taskId', taskId);
        if (file) formData.append('file', file);
        formData.append('hours', hours);
        formData.append('remark', remark);
        //console.log('Form Data:', formData.get('userId'), formData.get('taskId'), formData.get('hours'), formData.get('remark'));
        try {
            const response = await dailyTaskUpdate(formData);
            if (response.status == 200) {
                console.log('Task updated successfully');
                if (status === 'submitted') {
                    const res = await updateTask(parseInt(taskId), status);
                    if (res !== 'ok') {
                        console.log('Task could not be updated.');
                    }
                    
                    try {
                            const pref = await Preferences.get({ key: 'user' });
                            if (pref.value) {
                              const user = JSON.parse(pref.value);
                              const empId = user.empId.toString();
                              const fetchedTasks = await fetchTasks(empId);
                              sessionStorage.setItem('tasks', JSON.stringify(fetchedTasks));
                              //console.log('Tasks refreshed:', fetchedTasks);
                            }
                          } catch (err) {
                            console.error('Failed to refresh tasks:', err);
                          }
                }
                window.history.back();
            } else {
                console.error('Failed to update task:', response.message);
            }
        } catch (error) {
            console.error('Error while updating task:', error);
        }
    };


  return (
    <IonPage>
      <IonHeader>
        <IonToolbar>
             <IonButtons slot="start">
                        <IonButton>
                           <IonBackButton defaultHref='/Status'/>
                        </IonButton>
                    </IonButtons>
          <IonTitle>Daily Task Updation</IonTitle>
        </IonToolbar>
      </IonHeader>
      <IonContent className="ion-padding">

        <IonItem>
          <IonLabel position="stacked">Task</IonLabel>
          <IonInput value={task} readonly />
        </IonItem>

        <IonItem>
          <IonLabel position="stacked">From Date</IonLabel>
          <IonInput
            readonly
            value={fromDate ? formatDate(fromDate) : 'No Date Available'}
            placeholder="Select From Date"
          />
        </IonItem>

        <IonItem>
          <IonLabel position="stacked">To Date</IonLabel>
          <IonInput
            readonly
            value={toDate ? formatDate(toDate) : 'No Date Available'}
            placeholder="Select To Date"
          />
        </IonItem>


        <IonItem>
          <IonLabel position="stacked">Total Estimated Hours</IonLabel>
          <IonInput type="number" value={estHours} readonly />
        </IonItem>

        <IonItem>
          <IonLabel position="stacked">Status</IonLabel>
          <IonSelect value={status} placeholder="Select Status" onIonChange={e => setStatus(e.detail.value)}>
            <IonSelectOption value="inprocess">In Process</IonSelectOption>
            <IonSelectOption value="submitted">Submitted</IonSelectOption>
          </IonSelect>
        </IonItem>

        <IonItem>
          <IonLabel position="stacked">File Upload</IonLabel>
          <input type="file" accept="image/*" onChange={handleFileChange} />
        </IonItem>

        <IonItem>
          <IonLabel position="stacked">Actual Working Hours (Today)</IonLabel>
          <IonInput type="text" value={hours} placeholder="e.g., 8+3" onIonChange={e => setHours(e.detail.value!)} />
        </IonItem>

        <IonItem>
          <IonLabel position="stacked">Remarks / Comments</IonLabel>
          <IonTextarea 
            placeholder="Remarks" 
            onIonChange={e => setRemark(e.detail.value!)} 
          />
        </IonItem>

        <IonGrid>
          <IonRow>
            <IonCol>
              <IonButton expand="block" color="primary" onClick={handleSubmit}>Submit</IonButton>
            </IonCol>
            <IonCol>
              <IonButton expand="block" color="medium" onClick={() => window.history.back()}>Close</IonButton>
            </IonCol>
          </IonRow>
        </IonGrid>

      </IonContent>
    </IonPage>
  );
};

export default DailyTaskUpdate;
