
import { SectorWhatsApp, SectorWhatsAppNumber } from "@/lib/types";

// Configuração dos números de WhatsApp por setor
let sectorPhones: SectorWhatsApp[] = [
  {
    sector: "RH",
    phoneNumbers: [
      {
        id: "1",
        phoneNumber: "+5511999999999" // Substituir pelo número real
      }
    ]
  },
  {
    sector: "DISCIPLINA",
    phoneNumbers: [
      {
        id: "2",
        phoneNumber: "+5511999999998" // Substituir pelo número real
      }
    ]
  },
  {
    sector: "DP",
    phoneNumbers: [
      {
        id: "3",
        phoneNumber: "+5511999999997" // Substituir pelo número real
      }
    ]
  },
  {
    sector: "PLANEJAMENTO",
    phoneNumbers: [
      {
        id: "4",
        phoneNumber: "+5511999999996" // Substituir pelo número real
      }
    ]
  }
];

export const getAllSectorPhones = (): SectorWhatsApp[] => {
  return sectorPhones;
};

export const updateSectorPhones = (newSectorPhones: SectorWhatsApp[]): void => {
  sectorPhones = newSectorPhones;
};

export const getWhatsAppNumbersForSector = (sector: "RH" | "DISCIPLINA" | "DP" | "PLANEJAMENTO"): SectorWhatsAppNumber[] => {
  const sectorPhone = sectorPhones.find(item => item.sector === sector);
  return sectorPhone?.phoneNumbers || [];
};

export const getWhatsAppNumberForSector = (sector: "RH" | "DISCIPLINA" | "DP" | "PLANEJAMENTO"): string => {
  const numbers = getWhatsAppNumbersForSector(sector);
  return numbers.length > 0 ? numbers[0].phoneNumber : "";
};

export const addPhoneNumberToSector = (sector: "RH" | "DISCIPLINA" | "DP" | "PLANEJAMENTO", phoneNumber: string): SectorWhatsAppNumber => {
  const newNumber: SectorWhatsAppNumber = {
    id: Date.now().toString(),
    phoneNumber
  };
  
  const sectorIndex = sectorPhones.findIndex(item => item.sector === sector);
  if (sectorIndex !== -1) {
    sectorPhones[sectorIndex].phoneNumbers.push(newNumber);
  } else {
    sectorPhones.push({
      sector,
      phoneNumbers: [newNumber]
    });
  }
  
  return newNumber;
};

export const removePhoneNumberFromSector = (sector: "RH" | "DISCIPLINA" | "DP" | "PLANEJAMENTO", numberId: string): boolean => {
  const sectorIndex = sectorPhones.findIndex(item => item.sector === sector);
  if (sectorIndex !== -1) {
    const phoneNumberIndex = sectorPhones[sectorIndex].phoneNumbers.findIndex(item => item.id === numberId);
    if (phoneNumberIndex !== -1) {
      sectorPhones[sectorIndex].phoneNumbers.splice(phoneNumberIndex, 1);
      return true;
    }
  }
  return false;
};

export const sendWhatsAppMessage = async (
  phoneNumber: string,
  message: string
): Promise<boolean> => {
  // Esta é uma implementação simulada
  // Em um ambiente real, você precisaria integrar com uma API como Twilio ou similar
  console.log(`Enviando mensagem WhatsApp para ${phoneNumber}:`, message);
  
  try {
    // Simular uma chamada de API
    await new Promise(resolve => setTimeout(resolve, 500));
    
    // Em uma implementação real, você chamaria a API aqui
    // Exemplo com Twilio (pseudocódigo):
    /*
    const response = await fetch('https://api.twilio.com/2010-04-01/Accounts/YOUR_ACCOUNT_SID/Messages.json', {
      method: 'POST',
      headers: {
        'Authorization': 'Basic ' + btoa('YOUR_ACCOUNT_SID:YOUR_AUTH_TOKEN'),
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: new URLSearchParams({
        'From': 'whatsapp:+YOUR_TWILIO_NUMBER',
        'To': `whatsapp:${phoneNumber}`,
        'Body': message
      }).toString()
    });
    
    return response.ok;
    */
    
    return true; // Simula sucesso
  } catch (error) {
    console.error("Erro ao enviar mensagem WhatsApp:", error);
    return false;
  }
};

export const sendWhatsAppMessageToSector = async (
  sector: "RH" | "DISCIPLINA" | "DP" | "PLANEJAMENTO",
  message: string
): Promise<boolean> => {
  const phoneNumbers = getWhatsAppNumbersForSector(sector);
  if (phoneNumbers.length === 0) {
    console.error("Nenhum número de telefone configurado para o setor:", sector);
    return false;
  }

  // Enviar para o primeiro número do setor (poderia ser modificado para enviar para todos)
  return sendWhatsAppMessage(phoneNumbers[0].phoneNumber, message);
};

// Função para criar a mensagem de notificação com base nos dados do atendimento
export const createAttendanceNotificationMessage = (
  name: string,
  registration: string,
  position: string,
  reason: string
): string => {
  return `
*NOVO ATENDIMENTO REGISTRADO*

*Nome:* ${name}
*Matrícula:* ${registration}
*Cargo:* ${position}
*Motivo do atendimento:* ${reason}

Por favor, verifique o sistema para mais detalhes.
`;
};
