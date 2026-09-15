export const calculateAge = (birthdate: string) => {
  const [year, month, day] = birthdate.split("-").map(Number);
  const today = new Date();

  let age = today.getFullYear() - year;
  const monthDiff = today.getMonth() - (month - 1); // JS months are 0-indexed

  if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < day)) {
    age--;
  }

  return age;
};