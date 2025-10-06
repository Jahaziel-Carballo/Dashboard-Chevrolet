// src/hooks/useFileManager.js
import { useState, useCallback } from 'react';
import { useApp } from '../contexts/AppContext';
import { processExcel } from '../utils/kpiProcessor';
import { fileSha256Hex } from '../utils/fileHash';

export function useFileManager() {
  const { state, dispatch } = useApp();
  const [processing, setProcessing] = useState(false);
  const [batchProgress, setBatchProgress] = useState({ current: 0, total: 0 });

  // Procesar un solo archivo
  const processSingleFile = async (file) => {
    if (!file) return null;

    setProcessing(true);
    try {
      if (!file.name.match(/\.(xlsx|xls)$/i)) {
        throw new Error('Por favor, sube un archivo Excel válido (.xlsx o .xls)');
      }

      const fileHash = await fileSha256Hex(file);
      
      // Verificar si el archivo ya fue procesado
      const existingFile = state.historicalData.find(item => item.fileInfo.hash === fileHash);
      if (existingFile) {
        throw new Error(`Este archivo ya fue procesado anteriormente: ${existingFile.fileInfo.name}`);
      }

      const result = await processExcel(file);
      
      const processedData = {
        ...result,
        id: `file_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
        fileInfo: {
          name: file.name,
          size: file.size,
          type: file.type,
          hash: fileHash,
          uploadDate: new Date().toISOString()
        },
        timestamp: new Date().toISOString(),
        displayName: file.name.replace('.xlsx', '').replace('.xls', '')
      };

      dispatch({ type: 'ADD_DATA', payload: processedData });
      return processedData;
    } catch (error) {
      console.error('Error procesando archivo:', error);
      throw error;
    } finally {
      setProcessing(false);
    }
  };

  // Procesar múltiples archivos
  const processMultipleFiles = async (files) => {
    const excelFiles = Array.from(files).filter(file => 
      file.name.match(/\.(xlsx|xls)$/i)
    );

    if (excelFiles.length === 0) {
      throw new Error('No se encontraron archivos Excel válidos');
    }

    setProcessing(true);
    setBatchProgress({ current: 0, total: excelFiles.length });

    try {
      const results = [];
      
      for (let i = 0; i < excelFiles.length; i++) {
        const file = excelFiles[i];
        setBatchProgress({ current: i + 1, total: excelFiles.length });

        try {
          const fileHash = await fileSha256Hex(file);
          
          // Verificar duplicados
          const existingFile = state.historicalData.find(item => item.fileInfo.hash === fileHash);
          if (!existingFile) {
            const result = await processExcel(file);
            const processedData = {
              ...result,
              id: `file_${Date.now()}_${i}_${Math.random().toString(36).substr(2, 9)}`,
              fileInfo: {
                name: file.name,
                size: file.size,
                type: file.type,
                hash: fileHash,
                uploadDate: new Date().toISOString()
              },
              timestamp: new Date().toISOString(),
              displayName: file.name.replace('.xlsx', '').replace('.xls', '')
            };

            dispatch({ type: 'ADD_DATA', payload: processedData });
            results.push(processedData);
          } else {
            console.log(`Archivo duplicado omitido: ${file.name}`);
          }
        } catch (fileError) {
          console.error(`Error procesando ${file.name}:`, fileError);
          // Continuar con el siguiente archivo
        }
      }

      return results;
    } finally {
      setProcessing(false);
      setBatchProgress({ current: 0, total: 0 });
    }
  };

  // Cargar datos de comparación
  const loadComparisonData = useCallback(() => {
    const comparisonData = state.comparisonSelection.map(id =>
      state.historicalData.find(item => item.id === id)
    ).filter(Boolean);

    dispatch({ type: 'SET_COMPARISON_DATA', payload: comparisonData });
    return comparisonData;
  }, [state.comparisonSelection, state.historicalData, dispatch]);

  // Exportar datos
  const exportData = useCallback((data) => {
    const dataStr = JSON.stringify(data, null, 2);
    const dataBlob = new Blob([dataStr], { type: 'application/json' });
    
    const url = URL.createObjectURL(dataBlob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `reporte_automotriz_${new Date().toISOString().split('T')[0]}.json`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  }, []);

  // Importar datos
  const importData = useCallback(async (file) => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      
      reader.onload = (e) => {
        try {
          const importedData = JSON.parse(e.target.result);
          
          // Validar estructura básica
          if (!importedData.kpis || !importedData.metadata) {
            throw new Error('Formato de archivo inválido');
          }

          const processedData = {
            ...importedData,
            id: `imported_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
            timestamp: new Date().toISOString(),
            fileInfo: importedData.fileInfo || {
              name: `imported_${new Date().toISOString()}`,
              size: file.size,
              type: file.type,
              uploadDate: new Date().toISOString()
            }
          };

          dispatch({ type: 'ADD_DATA', payload: processedData });
          resolve(processedData);
        } catch (error) {
          reject(new Error('Error importando archivo: Formato inválido'));
        }
      };
      
      reader.onerror = () => reject(new Error('Error leyendo archivo'));
      reader.readAsText(file);
    });
  }, [dispatch]);

  return {
    // Estado
    processing,
    batchProgress,
    
    // Acciones
    processSingleFile,
    processMultipleFiles,
    loadComparisonData,
    exportData,
    importData,
    
    // Utilidades
    hasData: state.historicalData.length > 0,
    canCompare: state.historicalData.length >= 2
  };
}