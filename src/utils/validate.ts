/**
 * Checks if the given path is an external link (http, https, mailto, or tel).
 * @param {string} path The path to be checked.
 * @returns {boolean} Returns true if the path is external, otherwise false.
 */
  export function isExternal(path: string): boolean {
    return /^(https?:|mailto:|tel:)/.test(path);
  }
  
  /**
   * Validates if the given username is in the valid list.
   * @param {string} str The username to be checked.
   * @returns {boolean} Returns true if the username is valid, otherwise false.
   */
  export function validUsername(str: string): boolean {
    const valid_map = ['admin', 'editor'];
    return valid_map.indexOf(str.trim()) >= 0;
  }
  
  /**
   * Validates if the given string is a valid URL.
   * @param {string} url The URL to be checked.
   * @returns {boolean} Returns true if the URL is valid, otherwise false.
   */
  export function validURL(url: string): boolean {
    const reg = /^(https?|ftp):\/\/([a-zA-Z0-9.-]+(:[a-zA-Z0-9.&%$-]+)*@)*((25[0-5]|2[0-4][0-9]|1[0-9]{2}|[1-9][0-9]?)(\.(25[0-5]|2[0-4][0-9]|1[0-9]{2}|[1-9]?[0-9])){3}|([a-zA-Z0-9-]+\.)*[a-zA-Z0-9-]+\.(com|edu|gov|int|mil|net|org|biz|arpa|info|name|pro|aero|coop|museum|[a-zA-Z]{2}))(:[0-9]+)*(\/($|[a-zA-Z0-9.,?'\\+&%$#=~_-]+))*$/;
    return reg.test(url);
  }
  
  /**
   * Checks if the given string is all lowercase letters.
   * @param {string} str The string to be checked.
   * @returns {boolean} Returns true if the string is lowercase, otherwise false.
   */
  export function validLowerCase(str: string): boolean {
    const reg = /^[a-z]+$/;
    return reg.test(str);
  }
  
  /**
   * Checks if the given string is all uppercase letters.
   * @param {string} str The string to be checked.
   * @returns {boolean} Returns true if the string is uppercase, otherwise false.
   */
  export function validUpperCase(str: string): boolean {
    const reg = /^[A-Z]+$/;
    return reg.test(str);
  }
  
  /**
   * Checks if the given string contains only alphabets (both uppercase and lowercase).
   * @param {string} str The string to be checked.
   * @returns {boolean} Returns true if the string contains only alphabets, otherwise false.
   */
  export function validAlphabets(str: string): boolean {
    const reg = /^[A-Za-z]+$/;
    return reg.test(str);
  }
  
  /**
   * Validates if the given string is a valid email.
   * @param {string} email The email to be checked.
   * @returns {boolean} Returns true if the email is valid, otherwise false.
   */
  export function validEmail(email: string): boolean {
    const reg = /^(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
    return reg.test(email);
  }
  
  /**
   * Checks if the given value is a string.
   * @param {unknown} str The value to be checked.
   * @returns {boolean} Returns true if the value is a string, otherwise false.
   */
  export function isString(str: unknown): boolean {
    return typeof str === 'string' || str instanceof String;
  }
  
  /**
   * Checks if the given value is an array.
   * @param {unknown} arg The value to be checked.
   * @returns {boolean} Returns true if the value is an array, otherwise false.
   */
  export function isArray(arg: unknown): boolean {
    if (typeof Array.isArray === 'undefined') {
      return Object.prototype.toString.call(arg) === '[object Array]';
    }
    return Array.isArray(arg);
  }
  