import React, { useEffect, useState, useRef, useCallback } from 'react';
import { GoogleMap, Marker, InfoWindow, StandaloneSearchBox, DirectionsRenderer, TrafficLayer } from '@react-google-maps/api';
import firebase from 'firebase/compat/app';
import 'firebase/compat/database';
import './MapPage.css';
import { useLoadScript } from '@react-google-maps/api';
import { IonPage, IonContent, IonButton, IonAlert } from '@ionic/react';
import { useHistory } from 'react-router-dom';
import customMapStyle from './MapStyle';
import subterminalImage from "../../assets/imgs/sub.png";
import loadZoneImage from "../../assets/imgs/load.png";
import jeepImage from "../../assets/imgs/jeep.png";
import tricycleImage from "../../assets/imgs/tricycle.png";

import currentImage from "../../assets/imgs/current.png";
import destinationImage from "../../assets/imgs/destination.png";
import settingsImage from "../../assets/imgs/settings.png";

interface TerminalData {
  tag: string,
  id: string,
  name: string;
  latitude: number,
  longitude: number,
  address: string,
  starting?: string,
  ending?: string,
}

const containerStyle = {
  width: '100%',
  height: '100%',
};

const MapPage: React.FC = () => {
  const [markers, setMarkers] = useState<TerminalData[]>([]);
  const [selectedMarker, setSelectedMarker] = useState<TerminalData | null>(null);
  const [currentLocation, setCurrentLocation] = useState({ lat: 0, lng: 0 });
  const [destination, setDestination] = useState({ lat: 0, lng: 0 });
  const [directions, setDirections] = useState<google.maps.DirectionsResult | null>(null);
  const [trafficNote, setTrafficNote] = useState('');
  const [showAlert, setShowAlert] = useState(false);
  const { isLoaded } = useLoadScript({
    googleMapsApiKey: "AIzaSyCinM8IcwmrFy5Y4ibwLB4_kHaGQNmsddE",
    libraries: ['places'],
  });
  const searchBoxRefStart = useRef<google.maps.places.SearchBox | null>(null);
  const searchBoxRefDest = useRef<google.maps.places.SearchBox | null>(null);
  const history = useHistory();

  useEffect(() => {
    console.log("Dito ***********");
    const fetchData = async () => {
      try {
        const firebaseConfig = {
          apiKey: "AIzaSyDb16--NNWhB_ZRC-NL8WmfMeGJwKr-6ms",
          authDomain: "dropoff-table.firebaseapp.com",
          databaseURL: "https://dropoff-table-default-rtdb.firebaseio.com/",
          projectId: "dropoff-table",
          storageBucket: "dropoff-table.appspot.com",
          messagingSenderId: "60054294451",
          appId: "1:60054294451:web:91f77c26a9115462dc05c6"
        };

        const mapApp = firebase.initializeApp(firebaseConfig, 'mapDB');
        const database = mapApp.database();

        const jodaterminalRef = database.ref('jodaterminal'); 
        const loadZonesRef = database.ref('loadZones'); 
        const subsubterminalRef = database.ref('subsubterminals'); 
        const terminalRef = database.ref('terminals'); 

        const updateMarkers = (newData: TerminalData[]) => {
          setMarkers(prevMarkers => [...prevMarkers, ...newData]);
        };
        

        jodaterminalRef.on('value', (snapshot) => {
          const data: TerminalData[] = [];
          snapshot.forEach((childSnapshot) => {
            const childData = childSnapshot.val();
            const terminal: TerminalData = {
              tag: "joda",
              id: childData.joda_ID,
              starting: childData.starting,
              ending: childData.ending,

              name: childData.joda_Name,
              latitude: parseFloat(childData.latitude),
              longitude: parseFloat(childData.longitude),
              address: childData.address,
            };
            data.push(terminal);
          });
          console.log(data);
          updateMarkers(data);
        });
        loadZonesRef.on('value', (snapshot) => {
          const data: TerminalData[] = [];
          snapshot.forEach((childSnapshot) => {
            const childData = childSnapshot.val();
            const terminal: TerminalData = {
              tag: "loadZones",
              id: childData.load_ID,

              name: childData.load_Name,
              latitude: parseFloat(childData.latitude),
              longitude: parseFloat(childData.longitude),
              address: childData.address,
            };
            data.push(terminal);
          });
          console.log(data);
          updateMarkers(data);
        });
        subsubterminalRef.on('value', (snapshot) => {
          const data: TerminalData[] = [];
          snapshot.forEach((childSnapshot) => {
            const childData = childSnapshot.val();
            const terminal: TerminalData = {
              tag: "subsubterminal",
              id: childData.toda_ID,
              starting: childData.starting,
              ending: childData.ending,

              name: childData.toda_Name,
              latitude: parseFloat(childData.latitude),
              longitude: parseFloat(childData.longitude),
              address: childData.address,
            };
            data.push(terminal);
          });
          console.log(data);
          updateMarkers(data);
        });
        terminalRef.on('value', (snapshot) => {
          const data: TerminalData[] = [];
          snapshot.forEach((childSnapshot) => {
            const childData = childSnapshot.val();
            const terminal: TerminalData = {
              tag: "terminal",
              id: childData.toda_ID,
              starting: childData.starting,
              ending: childData.ending,

              name: childData.toda_Name,
              latitude: parseFloat(childData.latitude),
              longitude: parseFloat(childData.longitude),
              address: childData.address,
            };
            data.push(terminal);
          });
          console.log(data);
          updateMarkers(data);
        });

        const position = await getCurrentPosition();
        setCurrentLocation(position);
      } catch (error) {
        console.error('Error fetching data:', error);
      }
    };

    fetchData();
  }, []);

  const getCurrentPosition = () => {
    return new Promise<{ lat: number; lng: number }>((resolve, reject) => {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          resolve({
            lat: position.coords.latitude,
            lng: position.coords.longitude
          });
        },
        (error) => {
          console.error('Error getting current position:', error);
          reject(error);
        }
      );
    });
  };

  const handleSettingsClick = () => {
    history.push('/settings');
  };

  const handleStartChanged = useCallback(() => {
    const places = searchBoxRefStart.current?.getPlaces();
    if (places && places.length) {
      const place = places[0];
      if (place.geometry && place.geometry.location) {
        setCurrentLocation({
          lat: place.geometry.location.lat(),
          lng: place.geometry.location.lng(),
        });
      }
    }
  }, []);

  const handleDestChanged = useCallback(() => {
    const places = searchBoxRefDest.current?.getPlaces();
    if (places && places.length) {
      const place = places[0];
      if (place.geometry && place.geometry.location) {
        setDestination({
          lat: place.geometry.location.lat(),
          lng: place.geometry.location.lng(),
        });
      }
    }
  }, []);

  const handleStartJourney = () => {
    if (currentLocation && destination) {
      const directionsService = new google.maps.DirectionsService();
      directionsService.route(
        {
          origin: currentLocation,
          destination: destination,
          travelMode: google.maps.TravelMode.DRIVING,
          drivingOptions: {
            departureTime: new Date(),
            trafficModel: "bestguess" as google.maps.TrafficModel,
          },
        },
        (result, status) => {
          if (status === google.maps.DirectionsStatus.OK && result) {
            setDirections(result);
            const legs = result.routes[0].legs;
            if (legs && legs.length > 0) {
              const trafficSpeedEntries = legs[0].traffic_speed_entry;
              let trafficNote = 'Traffic Conditions: ';
              if (trafficSpeedEntries && trafficSpeedEntries.length > 0) {
                const speeds = trafficSpeedEntries.map(entry => entry.speed);
                const averageSpeed = speeds.reduce((acc, speed) => acc + speed, 0) / speeds.length;
                if (averageSpeed < 20) {
                  trafficNote += 'Heavy traffic';
                } else if (averageSpeed < 40) {
                  trafficNote += 'Moderate traffic';
                } else {
                  trafficNote += 'Light traffic';
                }
              } else {
                trafficNote += 'No significant traffic congestion.';
              }
              setTrafficNote(trafficNote);
              setShowAlert(true);  // Show the alert with traffic information
            }
          } else {
            console.error(`Error fetching directions ${result}`);
          }
        }
      );
    }
  };

  const handleAlertClose = () => {
    setShowAlert(false);
  };

  if (!isLoaded) return <div>Loading...</div>;

  return (
    <IonPage>
      <IonContent>
        <div className="map-page-container">
          <GoogleMap
            mapContainerStyle={containerStyle}
            center={currentLocation}
            zoom={15}
            options={{ disableDefaultUI: true, styles: customMapStyle }}
          >
            {markers.map((marker, index)=> (
  <Marker
    key={index}
    position={{
      lat: marker.latitude,
      lng: marker.longitude,
    }}
    title={marker.name}
    onClick={() => setSelectedMarker(marker)}
    icon={{
      url: marker.tag?.includes('subsubterminal')
        ? subterminalImage
        : marker.tag?.includes('loadZones')
        ? loadZoneImage
        : marker.tag?.includes('joda')
        ? jeepImage
        : tricycleImage,
      scaledSize: new window.google.maps.Size(40, 40),
    }}
  />
))}
{selectedMarker && (
  <InfoWindow
    position={{ lat: selectedMarker.latitude, lng: selectedMarker.longitude }}
    onCloseClick={() => setSelectedMarker(null)}
  >
    <div>
      <h3>{selectedMarker.name}</h3>
      <p>{selectedMarker.address}</p>
    </div>
  </InfoWindow>
)}
<Marker
  position={currentLocation}
  icon={{ url: currentImage }}
/>
<Marker
  position={destination}
  icon={{ url: destinationImage }}
/>
{directions && <DirectionsRenderer directions={directions} />}
<TrafficLayer />
</GoogleMap>
<div className="settings-button-container">
  <div className="settings-button" onClick={handleSettingsClick}>
    <img src={settingsImage} alt="Settings" />
  </div>
</div>
<div className="search-box-container">
  <StandaloneSearchBox
    onLoad={(ref) => {
      searchBoxRefStart.current = ref;
    }}
    onPlacesChanged={handleStartChanged}
  >
    <input
      type="text"
      placeholder="Starting place"
      className="search-input"
    />
  </StandaloneSearchBox>
  <StandaloneSearchBox
    onLoad={(ref) => {
      searchBoxRefDest.current = ref;
    }}
    onPlacesChanged={handleDestChanged}
  >
    <input
      type="text"
      placeholder="Destination"
      className="search-input"
    />
  </StandaloneSearchBox>
</div>
<div className="start-journey-button">
  <IonButton onClick={handleStartJourney}>Start Journey</IonButton>
</div>
</div>
<IonAlert
  isOpen={showAlert}
  onDidDismiss={handleAlertClose}
  header={'Traffic Information'}
  message={trafficNote}
  buttons={[{ text: 'OK', handler: handleAlertClose }]}
/>
</IonContent>
</IonPage>
);
};

export default MapPage;
