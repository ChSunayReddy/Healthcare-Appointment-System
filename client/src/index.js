import axios from "axios";
import React from 'react';
import 'antd/dist/reset.css';
import ReactDOM from 'react-dom/client';
import './index.css';
import {Provider} from 'react-redux';
import App from './App';
import reportWebVitals from './reportWebVitals';
import store from './redux/store';
axios.defaults.baseURL = process.env.REACT_APP_API_URL || "";
const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(
  <Provider store={store}>
    <App />
  </Provider>

);
reportWebVitals();
