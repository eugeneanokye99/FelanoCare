// src/utils/firebaseCart.js
import {
  doc,
  collection,
  getDocs,
  setDoc,
  updateDoc,
  deleteDoc,
  getDoc,
} from 'firebase/firestore';
import { db } from '../firebase';

export const getCartItems = async (userId) => {
  const cartRef = collection(db, 'carts', userId, 'items');
  const snapshot = await getDocs(cartRef);
  return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
};

export const addToCart = async (userId, item) => {
  const itemRef = doc(db, 'carts', userId, 'items', item.id);
  const docSnap = await getDoc(itemRef);

  if (docSnap.exists()) {
    const currentQty = docSnap.data().quantity || 1;
    await updateDoc(itemRef, { quantity: currentQty + 1 });
  } else {
    await setDoc(itemRef, { ...item, quantity: 1 });
  }
};

export const updateQuantity = async (userId, itemId, quantity) => {
  const itemRef = doc(db, 'carts', userId, 'items', itemId);
  await updateDoc(itemRef, { quantity });
};

export const deleteFromCart = async (userId, itemId) => {
  const itemRef = doc(db, 'carts', userId, 'items', itemId);
  await deleteDoc(itemRef);
};
