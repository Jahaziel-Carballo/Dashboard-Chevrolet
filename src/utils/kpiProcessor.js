// src/utils/kpiProcessor.js - VERSIÓN PERFECCIONADA
import * as XLSX from "xlsx";

/**
 * Función principal hiper-mejorada - Con inteligencia adaptativa para archivos reales
 */
export async function processExcel(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();

    reader.onload = (e) => {
      try {
        console.log("🚀 INICIANDO PROCESAMIENTO INTELIGENTE DE EXCEL");
        const data = new Uint8Array(e.target.result);
        const workbook = XLSX.read(data, { type: "array" });

        // ==================== DETECCIÓN INTELIGENTE DE HOJA ====================
        console.log("🔍 FASE 1: DETECCIÓN INTELIGENTE DE HOJA");
        const sheetNames = workbook.SheetNames;
        
        // Estrategia de prioridad para nombres de hojas
        const sheetPriority = [
          { pattern: 'edo de resultado', weight: 100 },
          { pattern: 'estado de resultado', weight: 95 },
          { pattern: 'resultado', weight: 90 },
          { pattern: 'edo. de resultado', weight: 85 },
          { pattern: 'resumen', weight: 80 },
          { pattern: 'consolidado', weight: 75 },
          { pattern: 'detalle', weight: 70 },
          { pattern: 'hoja1', weight: 60 },
          { pattern: 'sheet1', weight: 50 }
        ];

        let bestSheet = { name: null, score: 0 };
        
        sheetNames.forEach(sheetName => {
          const lowerSheet = sheetName.toLowerCase();
          let sheetScore = 0;
          
          sheetPriority.forEach(({ pattern, weight }) => {
            if (lowerSheet.includes(pattern)) {
              sheetScore += weight;
            }
          });

          // Bonus por coincidencia exacta
          if (lowerSheet === 'edo de resultados' || lowerSheet === 'estado de resultados') {
            sheetScore += 50;
          }

          if (sheetScore > bestSheet.score) {
            bestSheet = { name: sheetName, score: sheetScore };
          }
        });

        const targetSheet = bestSheet.name || sheetNames[0];
        console.log(`📊 Hoja seleccionada: "${targetSheet}" (score: ${bestSheet.score}) de opciones:`, sheetNames);
        
        const worksheet = workbook.Sheets[targetSheet];

        // Convertir a JSON manteniendo estructura de columnas
        const jsonData = XLSX.utils.sheet_to_json(worksheet, {
          header: 1,
          defval: "",
          blankrows: false
        });

        if (!jsonData || jsonData.length === 0) {
          return reject("Archivo Excel vacío o hoja no encontrada");
        }

        console.log(`📈 Datos crudos cargados: ${jsonData.length} filas, ${jsonData[0]?.length || 0} columnas`);

        // ==================== DETECCIÓN INTELIGENTE DE ENCABEZADOS ====================
        console.log("🔍 FASE 2: DETECCIÓN INTELIGENTE DE ENCABEZADOS");
        
        let headerRowIndex = -1;
        let headerConfidence = 0;

        // Patrones de encabezados con pesos
        const headerPatterns = [
          { pattern: "concepto", weight: 100 },
          { pattern: "descripción", weight: 90 },
          { pattern: "cuenta", weight: 85 },
          { pattern: "partida", weight: 80 },
          { pattern: "rubro", weight: 75 }
        ];

        // Buscar en las primeras 20 filas
        for (let i = 0; i < Math.min(20, jsonData.length); i++) {
          const row = jsonData[i];
          if (!row || row.length === 0) continue;

          let rowScore = 0;
          let firstCell = String(row[0] || "").toLowerCase().trim();

          // Evaluar patrones en la primera celda
          headerPatterns.forEach(({ pattern, weight }) => {
            if (firstCell.includes(pattern)) {
              rowScore += weight;
            }
          });

          // Bonus por estructura de encabezado (múltiples columnas con texto)
          let textColumns = 0;
          for (let j = 0; j < Math.min(10, row.length); j++) {
            const cell = String(row[j] || "");
            if (cell.trim().length > 2 && !cell.match(/^\d+[,.]?\d*$/)) {
              textColumns++;
            }
          }
          
          if (textColumns >= 3) {
            rowScore += 30;
          }

          // Bonus por presencia de palabras clave financieras
          const financialKeywords = ['ventas', 'costos', 'gastos', 'utilidad', 'ingresos', 'resultado'];
          let keywordMatches = 0;
          for (let j = 0; j < row.length; j++) {
            const cell = String(row[j] || "").toLowerCase();
            financialKeywords.forEach(keyword => {
              if (cell.includes(keyword)) keywordMatches++;
            });
          }
          rowScore += keywordMatches * 5;

          if (rowScore > headerConfidence) {
            headerConfidence = rowScore;
            headerRowIndex = i;
          }
        }

        // Fallback estratégico
        if (headerRowIndex === -1) {
          console.log("⚠️  No se encontró encabezado claro, usando estrategia de fallback");
          // Buscar fila que contenga "RESULTADOS" o "INGRESOS" y usar la siguiente
          for (let i = 0; i < Math.min(15, jsonData.length); i++) {
            const row = jsonData[i];
            if (row && row.length > 0) {
              const firstCell = String(row[0] || "").toLowerCase();
              if (firstCell.includes("resultado") || firstCell.includes("ingreso")) {
                headerRowIndex = i + 1;
                console.log(`🔄 Fallback: encabezado en fila ${headerRowIndex} (después de '${firstCell}')`);
                break;
              }
            }
          }
        }

        if (headerRowIndex === -1) {
          headerRowIndex = 4; // Último recurso
          console.log(`🔄 Último recurso: usando fila ${headerRowIndex} como encabezado`);
        }

        console.log(`✅ Encabezados en fila ${headerRowIndex} (confianza: ${headerConfidence})`);

        const headerRow = jsonData[headerRowIndex] || [];
        console.log("📋 Muestra de encabezados:", headerRow.slice(0, 8).map(h => `"${h}"`).join(', '));

        // ==================== ANÁLISIS INTELIGENTE DE COLUMNAS ====================
        console.log("🔍 FASE 3: ANÁLISIS INTELIGENTE DE COLUMNAS");

        // Analizar todas las columnas
        const columnAnalysis = [];
        for (let col = 0; col < headerRow.length; col++) {
          const headerText = String(headerRow[col] || "").toLowerCase().trim();
          
          // Analizar contenido de datos
          let numericDataCount = 0;
          let totalValue = 0;
          let maxValue = 0;
          let sampleValues = [];
          let zeroCount = 0;

          for (let row = headerRowIndex + 1; row < Math.min(headerRowIndex + 50, jsonData.length); row++) {
            if (jsonData[row] && jsonData[row][col] !== undefined && jsonData[row][col] !== "") {
              const value = parseExcelValue(jsonData[row][col]);
              if (!isNaN(value)) {
                if (value === 0) {
                  zeroCount++;
                } else {
                  numericDataCount++;
                  totalValue += Math.abs(value);
                  maxValue = Math.max(maxValue, Math.abs(value));
                  if (sampleValues.length < 10) sampleValues.push(value);
                }
              }
            }
          }

          const avgValue = numericDataCount > 0 ? totalValue / numericDataCount : 0;
          const dataDensity = numericDataCount / Math.min(30, jsonData.length - headerRowIndex - 1);

          columnAnalysis.push({
            index: col,
            header: headerText,
            numericDataCount,
            dataDensity,
            avgValue,
            maxValue,
            zeroCount,
            sampleValues,
            currentScore: 0,
            previousScore: 0
          });
        }

        console.log("📊 Resumen análisis columnas:", columnAnalysis.map(c => ({
          col: c.index,
          header: c.header.substring(0, 20),
          datos: c.numericDataCount,
          densidad: c.dataDensity.toFixed(2),
          avg: Math.round(c.avgValue)
        })));

        // Sistema de scoring inteligente para columnas - AJUSTADO
        columnAnalysis.forEach(col => {
          let currentScore = 0;
          let previousScore = 0;

          const header = col.header;

          // === SCORING PARA COLUMNA ACTUAL ===
          // Por texto en encabezado - MEJORADO
          if (header.includes("2025")) currentScore += 100;
          if (header.includes("2024")) currentScore -= 50;
          
          if (header.includes("actual")) currentScore += 80;
          if (header.includes("presupuesto")) currentScore -= 40;
          if (header.includes("variacion")) currentScore -= 30;
          if (header.includes("año anterior") || header.includes("anio anterior")) currentScore -= 60;
          
          // Por mes actual (detectar dinámicamente) - MEJORADO
          const months = ['enero', 'febrero', 'marzo', 'abril', 'mayo', 'junio', 
                         'julio', 'agosto', 'septiembre', 'octubre', 'noviembre', 'diciembre'];
          months.forEach(month => {
            if (header.includes(month)) {
              currentScore += 70;
              // Bonus adicional si coincide con el mes actual aproximado
              const currentMonth = new Date().getMonth();
              const monthIndex = months.indexOf(month);
              if (monthIndex === currentMonth || monthIndex === currentMonth - 1) {
                currentScore += 20;
              }
            }
          });

          // Por datos (columnas con muchos datos son más probables) - AJUSTADO
          currentScore += Math.min(col.numericDataCount * 2, 50); // Reducido de 3 a 2
          currentScore += Math.min(col.dataDensity * 80, 30); // Ajustado
          
          // Por posición (las columnas actuales suelen estar más a la derecha) - MEJORADO
          const positionBonus = (col.index / headerRow.length) * 40; // Reducido de 50 a 40
          currentScore += positionBonus;

          // Por magnitud (las columnas actuales suelen tener valores más grandes) - AJUSTADO
          if (col.maxValue > 1000000) currentScore += 15; // Reducido
          if (col.maxValue > 10000000) currentScore += 25; // Reducido

          // === SCORING PARA COLUMNA AÑO ANTERIOR === - MEJORADO
          if (header.includes("2024")) previousScore += 100;
          if (header.includes("2023")) previousScore += 80;
          if (header.includes("año anterior") || header.includes("anio anterior")) previousScore += 90;
          if (header.includes("anterior")) previousScore += 70;
          if (header.includes("compar")) previousScore += 30;
          
          // Penalizar por ser muy reciente
          if (header.includes("2025")) previousScore -= 80;
          if (header.includes("actual")) previousScore -= 60;
          
          // Por datos - AJUSTADO
          previousScore += Math.min(col.numericDataCount * 2, 40);
          previousScore += Math.min(col.dataDensity * 70, 25); // Reducido
          
          // Por posición (las columnas anteriores suelen estar más a la izquierda) - MEJORADO
          const previousPositionBonus = ((headerRow.length - col.index) / headerRow.length) * 35; // Reducido
          previousScore += previousPositionBonus;

          // Bonus por ser claramente del año anterior - NUEVO
          if (header.includes("2024") && header.includes("año anterior")) {
            previousScore += 50;
          }

          col.currentScore = Math.max(0, currentScore);
          col.previousScore = Math.max(0, previousScore);
        });

        // Seleccionar mejores candidatos - MEJORADO
        const currentCandidates = columnAnalysis
          .filter(col => !col.header.includes("año anterior") && 
                         !col.header.includes("anio anterior") &&
                         !col.header.includes("2024"))
          .sort((a, b) => b.currentScore - a.currentScore);

        const previousCandidates = columnAnalysis
          .filter(col => col.header.includes("2024") || 
                         col.header.includes("año anterior") ||
                         col.header.includes("anio anterior"))
          .sort((a, b) => b.previousScore - a.previousScore);

        // Si no hay candidatos claros para año anterior, buscar cualquier columna que no sea la actual
        if (previousCandidates.length === 0) {
          previousCandidates.push(...columnAnalysis
            .filter(col => col.index !== (currentCandidates[0]?.index || -1))
            .sort((a, b) => b.previousScore - a.previousScore));
        }

        console.log("🎯 Top 3 candidatos ACTUALES:", currentCandidates.slice(0, 3).map(c => ({
          col: c.index,
          header: c.header,
          score: c.currentScore
        })));

        console.log("🎯 Top 3 candidatos AÑO ANTERIOR:", previousCandidates.slice(0, 3).map(c => ({
          col: c.index,
          header: c.header,
          score: c.previousScore
        })));

        // Asignar columnas con validación - MEJORADO
        let currentMonthCol = -1;
        let previousYearCol = -1;

        if (currentCandidates.length > 0 && currentCandidates[0].currentScore > 25) { // Reducido umbral
          currentMonthCol = currentCandidates[0].index;
          console.log(`✅ Columna ACTUAL asignada: ${currentMonthCol} - "${currentCandidates[0].header}" (score: ${currentCandidates[0].currentScore})`);
        } else {
          // Fallback de emergencia: columna más a la derecha con datos
          for (let col = headerRow.length - 1; col >= 0; col--) {
            if (columnAnalysis[col].numericDataCount >= 3) { // Reducido requerimiento
              currentMonthCol = col;
              console.log(`🔄 Columna ACTUAL (fallback emergencia): ${col}`);
              break;
            }
          }
        }

        if (previousCandidates.length > 0 && previousCandidates[0].previousScore > 25) { // Reducido umbral
          previousYearCol = previousCandidates[0].index;
          console.log(`✅ Columna AÑO ANTERIOR asignada: ${previousYearCol} - "${previousCandidates[0].header}" (score: ${previousCandidates[0].previousScore})`);
        } else {
          // Fallback: buscar cualquier columna con "año anterior" o "2024"
          for (let col = 0; col < headerRow.length; col++) {
            const header = String(headerRow[col] || "").toLowerCase();
            if (header.includes("año anterior") || header.includes("anio anterior") || header.includes("2024")) {
              previousYearCol = col;
              console.log(`🔄 Columna AÑO ANTERIOR (fallback textual): ${col}`);
              break;
            }
          }
        }

        // VALIDACIÓN CRÍTICA: Evitar columnas duplicadas - MEJORADO
        if (currentMonthCol !== -1 && previousYearCol !== -1 && currentMonthCol === previousYearCol) {
          console.warn("❌ CRÍTICO: Columnas actual y anterior son la misma! Ejecutando recuperación...");
          
          // Buscar alternativa para año anterior
          const alternativePrevious = previousCandidates.find(candidate => 
            candidate.index !== currentMonthCol && candidate.previousScore > 15 // Umbral reducido
          );
          
          if (alternativePrevious) {
            previousYearCol = alternativePrevious.index;
            console.log(`🔁 Columna AÑO ANTERIOR corregida: ${previousYearCol}`);
          } else {
            // Buscar cualquier columna diferente con datos
            for (let col = 0; col < headerRow.length; col++) {
              if (col !== currentMonthCol && columnAnalysis[col].numericDataCount >= 2) { // Reducido requerimiento
                previousYearCol = col;
                console.log(`🔁 Columna AÑO ANTERIOR (emergencia): ${col}`);
                break;
              }
            }
          }
        }

        // Validaciones finales - MEJORADO
        if (currentMonthCol === -1) {
          // Último recurso absoluto: primera columna con datos
          for (let col = 0; col < headerRow.length; col++) {
            if (columnAnalysis[col].numericDataCount > 0) {
              currentMonthCol = col;
              console.log(`🆘 COLUMNA ACTUAL (último recurso): ${col}`);
              break;
            }
          }
          if (currentMonthCol === -1) {
            return reject("No se pudo detectar ninguna columna con datos del período actual");
          }
        }

        if (previousYearCol === -1) {
          console.warn("⚠️  No se encontró columna del año anterior, se usarán valores por defecto");
          // En lugar de usar la misma columna, buscar una alternativa diferente
          for (let col = 0; col < headerRow.length; col++) {
            if (col !== currentMonthCol && columnAnalysis[col].numericDataCount >= 2) {
              previousYearCol = col;
              console.log(`🔄 Columna AÑO ANTERIOR (alternativa): ${col}`);
              break;
            }
          }
          if (previousYearCol === -1) {
            previousYearCol = currentMonthCol; // Último recurso absoluto
          }
        }

        console.log(`🎊 ASIGNACIÓN FINAL: Actual=Col${currentMonthCol}, Anterior=Col${previousYearCol}`);

        // ==================== EXTRACCIÓN INTELIGENTE DE CONCEPTOS ====================
        console.log("🔍 FASE 4: EXTRACCIÓN INTELIGENTE DE CONCEPTOS");

        const conceptMap = new Map();
        const allConcepts = [];

        for (let i = headerRowIndex + 1; i < jsonData.length; i++) {
          const row = jsonData[i];
          if (!row || row.length === 0) continue;

          const concept = String(row[0] || "").trim();
          if (!concept || concept.length < 2) continue;

          // Excluir encabezados de sección - LISTA EXPANDIDA
          const sectionHeaders = [
            "RESULTADOS", "INGRESOS NETOS", "TOTAL DE COSTOS", 
            "UTILIDAD/PERDIDA BRUTA", "TOTAL DE GASTOS DE OPERACIÓN",
            "COSTO INTEGRAL DEL FINANCIAMIENTO", "OTROS GASTOS Y PRODUCTOS",
            "GASTOS EXTRAORDINARIOS", "FLUJO OPERATIVO", "CONCEPTO"
          ];
          
          if (sectionHeaders.some(header => concept.toUpperCase().includes(header))) continue;

          const normalizedConcept = concept.toLowerCase().replace(/\s+/g, " ").trim();
          conceptMap.set(normalizedConcept, row);
          allConcepts.push(normalizedConcept);
        }

        console.log(`📝 ${allConcepts.length} conceptos únicos encontrados`);

        // Función de búsqueda ultra-robusta - MEJORADA
        const findValueEnhanced = (searchPatterns, columnIndex, isRequired = false) => {
          if (!Array.isArray(searchPatterns)) searchPatterns = [searchPatterns];

          // Estrategia 1: Búsqueda exacta
          for (const pattern of searchPatterns) {
            const normalizedPattern = pattern.toLowerCase().replace(/\s+/g, " ").trim();
            
            const exactMatch = conceptMap.get(normalizedPattern);
            if (exactMatch && exactMatch[columnIndex] !== undefined && exactMatch[columnIndex] !== "") {
              const value = parseExcelValue(exactMatch[columnIndex]);
              if (value !== 0 || !isRequired) {
                console.log(`✅ Encontrado EXACTO: "${pattern}" -> ${value} en columna ${columnIndex}`);
                return value;
              }
            }
          }

          // Estrategia 2: Búsqueda por coincidencia flexible (80%+) - AJUSTADO
          for (const pattern of searchPatterns) {
            const normalizedPattern = pattern.toLowerCase().replace(/\s+/g, " ").trim();
            const patternWords = normalizedPattern.split(' ').filter(w => w.length > 2);

            for (const [concept, row] of conceptMap.entries()) {
              let matches = 0;
              patternWords.forEach(word => {
                if (concept.includes(word)) matches++;
              });

              const matchRatio = matches / patternWords.length;
              if (matchRatio >= 0.80) { // Reducido de 0.85 a 0.80
                const value = parseExcelValue(row[columnIndex]);
                if (value !== 0 || !isRequired) {
                  console.log(`✅ Encontrado FLEXIBLE (${Math.round(matchRatio*100)}%): "${pattern}" -> ${value}`);
                  return value;
                }
              }
            }
          }

          // Estrategia 3: Búsqueda por sinónimos expandida - MEJORADA
          const synonymMap = {
            'ventas de autos nuevos': ['venta de autos nuevos', 'autos nuevos', 'ventas autos nuevos', 'vehiculos nuevos', 'ventas autos'],
            'ventas de f&i': ['f&i', 'financiamiento', 'ventas financiamiento', 'financiamientos', 'f y i'],
            'utilidad/perdida bruta': ['utilidad bruta', 'margin bruta', 'resultado bruto', 'bruto', 'utilidad bruta total'],
            'utilidad/perdida operación': ['utilidad operación', 'resultado operativo', 'utilidad operativa', 'operación', 'resultado operación'],
            'utilidad/perdida neta': ['utilidad neta', 'resultado neto', 'utilidad del ejercicio', 'neta', 'utilidad final'],
            'refacciones y accesorios (mostrador)': ['refacciones mostrador', 'mostrador', 'refacciones (mostrador)', 'refacciones mostrador'],
            'refacciones y accesorios (ventanilla)': ['refacciones ventanilla', 'ventanilla', 'refacciones (ventanilla)', 'refacciones ventanilla'],
            'refacciones y accesorios (mayoreo)': ['refacciones mayoreo', 'mayoreo', 'refacciones (mayoreo)', 'refacciones mayoreo'],
            'total de gastos de operación': ['gastos de operación totales', 'total gastos operación', 'gastos operación', 'gastos operativos totales'],
            'ventas de autos usados': ['autos usados', 'ventas usados', 'vehiculos usados', 'venta autos usados'],
            'servicio arlux': ['servicio arltux', 'artlux', 'arlux servicio'] // Corrección de typo común
          };

          for (const pattern of searchPatterns) {
            if (synonymMap[pattern]) {
              for (const synonym of synonymMap[pattern]) {
                for (const [concept, row] of conceptMap.entries()) {
                  if (concept.includes(synonym)) {
                    const value = parseExcelValue(row[columnIndex]);
                    if (value !== 0 || !isRequired) {
                      console.log(`✅ Encontrado por SINÓNIMO: "${pattern}" -> ${value} via "${synonym}"`);
                      return value;
                    }
                  }
                }
              }
            }
          }

          // Estrategia 4: Búsqueda por palabras clave individuales - NUEVA
          for (const pattern of searchPatterns) {
            const keywords = pattern.toLowerCase().split(' ').filter(w => w.length > 3);
            let bestMatch = { concept: null, score: 0, value: 0 };
            
            for (const [concept, row] of conceptMap.entries()) {
              let score = 0;
              keywords.forEach(keyword => {
                if (concept.includes(keyword)) score++;
              });
              
              if (score > bestMatch.score && score >= keywords.length * 0.6) {
                const value = parseExcelValue(row[columnIndex]);
                bestMatch = { concept, score, value };
              }
            }
            
            if (bestMatch.score > 0) {
              console.log(`✅ Encontrado por KEYWORDS (score: ${bestMatch.score}): "${pattern}" -> ${bestMatch.value}`);
              return bestMatch.value;
            }
          }

          if (isRequired) {
            console.warn(`❌ Concepto REQUERIDO no encontrado: ${searchPatterns[0]}`);
            // Para conceptos requeridos, buscar cualquier valor en la columna que parezca relevante
            for (const [concept, row] of conceptMap.entries()) {
              if (concept.includes(searchPatterns[0].split(' ')[0])) {
                const value = parseExcelValue(row[columnIndex]);
                if (value !== 0) {
                  console.log(`🔄 Usando valor alternativo para requerido: ${concept} -> ${value}`);
                  return value;
                }
              }
            }
          } else {
            console.log(`⚠️  Concepto opcional no encontrado: ${searchPatterns[0]}`);
          }

          return 0;
        };

        // ==================== DEFINICIÓN DE CONCEPTOS Y EXTRACCIÓN ====================
        console.log("🔍 FASE 5: EXTRACCIÓN DE DATOS");

        const conceptos = {
          // INGRESOS - LISTA EXPANDIDA
          ventas_autos_nuevos: ["ventas de autos nuevos", "autos nuevos"],
          ventas_unidades_flotillas: ["ventas de unidades a flotillas", "unidades flotillas", "flotillas"],
          ventas_unidades_otros_distribuidores: ["ventas de unidades a otros distribuidores", "otros distribuidores"],
          ventas_financiamiento: ["ventas de f&i", "financiamiento", "f&i", "f y i"],
          ventas_refacciones: ["refacciones y accesorios (mostrador)", "refacciones mostrador", "refacciones"],
          ventas_refacciones_ventanilla: ["refacciones y accesorios (ventanilla)", "refacciones ventanilla"],
          ventas_refacciones_mayoreo: ["refacciones y accesorios (mayoreo)", "refacciones mayoreo"],
          ventas_servicio: ["servicio"],
          ventas_servicio_arlux: ["servicio arlux", "servicio arltux", "arlux"],
          ventas_polizas_garantia: ["polizas de garantia extendida", "garantia extendida"],
          ventas_hojalateria_refacciones: ["hojalateria y pintura refacciones", "hojalateria refacciones"],
          ventas_hojalateria_mano_obra: ["hojalateria y pintura mano de obra", "hojalateria mano obra"],
          ventas_autos_usados: ["ventas de autos usados", "autos usados"],

          // COSTOS - LISTA EXPANDIDA
          costos_autos_nuevos: ["costos de autos nuevos", "costo autos nuevos"],
          costo_unidades_flotillas: ["costo vta. unids. flotilla", "costo flotillas"],
          costo_unidades_otros_distribuidores: ["costo unids. de otros dist/filiales", "costo otros distribuidores"],
          costo_refacciones_mostrador: ["costo de refac. y acc. (mostrador)", "costo refacciones mostrador"],
          costo_refacciones_ventanilla: ["costo de refac. y acc. (ventanilla)", "costo refacciones ventanilla"],
          costo_refacciones_mayoreo: ["costo de refac. y acc. (mayoreo)", "costo refacciones mayoreo"],
          costo_servicio: ["costo de servicio"],
          costo_servicio_arlux: ["costo de servicio arlux", "costo servicio arltux"],
          costo_polizas_garantia: ["costo de polizas de garantía extendida", "costo garantia extendida"],
          costo_hojalateria_refacciones: ["costo de hojalateria y pintura refacciones", "costo hojalateria refacciones"],
          costo_hojalateria_mano_obra: ["costo de hojalateria y pintura m.o", "costo hojalateria mano obra"],
          costo_autos_usados: ["costo de autos usados", "costo autos usados"],

          // GASTOS OPERATIVOS (INDIVIDUALES)
          gastos_generales: ["gastos generales"],
          gastos_personal: ["gastos de personal"],
          comisiones_ventas: ["comisiones sobre ventas"],
          rentas: ["rentas"],
          
          // TOTALES CRÍTICOS (DIRECTOS DEL EXCEL)
          gastos_operacion_totales: ["total de gastos de operación", "gastos de operación totales", "total gastos operación"],
          utilidad_bruta: ["utilidad/perdida bruta", "utilidad bruta"],
          utilidad_operacion: ["utilidad/perdida operación", "utilidad operación"],
          utilidad_neta: ["utilidad/perdida neta", "utilidad/perdida del negocio", "utilidad neta"]
        };

        const kpis = {};

        console.log("=== EXTRACCIÓN DE DATOS ACTUALES ===");
        for (const [key, patterns] of Object.entries(conceptos)) {
          kpis[key] = findValueEnhanced(patterns, currentMonthCol, 
            key.includes('utilidad') || 
            key.includes('gastos_operacion_totales') ||
            key === 'ventas_autos_nuevos' // Concepto crítico
          );
        }

        console.log("=== EXTRACCIÓN DE DATOS AÑO ANTERIOR ===");
        for (const [key, patterns] of Object.entries(conceptos)) {
          kpis[`${key}_anio_anterior`] = findValueEnhanced(patterns, previousYearCol, false);
        }

        // ==================== VALIDACIÓN CRUZADA INTELIGENTE ====================
        console.log("🔍 FASE 6: VALIDACIÓN CRUZADA INTELIGENTE");

        // Detectar si las columnas son idénticas (error común) - MEJORADO
        let identicalColumnsDetected = true;
        const criticalComparisonKPIs = ['ventas_autos_nuevos', 'utilidad_neta', 'utilidad_bruta'];
        let differencesCount = 0;

        criticalComparisonKPIs.forEach(kpi => {
          const current = kpis[kpi];
          const previous = kpis[`${kpi}_anio_anterior`];
          // Tolerancia más estricta para detectar diferencias
          const difference = Math.abs(current - previous);
          const tolerance = Math.max(500, current * 0.005); // 0.5% o 500 pesos
          
          if (difference > tolerance) {
            identicalColumnsDetected = false;
            differencesCount++;
            console.log(`📊 Diferencia detectada en ${kpi}: ${current} vs ${previous} (diff: ${difference})`);
          }
        });

        if (identicalColumnsDetected && differencesCount === 0 && currentMonthCol !== previousYearCol) {
          console.error("❌ CRÍTICO: Columnas actual y anterior contienen datos MUY SIMILARES");
          
          // Recuperación automática: buscar columna alternativa para año anterior
          const alternativeColumns = columnAnalysis
            .filter(col => col.index !== currentMonthCol && col.numericDataCount >= 2)
            .sort((a, b) => b.numericDataCount - a.numericDataCount);

          if (alternativeColumns.length > 0) {
            const recoveryCol = alternativeColumns[0].index;
            console.log(`🔄 Recuperación: usando columna ${recoveryCol} para año anterior`);
            
            // Re-extraer datos del año anterior
            for (const [key, patterns] of Object.entries(conceptos)) {
              const newValue = findValueEnhanced(patterns, recoveryCol, false);
              if (newValue !== 0) {
                kpis[`${key}_anio_anterior`] = newValue;
              }
            }
          }
        }

        // ==================== CÁLCULOS Y VALIDACIONES MEJORADOS ====================
        console.log("🔍 FASE 7: CÁLCULOS Y VALIDACIONES MEJORADOS");

        // 1. INGRESOS TOTALES - CÁLCULO MÁS PRECISO
        kpis.ingresos_totales = 
          (kpis.ventas_autos_nuevos || 0) +
          (kpis.ventas_unidades_flotillas || 0) +
          (kpis.ventas_unidades_otros_distribuidores || 0) +
          (kpis.ventas_financiamiento || 0) +
          (kpis.ventas_refacciones || 0) +
          (kpis.ventas_refacciones_ventanilla || 0) +
          (kpis.ventas_refacciones_mayoreo || 0) +
          (kpis.ventas_servicio || 0) +
          (kpis.ventas_servicio_arlux || 0) +
          (kpis.ventas_polizas_garantia || 0) +
          (kpis.ventas_hojalateria_refacciones || 0) +
          (kpis.ventas_hojalateria_mano_obra || 0) +
          (kpis.ventas_autos_usados || 0);

        console.log("💰 Ingresos totales calculados:", kpis.ingresos_totales);

        // 2. COSTOS TOTALES - CÁLCULO MÁS PRECISO
        kpis.costos_totales =
          (kpis.costos_autos_nuevos || 0) +
          (kpis.costo_unidades_flotillas || 0) +
          (kpis.costo_unidades_otros_distribuidores || 0) +
          (kpis.costo_refacciones_mostrador || 0) +
          (kpis.costo_refacciones_ventanilla || 0) +
          (kpis.costo_refacciones_mayoreo || 0) +
          (kpis.costo_servicio || 0) +
          (kpis.costo_servicio_arlux || 0) +
          (kpis.costo_polizas_garantia || 0) +
          (kpis.costo_hojalateria_refacciones || 0) +
          (kpis.costo_hojalateria_mano_obra || 0) +
          (kpis.costo_autos_usados || 0);

        console.log("💸 Costos totales calculados:", kpis.costos_totales);

        // 3. GASTOS OPERACIÓN - ESTRATEGIA MEJORADA
        if (kpis.gastos_operacion_totales === 0) {
          console.log("🔄 Calculando gastos de operación (no se encontró total directo)");
          kpis.gastos_operacion_totales =
            (kpis.gastos_generales || 0) +
            (kpis.gastos_personal || 0) +
            (kpis.comisiones_ventas || 0) +
            (kpis.rentas || 0);
        } else {
          console.log("✅ Usando gastos de operación totales directos del Excel:", kpis.gastos_operacion_totales);
        }

        console.log("📊 Gastos operación totales (FINAL):", kpis.gastos_operacion_totales);

        // 4. GASTOS OPERACIÓN AÑO ANTERIOR
        if (kpis.gastos_operacion_totales_anio_anterior === 0) {
          console.log("🔄 Calculando gastos de operación año anterior (no se encontró total directo)");
          kpis.gastos_operacion_totales_anio_anterior =
            (kpis.gastos_generales_anio_anterior || 0) +
            (kpis.gastos_personal_anio_anterior || 0) +
            (kpis.comisiones_ventas_anio_anterior || 0) +
            (kpis.rentas_anio_anterior || 0);
        } else {
          console.log("✅ Usando gastos de operación año anterior directos del Excel:", kpis.gastos_operacion_totales_anio_anterior);
        }

        // 5. INGRESOS AÑO ANTERIOR
        kpis.ingresos_totales_anio_anterior =
          (kpis.ventas_autos_nuevos_anio_anterior || 0) +
          (kpis.ventas_unidades_flotillas_anio_anterior || 0) +
          (kpis.ventas_unidades_otros_distribuidores_anio_anterior || 0) +
          (kpis.ventas_financiamiento_anio_anterior || 0) +
          (kpis.ventas_refacciones_anio_anterior || 0) +
          (kpis.ventas_refacciones_ventanilla_anio_anterior || 0) +
          (kpis.ventas_refacciones_mayoreo_anio_anterior || 0) +
          (kpis.ventas_servicio_anio_anterior || 0) +
          (kpis.ventas_servicio_arlux_anio_anterior || 0) +
          (kpis.ventas_polizas_garantia_anio_anterior || 0) +
          (kpis.ventas_hojalateria_refacciones_anio_anterior || 0) +
          (kpis.ventas_hojalateria_mano_obra_anio_anterior || 0) +
          (kpis.ventas_autos_usados_anio_anterior || 0);

        // 6. COSTOS AÑO ANTERIOR
        kpis.costos_totales_anio_anterior =
          (kpis.costos_autos_nuevos_anio_anterior || 0) +
          (kpis.costo_unidades_flotillas_anio_anterior || 0) +
          (kpis.costo_unidades_otros_distribuidores_anio_anterior || 0) +
          (kpis.costo_refacciones_mostrador_anio_anterior || 0) +
          (kpis.costo_refacciones_ventanilla_anio_anterior || 0) +
          (kpis.costo_refacciones_mayoreo_anio_anterior || 0) +
          (kpis.costo_servicio_anio_anterior || 0) +
          (kpis.costo_servicio_arlux_anio_anterior || 0) +
          (kpis.costo_polizas_garantia_anio_anterior || 0) +
          (kpis.costo_hojalateria_refacciones_anio_anterior || 0) +
          (kpis.costo_hojalateria_mano_obra_anio_anterior || 0) +
          (kpis.costo_autos_usados_anio_anterior || 0);

        // VALIDACIONES CRUZADAS AUTOMÁTICAS - MEJORADAS
        const utilidadBrutaCalculada = kpis.ingresos_totales - kpis.costos_totales;
        const diferenciaUtilidadBruta = Math.abs(kpis.utilidad_bruta - utilidadBrutaCalculada);
        const toleranciaUtilidadBruta = Math.max(1000, kpis.utilidad_bruta * 0.02); // 2% de tolerancia

        if (kpis.utilidad_bruta === 0 || diferenciaUtilidadBruta > toleranciaUtilidadBruta) {
          console.warn(`⚠️  Corrección utilidad bruta: ${kpis.utilidad_bruta} -> ${utilidadBrutaCalculada} (diff: ${diferenciaUtilidadBruta})`);
          kpis.utilidad_bruta = utilidadBrutaCalculada;
        }

        const utilidadOperacionCalculada = kpis.utilidad_bruta - kpis.gastos_operacion_totales;
        const diferenciaUtilidadOperacion = Math.abs(kpis.utilidad_operacion - utilidadOperacionCalculada);
        const toleranciaUtilidadOperacion = Math.max(500, kpis.utilidad_operacion * 0.02); // 2% de tolerancia

        if (kpis.utilidad_operacion === 0 || diferenciaUtilidadOperacion > toleranciaUtilidadOperacion) {
          console.warn(`⚠️  Corrección utilidad operación: ${kpis.utilidad_operacion} -> ${utilidadOperacionCalculada} (diff: ${diferenciaUtilidadOperacion})`);
          kpis.utilidad_operacion = utilidadOperacionCalculada;
        }

        if (kpis.utilidad_bruta_anio_anterior === 0) {
          kpis.utilidad_bruta_anio_anterior = kpis.ingresos_totales_anio_anterior - kpis.costos_totales_anio_anterior;
          console.log("🔄 Utilidad bruta año anterior calculada:", kpis.utilidad_bruta_anio_anterior);
        }

        // ==================== MÉTRICAS DERIVADAS ====================
        console.log("🔍 FASE 8: CÁLCULO DE MÉTRICAS DERIVADAS");

        kpis.margen_bruto = kpis.ingresos_totales > 0 ?
          Number(((kpis.utilidad_bruta / kpis.ingresos_totales) * 100).toFixed(2)) : 0;

        kpis.margen_operativo = kpis.ingresos_totales > 0 ?
          Number(((kpis.utilidad_operacion / kpis.ingresos_totales) * 100).toFixed(2)) : 0;

        kpis.margen_neto = kpis.ingresos_totales > 0 ?
          Number(((kpis.utilidad_neta / kpis.ingresos_totales) * 100).toFixed(2)) : 0;

        // EFICIENCIA OPERATIVA MEJORADA
        kpis.ratio_eficiencia_operativa = kpis.ingresos_totales > 0 ?
          Number(((kpis.gastos_operacion_totales / kpis.ingresos_totales) * 100).toFixed(2)) : 0;

        console.log("🎯 Ratio eficiencia operativa calculado:", kpis.ratio_eficiencia_operativa);

        // Validación adicional para eficiencia operativa
        if (kpis.ratio_eficiencia_operativa === 0 && kpis.gastos_operacion_totales > 0 && kpis.ingresos_totales > 0) {
          console.warn("⚠️  Ratio eficiencia operativa es 0 pero hay datos. Recalculando...");
          kpis.ratio_eficiencia_operativa = Number(((kpis.gastos_operacion_totales / kpis.ingresos_totales) * 100).toFixed(2));
          console.log("🔁 Nuevo ratio eficiencia operativa:", kpis.ratio_eficiencia_operativa);
        }

        kpis.roi_personal = kpis.gastos_personal > 0 ?
          Number(((kpis.utilidad_operacion / kpis.gastos_personal) * 100).toFixed(2)) : 0;

        kpis.ratio_comisiones = kpis.ingresos_totales > 0 ?
          Number(((kpis.comisiones_ventas / kpis.ingresos_totales) * 100).toFixed(2)) : 0;

        // Crecimiento - MEJORADO
        if (kpis.utilidad_neta_anio_anterior !== 0) {
          kpis.crecimiento_utilidad_neta =
            Number((((kpis.utilidad_neta - kpis.utilidad_neta_anio_anterior) / Math.abs(kpis.utilidad_neta_anio_anterior)) * 100).toFixed(2));
        } else {
          kpis.crecimiento_utilidad_neta = kpis.utilidad_neta > 0 ? 100 : (kpis.utilidad_neta < 0 ? -100 : 0);
        }

        // Porcentajes de composición - MEJORADOS
        kpis.porcentaje_nuevos = kpis.ingresos_totales > 0 ?
          Number(((kpis.ventas_autos_nuevos / kpis.ingresos_totales) * 100).toFixed(2)) : 0;

        kpis.porcentaje_usados = kpis.ingresos_totales > 0 ?
          Number(((kpis.ventas_autos_usados / kpis.ingresos_totales) * 100).toFixed(2)) : 0;

        kpis.porcentaje_servicio = kpis.ingresos_totales > 0 ?
          Number((((kpis.ventas_servicio + kpis.ventas_servicio_arlux) / kpis.ingresos_totales) * 100).toFixed(2)) : 0;

        kpis.porcentaje_refacciones = kpis.ingresos_totales > 0 ?
          Number((((kpis.ventas_refacciones + kpis.ventas_refacciones_ventanilla + kpis.ventas_refacciones_mayoreo) / kpis.ingresos_totales) * 100).toFixed(2)) : 0;

        kpis.porcentaje_financiamiento = kpis.ingresos_totales > 0 ?
          Number(((kpis.ventas_financiamiento / kpis.ingresos_totales) * 100).toFixed(2)) : 0;

        // ==================== VALIDACIÓN FINAL Y METADATA ====================
        console.log("🔍 FASE 9: VALIDACIÓN FINAL");

        console.log("=== VERIFICACIÓN FINAL ===");
        console.log("💰 Ingresos totales:", kpis.ingresos_totales);
        console.log("💸 Costos totales:", kpis.costos_totales);
        console.log("📈 Utilidad bruta:", kpis.utilidad_bruta);
        console.log("⚙️  Utilidad operación:", kpis.utilidad_operacion);
        console.log("✅ Utilidad neta:", kpis.utilidad_neta);
        console.log("📊 Gastos operación totales:", kpis.gastos_operacion_totales);
        console.log("🎯 Eficiencia operativa:", kpis.ratio_eficiencia_operativa + "%");
        console.log("📊 Utilidad neta año anterior:", kpis.utilidad_neta_anio_anterior);
        console.log("🚀 Crecimiento:", kpis.crecimiento_utilidad_neta + "%");

        // Análisis de calidad de datos - MEJORADO
        const dataQuality = {
          totalKPIs: Object.keys(kpis).length,
          zeroValues: Object.values(kpis).filter(v => v === 0).length,
          negativeValues: Object.values(kpis).filter(v => v < 0).length,
          identicalCurrentPrevious: 0,
          dataConsistency: 0
        };

        // Calcular consistencia - MEJORADO
        const calculatedUtilidadBruta = kpis.ingresos_totales - kpis.costos_totales;
        const utilidadBrutaConsistency = Math.abs(kpis.utilidad_bruta - calculatedUtilidadBruta) < Math.max(1000, kpis.utilidad_bruta * 0.01);
        
        const calculatedUtilidadOperacion = kpis.utilidad_bruta - kpis.gastos_operacion_totales;
        const utilidadOperacionConsistency = Math.abs(kpis.utilidad_operacion - calculatedUtilidadOperacion) < Math.max(500, kpis.utilidad_operacion * 0.01);

        dataQuality.dataConsistency = (utilidadBrutaConsistency && utilidadOperacionConsistency) ? 100 : 
                                     (utilidadBrutaConsistency || utilidadOperacionConsistency) ? 75 : 50;

        const metadata = {
          processedAt: new Date().toISOString(),
          version: "v_perfeccionada_precisa",
          total_kpis: dataQuality.totalKPIs,
          fileName: file.name,
          sheetDetected: targetSheet,
          headerRowIndex: headerRowIndex,
          currentMonthColumn: currentMonthCol,
          previousYearColumn: previousYearCol,
          rowsProcessed: jsonData.length,
          conceptsFound: conceptMap.size,
          fileObject: {
            name: file.name,
            size: file.size,
            type: file.type
          },
          dataQuality: dataQuality,
          validation: {
            hasIngresos: kpis.ingresos_totales > 0,
            hasUtilidadNeta: kpis.utilidad_neta !== 0,
            hasComparativa: kpis.utilidad_neta_anio_anterior !== 0 && currentMonthCol !== previousYearCol,
            allCalculationsValid: kpis.ingresos_totales > 0 && kpis.utilidad_neta !== 0,
            columnsDifferent: currentMonthCol !== previousYearCol,
            dataConsistency: dataQuality.dataConsistency,
            hasEficienciaOperativa: kpis.ratio_eficiencia_operativa > 0,
            ingresosAccuracy: Math.abs(kpis.ingresos_totales - (kpis.utilidad_bruta + kpis.costos_totales)) < 100
          },
          fileSizeMB: (file.size / (1024 * 1024)).toFixed(2),
          processedTimestamp: Date.now(),
          extractionDetails: {
            currentMonthCol: currentMonthCol,
            previousYearCol: previousYearCol,
            headerRow: headerRowIndex,
            totalRows: jsonData.length,
            columnAnalysis: columnAnalysis.map(c => ({
              col: c.index,
              header: c.header,
              dataPoints: c.numericDataCount,
              currentScore: c.currentScore,
              previousScore: c.previousScore
            }))
          }
        };

        console.log("🎯 Metadata final:", metadata);
        console.log("✅ PROCESAMIENTO COMPLETADO EXITOSAMENTE");

        resolve({
          kpis,
          metadata
        });

      } catch (error) {
        console.error("❌ Error crítico procesando Excel:", error);
        reject(`Error procesando Excel: ${error.message}`);
      }
    };

    reader.onerror = (error) => {
      console.error("FileReader error:", error);
      reject("No se pudo leer el archivo Excel");
    };

    reader.readAsArrayBuffer(file);
  });
}

