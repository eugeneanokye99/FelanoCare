import { useState, useEffect } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { GoogleGenerativeAI } from '@google/generative-ai';
import { db } from '../../firebase';
import { collection, addDoc, getDocs } from 'firebase/firestore';
import { marked } from 'marked';
import toast from 'react-hot-toast';
import { 
  Utensils, 
  Apple, 
  Salad, 
  Soup, 
  Plus, 
  Loader2,
  Sparkles,
  ClipboardList,
  User,
  Scale,
  HeartPulse
} from 'lucide-react';

export default function NutritionDashboard() {
  const { userData } = useAuth();
  const [nutritionData, setNutritionData] = useState({
    age: '',
    weight: '',
    height: '',
    activityLevel: 'moderate',
    dietaryPreferences: [],
    healthGoals: [],
    restrictions: []
  });
  const [mealPlan, setMealPlan] = useState(null);
  const [isGenerating, setIsGenerating] = useState(false);
  const [savedPlans, setSavedPlans] = useState([]);
  const [model, setModel] = useState(null);
  const [activeTab, setActiveTab] = useState('generate');

  // Initialize Gemini AI
  useEffect(() => {
    const initGemini = async () => {
      try {
        const apiKey = import.meta.env.VITE_GEMINI_API_KEY;
        if (!apiKey) return;
        
        const genAI = new GoogleGenerativeAI(apiKey);
        setModel(genAI.getGenerativeModel({ 
          model: "gemini-1.5-flash-latest",
          generationConfig: {
            temperature: 0.7
          }
        }));
      } catch (error) {
        console.error('Error initializing AI:', error);
      }
    };
    initGemini();
  }, []);

  // Load saved meal plans
  useEffect(() => {
    const fetchSavedPlans = async () => {
      try {
        const querySnapshot = await getDocs(collection(db, 'mealPlans'));
        const plans = querySnapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data()
        }));
        setSavedPlans(plans);
      } catch (error) {
        console.error('Error fetching meal plans:', error);
      }
    };
    fetchSavedPlans();
  }, []);

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    
    if (type === 'checkbox') {
      setNutritionData(prev => ({
        ...prev,
        [name]: checked 
          ? [...prev[name], value]
          : prev[name].filter(item => item !== value)
      }));
    } else {
      setNutritionData(prev => ({
        ...prev,
        [name]: value
      }));
    }
  };

  const generateMealPlan = async () => {
    if (!model) {
      toast.error('AI service not available');
      return;
    }

    setIsGenerating(true);
    const toastId = toast.loading('Generating personalized meal plan...');

    try {
      const prompt = `
      Create a detailed 7-day meal plan for a ${nutritionData.age}-year-old individual with the following characteristics:
      - Weight: ${nutritionData.weight} kg
      - Height: ${nutritionData.height} cm
      - Activity level: ${nutritionData.activityLevel}
      - Dietary preferences: ${nutritionData.dietaryPreferences.join(', ') || 'none'}
      - Health goals: ${nutritionData.healthGoals.join(', ') || 'none'}
      - Restrictions: ${nutritionData.restrictions.join(', ') || 'none'}

      Provide the plan in MARKDOWN format with:
      - Daily breakdown (breakfast, lunch, dinner, snacks)
      - Calorie estimates for each meal
      - Macronutrient breakdown (protein, carbs, fats)
      - Preparation instructions
      - Shopping list for the week
      - Nutritional tips specific to the user's goals

      Format should be clean and professional for a healthcare application.
      `;

      const result = await model.generateContent(prompt);
      const response = await result.response;
      const text = response.text();

      const generatedPlan = {
        content: text,
        createdAt: new Date().toISOString(),
        userData: nutritionData
      };

      setMealPlan(generatedPlan);
      toast.success('Meal plan generated successfully!', { id: toastId });
    } catch (error) {
      console.error('Error generating meal plan:', error);
      toast.error('Failed to generate meal plan', { id: toastId });
    } finally {
      setIsGenerating(false);
    }
  };

  const saveMealPlan = async () => {
    if (!mealPlan) return;

    try {
      await addDoc(collection(db, 'mealPlans'), {
        ...mealPlan,
        userId: userData?.uid,
        userName: userData?.name
      });
      toast.success('Meal plan saved to your profile!');
    } catch (error) {
      console.error('Error saving meal plan:', error);
      toast.error('Failed to save meal plan');
    }
  };

  const renderMarkdown = (text) => {
    try {
      return { __html: marked.parse(text) };
    } catch (e) {
      return { __html: text };
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-6xl mx-auto">
        <div className="bg-white shadow rounded-lg overflow-hidden">
          {/* Header */}
          <div className="bg-green-600 px-6 py-4">
            <h1 className="text-xl font-semibold text-white flex items-center">
              <Utensils className="mr-2" size={20} />
              Nutrition & Dietetics Center
            </h1>
          </div>

          {/* Tabs */}
          <div className="border-b border-gray-200">
            <nav className="flex -mb-px">
              <button
                onClick={() => setActiveTab('generate')}
                className={`py-4 px-6 text-center border-b-2 font-medium text-sm flex items-center justify-center ${activeTab === 'generate' ? 'border-green-500 text-green-600' : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'}`}
              >
                <Sparkles className="mr-2" size={16} />
                Generate Plan
              </button>
              <button
                onClick={() => setActiveTab('saved')}
                className={`py-4 px-6 text-center border-b-2 font-medium text-sm flex items-center justify-center ${activeTab === 'saved' ? 'border-green-500 text-green-600' : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'}`}
              >
                <ClipboardList className="mr-2" size={16} />
                Saved Plans
              </button>
            </nav>
          </div>

          <div className="p-6">
            {activeTab === 'generate' ? (
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Nutrition Form */}
                <div className="lg:col-span-1 bg-gray-50 p-6 rounded-lg">
                  <h2 className="text-lg font-medium text-gray-900 mb-4 flex items-center">
                    <User className="mr-2" size={18} />
                    Your Nutrition Profile
                  </h2>
                  
                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Age
                      </label>
                      <input
                        type="number"
                        name="age"
                        value={nutritionData.age}
                        onChange={handleInputChange}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-green-500 focus:border-green-500"
                        min="1"
                        max="120"
                      />
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Weight (kg)
                        </label>
                        <input
                          type="number"
                          name="weight"
                          value={nutritionData.weight}
                          onChange={handleInputChange}
                          className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-green-500 focus:border-green-500"
                          min="1"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Height (cm)
                        </label>
                        <input
                          type="number"
                          name="height"
                          value={nutritionData.height}
                          onChange={handleInputChange}
                          className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-green-500 focus:border-green-500"
                          min="1"
                        />
                      </div>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Activity Level
                      </label>
                      <select
                        name="activityLevel"
                        value={nutritionData.activityLevel}
                        onChange={handleInputChange}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-green-500 focus:border-green-500"
                      >
                        <option value="sedentary">Sedentary (little or no exercise)</option>
                        <option value="light">Light (exercise 1-3 days/week)</option>
                        <option value="moderate">Moderate (exercise 3-5 days/week)</option>
                        <option value="active">Active (exercise 6-7 days/week)</option>
                        <option value="very-active">Very Active (hard exercise daily)</option>
                      </select>
                    </div>

                    {/* Dietary Preferences */}
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Dietary Preferences
                      </label>
                      <div className="space-y-2">
                        {['Vegetarian', 'Vegan', 'Pescatarian', 'Keto', 'Mediterranean', 'Low-Carb'].map(pref => (
                          <div key={pref} className="flex items-center">
                            <input
                              type="checkbox"
                              id={pref}
                              name="dietaryPreferences"
                              value={pref}
                              checked={nutritionData.dietaryPreferences.includes(pref)}
                              onChange={handleInputChange}
                              className="h-4 w-4 text-green-600 focus:ring-green-500 border-gray-300 rounded"
                            />
                            <label htmlFor={pref} className="ml-2 block text-sm text-gray-700">
                              {pref}
                            </label>
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* Health Goals */}
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Health Goals
                      </label>
                      <div className="space-y-2">
                        {['Weight Loss', 'Muscle Gain', 'Maintenance', 'Heart Health', 'Diabetes Management', 'Improved Digestion'].map(goal => (
                          <div key={goal} className="flex items-center">
                            <input
                              type="checkbox"
                              id={goal}
                              name="healthGoals"
                              value={goal}
                              checked={nutritionData.healthGoals.includes(goal)}
                              onChange={handleInputChange}
                              className="h-4 w-4 text-green-600 focus:ring-green-500 border-gray-300 rounded"
                            />
                            <label htmlFor={goal} className="ml-2 block text-sm text-gray-700">
                              {goal}
                            </label>
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* Restrictions */}
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Dietary Restrictions
                      </label>
                      <div className="space-y-2">
                        {['Gluten-Free', 'Dairy-Free', 'Nut-Free', 'Egg-Free', 'Shellfish-Free', 'Soy-Free'].map(restriction => (
                          <div key={restriction} className="flex items-center">
                            <input
                              type="checkbox"
                              id={restriction}
                              name="restrictions"
                              value={restriction}
                              checked={nutritionData.restrictions.includes(restriction)}
                              onChange={handleInputChange}
                              className="h-4 w-4 text-green-600 focus:ring-green-500 border-gray-300 rounded"
                            />
                            <label htmlFor={restriction} className="ml-2 block text-sm text-gray-700">
                              {restriction}
                            </label>
                          </div>
                        ))}
                      </div>
                    </div>

                    <button
                      onClick={generateMealPlan}
                      disabled={isGenerating || !nutritionData.age || !nutritionData.weight || !nutritionData.height}
                      className="w-full mt-4 flex justify-center items-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 disabled:opacity-70"
                    >
                      {isGenerating ? (
                        <>
                          <Loader2 className="animate-spin mr-2" size={16} />
                          Generating...
                        </>
                      ) : (
                        <>
                          <Sparkles className="mr-2" size={16} />
                          Generate Meal Plan
                        </>
                      )}
                    </button>
                  </div>
                </div>

                {/* Meal Plan Display */}
                <div className="lg:col-span-2">
                  {mealPlan ? (
                    <div className="bg-white p-6 rounded-lg border border-gray-200">
                      <div className="flex justify-between items-center mb-4">
                        <h2 className="text-lg font-medium text-gray-900">
                          Your Personalized Meal Plan
                        </h2>
                        <button
                          onClick={saveMealPlan}
                          className="inline-flex items-center px-3 py-1.5 border border-transparent text-xs font-medium rounded shadow-sm text-white bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500"
                        >
                          <Plus className="mr-1" size={14} />
                          Save Plan
                        </button>
                      </div>
                      <div 
                        className="prose max-w-none"
                        dangerouslySetInnerHTML={renderMarkdown(mealPlan.content)}
                      />
                    </div>
                  ) : (
                    <div className="bg-white p-8 text-center rounded-lg border border-gray-200">
                      <div className="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-green-100">
                        <Apple className="h-6 w-6 text-green-600" />
                      </div>
                      <h3 className="mt-2 text-sm font-medium text-gray-900">No meal plan generated</h3>
                      <p className="mt-1 text-sm text-gray-500">
                        Fill out your nutrition profile and generate a personalized meal plan.
                      </p>
                    </div>
                  )}
                </div>
              </div>
            ) : (
              <div>
                <h2 className="text-lg font-medium text-gray-900 mb-4">Your Saved Meal Plans</h2>
                {savedPlans.length > 0 ? (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {savedPlans.map(plan => (
                      <div key={plan.id} className="bg-white p-4 rounded-lg border border-gray-200">
                        <div className="flex justify-between items-start">
                          <div>
                            <h3 className="font-medium text-gray-900">
                              {new Date(plan.createdAt).toLocaleDateString()}
                            </h3>
                            <p className="text-sm text-gray-500">
                              {plan.userData.dietaryPreferences.join(', ') || 'No preferences'}
                            </p>
                          </div>
                          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                            {plan.userData.healthGoals[0] || 'General'}
                          </span>
                        </div>
                        <button
                          onClick={() => setMealPlan(plan)}
                          className="mt-3 text-sm text-green-600 hover:text-green-800"
                        >
                          View Details
                        </button>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="bg-white p-8 text-center rounded-lg border border-gray-200">
                    <div className="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-green-100">
                      <ClipboardList className="h-6 w-6 text-green-600" />
                    </div>
                    <h3 className="mt-2 text-sm font-medium text-gray-900">No saved meal plans</h3>
                    <p className="mt-1 text-sm text-gray-500">
                      Generate and save meal plans to see them here.
                    </p>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}