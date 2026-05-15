export interface Student {
  id: string;
  serialNumber?: number; // S. No. for sorting
  name: string;
  admissionNumber: string;
  studentClass: string; // 'class' is a reserved word in JS/TS
  dob: string;
  fatherName: string;
  motherName: string;
  mobileNumber: string;
  address: string;
  photoURL?: string;
  session?: string;
}

export type OperationType = 'create' | 'update' | 'delete' | 'list' | 'get' | 'write';

export interface FirestoreErrorInfo {
  error: string;
  operationType: OperationType;
  path: string | null;
  authInfo: {
    userId?: string | null;
    email?: string | null;
    emailVerified?: boolean | null;
    isAnonymous?: boolean | null;
    tenantId?: string | null;
    providerInfo?: {
      providerId?: string | null;
      email?: string | null;
    }[];
  };
}
