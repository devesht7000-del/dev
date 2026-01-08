import {
    collection,
    addDoc,
    getDocs,
    updateDoc,
    deleteDoc,
    doc,
    query,
    orderBy,
    where,
    Timestamp,
} from 'firebase/firestore';
import { db } from '../firebase/config';

const COLLECTION_NAME = 'issues';

export const createIssue = async (issueData) => {
    console.log('createIssue payload:', issueData);
    try {
        const docRef = await addDoc(collection(db, COLLECTION_NAME), {
            ...issueData,
            createdAt: Timestamp.now(),
        });
        console.log('createIssue success, id:', docRef.id);
        return docRef.id;
    } catch (error) {
        console.error('createIssue failed:', error);
        throw error;
    }
};

export const getAllIssues = async () => {
    const q = query(collection(db, COLLECTION_NAME), orderBy('createdAt', 'desc'));
    const querySnapshot = await getDocs(q);
    return querySnapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
    }));
};

export const updateIssue = async (issueId, updates) => {
    const issueRef = doc(db, COLLECTION_NAME, issueId);
    await updateDoc(issueRef, updates);
};

export const deleteIssue = async (issueId) => {
    const issueRef = doc(db, COLLECTION_NAME, issueId);
    await deleteDoc(issueRef);
};

export const getFilteredIssues = async (filters) => {
    let q = query(collection(db, COLLECTION_NAME));

    if (filters.status) {
        q = query(q, where('status', '==', filters.status));
    }

    if (filters.priority) {
        q = query(q, where('priority', '==', filters.priority));
    }

    q = query(q, orderBy('createdAt', 'desc'));

    const querySnapshot = await getDocs(q);
    return querySnapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
    }));
};
