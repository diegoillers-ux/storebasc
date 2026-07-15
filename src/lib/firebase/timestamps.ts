import { Timestamp } from 'firebase-admin/firestore';

/**
 * Convierte recursivamente todos los objetos Timestamp de Firestore en Dates de JavaScript.
 * Es crucial para permitir la serialización JSON de Next.js.
 */
export function convertTimestamps(data: any): any {
  if (!data) return data;

  // Si tiene toDate (es un Timestamp del Admin SDK o Web SDK)
  if (typeof data === 'object' && typeof data.toDate === 'function') {
    return data.toDate() as any;
  }

  // Si tiene la estructura de segundos/nanosegundos típica de Firebase serializado
  if (data && typeof data === 'object' && 'seconds' in data && 'nanoseconds' in data) {
    return new Date(data.seconds * 1000 + data.nanoseconds / 1000000) as any;
  }

  if (Array.isArray(data)) {
    return data.map((item) => convertTimestamps(item)) as any;
  }

  if (typeof data === 'object') {
    const result: any = {};
    for (const key in data) {
      if (Object.prototype.hasOwnProperty.call(data, key)) {
        result[key] = convertTimestamps(data[key]);
      }
    }
    return result;
  }

  return data;
}

/**
 * Convierte recursivamente objetos Date de JavaScript en Timestamps de Firestore para persistencia.
 */
export function convertDatesToTimestamps(data: any): any {
  if (!data) return data;

  if (data instanceof Date) {
    return Timestamp.fromDate(data);
  }

  if (Array.isArray(data)) {
    return data.map((item) => convertDatesToTimestamps(item));
  }

  if (typeof data === 'object') {
    // Evitar procesar instancias complejas que no sean objetos literales
    const proto = Object.getPrototypeOf(data);
    if (proto !== null && proto !== Object.prototype) {
      return data;
    }

    const result: any = {};
    for (const key in data) {
      if (Object.prototype.hasOwnProperty.call(data, key)) {
        result[key] = convertDatesToTimestamps(data[key]);
      }
    }
    return result;
  }

  return data;
}
