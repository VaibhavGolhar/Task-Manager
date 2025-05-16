// ConsolidatedReport.tsx
import React, { useState, useEffect } from 'react';
import {
  IonPage, IonHeader, IonToolbar, IonTitle, IonContent, IonItem, IonLabel, IonSelect, IonSelectOption,
  IonButton, IonCard, IonCardHeader, IonCardTitle, IonInput
} from '@ionic/react';
import { Bar } from 'react-chartjs-2';
import * as XLSX from 'xlsx';
import './ConsolidatedReport.css';
import { Chart, BarElement, CategoryScale, LinearScale, Tooltip, Legend } from 'chart.js';
import { buildOutline, businessOutline, calendarOutline, constructOutline, earthOutline, flaskOutline, gitNetworkOutline, hammerOutline, heartOutline, laptopOutline, leafOutline, peopleOutline, schoolOutline, searchOutline } from 'ionicons/icons';
import { getEmployees } from '../apis/employeeAPI';
import { fetchTasks } from '../apis/fetchTasksAPI';
import type { ChartData } from 'chart.js';

Chart.register(BarElement, CategoryScale, LinearScale, Tooltip, Legend);

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

// Helper to get months between two dates in "Month YYYY" format
function getMonthsBetween(start: Date, end: Date) {
  const months = [];
  const current = new Date(start.getFullYear(), start.getMonth(), 1);
  end = new Date(end.getFullYear(), end.getMonth(), 1);
  while (current <= end) {
    const monthName = current.toLocaleString('default', { month: 'long' });
    months.push(`${monthName} ${current.getFullYear()}`);
    current.setMonth(current.getMonth() + 1);
  }
  return months;
}

// Get 1st April of current financial year
function getFinancialYearStart() {
  const now = new Date();
  const year = now.getMonth() >= 3 ? now.getFullYear() : now.getFullYear() - 1;
  return new Date(year, 3, 1); // April is month 3 (0-based)
}

const ConsolidatedReport: React.FC = () => {
  const [role, setRole] = useState('');
  const [department, setDepartment] = useState('');
  const [employee, setEmployee] = useState('');
  const [toDate, setToDate] = useState(() => {
    const now = new Date();
    return now.toISOString().split('T')[0];
  });
  const [showChart, setShowChart] = useState(false);

  const startDateObj = getFinancialYearStart();
  const startDate = startDateObj.toISOString().split('T')[0];

  // Employee state
  const [employees, setEmployees] = useState<{ department: string; id: number; name: string }[]>([]);
  const [filteredEmployees, setFilteredEmployees] = useState<{ id: number; name: string }[]>([]);
  const [employeeError, setEmployeeError] = useState<string>('');
  

  const [barChartData, setBarChartData] = useState<ChartData<'bar'>>({
    labels: [],
    datasets: [
      {
        label: 'Hours Worked',
        data: [],
        backgroundColor: '#36A2EB',
      },
    ],
  });
  const [loading, setLoading] = useState(false);

  // Fetch employees if not in session storage
  useEffect(() => {
    const fetchEmployeesList = async () => {
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
    fetchEmployeesList();
  }, []);

  // Filter employees when department changes
  useEffect(() => {
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
    workingHrs?: string;
    // Add other fields as needed
  }

  const handleShowConsolidated = async () => {
    if (!employee || !toDate) {
      setEmployeeError('Please select both employee and To Date');
      setShowChart(false);
      return;
    }
    setLoading(true);
    setShowChart(false);

    let tasks: Task[] = [];
    const tasksData = sessionStorage.getItem('tasksData');
    if (tasksData) {
      tasks = JSON.parse(tasksData);
    } else {
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

    // Filter by employee and date range
    const empObj = employees.find(emp => emp.name === employee);
    if (!empObj) {
      setEmployeeError('Employee not found');
      setLoading(false);
      setShowChart(false);
      return;
    }
    const start = new Date(startDate);
    const end = new Date(toDate);

    // Helper to check if a date is in range
    const inRange = (dateStr?: string) => {
      if (!dateStr) return false;
      const d = new Date(dateStr);
      return d >= start && d <= end;
    };

    const filtered = tasks.filter((task: Task) => {
      if (task.assignToId !== empObj.id.toString()) return false;
      // Task is in range if fromDate or toDate is in range
      return inRange(task.fromDate) || inRange(task.toDate);
    });

    // Prepare months for X-axis
    const months = getMonthsBetween(start, end);

    // Sum workingHrs for each month
    const monthHours: { [key: string]: number } = {};
    months.forEach(m => { monthHours[m] = 0; });

    filtered.forEach((task: Task) => {
      // Use fromDate or toDate to determine the month
      const dateStr = task.fromDate || task.toDate;
      if (!dateStr) return;
      const d = new Date(dateStr);
      const monthLabel = `${d.toLocaleString('default', { month: 'long' })} ${d.getFullYear()}`;
      if (monthLabel in monthHours) {
        const hrs = Number(task.workingHrs) || 0;
        monthHours[monthLabel] += hrs;
      }
    });

    setBarChartData({
      labels: months,
      datasets: [
        {
          label: 'Hours Worked',
          data: months.map(m => monthHours[m]),
          backgroundColor: '#36A2EB',
        },
      ],
    });
    setShowChart(true);
    setLoading(false);
  };

  const exportToExcel = () => {
    const data = ((barChartData.labels ?? []) as string[]).map((month, idx) => ({
      Month: month,
      Hours: barChartData.datasets[0].data[idx],
    }));

    const worksheet = XLSX.utils.json_to_sheet(data);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, 'Consolidated Report');
    XLSX.writeFile(workbook, 'Consolidated_Report.xlsx');
  };

  return (
    <IonPage>
      <IonHeader>
        <IonToolbar className="report-header">
          <IonTitle className="report-title">Consolidated Sheet</IonTitle>
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

          {/* Start Date (Disabled) */}
          <IonItem className="report-item">
            <IonLabel className="report-label">From Date</IonLabel>
            <IonInput value={startDate} disabled className="report-input" />
          </IonItem>

          {/* End Date */}
          <IonItem className="report-item">
            <IonLabel className="report-label">To Date</IonLabel>
            <IonInput
              type="date"
              value={toDate}
              onIonChange={e => setToDate(e.detail.value!)}
              className="report-input"
              min={startDate}
              max={new Date().toISOString().split('T')[0]}
            />
          </IonItem>

          {/* Show Report Button */}
          <IonButton expand="block" className="report-button" onClick={handleShowConsolidated} disabled={loading}>
            {loading ? 'Loading...' : 'Show'}
          </IonButton>

          {/* Bar Chart */}
          <IonCard className="report-card" style={{ marginTop: 24 }}>
            <IonCardHeader>
              <IonCardTitle className="report-card-title">Bar Chart</IonCardTitle>
            </IonCardHeader>
            <div className="chart-container" style={{ minHeight: 300 }}>
              {showChart && (barChartData.labels ?? []).length > 0 && barChartData.datasets[0].data.some((d) => {
                if (typeof d === 'number') return d > 0;
                if (Array.isArray(d)) return d[0] > 0 || d[1] > 0;
                return false;
              }) ? (
                <Bar data={barChartData} options={{ responsive: true, maintainAspectRatio: false }} />
              ) : (
                <div style={{ textAlign: 'center', color: '#888', padding: '24px' }}>
                  No data to display. Please select employee and date, then click Show.
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

export default ConsolidatedReport;
