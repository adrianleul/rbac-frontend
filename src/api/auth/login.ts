import request from "../../utils/request";

// Login method
interface LoginResponse {
  msg: string;
  code: number;
  token: string;
}

export const login = (
  username: string,
  password: string,
  code: string,
  uuid: string
): Promise<LoginResponse> => {
  return request.post('/auth/login', { username, password, code, uuid }, {
    headers: {
      isToken: false,
      repeatSubmit: false,
    },
  });
};

// Registration method
export const register = async (data: Record<string, unknown>) => {
  return request.post('/auth/register', data, {
    headers: {
      isToken: false,
    },
  });
};

interface User {
    userId: string;
    userName: string;
    nickName: string;
    avatar: string;
}

interface GetUserInfoResponse {
    user: User;
    roles: string[];
    permissions: string[];
}

// Get user details
export const getInfo = async (): Promise<GetUserInfoResponse> => {
  return request.get('/auth/getInfo', {
    timeout: 20000,
  });
};

// Logout method
export const logout = async () => {
  return request.post('/logout', {});
};

interface CaptchaResponse {
  msg: string;
  img: string;
  code: number;
  captchaEnabled: boolean;
  uuid: string;
}

export const getCodeImg = (): Promise<CaptchaResponse> => {
  return request.get('/captchaImage', {
    headers: {
      isToken: 'false',
    },
    timeout: 20000,
  });
};
