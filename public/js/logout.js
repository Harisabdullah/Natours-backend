import axios from 'axios';
import { showAlert } from './alerts';

export const logout = async () => {
  try{
    let res = await axios({
      url: 'http://localhost:3000/api/v1/users/logout',
      method: 'GET'
    });

    if(res.data.status === 'success') {
      showAlert('success', 'Logged out successfully!');
      window.setTimeout(()=>{
        location.assign('/');
      }, 1500);
    }
  } catch (err){
    console.log(err);
    showAlert('error', 'Error logging out! Try again?');
  }
}
