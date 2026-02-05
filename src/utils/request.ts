// Request.ts
// ----------
// This module creates an Axios instance that injects the token header,
// formats GET parameters, checks for duplicate submissions,
// handles API response errors according to HTTP codes via a custom error code map,
// and provides a universal download function capable of saving binary responses.
// It uses Material UI–style notification, dialog, and loading utilities (here implemented
// as placeholders) that you can replace with your actual Material UI components.

import axios from 'axios';
import type { InternalAxiosRequestConfig } from 'axios';
import { logoutUser } from '../features/user/userSlice';
import { getToken } from '../utils/auth';
import errorCode from '../utils/errorCode';
import { tansParams, blobValidate } from '../utils/config';
import cache from '../plugins/cache';
import { saveAs } from 'file-saver';
import { ENV } from '../../env';
import store from '../store';
import { toast } from '../components/alert/Toast';
import { toastService } from '../components/alert/toastService';


// Material UI–style stubs for notifications & dialogs
function showNotification(message: string, variant: 'error' | 'warning' | 'info' | 'success'): void {
  const title = variant === 'error' ? 'Error' : variant === 'warning' ? 'Warning' : variant === 'success' ? 'Success' : 'Info';
  toastService.show(toast[variant](title, message));
}

function showMessage(message: string, variant: 'error' | 'warning' | 'info' | 'success', duration = 5000): void {
  const title = variant === 'error' ? 'Error' : variant === 'warning' ? 'Warning' : variant === 'success' ? 'Success' : 'Info';
  toastService.show(toast[variant](title, message, duration));
}

function confirmDialog(message: string, title = 'System Prompt'): Promise<boolean> {
  return Promise.resolve(window.confirm(`${title}: ${message}`));
}

interface LoadingInstance {
  close: () => void;
}

function showLoading(text: string): LoadingInstance {
  console.log(`Loading: ${text}`);
  return {
    close: () => console.log('Loading closed'),
  };
}

let downloadLoadingInstance: LoadingInstance;
export let isRelogin = { show: false };

axios.defaults.headers['Content-Type'] = 'application/json;charset=utf-8';

// Create an Axios instance.
const service = axios.create({
  baseURL: ENV.API_BASE_URL,
  timeout: 20000,
});

// Use InternalAxiosRequestConfig as the type for the interceptor callback.
service.interceptors.request.use(
  (config: InternalAxiosRequestConfig): InternalAxiosRequestConfig | Promise<InternalAxiosRequestConfig> => {
    // Ensure headers is defined to satisfy the type.
    config.headers = config.headers || {};
    const headers = config.headers as any; // you may further narrow this type if needed

    // Check if token should be attached.
    const isToken = headers.isToken === false;
    const isRepeatSubmit = headers.repeatSubmit === false;

    if (getToken() && !isToken) {
      headers['Authorization'] = 'Bearer ' + getToken();
    }

    // GET method: transform the params into a formatted query string.
    if (config.method?.toLowerCase() === 'get' && config.params) {
      let url = (config.url || '') + '?' + tansParams(config.params);
      url = url.slice(0, -1);
      config.params = {};
      config.url = url;
    }

    // Prevent duplicate submissions for POST/PUT requests.
    if (
      !isRepeatSubmit &&
      (config.method?.toLowerCase() === 'post' || config.method?.toLowerCase() === 'put')
    ) {
      const requestObj = {
        url: config.url,
        data: typeof config.data === 'object' ? JSON.stringify(config.data) : config.data,
        time: new Date().getTime(),
      };

      const requestSize = Object.keys(JSON.stringify(requestObj)).length;
      const limitSize = 5 * 1024 * 1024; // 5MB limit

      if (requestSize >= limitSize) {
        console.warn(
          `[${config.url}]: The requested data size exceeds the allowed 5M limit, so duplicate submission check is skipped.`
        );
        return config;
      }

      // Define an interface for your session object.
      interface RequestCache {
        url: string;
        data: string;
        time: number;
      }

      // In your interceptor:
const sessionObj = cache.session.getJSON('sessionObj') as RequestCache | null;

if (!sessionObj) {
  cache.session.setJSON('sessionObj', requestObj);
} else {
  const s_url: string = sessionObj.url;
  const s_data: string = sessionObj.data;
  const s_time: number = sessionObj.time; // now ts knows s_time is a number
  const interval = 2000; // Interval in ms

  if (
    s_data === requestObj.data &&
    requestObj.time - s_time < interval &&
    s_url === requestObj.url
  ) {
    const message = 'Data is being processed, please do not resubmit';
    console.warn(`[${s_url}]: ${message}`);
    return Promise.reject(new Error(message));
  } else {
    cache.session.setJSON('sessionObj', requestObj);
  }
}
    }
    return config;
  },
  error => {
    console.error(error);
    return Promise.reject(error);
  }
);

// Response interceptor remains similar
service.interceptors.response.use(
  async (res) => {
    const code: number = res.data.code || 200;
    const msg: string = errorCode[code] || res.data.msg || errorCode['default'];

    if (
      res.request.responseType === 'blob' ||
      res.request.responseType === 'arraybuffer'
    ) {
      return res.data;
    }

    if (code === 401) {
      if (!isRelogin.show) {
        isRelogin.show = true;
        try {
          const confirmed = await confirmDialog(
            'The login status has expired. You can stay or log in again.',
            'System Prompt'
          );
          isRelogin.show = false;
          if (confirmed) {
            await store.dispatch(logoutUser());
            location.href = '/login';
          }
        } catch (err) {
          isRelogin.show = false;
        }
      }
      return Promise.reject(new Error('Invalid session, please log in again.'));
    } else if (code === 500) {
      showMessage(msg, 'error');
      return Promise.reject(new Error(msg));
    } else if (code === 601) {
      showMessage(msg, 'warning');
      return Promise.reject(new Error('error'));
    } else if (code !== 200) {
      showNotification(msg, 'error');
      return Promise.reject(new Error('error'));
    } else {
      return res.data;
    }
  },
  error => {
    let { message } = error;
    if (message === 'Network Error') {
      message = 'Backend interface connection abnormality';
    } else if (message.includes('timeout')) {
      message = 'System interface request timeout';
    } else if (message.includes('Request failed with status code')) {
      message =
        'System interface ' +
        message.substr(message.length - 3) +
        ' abnormal';
    }
    showMessage(message, 'error', 5000);
    return Promise.reject(error);
  }
);

export function download(
  url: string,
  params: any,
  filename: string,
  config?: InternalAxiosRequestConfig
): Promise<void> {
  downloadLoadingInstance = showLoading('Downloading data, please wait.');
  return service
    .post(url, params, {
      transformRequest: [(params) => tansParams(params)],
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      responseType: 'blob',
      ...config,
    })
    .then(async (data: any) => {
      const isBlob: boolean = blobValidate(data);
      if (isBlob) {
        const blob = new Blob([data]);
        saveAs(blob, filename);
      } else {
        const resText = await data.text();
        const rspObj = JSON.parse(resText);
        const errMsg = errorCode[rspObj.code] || rspObj.msg || errorCode['default'];
        showMessage(errMsg, 'error');
      }
      downloadLoadingInstance.close();
    })
    .catch((r) => {
      console.error(r);
      showMessage(
        'An error occurred while downloading the file. Please contact the administrator!',
        'error'
      );
      downloadLoadingInstance.close();
    });
}

export default service;