// MonthlyReport.tsx
import React, { useState } from 'react';
import {
  IonPage, IonHeader, IonToolbar, IonTitle, IonContent, IonItem, IonLabel, IonSelect, IonSelectOption,
  IonButton, IonCard, IonCardHeader, IonCardTitle
} from '@ionic/react';
import { Pie } from 'react-chartjs-2';
import * as XLSX from 'xlsx';
import './MonthlyReport.css'; // Import custom styles
import { buildOutline, businessOutline, calendarOutline, constructOutline, earthOutline, flaskOutline, gitNetworkOutline, hammerOutline, heartOutline, laptopOutline, leafOutline, peopleOutline, schoolOutline, searchOutline } from 'ionicons/icons';
import { getEmployees } from '../apis/employeeAPI'; // <-- Make sure this import exists
import { fetchTasks } from '../apis/fetchTasksAPI'; // <-- Add this import
import { Chart, ArcElement, Tooltip, Legend } from 'chart.js';
Chart.register(ArcElement, Tooltip, Legend);

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

// Helper to get last 6 months in "Month YYYY" format
const getLastSixMonths = () => {
  const months = [];
  const now = new Date();
  for (let i = 0; i < 6; i++) {
    const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
    const monthName = d.toLocaleString('default', { month: 'long' });
    months.push(`${monthName} ${d.getFullYear()}`);
  }
  return months;
};

const lastSixMonths = getLastSixMonths();

