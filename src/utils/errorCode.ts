const errorCode: Record<string, string> = {
    '401': 'Authentication failed and system resources cannot be accessed.',
    '403': 'There is no permission for the current operation',
    '404': 'Access resource does not exist',
    'default': 'Unknown system error, please report it to the administrator',
  };
  
  export default errorCode;