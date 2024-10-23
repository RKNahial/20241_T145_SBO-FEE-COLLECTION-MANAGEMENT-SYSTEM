import {GoogleLogin} from 'react-google-login';
const clientId="191454366253-g2te5lrt5n6gjgif1k6nsbm0f9o6etp4.apps.googleusercontent.com";
function Login(){

    return(
        <div id="signIn Button">
            <GoogleLogin
            clientId='{clientId}'
            buttonText='Login'
            onSuccess={onSuccess}
            onFailure={onFailure}
            cookiePolicy={'single_host_origin'}
            isSignedIn={true}
            />
        </div>
    )
}
export default Login;


