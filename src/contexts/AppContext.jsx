// src/contexts/AppContext.jsx
import React, { createContext, useContext, useReducer } from 'react';

const AppContext = createContext();

// Estado inicial expandido
const initialState = {
  // Archivo actualmente seleccionado para vista detallada
  currentData: null,
  // Todos los archivos procesados
  historicalData: [],
  // IDs de archivos seleccionados para comparación
  comparisonSelection: [],
  // Datos cargados para comparación
  comparisonData: [],
  // Modo de vista actual (single, comparison, historical)
  viewMode: 'single',
  // Filtros y configuraciones
  filters: {
    dateRange: {
      start: null,
      end: null
    },
    categories: ['ingresos', 'costos', 'gastos'],
    metrics: ['utilidad_neta', 'ingresos_totales', 'margen_neto']
  },
  loading: false,
  error: null,
  // Configuración de la aplicación
  settings: {
    autoProcess: true,
    keepHistory: true,
    maxFiles: 50
  }
};

function appReducer(state, action) {
  switch (action.type) {
    case 'SET_LOADING':
      return { ...state, loading: action.payload };
    
    case 'SET_ERROR':
      return { ...state, error: action.payload, loading: false };
    
    case 'ADD_DATA':
      const newData = {
        ...action.payload,
        id: `file_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
        timestamp: new Date().toISOString(),
        displayName: action.payload.fileInfo.name.replace('.xlsx', '').replace('.xls', '')
      };
      
      const updatedHistoricalData = state.settings.keepHistory 
        ? [...state.historicalData, newData].slice(-state.settings.maxFiles)
        : [newData];
      
      return {
        ...state,
        currentData: newData,
        historicalData: updatedHistoricalData,
        viewMode: 'single',
        loading: false,
        error: null
      };
    
    case 'SET_CURRENT_DATA':
      return { 
        ...state, 
        currentData: action.payload,
        viewMode: 'single'
      };
    
    case 'ADD_TO_COMPARISON':
      const isAlreadySelected = state.comparisonSelection.includes(action.payload);
      if (isAlreadySelected) {
        return state;
      }
      return {
        ...state,
        comparisonSelection: [...state.comparisonSelection, action.payload],
        viewMode: state.comparisonSelection.length >= 1 ? 'comparison' : 'single'
      };
    
    case 'REMOVE_FROM_COMPARISON':
      const updatedSelection = state.comparisonSelection.filter(id => id !== action.payload);
      return {
        ...state,
        comparisonSelection: updatedSelection,
        viewMode: updatedSelection.length >= 2 ? 'comparison' : 'single'
      };
    
    case 'CLEAR_COMPARISON':
      return {
        ...state,
        comparisonSelection: [],
        comparisonData: [],
        viewMode: 'single'
      };
    
    case 'SET_COMPARISON_DATA':
      return {
        ...state,
        comparisonData: action.payload,
        viewMode: 'comparison'
      };
    
    case 'SET_VIEW_MODE':
      return {
        ...state,
        viewMode: action.payload
      };
    
    case 'UPDATE_FILTERS':
      return {
        ...state,
        filters: { ...state.filters, ...action.payload }
      };
    
    case 'REMOVE_HISTORICAL_DATA':
      const filteredHistorical = state.historicalData.filter(item => item.id !== action.payload);
      const newCurrentData = state.currentData?.id === action.payload ? null : state.currentData;
      const filteredComparison = state.comparisonSelection.filter(id => id !== action.payload);
      
      return {
        ...state,
        historicalData: filteredHistorical,
        currentData: newCurrentData,
        comparisonSelection: filteredComparison,
        viewMode: filteredComparison.length >= 2 ? 'comparison' : 'single'
      };
    
    case 'CLEAR_ALL_DATA':
      return {
        ...initialState,
        settings: state.settings
      };
    
    case 'UPDATE_SETTINGS':
      return {
        ...state,
        settings: { ...state.settings, ...action.payload }
      };
    
    default:
      return state;
  }
}

export function AppProvider({ children }) {
  const [state, dispatch] = useReducer(appReducer, initialState);

  return (
    <AppContext.Provider value={{ state, dispatch }}>
      {children}
    </AppContext.Provider>
  );
}

export const useApp = () => {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error('useApp debe usarse dentro de AppProvider');
  }
  return context;
};