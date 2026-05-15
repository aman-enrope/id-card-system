import { create } from 'zustand';
import { Student } from '../types';
import { SCHOOL_CONFIG } from '../constants';
import { 
  collection, 
  addDoc, 
  getDocs, 
  updateDoc, 
  deleteDoc, 
  doc,
  query,
  orderBy
} from 'firebase/firestore';
import { db, handleFirestoreError } from '../lib/firebase';

interface SchoolSettings {
  name: string;
  addressLine1: string;
  addressLine2: string;
  logoURL: string;
  watermarkURL: string;
  themeColor: string;
  session: string;
  principalSignatureURL: string;
}

interface IDStore {
  students: Student[];
  settings: SchoolSettings;
  loading: boolean;
  error: string | null;
  fetchStudents: () => Promise<void>;
  fetchSettings: () => Promise<void>;
  updateSettings: (updates: Partial<SchoolSettings>) => Promise<void>;
  addStudent: (student: Omit<Student, 'id'>) => Promise<void>;
  updateStudent: (id: string, updates: Partial<Student>) => Promise<void>;
  deleteStudent: (id: string) => Promise<void>;
  bulkAddStudents: (students: Omit<Student, 'id'>[]) => Promise<void>;
}

const COLLECTION_NAME = 'students';
const SETTINGS_COLLECTION = 'settings';
const DEFAULT_SETTINGS: SchoolSettings = SCHOOL_CONFIG as SchoolSettings;

export const useStore = create<IDStore>((set, get) => ({
  students: [],
  settings: DEFAULT_SETTINGS,
  loading: false,
  error: null,

  fetchSettings: async () => {
    try {
      console.log('[STORE] Fetching settings from Firestore...');
      const q = query(collection(db, SETTINGS_COLLECTION));
      const querySnapshot = await getDocs(q);
      if (!querySnapshot.empty) {
        const settings = querySnapshot.docs[0].data() as SchoolSettings;
        console.log('[STORE] Settings loaded from Firestore:', settings);
        set({ settings });
      } else {
        console.log('[STORE] No settings in Firestore, using DEFAULT_SETTINGS:', DEFAULT_SETTINGS);
      }
    } catch (error) {
      console.error('[STORE] Error fetching settings:', error);
      handleFirestoreError(error, 'get', SETTINGS_COLLECTION);
    }
  },

  updateSettings: async (updates) => {
    try {
      const q = query(collection(db, SETTINGS_COLLECTION));
      const querySnapshot = await getDocs(q);
      const newSettings = { ...get().settings, ...updates };
      
      if (!querySnapshot.empty) {
        const docRef = doc(db, SETTINGS_COLLECTION, querySnapshot.docs[0].id);
        await updateDoc(docRef, updates as any);
      } else {
        await addDoc(collection(db, SETTINGS_COLLECTION), newSettings);
      }
      set({ settings: newSettings });
    } catch (error) {
      handleFirestoreError(error, 'write', SETTINGS_COLLECTION);
    }
  },

  fetchStudents: async () => {
    set({ loading: true });
    try {
      // Fetch all students without orderBy first (to support old data without serialNumber)
      const q = query(collection(db, COLLECTION_NAME));
      const querySnapshot = await getDocs(q);
      const students = querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      })) as Student[];
      
      // Sort by serialNumber on client side for backward compatibility
      // Old documents without serialNumber will appear last
      students.sort((a, b) => {
        const aSerial = a.serialNumber ?? Infinity;
        const bSerial = b.serialNumber ?? Infinity;
        return aSerial - bSerial;
      });
      
      set({ students, loading: false });
    } catch (error) {
      console.error('[STORE] Error fetching students:', error);
      handleFirestoreError(error, 'list', COLLECTION_NAME);
      set({ error: (error as Error).message, loading: false });
    }
  },

  addStudent: async (student) => {
    try {
      const docRef = await addDoc(collection(db, COLLECTION_NAME), student);
      const newStudent = { id: docRef.id, ...student };
      set(state => ({ students: [...state.students, newStudent] }));
    } catch (error) {
      handleFirestoreError(error, 'create', COLLECTION_NAME);
    }
  },

  updateStudent: async (id, updates) => {
    try {
      const docRef = doc(db, COLLECTION_NAME, id);
      await updateDoc(docRef, updates as any);
      set(state => ({
        students: state.students.map(s => s.id === id ? { ...s, ...updates } : s)
      }));
    } catch (error) {
      handleFirestoreError(error, 'update', COLLECTION_NAME + '/' + id);
    }
  },

  deleteStudent: async (id) => {
    try {
      const docRef = doc(db, COLLECTION_NAME, id);
      await deleteDoc(docRef);
      set(state => ({
        students: state.students.filter(s => s.id !== id)
      }));
    } catch (error) {
      handleFirestoreError(error, 'delete', COLLECTION_NAME + '/' + id);
    }
  },

  bulkAddStudents: async (newStudents) => {
    set({ loading: true });
    try {
      // In a real bulk scenario, use writeBatch, but for simplicity we'll do sequential/parallel addDocs
      // Firestore batch has a limit of 500, but we can handle it
      const promises = newStudents.map(student => addDoc(collection(db, COLLECTION_NAME), student));
      await Promise.all(promises);
      await get().fetchStudents();
    } catch (error) {
      handleFirestoreError(error, 'write', COLLECTION_NAME);
      set({ loading: false });
    }
  }
}));
