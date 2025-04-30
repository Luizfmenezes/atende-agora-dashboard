
import { SectorWhatsApp } from "@/lib/types";

// Configuração dos números de WhatsApp por setor
const sectorPhones: SectorWhatsApp[] = [
  {
    sector: "RH",
    phoneNumber: "+5511999999999" // Substituir pelo número real
  },
  {
    sector: "DISCIPLINA",
    phoneNumber: "+5511999999998" // Substituir pelo número real
  },
  {
    sector: "DP",
    phoneNumber: "+5511999999997" // Substituir pelo número real
  },
  {
    sector: "PLANEJAMENTO",
    phoneNumber: "+5511999999996" // Substituir pelo número real
  }
];

export const getWhatsAppNumberForSector = (sector: "RH" | "DISCIPLINA" | "DP" | "PLANEJAMENTO"): string => {
  const sectorPhone = sectorPhones.find(item => item.sector === sector);
  return sectorPhone?.phoneNumber || "";
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
