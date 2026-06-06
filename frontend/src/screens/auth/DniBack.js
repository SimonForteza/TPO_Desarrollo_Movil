import React from 'react';
import DniUploadTemplate from '../../components/DniUploadTemplate';

export default function DniBack({ navigation }) {
  return (
    <DniUploadTemplate 
      step="2" 
      buttonText="Enviar" 
      onNext={() => navigation.replace('VerificationPending')} 
    />
  );
}