import React, { useState } from 'react';
import {
  IonPage, IonHeader, IonToolbar, IonTitle, IonContent,
  IonSegment, IonSegmentButton, IonLabel, IonCard, IonCardHeader,
  IonCardTitle, IonCardContent, IonButton, IonButtons,
  IonBackButton,
  IonIcon
} from '@ionic/react';
import { useHistory } from 'react-router-dom'; // Import useHistory
import { Preferences } from '@capacitor/preferences';
import { logOutOutline } from 'ionicons/icons';

type Task = {
  id: number;
  title: string;
  desc?: string;
  assignedTo?: string;
  status: 'new' | 'inProgress' | 'submitted' | 'completed';
  date: string;
};

const TaskStatus: React.FC = () => {
  const history = useHistory(); // Hook for navigation

  const [tasks, setTasks] = useState<Task[]>([
    { id: 1, title: 'Task One', status: 'new', date: '24/03 - 26/03' },
    { id: 2, title: 'Task Two', status: 'new', date: '25/03 - 28/03' },
    { id: 3, title: 'Task Three', status: 'submitted', date: '24/03 - 26/03', desc: 'Desc here', assignedTo: 'HOD' },
    { id: 4, title: 'Task Four', status: 'inProgress', date: '26/03 - 29/03' },
    { id: 5, title: 'Task Five', status: 'completed', date: '22/03 - 24/03' },
  ]);

  const [selectedStatus, setSelectedStatus] = useState<'new' | 'inProgress' | 'submitted' | 'completed'>('new');

  const updateStatus = (id: number, newStatus: Task['status']) => {
    setTasks(prev =>
      prev.map(task => (task.id === id ? { ...task, status: newStatus } : task))
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
            <IonButton onClick={() => history.push('/AssignTask')}>+ Assign Task</IonButton>
            <IonButton onClick={async () => {
              await Preferences.remove({ key: 'user' });
              history.replace('/login'); 
              }}>
              <IonIcon icon={logOutOutline} />
            </IonButton>
            </IonButtons>
        </IonToolbar>
      </IonHeader>

      <IonContent className={`ion-padding status-${selectedStatus}`}>

        <div className="status-buttons ion-text-center ion-margin-bottom">
          <IonSegment value={selectedStatus} onIonChange={(e: CustomEvent) => setSelectedStatus(e.detail.value as Task['status'])}>
            <IonSegmentButton value="new"><IonLabel>New Tasks ({tasks.filter(t => t.status === 'new').length})</IonLabel></IonSegmentButton>
            <IonSegmentButton value="inProgress"><IonLabel>In Process ({tasks.filter(t => t.status === 'inProgress').length})</IonLabel></IonSegmentButton>
            <IonSegmentButton value="submitted"><IonLabel>Submitted ({tasks.filter(t => t.status === 'submitted').length})</IonLabel></IonSegmentButton>
            <IonSegmentButton value="completed"><IonLabel>Completed ({tasks.filter(t => t.status === 'completed').length})</IonLabel></IonSegmentButton>
          </IonSegment>
        </div>

        {filteredTasks.map(task => (
          <IonCard key={task.id} color="light">
            <IonCardHeader>
              <IonCardTitle>{task.title}</IonCardTitle>
              <p>{task.date}</p>
            </IonCardHeader>
            <IonCardContent>
              {task.desc && <p><strong>Description:</strong> {task.desc}</p>}
              {task.assignedTo && <p><strong>Assigned to:</strong> {task.assignedTo}</p>}

              {/* Buttons based on status */}
              {task.status === 'new' && (
                <IonButtons>
                  <IonButton onClick={() => updateStatus(task.id, 'inProgress')}>Start</IonButton>
                  <IonButton color="medium" fill="outline">Close</IonButton>
                </IonButtons>
              )}
              {task.status === 'inProgress' && (
                <IonButtons>
                  <IonButton onClick={() => updateStatus(task.id, 'submitted')}>Submit</IonButton>
                  <IonButton color="medium" fill="outline">Close</IonButton>
                </IonButtons>
              )}
              {task.status === 'submitted' && (
                <IonButtons>
                  <IonButton onClick={() => updateStatus(task.id, 'completed')}>Mark Completed</IonButton>
                  <IonButton onClick={() => updateStatus(task.id, 'inProgress')} color="warning">Unsubmit</IonButton>
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