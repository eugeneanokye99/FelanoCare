// src/pages/EPharmacy.jsx
import {
  ShoppingCart,
  Search,
  Filter,
  PlusCircle,
  Heart,
} from 'lucide-react';
import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { db } from '../../firebase'; // Adjust path if needed
import { collection, addDoc, onSnapshot } from 'firebase/firestore';
import { toast } from 'react-hot-toast';
import { addToCart as addToUserCart } from '../../utils/firebaseCart';

const dummyProducts = [
  {
    id: 1,
    name: 'Paracetamol 500mg',
    price: '₵12.00',
    image: '/images/paracetamol.jpg',
  },
  {
    id: 2,
    name: 'Multivitamin Gummies',
    price: '₵35.00',
    image: '/images/vitamins.jpg',
  },
  {
    id: 3,
    name: 'Ibuprofen Gel',
    price: '₵22.00',
    image: '/images/ibuprofen.jpg',
  },
];

export default function EPharmacy() {
  const [cartItems, setCartItems] = useState([]);
  const [addingId, setAddingId] = useState(null);
  const navigate = useNavigate();

  const userId = 'test_user_id'; // Replace with actual auth ID if available

  const cartRef = collection(db, 'cart');

  useEffect(() => {
    const unsubscribe = onSnapshot(cartRef, (snapshot) => {
      const items = snapshot.docs
        .map(doc => ({ id: doc.id, ...doc.data() }))
        .filter(item => item.userId === userId);
      setCartItems(items);
    });

    return () => unsubscribe();
  }, []);

  const addToCart = async (product) => {
    setAddingId(product.id);
    try {
      await addToUserCart(userId, {
        id: String(product.id), // required for doc ID
        name: product.name,
        price: product.price,
        image: product.image,
      });
      toast.success(`${product.name} added to cart`);
    } catch (err) {
      toast.error('Failed to add to cart');
    } finally {
      setTimeout(() => setAddingId(null), 1000);
    }
  };

  return (
    <div className="min-h-screen bg-white text-gray-800">
      {/* Header */}
      <header className="flex items-center justify-between px-6 py-4 border-b shadow-sm">
        <h1 className="text-2xl font-bold">e-Pharmacy</h1>
        <div className="flex gap-3 items-center">
          <button className="p-2 bg-gray-100 rounded-full">
            <Search className="h-5 w-5" />
          </button>
          <button
            className="relative p-2 bg-gray-100 rounded-full"
            onClick={() => navigate('/cart')}
          >
            <ShoppingCart className="h-5 w-5" />
            {cartItems.length > 0 && (
              <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs w-5 h-5 flex items-center justify-center rounded-full">
                {cartItems.length}
              </span>
            )}
          </button>
        </div>
      </header>

      {/* Filters */}
      <div className="flex items-center gap-4 px-6 py-4 border-b">
        <Filter className="h-5 w-5 text-gray-500" />
        <span className="text-sm font-medium text-gray-600">Categories:</span>
        <div className="flex gap-2 flex-wrap">
          <button className="px-3 py-1 text-sm border rounded-full hover:bg-indigo-100">Pain Relief</button>
          <button className="px-3 py-1 text-sm border rounded-full hover:bg-indigo-100">Supplements</button>
          <button className="px-3 py-1 text-sm border rounded-full hover:bg-indigo-100">Cough & Cold</button>
        </div>
      </div>

      {/* Product Grid */}
      <div className="grid gap-6 p-6 sm:grid-cols-2 lg:grid-cols-3">
        {dummyProducts.map((product) => (
          <div
            key={product.id}
            className="bg-white border rounded-lg shadow-sm hover:shadow-md transition"
          >
            <img
              src={product.image}
              alt={product.name}
              className="w-full h-40 object-cover rounded-t-lg"
            />
            <div className="p-4">
              <h2 className="text-lg font-semibold">{product.name}</h2>
              <p className="text-sm text-gray-500">{product.price}</p>
              <div className="flex items-center justify-between mt-4">
                <button
                  onClick={() => addToCart(product)}
                  disabled={addingId === product.id}
                  className="text-sm px-3 py-1 bg-indigo-600 text-white rounded-full flex items-center gap-2 hover:bg-indigo-700 disabled:opacity-70"
                >
                  <PlusCircle className="w-4 h-4" />
                  {addingId === product.id ? 'Adding...' : 'Add to Cart'}
                </button>
                <Heart className="h-5 w-5 text-gray-400 hover:text-red-500 cursor-pointer" />
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Footer */}
      <footer className="p-6 text-center text-sm text-gray-400">
        © {new Date().getFullYear()} FelanoCare e-Pharmacy. All rights reserved.
      </footer>
    </div>
  );
}
