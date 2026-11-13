import { 
  collection, 
  doc, 
  setDoc,
  updateDoc, 
  deleteDoc, 
  query, 
  orderBy, 
  onSnapshot, 
  serverTimestamp,
  getDocs,
  where
} from 'firebase/firestore';
import { db } from './firebase';
import { CropBatch } from '../types';

export interface CreateBatchInput {
  name: string;
  plantingDate: string;
  cropType: string;
  variety?: string;
  sectionKey: string;
  sensors?: string[];
  sensorStatus?: 'online' | 'offline';
}

/**
 * Creates a new Crop Batch document in Firestore under users/{uid}/batches/{batchId}
 * Uses setDoc with immediate local caching to guarantee instant UI update without hanging
 */
export const createCropBatch = async (
  userId: string, 
  payload: CreateBatchInput
): Promise<string> => {
  const batchData = {
    userId,
    name: payload.name.trim(),
    cropType: payload.cropType,
    variety: payload.variety?.trim() || '',
    plantingDate: payload.plantingDate,
    sectionKey: payload.sectionKey.trim().toLowerCase(),
    sensors: payload.sensors || ['N', 'P', 'K', 'humidity'],
    sensorStatus: payload.sensorStatus || 'offline',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    serverCreatedAt: serverTimestamp(),
  };

  const batchesCol = collection(db, 'users', userId, 'batches');
  const newDocRef = doc(batchesCol);

  // Firestore local cache updates synchronously. We allow setDoc to write and don't stall the UI.
  const writePromise = setDoc(newDocRef, batchData);
  const quickAck = new Promise<void>((resolve) => setTimeout(resolve, 250));

  await Promise.race([writePromise, quickAck]);
  return newDocRef.id;
};

/**
 * Real-time listener for crop batches belonging to a specific user (users/{uid}/batches)
 */
export const subscribeUserBatches = (
  userId: string,
  onBatchesUpdated: (batches: CropBatch[]) => void,
  onError?: (error: Error) => void
) => {
  const batchesQuery = query(
    collection(db, 'users', userId, 'batches'),
    orderBy('createdAt', 'desc')
  );

  return onSnapshot(
    batchesQuery,
    (snapshot) => {
      const batches: CropBatch[] = snapshot.docs.map((docSnap) => {
        const data = docSnap.data();
        return {
          id: docSnap.id,
          userId,
          name: data.name || data.batchName || 'Unnamed Batch',
          batchName: data.name || data.batchName || 'Unnamed Batch',
          cropType: data.cropType || 'Rice',
          variety: data.variety || '',
          plantingDate: data.plantingDate || new Date().toISOString().split('T')[0],
          sectionKey: data.sectionKey || data.sensorSetId || docSnap.id.substring(0, 8),
          sensors: data.sensors || ['N', 'P', 'K', 'humidity'],
          sensorStatus: data.sensorStatus || 'offline',
          growthStage: data.growthStage || 'Vegetative',
          healthScore: data.healthScore ?? 85,
          condition: data.condition || 'Healthy',
          priority: data.priority || 'Low',
          activeIssuesCount: data.activeIssuesCount || 0,
          createdAt: data.createdAt || new Date().toISOString(),
          updatedAt: data.updatedAt || new Date().toISOString(),
        } as CropBatch;
      });

      onBatchesUpdated(batches);
    },
    (err) => {
      console.warn('Real-time batches listener status:', err);
      // Fallback: Check if legacy batches exist under root cropBatches collection
      const legacyQuery = query(
        collection(db, 'cropBatches'),
        where('userId', '==', userId)
      );
      getDocs(legacyQuery).then((legacySnap) => {
        if (!legacySnap.empty) {
          const legacyBatches: CropBatch[] = legacySnap.docs.map((docSnap) => {
            const data = docSnap.data();
            return {
              id: docSnap.id,
              userId,
              name: data.batchName || data.name || 'Unnamed Batch',
              batchName: data.batchName || data.name,
              cropType: data.cropType,
              variety: data.variety,
              plantingDate: data.plantingDate,
              sectionKey: data.sectionKey || data.sensorSetId || docSnap.id,
              sensors: data.sensors || ['N', 'P', 'K', 'humidity'],
              sensorStatus: data.sensorStatus || 'offline',
              createdAt: data.createdAt || new Date().toISOString(),
            } as CropBatch;
          });
          onBatchesUpdated(legacyBatches);
        } else if (onError) {
          onError(err);
        }
      }).catch(() => {
        if (onError) onError(err);
      });
    }
  );
};

/**
 * Delete a batch from users/{uid}/batches/{batchId}
 */
export const deleteCropBatch = async (userId: string, batchId: string): Promise<void> => {
  await deleteDoc(doc(db, 'users', userId, 'batches', batchId));
};

/**
 * Save an analysis result under users/{uid}/batches/{batchId}/analyses/{id}
 * Uses setDoc with quick local ack to prevent hanging on remote sync
 */
export const saveBatchAnalysis = async (
  userId: string,
  batchId: string,
  analysisData: Record<string, unknown>
): Promise<string> => {
  const colRef = collection(db, 'users', userId, 'batches', batchId, 'analyses');
  const docRef = doc(colRef);
  const writePromise = setDoc(docRef, {
    ...analysisData,
    analyzedAt: new Date().toISOString(),
    createdAt: new Date().toISOString(),
  });
  // Firestore local cache updates immediately; do not stall UI on network latency
  const quickAck = new Promise<void>((resolve) => setTimeout(resolve, 250));
  await Promise.race([writePromise, quickAck]);
  return docRef.id;
};

/**
 * Update an existing batch under users/{uid}/batches/{batchId}
 */
export const updateCropBatch = async (
  userId: string,
  batchId: string, 
  updates: Partial<CropBatch>
): Promise<void> => {
  const batchRef = doc(db, 'users', userId, 'batches', batchId);
  await updateDoc(batchRef, {
    ...updates,
    updatedAt: new Date().toISOString(),
  });
};
