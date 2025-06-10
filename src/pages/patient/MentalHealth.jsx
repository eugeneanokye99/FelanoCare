import { useState, useEffect } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { collection, getDocs, query, where } from 'firebase/firestore';
import { db } from '../../firebase';
import { marked } from 'marked';
import toast from 'react-hot-toast';
import {
  Brain,
  HeartPulse,
  MessageSquare,
  BookOpen,
  ClipboardList,
  User,
  Calendar,
  Clock,
  Phone,
  Mail,
  ChevronDown,
  Plus
} from 'lucide-react';

export default function MentalHealthDashboard() {
  const { userData } = useAuth();
  const [activeTab, setActiveTab] = useState('resources');
  const [psychologists, setPsychologists] = useState([]);
  const [selectedPsychologist, setSelectedPsychologist] = useState(null);
  const [contactForm, setContactForm] = useState({
    reason: '',
    urgency: 'normal',
    preferredDate: '',
    preferredTime: '',
    message: ''
  });
  const [isLoading, setIsLoading] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Fetch psychologists from Firestore
  useEffect(() => {
    const fetchPsychologists = async () => {
      setIsLoading(true);
      try {
        const q = query(
          collection(db, 'users'),
          where('userType', '==', 'doctor'),
          where('specialization', '==', 'psychology')
        );
        const querySnapshot = await getDocs(q);
        const psychList = querySnapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data()
        }));
        setPsychologists(psychList);
      } catch (error) {
        console.error('Error fetching psychologists:', error);
        toast.error('Failed to load psychologists');
      } finally {
        setIsLoading(false);
      }
    };

    fetchPsychologists();
  }, []);

  const handleContactChange = (e) => {
    const { name, value } = e.target;
    setContactForm(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleContactSubmit = async (e) => {
    e.preventDefault();
    if (!selectedPsychologist) {
      toast.error('Please select a psychologist');
      return;
    }

    setIsSubmitting(true);
    try {
      // In a real app, you would send this to your backend
      // or use Firebase Functions to handle email notifications
      console.log('Contact request:', {
        psychologist: selectedPsychologist,
        patient: userData,
        contactForm
      });

      toast.success('Contact request sent successfully!');
      setContactForm({
        reason: '',
        urgency: 'normal',
        preferredDate: '',
        preferredTime: '',
        message: ''
      });
    } catch (error) {
      console.error('Error sending contact request:', error);
      toast.error('Failed to send contact request');
    } finally {
      setIsSubmitting(false);
    }
  };

  const mentalHealthResources = [
    {
      title: "Understanding Anxiety Disorders",
      content: `
### Understanding Anxiety Disorders

Anxiety disorders are among the most common mental health conditions, affecting millions worldwide. 

**Types of Anxiety Disorders:**
- Generalized Anxiety Disorder (GAD)
- Panic Disorder
- Social Anxiety Disorder
- Specific Phobias
- Separation Anxiety Disorder

**Symptoms May Include:**
- Excessive worry
- Restlessness
- Fatigue
- Difficulty concentrating
- Irritability
- Sleep disturbances
- Physical symptoms (racing heart, sweating)

**Treatment Options:**
- Cognitive Behavioral Therapy (CBT)
- Medication (SSRIs, SNRIs)
- Mindfulness techniques
- Lifestyle modifications

If you're experiencing these symptoms, consider reaching out to a mental health professional.
      `,
      icon: <HeartPulse size={20} />
    },
    {
      title: "Depression: Signs and Support",
      content: `
### Recognizing Depression

Depression is more than just feeling sad—it's a serious medical condition that affects how you feel, think, and behave.

**Common Symptoms:**
- Persistent sad, anxious, or "empty" mood
- Loss of interest in activities once enjoyed
- Changes in appetite or weight
- Sleep disturbances
- Fatigue or loss of energy
- Feelings of worthlessness or guilt
- Difficulty concentrating
- Recurrent thoughts of death or suicide

**What You Can Do:**
1. Reach out to a mental health professional
2. Consider therapy (CBT, interpersonal therapy)
3. Explore medication options with a psychiatrist
4. Practice self-care and maintain social connections
5. Establish a routine
6. Engage in physical activity

**Emergency Resources:**
- National Suicide Prevention Lifeline: 988
- Crisis Text Line: Text HOME to 741741
      `,
      icon: <Brain size={20} />
    },
    {
      title: "Stress Management Techniques",
      content: `
### Effective Stress Management

Chronic stress can negatively impact both mental and physical health. Here are evidence-based techniques:

**Immediate Relief:**
- Deep breathing exercises (4-7-8 technique)
- Progressive muscle relaxation
- Mindfulness meditation (even 5 minutes helps)
- Brief physical activity (walking, stretching)

**Long-Term Strategies:**
1. **Time Management:**
   - Prioritize tasks
   - Learn to say no
   - Delegate when possible

2. **Lifestyle Factors:**
   - Regular exercise (30 mins most days)
   - Balanced nutrition
   - Adequate sleep (7-9 hours)
   - Limit caffeine and alcohol

3. **Cognitive Approaches:**
   - Challenge negative thoughts
   - Practice gratitude
   - Maintain perspective

4. **Social Support:**
   - Nurture relationships
   - Join support groups
   - Seek professional help when needed
      `,
      icon: <MessageSquare size={20} />
    }
  ];

  const selfAssessmentTools = [
    {
      title: "Anxiety Self-Assessment",
      questions: [
        "Do you experience excessive worry more days than not?",
        "Do you have difficulty controlling your worry?",
        "Do you often feel restless or on edge?",
        "Do you tire easily?",
        "Do you have difficulty concentrating?",
        "Do you experience irritability?",
        "Do you have muscle tension?",
        "Do you have sleep disturbances?"
      ],
      scoring: "If you answered 'yes' to several of these questions, you may want to consult with a mental health professional."
    },
    {
      title: "Depression Screening",
      questions: [
        "Little interest or pleasure in doing things?",
        "Feeling down, depressed, or hopeless?",
        "Trouble falling or staying asleep, or sleeping too much?",
        "Feeling tired or having little energy?",
        "Poor appetite or overeating?",
        "Feeling bad about yourself - or that you're a failure?",
        "Trouble concentrating on things?",
        "Moving or speaking slowly, or being fidgety/restless?",
        "Thoughts of self-harm or suicide?"
      ],
      scoring: "Several 'yes' answers suggest you may be experiencing depression and should seek professional advice."
    }
  ];

  return (
    <div className="min-h-screen bg-gray-50 py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-6xl mx-auto">
        <div className="bg-white shadow rounded-lg overflow-hidden">
          {/* Header */}
          <div className="bg-indigo-600 px-6 py-4">
            <h1 className="text-xl font-semibold text-white flex items-center">
              <Brain className="mr-2" size={20} />
              Mental Health & Psychology Center
            </h1>
          </div>

          {/* Tabs */}
          <div className="border-b border-gray-200">
            <nav className="flex -mb-px">
              <button
                onClick={() => setActiveTab('resources')}
                className={`py-4 px-6 text-center border-b-2 font-medium text-sm flex items-center justify-center ${activeTab === 'resources' ? 'border-indigo-500 text-indigo-600' : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'}`}
              >
                <BookOpen className="mr-2" size={16} />
                Resources
              </button>
              <button
                onClick={() => setActiveTab('assessments')}
                className={`py-4 px-6 text-center border-b-2 font-medium text-sm flex items-center justify-center ${activeTab === 'assessments' ? 'border-indigo-500 text-indigo-600' : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'}`}
              >
                <ClipboardList className="mr-2" size={16} />
                Self-Assessments
              </button>
              <button
                onClick={() => setActiveTab('contact')}
                className={`py-4 px-6 text-center border-b-2 font-medium text-sm flex items-center justify-center ${activeTab === 'contact' ? 'border-indigo-500 text-indigo-600' : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'}`}
              >
                <MessageSquare className="mr-2" size={16} />
                Contact a Professional
              </button>
            </nav>
          </div>

          <div className="p-6">
            {activeTab === 'resources' && (
              <div className="space-y-6">
                <h2 className="text-lg font-medium text-gray-900">Mental Health Resources</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {mentalHealthResources.map((resource, index) => (
                    <div key={index} className="bg-white border border-gray-200 rounded-lg overflow-hidden shadow-sm">
                      <div className="p-4 bg-indigo-50 flex items-center">
                        <div className="p-2 rounded-full bg-indigo-100 text-indigo-600 mr-3">
                          {resource.icon}
                        </div>
                        <h3 className="font-medium text-gray-900">{resource.title}</h3>
                      </div>
                      <div className="p-4 prose prose-sm max-w-none" dangerouslySetInnerHTML={{ __html: marked.parse(resource.content) }} />
                    </div>
                  ))}
                </div>
              </div>
            )}

            {activeTab === 'assessments' && (
              <div className="space-y-8">
                <h2 className="text-lg font-medium text-gray-900">Self-Assessment Tools</h2>
                <p className="text-gray-600">
                  These screening tools are not diagnostic instruments but can help identify symptoms that may need professional evaluation.
                </p>
                
                <div className="space-y-6">
                  {selfAssessmentTools.map((tool, index) => (
                    <div key={index} className="bg-white border border-gray-200 rounded-lg p-6">
                      <h3 className="font-medium text-gray-900 mb-4">{tool.title}</h3>
                      <ul className="space-y-3 mb-4">
                        {tool.questions.map((question, qIndex) => (
                          <li key={qIndex} className="flex items-start">
                            <input
                              type="checkbox"
                              id={`q-${index}-${qIndex}`}
                              className="mt-1 h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300 rounded"
                            />
                            <label htmlFor={`q-${index}-${qIndex}`} className="ml-2 block text-sm text-gray-700">
                              {question}
                            </label>
                          </li>
                        ))}
                      </ul>
                      <p className="text-sm text-gray-600 mt-4">{tool.scoring}</p>
                    </div>
                  ))}
                </div>

                <div className="bg-blue-50 border-l-4 border-blue-400 p-4">
                  <div className="flex">
                    <div className="flex-shrink-0">
                      <svg className="h-5 w-5 text-blue-400" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                        <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2h-1V9z" clipRule="evenodd" />
                      </svg>
                    </div>
                    <div className="ml-3">
                      <p className="text-sm text-blue-700">
                        <strong>Note:</strong> These assessments are not substitutes for professional diagnosis. If you're experiencing distress, please contact a mental health professional.
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {activeTab === 'contact' && (
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Psychologist Selection */}
                <div className="lg:col-span-1">
                  <h2 className="text-lg font-medium text-gray-900 mb-4">Available Psychologists</h2>
                  {isLoading ? (
                    <div className="flex justify-center py-8">
                      <svg className="animate-spin h-8 w-8 text-indigo-600" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                      </svg>
                    </div>
                  ) : (
                    <div className="space-y-3">
                      {psychologists.length > 0 ? (
                        psychologists.map(psych => (
                          <div
                            key={psych.id}
                            onClick={() => setSelectedPsychologist(psych)}
                            className={`p-4 border rounded-lg cursor-pointer ${selectedPsychologist?.id === psych.id ? 'border-indigo-500 bg-indigo-50' : 'border-gray-200 hover:border-indigo-300'}`}
                          >
                            <div className="flex items-center">
                              <div className="h-10 w-10 rounded-full bg-indigo-100 flex items-center justify-center text-indigo-600 mr-3">
                                <User size={18} />
                              </div>
                              <div>
                                <p className="font-medium">{psych.name}</p>
                                <p className="text-sm text-gray-500">{psych.specializationDetails || 'Clinical Psychologist'}</p>
                              </div>
                            </div>
                          </div>
                        ))
                      ) : (
                        <div className="text-center py-8 text-gray-500">
                          No psychologists available at this time
                        </div>
                      )}
                    </div>
                  )}
                </div>

                {/* Contact Form */}
                <div className="lg:col-span-2">
                  <h2 className="text-lg font-medium text-gray-900 mb-4">
                    {selectedPsychologist ? `Contact ${selectedPsychologist.name}` : 'Select a Psychologist'}
                  </h2>
                  
                  {selectedPsychologist ? (
                    <form onSubmit={handleContactSubmit} className="space-y-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Reason for Contact</label>
                        <select
                          name="reason"
                          value={contactForm.reason}
                          onChange={handleContactChange}
                          className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                          required
                        >
                          <option value="">Select a reason</option>
                          <option value="consultation">Initial Consultation</option>
                          <option value="anxiety">Anxiety Concerns</option>
                          <option value="depression">Depression Concerns</option>
                          <option value="therapy">Therapy Inquiry</option>
                          <option value="other">Other</option>
                        </select>
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Urgency Level</label>
                        <div className="grid grid-cols-3 gap-3">
                          {['low', 'normal', 'high'].map(level => (
                            <label key={level} className="flex items-center">
                              <input
                                type="radio"
                                name="urgency"
                                value={level}
                                checked={contactForm.urgency === level}
                                onChange={handleContactChange}
                                className="h-4 w-4 text-indigo-600 focus:ring-indigo-500"
                              />
                              <span className="ml-2 block text-sm text-gray-700 capitalize">{level}</span>
                            </label>
                          ))}
                        </div>
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">Preferred Date</label>
                          <div className="relative">
                            <input
                              type="date"
                              name="preferredDate"
                              value={contactForm.preferredDate}
                              onChange={handleContactChange}
                              min={new Date().toISOString().split('T')[0]}
                              className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                            />
                            <Calendar className="absolute right-3 top-2.5 h-5 w-5 text-gray-400" />
                          </div>
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">Preferred Time</label>
                          <div className="relative">
                            <select
                              name="preferredTime"
                              value={contactForm.preferredTime}
                              onChange={handleContactChange}
                              className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 appearance-none"
                            >
                              <option value="">Any time</option>
                              {['9:00 AM', '10:00 AM', '11:00 AM', '12:00 PM', '1:00 PM', '2:00 PM', '3:00 PM', '4:00 PM'].map(time => (
                                <option key={time} value={time}>{time}</option>
                              ))}
                            </select>
                            <Clock className="absolute right-3 top-2.5 h-5 w-5 text-gray-400 pointer-events-none" />
                          </div>
                        </div>
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Additional Message</label>
                        <textarea
                          rows={3}
                          name="message"
                          value={contactForm.message}
                          onChange={handleContactChange}
                          className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                          placeholder="Briefly describe what you'd like to discuss"
                        />
                      </div>

                      <div className="pt-2">
                        <button
                          type="submit"
                          disabled={isSubmitting}
                          className="w-full flex justify-center items-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-70"
                        >
                          {isSubmitting ? (
                            <>
                              <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                              </svg>
                              Sending...
                            </>
                          ) : (
                            <>
                              <Mail className="mr-2" size={16} />
                              Send Request
                            </>
                          )}
                        </button>
                      </div>
                    </form>
                  ) : (
                    <div className="bg-gray-50 p-8 text-center rounded-lg border border-gray-200">
                      <div className="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-indigo-100">
                        <User className="h-6 w-6 text-indigo-600" />
                      </div>
                      <h3 className="mt-2 text-sm font-medium text-gray-900">Select a psychologist</h3>
                      <p className="mt-1 text-sm text-gray-500">
                        Choose from our list of available mental health professionals to contact them.
                      </p>
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}