const MonthlyReport: React.FC = () => {
  const [role, setRole] = useState('');
  const [department, setDepartment] = useState('');
  const [employee, setEmployee] = useState('');
  const [month, setMonth] = useState('');
  const [showChart, setShowChart] = useState(false);

  // Employee state
  const [employees, setEmployees] = useState<{ department: string; id: number; name: string }[]>([]);
  const [filteredEmployees, setFilteredEmployees] = useState<{ id: number; name: string }[]>([]);
  const [employeeError, setEmployeeError] = useState<string>('');

  const [pieChartData, setPieChartData] = useState({
    labels: ['New', 'In Process', 'Submit', 'Complete'],
    datasets: [
      { data: [0, 0, 0, 0], backgroundColor: ['#FF6384', '#36A2EB', '#FFCE56', '#4CAF50'] },
    ],
  });
  const [loading, setLoading] = useState(false);

  // Fetch employees if not in session storage
  React.useEffect(() => {
    const fetchEmployees = async () => {
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
        setEmployeeError('Failed to fetch employees. Error: ' + error);
      }
    };
    fetchEmployees();
  }, []);

  // Filter employees when department changes
  React.useEffect(() => {
    if (!department) {
      setFilteredEmployees([]);
      setEmployee('');
      setEmployeeError('Please select a department first');
      return;
    }
    setEmployeeError('');
    const filtered = employees.filter(emp => emp.department === department);
    setFilteredEmployees(filtered);
    setEmployee('');
  }, [department, employees]);

  // Define Task type for type safety
  interface Task {
    assignToId: string;
    fromDate?: string;
    toDate?: string;
    status: 'New' | 'In Process' | 'Submit' | 'Complete' | string;
    // Add other fields as needed
  }

  const handleShowReport = async () => {
    if (!employee || !month) {
      setEmployeeError('Please select both employee and month');
      setShowChart(false); // Hide chart if error
      return;
    }
    setLoading(true);
    setShowChart(false); // Hide chart while loading new data
    const tasksData = sessionStorage.getItem('tasksData');
    let tasks: Task[] = [];
    if (tasksData) {
      tasks = JSON.parse(tasksData);
      console.log('Using cached tasks:', tasks);
    } else {
      // Find employee ID by name
      const empObj = employees.find(emp => emp.name === employee);
      if (!empObj) {
        setEmployeeError('Employee not found');
        setLoading(false);
        setShowChart(false);
        return;
      }
      tasks = await fetchTasks(empObj.id.toString());
      sessionStorage.setItem('tasksData', JSON.stringify(tasks));
    }

    // Filter by employee and month
    const [monthName, year] = month.split(' ');
    const monthIdx = new Date(`${monthName} 1, ${year}`).getMonth() + 1; // JS months are 0-based, string months are 1-based
    const yearNum = parseInt(year, 10);

    const matchesMonth = (dateStr?: string) => {
      if (!dateStr) return false;
      const [y, m] = dateStr.split('-');
      //console.log('Checking date:', dateStr, 'Against:', yearNum, monthIdx, parseInt(y, 10) === yearNum && parseInt(m, 10) === monthIdx);
      return parseInt(y, 10) === yearNum && parseInt(m, 10) === monthIdx;
    };

    const filtered = tasks.filter((task: Task) => {
      const empObj = employees.find(emp => emp.name === employee);
      if (!empObj) return false;
      //console.log('Comparing task.assignToId:', task.assignToId, 'with empObj.id:', empObj.id.toString(), task.assignToId !== empObj.id.toString());
      if (task.assignToId !== empObj.id.toString()) return false;
      return matchesMonth(task.fromDate) || matchesMonth(task.toDate);
    });

    // Count by status
    const statusMap = { New: 0, 'In Process': 0, Submit: 0, Complete: 0 };
    filtered.forEach((task: Task) => {
      if (task.status === 'new') statusMap.New += 1;
      else if (task.status === 'inProgress') statusMap['In Process'] += 1;
      else if (task.status === 'submitted') statusMap.Submit += 1;
      else if (task.status === 'completed') statusMap.Complete += 1;
    });

    setPieChartData({
      labels: ['New', 'In Process', 'Submit', 'Complete'],
      datasets: [
        {
          data: [
            statusMap.New,
            statusMap['In Process'],
            statusMap.Submit,
            statusMap.Complete,
          ],
          backgroundColor: ['#FF6384', '#36A2EB', '#FFCE56', '#4CAF50'],
        },
      ],
    });
    setShowChart(true);
    setLoading(false);
  };

  const exportToExcel = () => {
    const data = [
      { Task: 'New', Hours: 60 },
      { Task: 'In Process', Hours: 110 },
      { Task: 'Submit', Hours: 150 },
      { Task: 'Complete', Hours: 130 },
    ];

    const worksheet = XLSX.utils.json_to_sheet(data);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, 'Task Report');
    XLSX.writeFile(workbook, 'Task_Report.xlsx');
  };

  return (
    <IonPage>
      <IonHeader>
        <IonToolbar className="report-header">
          <IonTitle className="report-title">Month Task Sheet Report</IonTitle>
        </IonToolbar>
      </IonHeader>

      <IonContent className="ion-padding report-content">
        <div className="report-container">
          {/* Role Selection */}
          <IonItem className="report-item">
            <IonLabel className="report-label">Role</IonLabel>
            <IonSelect value={role} onIonChange={e => setRole(e.detail.value)} className="report-select">
              <IonSelectOption value="MD">MD</IonSelectOption>
              <IonSelectOption value="CFO">CFO</IonSelectOption>
              <IonSelectOption value="GM">GM</IonSelectOption>
              <IonSelectOption value="HOD">HOD</IonSelectOption>
            </IonSelect>
          </IonItem>

          {/* Department Selection */}
          <IonItem className="report-item">
            <IonLabel className="report-label">Department</IonLabel>
            <IonSelect value={department} onIonChange={e => setDepartment(e.detail.value)} className="report-select">
              {departments.map((dept) => (
                <IonSelectOption key={dept.label} value={dept.label}>
                  {dept.label}
                </IonSelectOption>
              ))}
            </IonSelect>
          </IonItem>

          {/* Employee Selection */}
          <IonItem className="report-item">
            <IonLabel className="report-label">Employee</IonLabel>
            <IonSelect
              value={employee}
              onIonChange={e => setEmployee(e.detail.value)}
              className="report-select"
              disabled={!department || filteredEmployees.length === 0}
              placeholder={!department ? "Please select a department first" : "Select Employee"}
            >
              {!department ? (
                <IonSelectOption value="" disabled>
                  Please select a department first
                </IonSelectOption>
              ) : filteredEmployees.length === 0 ? (
                <IonSelectOption value="" disabled>
                  No employees found for this department
                </IonSelectOption>
              ) : (
                filteredEmployees.map(emp => (
                  <IonSelectOption key={emp.id} value={emp.name}>
                    {emp.name}
                  </IonSelectOption>
                ))
              )}
            </IonSelect>
          </IonItem>
          {employeeError && (
            <div style={{ color: 'red', marginBottom: '8px', fontSize: '14px' }}>{employeeError}</div>
          )}

          {/* Month Selection */}
          <IonItem className="report-item">
            <IonLabel className="report-label">Month</IonLabel>
            <IonSelect value={month} onIonChange={e => setMonth(e.detail.value)} className="report-select" placeholder="Select Month">
              {lastSixMonths.map(m => (
                <IonSelectOption key={m} value={m}>{m}</IonSelectOption>
              ))}
            </IonSelect>
          </IonItem>

          {/* Show Report Button */}
          <IonButton expand="block" className="report-button" onClick={handleShowReport} disabled={loading}>
            {loading ? 'Loading...' : 'Show'}
          </IonButton>

          {/* Pie Chart */}
          <IonCard className="report-card" style={{ marginTop: 24 }}>
            <IonCardHeader>
              <IonCardTitle className="report-card-title">Pie Chart</IonCardTitle>
            </IonCardHeader>
            <div className="chart-container">
              {showChart && pieChartData.datasets[0].data.some(d => d > 0) ? (
                <Pie data={pieChartData} />
              ) : (
                <div style={{ textAlign: 'center', color: '#888', padding: '24px' }}>
                  No data to display. Please select employee and month, then click Show.
                </div>
              )}
            </div>
          </IonCard>

          {/* Export to Excel Button */}
          {showChart && (
            <IonButton expand="block" className="report-button" onClick={exportToExcel}>
              Export to Excel
            </IonButton>
          )}
        </div>
      </IonContent>
    </IonPage>
  );
};

export default MonthlyReport;

