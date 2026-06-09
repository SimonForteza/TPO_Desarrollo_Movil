export const validateUserData = (data) => {
  const { nombre, apellido, email, cuil } = data;
  
  // Regex para nombre/apellido: solo letras, espacios y caracteres latinos
  const nameRegex = /^[a-zA-ZáéíóúÁÉÍÓÚñÑ\s]+$/;
  
  if (!nombre || !nameRegex.test(nombre)) return "El nombre es inválido (solo letras).";
  if (!apellido || !nameRegex.test(apellido)) return "El apellido es inválido (solo letras).";
  
  // Email simple
  if (!email || !/\S+@\S+\.\S+/.test(email)) return "El email es inválido.";
  
  return null; // Si es null, todo está bien
};