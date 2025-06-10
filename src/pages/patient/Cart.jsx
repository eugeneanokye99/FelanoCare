// src/pages/Cart.jsx
import { useEffect, useState } from 'react';
import { getCartItems, updateQuantity, deleteFromCart } from '../../utils/firebaseCart';
import { useAuth } from '../../contexts/AuthContext';
import { Trash2, Plus, Minus } from 'lucide-react';

export default function Cart() {
  const { currentUser } = useAuth();
  const [cart, setCart] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (currentUser?.uid) {
      fetchCart();
    }
  }, [currentUser]);

  const fetchCart = async () => {
    try {
      setLoading(true);
      const items = await getCartItems(currentUser.uid);
      setCart(items);
    } catch (err) {
      console.error("Failed to fetch cart:", err);
    } finally {
      setLoading(false);
    }
  };

  const handleQuantityChange = async (itemId, change) => {
    const item = cart.find(i => i.id === itemId);
    const newQty = item.quantity + change;
    if (newQty <= 0) return;
    await updateQuantity(currentUser.uid, itemId, newQty);
    fetchCart();
  };

  const handleDelete = async (itemId) => {
    await deleteFromCart(currentUser.uid, itemId);
    fetchCart();
  };

  if (loading) {
    return <div className="p-6 text-gray-600">Loading cart...</div>;
  }

  return (
    <div className="p-6 min-h-screen bg-gray-50">
      <h1 className="text-2xl font-semibold mb-6">Your Cart</h1>
      {cart.length === 0 ? (
        <p className="text-gray-600">🛒 Your cart is empty.</p>
      ) : (
        <div className="space-y-4">
          {cart.map(item => (
            <div
              key={item.id}
              className="flex items-center justify-between bg-white p-4 shadow rounded-lg"
            >
              <div className="flex items-center space-x-4">
                <img
                  src={item.image || '/images/default.jpg'}
                  alt={item.name}
                  className="w-16 h-16 rounded object-cover border"
                />
                <div>
                  <h2 className="text-lg font-medium">{item.name}</h2>
                  <p className="text-gray-500">{item.price}</p>
                </div>
              </div>
              <div className="flex items-center space-x-2">
                <button
                  onClick={() => handleQuantityChange(item.id, -1)}
                  className="text-gray-700 hover:text-black"
                >
                  <Minus size={20} />
                </button>
                <span className="text-sm">{item.quantity}</span>
                <button
                  onClick={() => handleQuantityChange(item.id, 1)}
                  className="text-gray-700 hover:text-black"
                >
                  <Plus size={20} />
                </button>
                <button
                  onClick={() => handleDelete(item.id)}
                  className="ml-4 text-red-500 hover:text-red-700"
                >
                  <Trash2 size={20} />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
