// src/utils/formatters.js - VERSIÓN MEJORADA Y ROBUSTA

/**
 * Formatea valores monetarios con precisión y validación
 * @param {number} value - Valor numérico a formatear
 * @param {string} currency - Código de moneda (default: 'MXN')
 * @param {number} decimals - Decimales a mostrar (default: 0)
 * @param {boolean} showDecimalsForCents - Mostrar decimales para valores < 1000
 * @returns {string} Valor formateado en moneda
 */
export const formatCurrency = (value, currency = 'MXN', decimals = 0, showDecimalsForCents = true) => {
  // Validación robusta de entrada
  if (value === null || value === undefined || isNaN(value)) {
    console.warn('⚠️ formatCurrency: Valor inválido recibido:', value);
    return '$ —';
  }

  // Determinar decimales inteligentemente
  let finalDecimals = decimals;
  if (showDecimalsForCents && value !== 0 && Math.abs(value) < 1000) {
    finalDecimals = 2; // Mostrar centavos para valores pequeños
  }

  // Manejo especial para cero
  if (value === 0) {
    return new Intl.NumberFormat('es-MX', {
      style: 'currency',
      currency: currency,
      minimumFractionDigits: finalDecimals,
      maximumFractionDigits: finalDecimals
    }).format(0);
  }

  try {
    return new Intl.NumberFormat('es-MX', {
      style: 'currency',
      currency: currency,
      minimumFractionDigits: finalDecimals,
      maximumFractionDigits: finalDecimals
    }).format(value);
  } catch (error) {
    console.error('❌ Error en formatCurrency:', error, 'Valor:', value);
    return `$${formatNumber(value, finalDecimals)}`;
  }
};

/**
 * Formatea porcentajes con precisión y opciones flexibles
 * @param {number} value - Valor porcentual (ej: 15.5 para 15.5%)
 * @param {number} decimals - Decimales a mostrar (default: 2)
 * @param {boolean} alwaysShowSign - Siempre mostrar signo + para positivos
 * @param {boolean} showSignForZero - Mostrar signo para cero
 * @returns {string} Porcentaje formateado
 */
export const formatPercent = (value, decimals = 2, alwaysShowSign = false, showSignForZero = false) => {
  // Validación robusta
  if (value === null || value === undefined || isNaN(value)) {
    console.warn('⚠️ formatPercent: Valor inválido recibido:', value);
    return '—%';
  }

  // Redondeo preciso
  const factor = Math.pow(10, decimals);
  const roundedValue = Math.round(value * factor) / factor;
  
  // Determinar signo
  let sign = '';
  if (alwaysShowSign && roundedValue > 0) {
    sign = '+';
  } else if (roundedValue < 0) {
    sign = ''; // El signo negativo viene incluido en el número
  } else if (showSignForZero && roundedValue === 0) {
    sign = '±';
  }

  // Manejo de cero
  if (roundedValue === 0 && !showSignForZero) {
    return `0${decimals > 0 ? '.' + '0'.repeat(decimals) : ''}%`;
  }

  try {
    // Usar toLocaleString para formato consistente
    const numberPart = roundedValue.toLocaleString('es-MX', {
      minimumFractionDigits: decimals,
      maximumFractionDigits: decimals
    });
    
    return `${sign}${numberPart}%`;
  } catch (error) {
    console.error('❌ Error en formatPercent:', error, 'Valor:', value);
    return `${sign}${roundedValue.toFixed(decimals)}%`;
  }
};

/**
 * Formatea números con separadores de miles y decimales controlados
 * @param {number} value - Valor numérico
 * @param {number} decimals - Decimales a mostrar
 * @param {boolean} compact - Usar formato compacto (K, M) para números grandes
 * @returns {string} Número formateado
 */
export const formatNumber = (value, decimals = 0, compact = false) => {
  if (value === null || value === undefined || isNaN(value)) {
    return '—';
  }

  // Manejo especial para cero
  if (value === 0) {
    if (decimals > 0) {
      return `0${decimals > 0 ? '.' + '0'.repeat(decimals) : ''}`;
    }
    return '0';
  }

  try {
    if (compact && Math.abs(value) >= 1000) {
      return new Intl.NumberFormat('es-MX', {
        notation: 'compact',
        minimumFractionDigits: decimals,
        maximumFractionDigits: decimals
      }).format(value);
    }

    return new Intl.NumberFormat('es-MX', {
      minimumFractionDigits: decimals,
      maximumFractionDigits: decimals
    }).format(value);
  } catch (error) {
    console.error('❌ Error en formatNumber:', error, 'Valor:', value);
    return value.toFixed(decimals);
  }
};

