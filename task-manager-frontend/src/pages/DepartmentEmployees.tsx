import React, { useState } from 'react';
import { useLocation } from 'react-router-dom';
import { IonPage, IonHeader, IonToolbar, IonTitle, IonContent, IonList, IonItem, IonLabel, IonBackButton, IonButtons } from '@ionic/react';

type Employee = {
  id: number;
  name: string;
  designation: string;
  newTasks: string;
  inProgressTasks: string;
  submittedTasks: string;
  completedTasks: string;
};

type LocationState = {
  employees: Employee[];
};

const DepartmentEmployees: React.FC = () => {
  const location = useLocation<LocationState>();
  const employees: Employee[] = location.state?.employees || [];
  const [expandedEmployeeId, setExpandedEmployeeId] = useState<number | null>(null);

  const toggleExpand = (id: number) => {
    setExpandedEmployeeId((prevId) => (prevId === id ? null : id));
  };

  return (
    <IonPage>
      <IonHeader>
        <IonToolbar>
          <IonButtons slot="start">
            <IonBackButton defaultHref='/Departments' />
          </IonButtons>
          <IonTitle>Department Employees</IonTitle>
        </IonToolbar>
      </IonHeader>
      <IonContent>
        {employees.length > 0 ? (
          <IonList>
            {employees.map((employee) => (
              <IonItem key={employee.id} button onClick={() => toggleExpand(employee.id)}>
                <IonLabel>
                  <h2>{employee.name}</h2>
                  <p>{employee.designation}</p>
                  {expandedEmployeeId === employee.id && (
                    <div style={{ marginTop: '10px' }}>
                      <p>New Tasks: {employee.newTasks}</p>
                      <p>In Progress Tasks: {employee.inProgressTasks}</p>
                      <p>Submitted Tasks: {employee.submittedTasks}</p>
                      <p>Completed Tasks: {employee.completedTasks}</p>
                    </div>
                  )}
                </IonLabel>
              </IonItem>
            ))}
          </IonList>
        ) : (
          <p>No employees found.</p>
        )}
      </IonContent>
    </IonPage>
  );
};

export default DepartmentEmployees;