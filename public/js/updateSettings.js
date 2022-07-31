import axios from 'axios';
import { showAlert } from './alerts';


// UpdateData
// type = password || data
export const updateSettings = async (data, type) => {
  const url =
    type === 'data'
      ? '/api/v1/users/updateMe'
      : '/api/v1/users/updateMyPassword';
  try{
    const res = await axios({
      url,
      method: 'PATCH',
      data
    });

    if(res.data.status === 'success'){
      showAlert('success', `Your ${type.toUpperCase()} has been updated successfully.`);
    }
  } catch (err) {
    console.log(err);
    try{ showAlert('error', err.response.data.message);}
    catch (e) {showAlert('error', 'Something went wrong, please try again.');}
  }
}