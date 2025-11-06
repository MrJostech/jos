export const getToken = () => {
  return localStorage.getItem('halcyon_token');
};

export const getUser = () => {
  const user = localStorage.getItem('halcyon_user');
  return user ? JSON.parse(user) : null;
};

export const setAuth = (token, user) => {
  localStorage.setItem('halcyon_token', token);
  localStorage.setItem('halcyon_user', JSON.stringify(user));
};

export const removeAuth = () => {
  localStorage.removeItem('halcyon_token');
  localStorage.removeItem('halcyon_user');
};

export const isAuthenticated = () => {
  return !!getToken();
};