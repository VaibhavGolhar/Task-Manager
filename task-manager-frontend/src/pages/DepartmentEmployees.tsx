import React, { useState } from 'react';
import { useLocation, useHistory } from 'react-router-dom';
import { IonPage, IonHeader, IonToolbar, IonTitle, IonContent, IonList, IonItem, IonLabel, IonBackButton, IonButtons, IonButton, IonIcon } from '@ionic/react';
import { Preferences } from '@capacitor/preferences';
import { refresh } from 'ionicons/icons';
import { fetchTasks } from '../apis/fetchTasksAPI';
import { getDepartmentEmployees } from '../apis/fetchDepartmentEmployeesAPI';

type Task = {
  taskId: number;
  description: string;
  status: string;
  workingHrs: number;
};

type Employee = {
  id: number;
  name: string;
  designation: string;
  newTasks: number;
  inProgressTasks: number;
  submittedTasks: number;
  completedTasks: number;
  tasks: Task[];
};

type LocationState = {
  employees?: Employee[];
  label?: string;
};

const DepartmentEmployees: React.FC = () => {
  const location = useLocation<LocationState>();
  const history = useHistory();
  const employees: Employee[] = location.state?.employees || [];
  const departmentLabel = location.state?.label; // Get the department label here
  const [expandedEmployeeId, setExpandedEmployeeId] = useState<number | null>(null);

  // Redirect back if no employees data is available
  if (!location.state || !location.state.employees) {
    history.replace('/Departments'); // Redirect to the Departments page
    return null;
  }

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
          <IonTitle>{departmentLabel ? `${departmentLabel} Employees` : 'Department Employees'}</IonTitle>
          <IonButtons slot="end">
            <IonButton
              onClick={async () => {
                if (departmentLabel) {
                  const res = await getDepartmentEmployees(departmentLabel);
                  sessionStorage.setItem(`${departmentLabel}Employees`, JSON.stringify(res));
                  history.replace({
                    pathname: '/DepartmentEmployees',
                    state: { employees: res, label: departmentLabel },
                  });
                }
              }}
            >
              <IonIcon icon={refresh} />
            </IonButton>
          </IonButtons>
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
                      <h3>Task Details:</h3>
                      <ul>
                        {employee.tasks.map((task) => (
                          <li key={task.taskId}>
                            <p><strong>Description:</strong> {task.description}</p>
                            <p><strong>Status:</strong> {task.status}</p>
                            <p><strong>Working Hours:</strong> {task.workingHrs}</p>
                          </li>
                        ))}
                      </ul>
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