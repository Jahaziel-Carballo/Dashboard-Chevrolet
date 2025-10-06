// src/hooks/useFileProcessor.js
import { useState } from 'react';
import { processExcel } from '../utils/kpiProcessor';
import { fileSha256Hex } from '../utils/fileHash';

export function useFileProcessor() {
  const [processing, setProcessing] = useState(false);

  const processFile = async (file) => {
    if (!file) return null;

    setProcessing(true);
    try {
      // Verificar que es un archivo Excel
      if (!file.name.match(/\.(xlsx|xls)$/i)) {
        throw new Error('Por favor, sube un archivo Excel válido (.xlsx o .xls)');
      }

      // Generar hash para identificar archivos únicos
      const fileHash = await fileSha256Hex(file);
      
      // Procesar el archivo
      const result = await processExcel(file);
      
      return {
        ...result,
        fileInfo: {
          name: file.name,
          size: file.size,
          type: file.type,
          hash: fileHash,
          uploadDate: new Date().toISOString()
        }
      };
    } catch (error) {
      console.error('Error procesando archivo:', error);
      throw error;
    } finally {
      setProcessing(false);
    }
  };

  return { processFile, processing };
}