import { initializeApp, getApps, getApp } from 'firebase/app';
import {
  getAuth,
  GoogleAuthProvider,
  signInWithPopup,
  signOut,
  onAuthStateChanged,
  User as FirebaseUser,
} from 'firebase/auth';
import {
  getFirestore,
  collection,
  doc,
  setDoc,
  getDoc,
  getDocs,
  getDocFromServer,
  query,
  orderBy,
  limit,
  onSnapshot,
} from 'firebase/firestore';
import firebaseConfig from '../firebase-applet-config.json';
import { Complaint, RecurrenceCluster } from './types';

// Initialize Firebase App
const app = getApps().length === 0 ? initializeApp(firebaseConfig) : getApp();

// Initialize Auth
export const auth = getAuth(app);
export const googleProvider = new GoogleAuthProvider();

// Initialize Firestore
export const db = getFirestore(
  app,
  firebaseConfig.firestoreDatabaseId || '(default)'
);

// Connection test per Skill specification
export async function validateFirestoreConnection() {
  try {
    await getDocFromServer(doc(db, 'test', 'connection'));
    console.log('Connected to Cloud Firestore database successfully.');
  } catch (error: any) {
    if (error?.message?.includes('the client is offline')) {
      console.warn('Firestore offline: please check network or configuration.');
    } else {
      // Non-fatal if test collection does not exist
      console.log('Firestore initialized.');
    }
  }
}

validateFirestoreConnection();

// Sign in with Google
export async function signInWithGoogle(): Promise<FirebaseUser | null> {
  try {
    const result = await signInWithPopup(auth, googleProvider);
    const user = result.user;

    // Save/update user profile in Firestore
    if (user) {
      await setDoc(
        doc(db, 'users', user.uid),
        {
          uid: user.uid,
          email: user.email,
          displayName: user.displayName,
          photoURL: user.photoURL,
          role: 'citizen',
          lastLoginAt: new Date().toISOString(),
        },
        { merge: true }
      );
    }
    return user;
  } catch (error: any) {
    console.error('Google Sign-in error:', error);
    throw error;
  }
}

// Sign out
export async function logoutUser() {
  await signOut(auth);
}

// Save complaint to Firestore
export async function saveComplaintToFirestore(complaint: Complaint) {
  try {
    await setDoc(doc(db, 'complaints', complaint.id), complaint);
  } catch (err) {
    console.warn('Error persisting complaint to Firestore:', err);
  }
}

// Save cluster to Firestore
export async function saveClusterToFirestore(cluster: RecurrenceCluster) {
  try {
    await setDoc(doc(db, 'clusters', cluster.id), cluster);
  } catch (err) {
    console.warn('Error persisting cluster to Firestore:', err);
  }
}

// Sync all initial complaints and clusters to Firestore if empty
export async function seedInitialFirestoreData(
  initialComplaints: Complaint[],
  initialClusters: RecurrenceCluster[]
) {
  try {
    const snap = await getDocs(query(collection(db, 'complaints'), limit(1)));
    if (snap.empty) {
      console.log('Seeding initial complaints to Firestore...');
      for (const c of initialComplaints) {
        await setDoc(doc(db, 'complaints', c.id), c);
      }
      for (const cl of initialClusters) {
        await setDoc(doc(db, 'clusters', cl.id), cl);
      }
      console.log('Seeding complete.');
    }
  } catch (err) {
    console.warn('Firestore seeding check:', err);
  }
}
