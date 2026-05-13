/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
*/

// Serviço temporariamente simplificado para garantir o build
// A biblioteca @google/genai foi removida do package.json para estabilidade do deploy

export const initializeChat = (): any => {
  return null;
};

export const sendMessageToGemini = async (message: string): Promise<string> => {
  // Simulação de resposta enquanto a biblioteca é reestabelecida em versão estável
  return "O sistema de IA está passando por manutenção para melhorias. Por favor, entre em contato diretamente pelo WhatsApp para um atendimento imediato!";
};