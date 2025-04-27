import React from 'react';
import {
  IonPage, IonHeader, IonToolbar, IonTitle, IonContent, IonButtons,
  IonGrid, IonRow, IonCol, IonButton, IonIcon
} from '@ionic/react';
import {
  calendarOutline, leafOutline, buildOutline, schoolOutline, heartOutline,
  flaskOutline, constructOutline, businessOutline, peopleOutline, earthOutline,
  hammerOutline, gitNetworkOutline, laptopOutline, searchOutline,
  arrowBack,
  logOutOutline
} from 'ionicons/icons';
import { useHistory } from 'react-router-dom';
import { Preferences } from '@capacitor/preferences';
import { getDepartmentEmployees } from '../apis/fetchDepartmentEmployeesAPI';

const departments = [
  { label: "Accounts and Finances", icon: calendarOutline },
  { label: "Agriculture HNT", icon: leafOutline },
  { label: "Instrument", icon: calendarOutline },
  { label: "Agriculture", icon: leafOutline },
  { label: "Purchase", icon: businessOutline },
  { label: "Production", icon: calendarOutline },
  { label: "General", icon: peopleOutline },
  { label: "Environment", icon: earthOutline },
  { label: "Electrical", icon: gitNetworkOutline },
  { label: "Engineering", icon: buildOutline },
  { label: "Education", icon: schoolOutline },
  { label: "Distillery", icon: flaskOutline },
  { label: "Co_Gen", icon: constructOutline },
  { label: "Civil", icon: hammerOutline },
  { label: "Information Technology", icon: laptopOutline },
  { label: "Secretarial", icon: searchOutline },
  { label: "Marketing and Sales", icon: heartOutline },
];

const Departments: React.FC = () => {
  const history = useHistory();

  const goToDepartment = async (label: string) => {
    const storedEmployees = sessionStorage.getItem(`${label}Employees`);
    
    if (storedEmployees) {
      // If employees exist in session storage, use them
      const employees = JSON.parse(storedEmployees);
      history.push({
        pathname: '/DepartmentEmployees',
        state: { employees, label } // Pass the label here
      });
    } else {
      // If not, fetch employees and store them in session storage
      const res = await getDepartmentEmployees(label);
      sessionStorage.setItem(`${label}Employees`, JSON.stringify(res));
      history.push({
        pathname: '/DepartmentEmployees',
        state: { employees: res, label } // Pass the label here
      });
    }
  };

  return (
    <IonPage>
      <IonHeader>
        <IonToolbar>
        <IonButtons slot="end">
        <IonButton onClick={() => history.push('/Status', { from: 'Departments' })}>
          Status Tab
        </IonButton>
        </IonButtons>
          <IonTitle>Departments</IonTitle>
          <IonButtons slot="end">
            <IonButton onClick={() => history.push('/AssignTask')}>+ Assign Task</IonButton>
            <IonButton onClick={async () => {
                await Preferences.remove({ key: 'user' });
                sessionStorage.clear();
                history.replace('/login'); 
                }}>
                  <IonIcon icon={logOutOutline} />
                </IonButton>
          </IonButtons>
        </IonToolbar>
      </IonHeader>

      <IonContent className="ion-padding">
        <IonGrid>
          <IonRow>
            {departments.map((dept, index) => (
              <IonCol size="4" key={index}>
                <IonButton
                  expand="block"
                  fill="clear"
                  onClick={() => goToDepartment(dept.label)}
                  style={{
                    borderRadius: '20px',
                    textTransform: 'none',
                    height: '60px',
                    whiteSpace: 'normal',
                    backgroundColor: 'rgba(17, 0, 255, 0.1)',
                    border: '2px solid #1100FF',
                    color: 'black'
                  }}>
                  <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                    <span style={{ fontSize: '14px', textAlign: 'center' }}>{dept.label}</span>
                    <IonIcon icon={dept.icon} size="small" />
                  </div>
                </IonButton>
              </IonCol>
            ))}
          </IonRow>
        </IonGrid>
      </IonContent>
    </IonPage>
  );
};

export default Departments;