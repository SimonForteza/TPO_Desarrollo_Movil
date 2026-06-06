import React from 'react';
import DniUploadTemplate from '../../components/DniUploadTemplate';

export default function DniFront({ navigation }) {
  return (
    <DniUploadTemplate 
      step="1" 
      buttonText="Continuar" 
      onNext={() => navigation.navigate('DniBack')} 
    />
  );
}