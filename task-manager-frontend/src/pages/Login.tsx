import { IonButton, IonCard, IonCardContent, IonContent, IonHeader, IonIcon, IonInput, IonPage, IonTitle, IonToolbar } from '@ionic/react';
import { settings } from 'ionicons/icons';
import React from 'react';
import { loginUser } from '../apis/login';
import logo from '../assets/logo.svg';

const cardStyle: React.CSSProperties = {
    width: '90%',
    maxWidth: '400px',
    margin: '0 auto'
};

const logoStyle: React.CSSProperties = {
    width: '25vw',
    maxWidth: '120px',
    minWidth: '60px'
};

const Login: React.FC = () => {
    const [username, setUsername] = React.useState('');
    const [password, setPassword] = React.useState('');

    const doLogin = async (event: React.FormEvent<HTMLFormElement>) => {
        event.preventDefault();
        const result = await loginUser(username, password);
        if (result["status"] == 200) {
            alert('Login successful');
        } else if (result["status"] == 401) {
            alert('Invalid credentials');
        }
        else if (result["status"] == 400) {
            alert('Please enter username and password.');
        }
        else if (result["status"] == 404) {
            alert('User not found');
        }
        else {
            alert('Server error');
        }
    };

    return (
        <IonPage>
            <IonHeader>
                <IonToolbar color={'primary'}>
                    <IonButton slot='start' fill='clear' color={'light'}>
                        <IonIcon icon={settings} />
                    </IonButton>
                    <IonTitle>Login Page</IonTitle>
                </IonToolbar>
            </IonHeader>
            <IonContent className="ion-padding" scrollY={false}>
                <div className='ion-text-center ion-padding'>
                    <img src={logo} alt='Task Manager' style={logoStyle} />
                </div>
                
                <div className='ion-padding'>
                    <IonCard style={cardStyle}>
                        <IonCardContent>
                            <div className="ion-text-center ion-margin-bottom">
                                <h1 style={{ color: 'black' }}>Task Manager</h1>
                            </div>
                            <br />
                            <form onSubmit={doLogin}>
                                <IonInput
                                    fill='outline'
                                    label='Username'
                                    labelPlacement='floating'
                                    placeholder='Username'
                                    value={username}
                                    onIonChange={e => setUsername(e.detail.value!)}
                                />
                                <IonInput
                                    className='ion-margin-top'
                                    fill='outline'
                                    label="Password"
                                    labelPlacement='floating'
                                    placeholder='Password'
                                    type="password"
                                    value={password}
                                    onIonChange={e => setPassword(e.detail.value!)}
                                />
                                <div className="ion-text-center">
                                    <IonButton className='ion-margin-top' type='submit'>Login</IonButton>
                                </div>
                            </form>
                        </IonCardContent>
                    </IonCard>
                </div>
            </IonContent>
        </IonPage>
    );
};

export default Login;