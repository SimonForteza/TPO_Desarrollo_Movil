import React from 'react';
import DniUploadTemplate from '../../components/DniUploadTemplate';

export default function DniFront({ route, navigation }) {
  const { userData } = route.params;

  const handleNext = (fotoBase64) => {
    navigation.navigate('DniBack', {
      userData: {
        ...userData,
        fotoDniFrente: fotoBase64
      }
    });
  };

  return (
    <DniUploadTemplate 
      step="1" 
      buttonText="Continuar" 
      onNext={handleNext} 
    />
  );
}