/**
 * Determina el color CSS para representar tendencias
 * @param {number} value - Valor de la tendencia
 * @param {boolean} useIntensity - Usar intensidad de color basada en magnitud
 * @returns {string} Clase de color de Tailwind CSS
 */
export const getTrendColor = (value, useIntensity = false) => {
  if (value === null || value === undefined || isNaN(value)) {
    return 'text-gray-500';
  }

  if (useIntensity) {
    const absoluteValue = Math.abs(value);
    if (value > 0) {
      if (absoluteValue > 20) return 'text-green-700';
      if (absoluteValue > 10) return 'text-green-600';
      return 'text-green-500';
    } else if (value < 0) {
      if (absoluteValue > 20) return 'text-red-700';
      if (absoluteValue > 10) return 'text-red-600';
      return 'text-red-500';
    }
  }

  // Comportamiento original
  if (value > 0) return 'text-green-600';
  if (value < 0) return 'text-red-600';
  return 'text-gray-600';
};

/**
 * Obtiene ícono para representar tendencias
 * @param {number} value - Valor de la tendencia
 * @param {boolean} useArrows - Usar flechas en lugar de emojis
 * @returns {string} Ícono o emoji
 */
export const getTrendIcon = (value, useArrows = false) => {
  if (value === null || value === undefined || isNaN(value)) {
    return useArrows ? '→' : '➡️';
  }

  if (useArrows) {
    if (value > 5) return '↗';
    if (value > 0) return '↑';
    if (value < -5) return '↙';
    if (value < 0) return '↓';
    return '→';
  }

  // Emojis originales
  if (value > 0) return '↗️';
  if (value < 0) return '↘️';
  return '➡️';
};

/**
 * Formatea valores grandes en formato legible (K, M, B)
 * @param {number} value - Valor numérico
 * @param {number} decimals - Decimales a mostrar
 * @returns {string} Valor formateado de manera compacta
 */
export const formatCompact = (value, decimals = 1) => {
  if (value === null || value === undefined || isNaN(value)) {
    return '—';
  }

  const absValue = Math.abs(value);
  
  if (absValue >= 1000000000) {
    return `${(value / 1000000000).toFixed(decimals)}B`;
  }
  if (absValue >= 1000000) {
    return `${(value / 1000000).toFixed(decimals)}M`;
  }
  if (absValue >= 1000) {
    return `${(value / 1000).toFixed(decimals)}K`;
  }
  
  return formatNumber(value, 0);
};

/**
 * Valida y limpia valores numéricos antes del formateo
 * @param {*} value - Valor a validar
 * @returns {number|undefined} Valor numérico limpio o undefined si es inválido
 */
export const sanitizeNumber = (value) => {
  if (typeof value === 'number' && !isNaN(value)) {
    return value;
  }
  
  if (typeof value === 'string') {
    // Limpiar strings: remover caracteres no numéricos excepto punto y signo
    const clean = value.replace(/[^\d.-]/g, '');
    const num = parseFloat(clean);
    if (!isNaN(num)) return num;
  }
  
  return undefined;
};

/**
 * Helper para formatear valores financieros con contexto apropiado
 * @param {number} value - Valor a formatear
 * @param {string} type - Tipo de valor: 'currency', 'percent', 'number'
 * @param {object} options - Opciones específicas del tipo
 * @returns {string} Valor formateado contextualmente
 */
export const formatFinancial = (value, type = 'currency', options = {}) => {
  const sanitized = sanitizeNumber(value);
  if (sanitized === undefined) {
    return '—';
  }

  const defaultOptions = {
    currency: {
      decimals: Math.abs(sanitized) < 1 ? 4 : (Math.abs(sanitized) < 1000 ? 2 : 0),
      showDecimalsForCents: true
    },
    percent: {
      decimals: 2,
      alwaysShowSign: true
    },
    number: {
      decimals: 0,
      compact: Math.abs(sanitized) >= 10000
    }
  };

  const typeOptions = { ...defaultOptions[type], ...options };

  switch (type) {
    case 'currency':
      return formatCurrency(sanitized, 'MXN', typeOptions.decimals, typeOptions.showDecimalsForCents);
    case 'percent':
      return formatPercent(sanitized, typeOptions.decimals, typeOptions.alwaysShowSign);
    case 'number':
      return formatNumber(sanitized, typeOptions.decimals, typeOptions.compact);
    default:
      return formatNumber(sanitized);
  }
};

// Alias para compatibilidad con código existente
export const formatMoney = formatCurrency;
export const formatPercentage = formatPercent;