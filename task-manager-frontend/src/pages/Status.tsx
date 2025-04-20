import React, { useState, useEffect } from 'react';
import {
  IonPage, IonHeader, IonToolbar, IonTitle, IonContent,
  IonSegment, IonSegmentButton, IonLabel, IonCard, IonCardHeader,
  IonCardTitle, IonCardContent, IonButton, IonButtons,
  IonBackButton,
  IonIcon
} from '@ionic/react';
import { useHistory } from 'react-router-dom';
import { Preferences } from '@capacitor/preferences';
import { logOutOutline, refresh } from 'ionicons/icons';
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
  status: string;
};

const TaskStatus: React.FC = () => {
  const history = useHistory();

  const [tasks, setTasks] = useState<Task[]>([]);
  const [selectedStatus, setSelectedStatus] = useState<'new' | 'inProgress' | 'submitted' | 'completed'>('new');
  const [expandedTaskId, setExpandedTaskId] = useState<string | null>(null);

  useEffect(() => {
    const loadTasks = async () => {
      try {
        const storedTasks = sessionStorage.getItem('tasks');
        if (storedTasks) {
          setTasks(JSON.parse(storedTasks) as Task[]);
        } else {
          const pref = await Preferences.get({ key: 'user' });
          if (pref.value) {
            const user = JSON.parse(pref.value);
            const empId = user.empId.toString();
            const fetchedTasks = await fetchTasks(empId);
            setTasks(fetchedTasks as unknown as Task[]);
            sessionStorage.setItem('tasks', JSON.stringify(fetchedTasks));
          }
        }
      } catch (err) {
        console.error('Failed to load tasks:', err);
      }
    };

    loadTasks();
  }, []);

  const updateStatus = (id: number, newStatus: Task['status']) => {
    setTasks(prev =>
      prev.map(task => (parseInt(task.taskId) === id ? { ...task, status: newStatus } : task))
    );
  };

  const filteredTasks = tasks.filter(task => task.status === selectedStatus);

  return (
    <IonPage>
      <IonHeader>
        <IonToolbar>
          <IonButtons slot="start">
            <IonBackButton />
          </IonButtons>
          <IonTitle>Status</IonTitle>
          <IonButtons slot="end">
            <IonButton onClick={async () => {
              try {
                const pref = await Preferences.get({ key: 'user' });
                if (pref.value) {
                  const user = JSON.parse(pref.value);
                  const empId = user.empId.toString();
                  const fetchedTasks = await fetchTasks(empId);
                  setTasks(fetchedTasks as unknown as Task[]);
                  sessionStorage.setItem('tasks', JSON.stringify(fetchedTasks));
                  //console.log('Tasks refreshed:', fetchedTasks);
                }
              } catch (err) {
                console.error('Failed to refresh tasks:', err);
              }
            }}>
              <IonIcon icon={refresh} />
            </IonButton>
            <IonButton onClick={() => history.push('/AssignTask')}>+ Assign Task</IonButton>
            <IonButton onClick={async () => {
              await Preferences.remove({ key: 'user' });
              history.replace('/login');
              sessionStorage.clear();
            }}>
              <IonIcon icon={logOutOutline} />
            </IonButton>
          </IonButtons>
        </IonToolbar>
      </IonHeader>

      <IonContent className={`ion-padding status-${selectedStatus}`}>
        <div className="status-buttons ion-text-center ion-margin-bottom">
          <IonSegment value={selectedStatus} onIonChange={(e: CustomEvent) => setSelectedStatus(e.detail.value as 'new' | 'inProgress' | 'submitted' | 'completed')}>
            <IonSegmentButton value="new"><IonLabel>New Tasks ({tasks.filter(t => t.status === 'new').length})</IonLabel></IonSegmentButton>
            <IonSegmentButton value="inProgress"><IonLabel>In Process ({tasks.filter(t => t.status === 'inProgress').length})</IonLabel></IonSegmentButton>
            <IonSegmentButton value="submitted"><IonLabel>Submitted ({tasks.filter(t => t.status === 'submitted').length})</IonLabel></IonSegmentButton>
            <IonSegmentButton value="completed"><IonLabel>Completed ({tasks.filter(t => t.status === 'completed').length})</IonLabel></IonSegmentButton>
          </IonSegment>
        </div>

        {filteredTasks.map(task => (
          <IonCard key={task.taskId} color="light" onClick={() => setExpandedTaskId(expandedTaskId === task.taskId ? null : task.taskId)}>
            <IonCardHeader>
              <IonCardTitle>{task.taskHead}</IonCardTitle>
              <p>{"From: " + task.fromDate} <br /> {"To: " + task.toDate}</p>
              <p><strong>Assigned By:</strong> {task.assignByName + ", " + task.assignByDesignation}</p>
            </IonCardHeader>
            <IonCardContent>
              {expandedTaskId === task.taskId && (
                <p><strong>Description:</strong> {task.task}</p>
              )}

              {/* Buttons based on status */}
              {task.status === 'new' && (
                <IonButtons>
                  <IonButton onClick={() => updateStatus(parseInt(task.taskId), 'inProgress')}>Start</IonButton>
                  <IonButton color="medium" fill="outline">Close</IonButton>
                </IonButtons>
              )}
              {task.status === 'inProgress' && (
                <IonButtons>
                  <IonButton onClick={() => updateStatus(parseInt(task.taskId), 'submitted')}>Submit</IonButton>
                  <IonButton color="medium" fill="outline">Close</IonButton>
                </IonButtons>
              )}
              {task.status === 'submitted' && (
                <IonButtons>
                  <IonButton onClick={() => updateStatus(parseInt(task.taskId), 'completed')}>Mark Completed</IonButton>
                  <IonButton onClick={() => updateStatus(parseInt(task.taskId), 'inProgress')} color="warning">Unsubmit</IonButton>
                </IonButtons>
              )}
              {task.status === 'completed' && (
                <IonLabel color="success">✔️ Task Completed</IonLabel>
              )}
            </IonCardContent>
          </IonCard>
        ))}
      </IonContent>
    </IonPage>
  );
};

export default TaskStatus;