function getEnvVar(key: string, defaultValue?: string): string {
  const value = import.meta.env[key as keyof ImportMetaEnv];
  if (value === undefined || value === '') {
    if (defaultValue !== undefined) return defaultValue;
    throw new Error(`Missing environment variable: ${key}`);
  }
  return value;
}

export const ENV = {
  API_BASE_URL: getEnvVar('VITE_API_BASE_URL'),
};
