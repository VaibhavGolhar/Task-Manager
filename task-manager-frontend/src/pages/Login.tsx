import { IonButton, IonCard, IonCardContent, IonContent, IonHeader, IonIcon, IonInput, IonPage, IonTitle, IonToolbar } from '@ionic/react';
import { settings, eye, eyeOff } from 'ionicons/icons';
import React, { useEffect } from 'react';
import { loginUser } from '../apis/login';
import logo from '../assets/logo.svg';
import { Preferences } from '@capacitor/preferences';
import { useHistory } from 'react-router-dom';

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
    const [showPassword, setShowPassword] = React.useState(false);
    const history = useHistory();

    useEffect(() => {
        const checkLogin = async () => {
            const { value } = await Preferences.get({ key: 'user' });
            if (value) {
            const user = JSON.parse(value);
            if (user.redirectTo) {
                history.push(`/${user.redirectTo}`);
            } else {
                history.push('/Dashboard');
            }
            }
        };

        checkLogin();
    });

    const doLogin = async (event: React.FormEvent<HTMLFormElement>) => {
        event.preventDefault();
        const result = await loginUser(BigInt(username), BigInt(password));
        if (result["status"] === 200) {
            const { user, redirectTo } = result.data;

            await Preferences.set({
                key: 'user',
                value: JSON.stringify({ ...user, redirectTo })
            });
            history.push(`/${redirectTo}`);
            
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
                                <div style={{ position: 'relative' }}>
                                    <IonInput
                                        className='ion-margin-top'
                                        fill='outline'
                                        label="Password"
                                        labelPlacement='floating'
                                        placeholder='Password'
                                        type={showPassword ? 'text' : 'password'}
                                        value={password}
                                        onIonChange={e => setPassword(e.detail.value!)}
                                    />
                                    <IonButton 
                                        type="button"
                                        onClick={(e) => {
                                            e.preventDefault();
                                            setShowPassword(!showPassword);
                                        }} 
                                        fill="clear" 
                                        style={{ position: 'absolute', right: '10px', top: '50%', transform: 'translateY(-60%)', zIndex: 999 }}
                                    >
                                        <IonIcon icon={showPassword ? eyeOff : eye} />
                                    </IonButton>
                                </div>
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