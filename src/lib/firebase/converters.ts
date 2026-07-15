import { FirestoreDataConverter, QueryDocumentSnapshot } from 'firebase-admin/firestore';
import { convertTimestamps, convertDatesToTimestamps } from './timestamps';

/**
 * Crea un conversor tipado genérico para colecciones de Firestore.
 * Remueve el campo `id` antes de persistir y lo inyecta automáticamente al leer.
 * También automatiza las conversiones entre Date y Timestamp.
 */
export const createConverter = <T extends { id?: string }>(): FirestoreDataConverter<T> => ({
  toFirestore(modelObject: T) {
    const { id, ...data } = modelObject as any;
    return convertDatesToTimestamps(data);
  },
  fromFirestore(snapshot: QueryDocumentSnapshot): T {
    const data = snapshot.data();
    return {
      id: snapshot.id,
      ...convertTimestamps(data),
    } as unknown as T;
  },
});
