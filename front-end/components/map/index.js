import { GoogleMap, LoadScript, Marker } from "@react-google-maps/api";

const containerStyle = {
  width: "100%",
  height: "400px",
};

const center = {
  lat: 11.0859383, // Updated latitude
  lng: 77.6630683, // Updated longitude
};
const api=NEXT_PUBLIC_MAP_KEY
const GoogleMapComponent = () => {
  return (
    <LoadScript googleMapsApiKey={api}>
      <GoogleMap mapContainerStyle={containerStyle} center={center} zoom={15}>
        <Marker position={center} />
      </GoogleMap>
    </LoadScript>
  );
};

export default GoogleMapComponent;