/**
 * Parser ultra-robusto para valores de Excel - Específico para formatos mexicanos
 */
function parseExcelValue(value) {
  if (value === null || value === undefined || value === "") return 0;
  if (typeof value === "number") return value;

  const originalStr = String(value).trim();
  let str = originalStr;

  // Valores vacíos o nulos
  if (str === "" || str === "-" || str === "—" || str === "NULL" || str === "N/A" || str === "#N/A") return 0;

  // Manejar fórmulas de Excel - MEJORADO
  if (str.startsWith('=')) {
    // Extraer el valor numérico de fórmulas simples
    const formulaMatch = str.match(/=([-]?[\d,.]+)/);
    if (formulaMatch) {
      str = formulaMatch[1].trim();
    } else {
      // Intentar extraer de fórmulas con operaciones simples
      const simpleFormulaMatch = str.match(/=([\d,.]+)\s*[\-\+]\s*([\d,.]+)/);
      if (simpleFormulaMatch) {
        const val1 = parseExcelValue(simpleFormulaMatch[1]);
        const val2 = parseExcelValue(simpleFormulaMatch[2]);
        if (str.includes('-')) return val1 - val2;
        if (str.includes('+')) return val1 + val2;
      }
      return 0;
    }
  }

  // Detectar formato contable mexicano (paréntesis para negativos)
  const isNegative = /^\([^)]+\)$/.test(str) || str.startsWith('-');
  
  // Limpiar caracteres no numéricos excepto puntos, comas y signos
  let cleanStr = str.replace(/[^\d,.-]/g, "").replace(/\s/g, "");

  // Manejo específico para formato mexicano - MEJORADO
  const hasComma = cleanStr.includes(',');
  const hasDot = cleanStr.includes('.');

  if (hasComma && hasDot) {
    // Formato mexicano: 1.234,56 (punto miles, coma decimal)
    // Ejemplo: 1.234,56 -> 1234.56
    cleanStr = cleanStr.replace(/\./g, '').replace(',', '.');
  } else if (hasComma && !hasDot) {
    // Podría ser: 1234,56 (coma decimal) o 1,234 (coma miles)
    const parts = cleanStr.split(',');
    if (parts.length === 2 && parts[1].length <= 2) {
      // Probablemente coma decimal (1234,56 -> 1234.56)
      cleanStr = cleanStr.replace(',', '.');
    } else if (parts.length > 1) {
      // Probablemente coma miles (1,234 -> 1234)
      cleanStr = cleanStr.replace(/,/g, '');
    }
  } else if (!hasComma && hasDot) {
    // Formato: 1234.56 (punto decimal) o 1.234 (punto miles)
    const parts = cleanStr.split('.');
    if (parts.length > 2) {
      // Múltiples puntos = separadores de miles (1.234.56 -> 123456)
      cleanStr = cleanStr.replace(/\./g, '');
    } else if (parts.length === 2 && parts[1].length <= 2) {
      // Punto decimal (1234.56 -> mantener)
    } else if (parts.length === 2 && parts[1].length > 2) {
      // Probablemente punto miles (1.234 -> 1234)
      cleanStr = cleanStr.replace(/\./g, '');
    }
  }

  // Limpiar cualquier carácter no numérico restante excepto punto y signo
  cleanStr = cleanStr.replace(/[^\d.-]/g, '');

  // Validar que no quede vacío
  if (cleanStr === "" || cleanStr === "-" || cleanStr === ".") {
    console.warn(`⚠️  Valor vacío después de limpiar: "${originalStr}" -> "${cleanStr}"`);
    return 0;
  }

  const num = parseFloat(cleanStr);
  if (isNaN(num)) {
    console.warn(`⚠️  No se pudo parsear: "${originalStr}" -> "${cleanStr}"`);
    return 0;
  }

  const result = isNegative ? -Math.abs(num) : num;
  
  // Log para valores muy grandes o muy pequeños (para debugging)
  if (Math.abs(result) > 1000000) {
    console.log(`🔍 Valor grande parseado: ${originalStr} -> ${result}`);
  }

  return result;
}

// Exportación para compatibilidad
export { processExcel as processExcelFile };