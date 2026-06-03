export const isValidEmail = (email: string): boolean => {
  const regex = /^[^\s@]+@([^\s@.,]+\.)+[^\s@.,]{2,}$/;
  return regex.test(email);
};

export const isValidPhone = (phone: string): boolean => {
  const regex = /^[+]?[0-9]{8,15}$/;
  return regex.test(phone);
};

export const isValidPiAddress = (address: string): boolean => {
  return address.length >= 56 && /^[A-Z0-9]+$/.test(address);
};

export const isStrongPassword = (password: string): boolean => {
  const regex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/;
  return regex.test(password);
};