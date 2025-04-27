import React, { useEffect, useState } from 'react';
import {
  IonPage, IonHeader, IonToolbar, IonTitle, IonContent,
  IonItem, IonLabel, IonInput, IonButton, IonDatetime, IonSelect, IonSelectOption,
  IonTextarea, IonIcon, IonModal,
  IonButtons,
  IonBackButton, IonSearchbar, IonList
} from '@ionic/react';
import { person, createOutline, ellipsisVertical } from 'ionicons/icons';
import { getEmployees } from '../apis/employeeAPI';
import { assignTask } from '../apis/assignTaskAPI';
import { Preferences } from '@capacitor/preferences';

const AssignTask: React.FC = () => {
  const [empId, setEmpId] = useState('');
  const [department, setDepartment] = useState('');
  const [taskHead, setTaskHead] = useState('');
  const [task, setTask] = useState('');
  const [assignTo, setAssignTo] = useState<string[]>([]);
  const [assignToId, setAssignToId] = useState<number[]>([]);
  const [employeeInput, setEmployeeInput] = useState('');
  const [assignBy, setAssignBy] = useState('');
  const [assignById, setAssignById] = useState('');
  const [priority, setPriority] = useState('');
  const [fromDate, setFromDate] = useState('');
  const [toDate, setToDate] = useState('');
  const [estHours, setEstHours] = useState('');
  const [showFromModal, setShowFromModal] = useState(false);
  const [showToModal, setShowToModal] = useState(false);
  const departments = [
    "Accounts and Finances", "Agriculture HNT", "Instrument", "Agriculture",
    "Purchase", "Production", "General", "Environment", "Electrical",
    "Engineering", "Education", "Distillery", "Co_Gen", "Civil",
    "Information Technology", "Secretarial", "Marketing and Sales"
  ];
  const [showDepartmentModal, setShowDepartmentModal] = useState(false);
  const [filteredDepartments, setFilteredDepartments] = useState(departments);
  const [employees, setEmployees] = useState<{
    department: string; id: number; name: string 
}[]>([]);
  const [filteredEmployees, setFilteredEmployees] = useState<{ id: number; name: string }[]>([]);
  const [showEmployeeSuggestions, setShowEmployeeSuggestions] = useState(false);
  const [showAssignBySuggestions, setShowAssignBySuggestions] = useState(false); // Separate state for Assign By suggestions
  const [filteredAssignByEmployees, setFilteredAssignByEmployees] = useState<{ id: number; name: string }[]>([]); // Separate filtered employees for Assign By

  useEffect(() => {
    const fetchUserInfo = async () => {
      const { value } = await Preferences.get({ key: 'user' });
      if (value) {
        const user = JSON.parse(value);
        setAssignBy(user.employeeName);
        setAssignById(user.empId); // Extract `employeeName` from the stored user object
        setEmpId(user.empId);
      }
    };

    const fetchEmployees = async () => {
      try {
        const cached = sessionStorage.getItem('employeeData');
        let data;
        if (cached) {
          data = JSON.parse(cached);
        } else {
          data = await getEmployees();
          //console.log(JSON.stringify(data));
          sessionStorage.setItem('employeeData', JSON.stringify(data));
        }
        setEmployees(data);
        console.log("Fetched employees:", data); // Debugging
      } catch (error) {
        console.error("Error fetching employees:", error);
      }
    }

    fetchEmployees();
    fetchUserInfo();
  }, []);

  const formatDate = (value: string) => {
    return new Date(value).toLocaleDateString('en-GB'); // dd/mm/yyyy
  };

  const handleSubmit = async () => {
    const formData = {
      department,
      taskHead,
      task,
      assignToId: assignToId.map(id => id.toString()), // send as string[]
      assignById: assignById.toString(), // send as string
      priority,
      fromDate,
      toDate,
      estHours // convert to BigInt as required by API
    };
  
    console.log("Task Submitted:", {
      ...formData,
      estHours: estHours.toString() // Convert BigInt to string for logging
    });
  
    const response = await assignTask(formData);
    if (response.status === 201) {
      alert('Task assigned successfully');
      window.location.href = '/Status';
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
          <IonTitle>Assign Task</IonTitle>
        </IonToolbar>
      </IonHeader>

      <IonContent className="ion-padding">
        <div style={{ backgroundColor: '#d6eaff', borderRadius: '12px', padding: '16px' }}>

          <IonItem button onClick={() => setShowDepartmentModal(true)}>
            <IonLabel position="stacked">Department</IonLabel>
            <IonInput value={department} placeholder="Select Department" readonly />
            <IonIcon slot="end" icon={createOutline} />
          </IonItem>

          <IonItem>
            <IonLabel position="stacked">Task Head</IonLabel>
            <IonInput
              value={taskHead}
              onIonChange={e => setTaskHead(e.detail.value!)}
              placeholder="Technical Head"
            />
            <IonIcon slot="end" icon={person} />
          </IonItem>

          <IonItem>
            <IonLabel position="stacked">Task</IonLabel>
            <IonTextarea
              value={task}
              onIonChange={e => setTask(e.detail.value!)}
              placeholder="Type Task Here"
            />
          </IonItem>

          <IonItem>
            <IonLabel position="stacked">Assign To</IonLabel>
            <IonInput
              value={employeeInput}
              onIonInput={async e => {
                const value = e.detail.value!;
                setEmployeeInput(value);

                // Fetch employees if not already available
                if (employees.length === 0) {
                  //sessionStorage.removeItem('employeeData');
                  try {
                    const cached = sessionStorage.getItem('employeeData');
                    let data;
                    if (cached) {
                      data = JSON.parse(cached);
                    } else {
                      data = await getEmployees();
                      //console.log(JSON.stringify(data));
                      sessionStorage.setItem('employeeData', JSON.stringify(data));
                    }
                    setEmployees(data);
                    //console.log("Fetched employees:", data); // Debugging
                  } catch (error) {
                    console.error("Error fetching employees:", error);
                  }
                }

                // Filter employees based on input
                const filtered = employees.filter(emp =>
                  emp.name && emp.name.toLowerCase().includes(value.toLowerCase())
                  && emp.department === department // Filter by department
                );
                setFilteredEmployees(filtered);

                // Show suggestions only if there are matches and input is not empty
                setShowEmployeeSuggestions(value.trim().length > 0 && filtered.length > 0);
              }}
              placeholder="Type to search employees"
            />
            <IonIcon slot="end" icon={person} />
          </IonItem>

          {showEmployeeSuggestions && filteredEmployees.length > 0 && (
            <IonList style={{ maxHeight: '150px', overflowY: 'auto' }}>
              {filteredEmployees.map((emp: { id: number; name: string }) => (
                <IonItem
                  key={emp.id}
                  button
                  onClick={() => {
                    if (!assignTo.includes(emp.name)) {
                      setAssignTo(prev => [...prev, emp.name]);
                      setAssignToId(prev => [...prev, emp.id]);
                    }
                    setEmployeeInput('');
                    setShowEmployeeSuggestions(false);
                  }}
                >
                  {emp.name}
                </IonItem>
              ))}
            </IonList>
          )}
          <div style={{ marginTop: '8px', display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
            {assignTo.map(name => (
              <IonButton key={name} size="small" color="medium" fill="outline"
                onClick={() => {
                  setAssignTo(prev => prev.filter(n => n !== name));
                  setAssignToId(prev => prev.filter(id => id !== assignToId[assignTo.indexOf(name)]));
                  }}>
                {name} &times;
              </IonButton>
            ))}
          </div>

          <IonItem>
            <IonLabel position="stacked">Assign By</IonLabel>
            {empId === '0' ? (
              <IonInput
                value={assignBy}
                onIonInput={async e => {
                  const value = e.detail.value!;
                  setAssignBy(value);

                  // Fetch employees if not already available
                  if (employees.length === 0) {
                    try {
                      const cached = sessionStorage.getItem('employeeData');
                      let data;
                      if (cached) {
                        data = JSON.parse(cached);
                      } else {
                        data = await getEmployees();
                        sessionStorage.setItem('employeeData', JSON.stringify(data));
                      }
                      setEmployees(data);
                    } catch (error) {
                      console.error("Error fetching employees:", error);
                    }
                  }

                  // Filter employees based on input for Assign By
                  const filtered = employees.filter(emp =>
                    emp.name && emp.name.toLowerCase().includes(value.toLowerCase())
                  );
                  setFilteredAssignByEmployees(filtered);

                  // Show suggestions only if there are matches and input is not empty
                  setShowAssignBySuggestions(value.trim().length > 0 && filtered.length > 0);
                }}
                placeholder="Type to search employees"
              />
            ) : (
              <IonInput
                value={assignBy || 'Loading...'}
                readonly={true} // Allow editing even after selection
                onIonInput={() => {
                  setAssignBy('');
                  setAssignById('0');
                  setShowAssignBySuggestions(false);
                }}
              />
            )}
            <IonIcon slot="end" icon={person} />
          </IonItem>

          {/* Separate suggestion list for Assign By */}
          {empId === '0' && showAssignBySuggestions && filteredAssignByEmployees.length > 0 && (
            <IonList style={{ maxHeight: '150px', overflowY: 'auto' }}>
              {filteredAssignByEmployees.map((emp: { id: number; name: string }) => (
                <IonItem
                  key={emp.id}
                  button
                  onClick={() => {
                    setAssignBy(emp.name);
                    setAssignById(emp.id.toString());
                    setShowAssignBySuggestions(false);
                  }}
                >
                  {emp.name}
                </IonItem>
              ))}
            </IonList>
          )}

          <IonItem>
            <IonLabel position="stacked">Priority</IonLabel>
            <IonSelect
              value={priority}
              onIonChange={e => setPriority(e.detail.value)}
              interface="popover"
              placeholder="Select Priority"
            >
              <IonSelectOption value="High">High</IonSelectOption>
              <IonSelectOption value="Medium">Medium</IonSelectOption>
              <IonSelectOption value="Low">Low</IonSelectOption>
            </IonSelect>
            <IonIcon slot="end" icon={ellipsisVertical} />
          </IonItem>

          <IonItem>
            <IonLabel position="stacked">From Date</IonLabel>
            <IonInput
              readonly
              value={fromDate ? formatDate(fromDate) : ''}
              placeholder="Select From Date"
              onClick={() => setShowFromModal(true)}
            />
          </IonItem>

          <IonItem>
            <IonLabel position="stacked">To Date</IonLabel>
            <IonInput
              readonly
              value={toDate ? formatDate(toDate) : ''}
              placeholder="Select To Date"
              onClick={() => setShowToModal(true)}
            />
          </IonItem>

          {/* From Date Modal */}
          <IonModal isOpen={showFromModal} onDidDismiss={() => setShowFromModal(false)}>
            <IonDatetime
              presentation="date"
              min={new Date().toISOString().split('T')[0]} // Set the minimum date to today's date
              onIonChange={e => {
                setFromDate(Array.isArray(e.detail.value) ? e.detail.value[0] : e.detail.value!);
                setShowFromModal(false);
              }}
            />
          </IonModal>

          {/* To Date Modal */}
          <IonModal isOpen={showToModal} onDidDismiss={() => setShowToModal(false)}>
            <IonDatetime
              presentation="date"
              min={new Date().toISOString().split('T')[0]} 
              onIonChange={e => {
                setToDate(Array.isArray(e.detail.value) ? e.detail.value[0] : e.detail.value!);
                setShowToModal(false);
              }}
            />
          </IonModal>

          {/* Department Selection Modal */}
          <IonModal isOpen={showDepartmentModal} onDidDismiss={() => setShowDepartmentModal(false)}>
            <IonHeader>
              <IonToolbar>
                <IonTitle>Select Department</IonTitle>
              </IonToolbar>
            </IonHeader>
            <IonContent>
              <IonSearchbar
                placeholder="Search Departments"
                onIonInput={e => {
                  const query = e.detail.value!.toLowerCase();
                  setFilteredDepartments(
                    departments.filter(dep => dep.toLowerCase().includes(query))
                  );
                }}
              />
              <IonList>
                {filteredDepartments.map(dep => (
                  <IonItem
                    key={dep}
                    button
                    onClick={() => {
                      setDepartment(dep);
                      setShowDepartmentModal(false);
                    }}
                  >
                    {dep}
                  </IonItem>
                ))}
              </IonList>
            </IonContent>
          </IonModal>

          <IonItem>
            <IonLabel position="stacked">Estimated Hours</IonLabel>
            <IonInput
              value={estHours}
              onIonChange={e => setEstHours(e.detail.value!)}
              placeholder="Est. hours"
              type="number"
            />
          </IonItem>

        </div>

        <div className="ion-padding ion-text-center">
          <IonButton expand="block" color="success" onClick={handleSubmit}>
            Submit
          </IonButton>
          <IonButton expand="block" color="danger" routerDirection="back" routerLink="/Status">
            Close
          </IonButton>
        </div>
      </IonContent>
    </IonPage>
  );
};

export default AssignTask;