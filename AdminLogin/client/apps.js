import logo from'./logo.svg';
import './App.css';
import LoginButton from "./AdminLogin/login.Admin"
import {useEffect} from 'react';
import {gapi} from 'gapi-script';
const clientId="191454366253-g2te5lrt5n6gjgif1k6nsbm0f9o6etp4.apps.googleusercontent.com";
function App(){
    useEffect(()=>{
      function start(){
        gapi.client.init({ 
          clientId:clientId,
          scope:"",
          }
  
        )
      }
    gapi.load('client:auth2', start) });
  
  }
  return(
    <div classname="App">
      <LoginButton></LoginButton>
    </div>
  )
  const PORT = process.env.PORT || 3027;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
  