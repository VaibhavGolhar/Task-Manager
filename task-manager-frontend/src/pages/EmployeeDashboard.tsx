import {
    IonPage, IonHeader, IonToolbar, IonTitle, IonContent, IonCard,
    IonCardHeader, IonCardTitle, IonCardContent, IonItem, IonLabel,
    IonBadge, IonButton, IonGrid, IonRow, IonCol,
    IonBackButton,
    IonButtons
  } from '@ionic/react';
  
  import React from 'react';
  
  const EmployeeDashboard: React.FC = () => {
    // Example task data - this should be fetched from backend API
    const assignedTasks = [
      {
        id: 1,
        name: "Submit Report on Inventory",
        assignedBy: "HOD - Logistics",
        status: "In Progress",
        due: "2025-04-08"
      },
      {
        id: 2,
        name: "Vendor Feedback Review",
        assignedBy: "HOD - Procurement",
        status: "Submitted",
        due: "2025-04-05"
      }
    ];
  
    const getBadgeColor = (status: string) => {
      switch (status.toLowerCase()) {
        case "completed": return "success";
        case "submitted": return "tertiary";
        case "in progress": return "warning";
        default: return "medium";
      }
    };
  
    return (
      <IonPage>
        <IonHeader>
          <IonToolbar>
             <IonButtons slot="start">
                <IonBackButton />
            </IonButtons>
            <IonTitle>Employee Dashboard</IonTitle>
          </IonToolbar>
        </IonHeader>
  
        <IonContent className="ion-padding">
          
          <IonCard>
            <IonCardHeader>
              <IonCardTitle>Assigned Tasks</IonCardTitle>
            </IonCardHeader>
            <IonCardContent>
              {assignedTasks.map(task => (
                <IonItem key={task.id}>
                  <IonLabel>
                    <h2>{task.name}</h2>
                    <p>Assigned by: {task.assignedBy} | Due: {task.due}</p>
                  </IonLabel>
                  <IonBadge color={getBadgeColor(task.status)}>{task.status}</IonBadge>
                </IonItem>
              ))}
            </IonCardContent>
          </IonCard>
  
          <IonGrid>
            <IonRow>
              <IonCol>
                <IonButton expand="block" routerLink="/daily-task-update" color="primary">
                  Update Daily Task
                </IonButton>
              </IonCol>
            </IonRow>
          </IonGrid>
  
        </IonContent>
      </IonPage>
    );
  };
  
  export default EmployeeDashboard;
  