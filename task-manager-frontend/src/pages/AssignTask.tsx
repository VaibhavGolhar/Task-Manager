import React, { useState } from 'react';
import {
  IonPage, IonHeader, IonToolbar, IonTitle, IonContent,
  IonItem, IonLabel, IonInput, IonButton, IonDatetime, IonSelect, IonSelectOption,
  IonTextarea, IonIcon, IonModal,
  IonButtons,
  IonBackButton
} from '@ionic/react';
import { person, createOutline, ellipsisVertical } from 'ionicons/icons';

const AssignTask: React.FC = () => {
  const [department, setDepartment] = useState('');
  const [taskHead, setTaskHead] = useState('');
  const [task, setTask] = useState('');
  const [assignTo, setAssignTo] = useState('');
  const [assignBy, setAssignBy] = useState('');
  const [priority, setPriority] = useState('');
  const [fromDate, setFromDate] = useState('');
  const [toDate, setToDate] = useState('');
  const [estHours, setEstHours] = useState('');
  const [showFromModal, setShowFromModal] = useState(false);
  const [showToModal, setShowToModal] = useState(false);

  const formatDate = (value: string) => {
    return new Date(value).toLocaleDateString('en-GB'); // dd/mm/yyyy
  };

  const handleSubmit = () => {
    const formData = {
      department,
      taskHead,
      task,
      assignTo,
      assignBy,
      priority,
      fromDate,
      toDate,
      estHours
    };
    console.log("Task Submitted:", formData);
    // Add API call or state update here
  };

  const handleClose = () => {
    console.log("Form Closed");
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

          <IonItem>
            <IonLabel position="stacked">Department</IonLabel>
            <IonInput
              value={department}
              onIonChange={e => setDepartment(e.detail.value!)}
              placeholder="IT/Technical/QA"
            />
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
              value={assignTo}
              onIonChange={e => setAssignTo(e.detail.value!)}
              placeholder="User 1, User 2"
            />
            <IonIcon slot="end" icon={person} />
          </IonItem>

          <IonItem>
            <IonLabel position="stacked">Assign By</IonLabel>
            <IonInput
              value={assignBy}
              onIonChange={e => setAssignBy(e.detail.value!)}
              placeholder="MD/HoD/GM"
            />
            <IonIcon slot="end" icon={person} />
          </IonItem>

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
              onIonChange={e => {
                setToDate(Array.isArray(e.detail.value) ? e.detail.value[0] : e.detail.value!);
                setShowToModal(false);
              }}
            />
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
          <IonButton expand="block" color="danger" onClick={handleClose}>
            Close
          </IonButton>
        </div>
      </IonContent>
    </IonPage>
  );
};

export default AssignTask;