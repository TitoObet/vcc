// HomePage.tsx

import React from 'react';
import { IonContent, IonHeader, IonPage, IonTitle, IonToolbar, IonButton } from '@ionic/react';
import { useHistory } from 'react-router-dom';
import './HomePage.css';

const HomePage: React.FC = () => {
  const history = useHistory();

  const handleLogin = () => {
    console.log('Login button clicked');
    history.push('/login');
  };

  const handleRegister = () => {
    console.log('Register button clicked');
    history.push('/register');
  };

  return (
    <IonPage>
      <IonContent className="ion-padding ion-content"> {/* Add ion-content class */}
      <div className="logo-container">
        <img src="src/assets/logo.png" alt="Logo" className="logo" /> {/* Add the logo image */}
      </div>
        <h1>Welcome to VCC</h1>
        <p>Please login or register to continue.</p>
        <IonButton expand="block" onClick={handleLogin}>Login</IonButton>
        <IonButton expand="block" onClick={handleRegister}>Register</IonButton> {/* New button for registration */}
      </IonContent>
    </IonPage>
  );
};

export default HomePage;
