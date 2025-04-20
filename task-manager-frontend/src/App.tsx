import { Route, BrowserRouter, Redirect } from 'react-router-dom';
import {
  IonApp,
  setupIonicReact,
  IonRouterOutlet
} from '@ionic/react';
import Departments from './pages/Departments';
import Login from './pages/Login';

import '@ionic/react/css/core.css';
import '@ionic/react/css/normalize.css';
import '@ionic/react/css/structure.css';
import '@ionic/react/css/typography.css';
import '@ionic/react/css/padding.css';
import '@ionic/react/css/float-elements.css';
import '@ionic/react/css/text-alignment.css';
import '@ionic/react/css/text-transformation.css';
import '@ionic/react/css/flex-utils.css';
import '@ionic/react/css/display.css';
import './theme/variables.css';
import EmployeeDashboard from './pages/EmployeeDashboard';
import Status from './pages/Status';
import AssignTask from './pages/AssignTask';
import TaskUpdation from './pages/TaskUpdation';

setupIonicReact();


const App: React.FC = () => (
  <IonApp>
    <BrowserRouter>
      <IonRouterOutlet>
        <Route path="/Login" component={Login} exact={true} />
        <Route path="/Departments" component={Departments} exact={true} />
        <Route path="/EmployeeDashboard" component={EmployeeDashboard} exact={true} />
        <Route path="/Status" component={Status} exact={true} />
        <Route path="/AssignTask" component={AssignTask} exact={true} />
        <Route path="/TaskUpdation" component={TaskUpdation} exact={true} />
        <Redirect exact from="/" to="/Login" />
      </IonRouterOutlet>
    </BrowserRouter>
  </IonApp>
);
export default App;