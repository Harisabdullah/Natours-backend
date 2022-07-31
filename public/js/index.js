import axios from 'axios';

import { showAlert } from './alerts';

import { login } from './login';
import { logout } from './logout';
import { updateSettings } from './updateSettings';
import { displayMap } from './mapbox';



// DOM Elements
const loginForm = document.querySelector('.form--login');
const logOutBtn = document.querySelector('.nav__el--logout');
const userDataForm = document.querySelector('.form-user-data');
const userPasswordForm = document.querySelector('.form-user-password');
const mapBox = document.getElementById('map');

// DELEGATIONS

if(mapBox) {
  const locations = JSON.parse(mapBox.dataset.locations);
  displayMap(locations);
}

if(loginForm) loginForm.addEventListener('submit', e => {
  e.preventDefault();

  document.querySelector('.btn-login').innerText = 'Logging in...';


  const email = document.getElementById('email').value;
  const password = document.getElementById('password').value;
  login(email, password);
});


if(logOutBtn) logOutBtn.addEventListener('click', async () => {
  document.querySelector('.nav__el--logout').innerText = 'Logging out...';
  await logout();
});


if(userDataForm) userDataForm.addEventListener('submit', e => {
  e.preventDefault();

  document.querySelector('.btn-save--settings').innerText = 'Updating...';

  const form = new FormData();
  form.append('name', document.getElementById('name').value);
  form.append('email', document.getElementById('email').value);
  form.append('photo', document.getElementById('photo').files[0]);

  console.log(form);

  updateSettings(form, 'data');

  document.querySelector('.btn-save--settings').innerText = 'Save settings';
});

if(userPasswordForm) userPasswordForm.addEventListener('submit', async e => {
  e.preventDefault();

  document.querySelector('.btn-save--password').innerText = 'Updating...';

  const passwordCurrent = document.getElementById('password-current').value;
  const password = document.getElementById('password').value;
  const passwordConfirm = document.getElementById('password-confirm').value;
  await updateSettings({ password, passwordConfirm, passwordCurrent }, 'password');

  document.getElementById('password-current').value = '';
  document.getElementById('password').value = '';
  document.getElementById('password-confirm').value = '';
  document.querySelector('.btn-save--password').innerText = 'Save password';
});