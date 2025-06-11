import { useState, useRef, useEffect } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { GoogleGenerativeAI } from '@google/generative-ai';
import { marked } from 'marked';
import { 
  Bot, 
  User, 
  Sparkles, 
  Send, 
  BrainCircuit, 
  Stethoscope, 
  Pill, 
  BookOpenText,
  AlertTriangle,
  Loader2
} from 'lucide-react';

// Configure marked to sanitize HTML (important for security)
marked.setOptions({
  breaks: true,
  gfm: true,
  sanitize: true
});

export default function AIConsulting() {
  const { userData } = useAuth();
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef(null);
  const [model, setModel] = useState(null);

  // Initialize Gemini
  useEffect(() => {
    const initGemini = async () => {
      try {
        const apiKey = import.meta.env.VITE_GEMINI_API_KEY;
        if (!apiKey) {
          console.error('Gemini API key not found in environment variables');
          return;
        }
        const genAI = new GoogleGenerativeAI(apiKey);
        setModel(genAI.getGenerativeModel({ 
          model: "gemini-1.5-flash-latest",
          generationConfig: {
            temperature: 0.7 // More deterministic medical responses
          }
        }));
      } catch (error) {
        console.error('Error initializing Gemini:', error);
      }
    };
    initGemini();
  }, []);

  // Initial introductory message
  useEffect(() => {
    setMessages([
      {
        id: 1,
        text: `Welcome, ${userData?.name || ''}! I'm FelanoCareAI, your advanced medical assistant. How can I assist you today?\n\nI can help with:\n\n• Symptom analysis and differential diagnosis\n• Evidence-based treatment recommendations\n• Drug interaction checks\n• Medical literature summaries\n• Clinical decision support\n\nPlease describe your patient case or medical query in detail.`,
        sender: 'ai',
        timestamp: new Date().toISOString()
      }
    ]);
  }, [userData?.name]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!input.trim() || !model) return;

    // Add user message
    const userMessage = {
      id: messages.length + 1,
      text: input,
      sender: 'user',
      timestamp: new Date().toISOString()
    };

    setMessages(prev => [...prev, userMessage]);
    setInput('');
    setIsLoading(true);

    try {
      const prompt = `
      You are FelanoCareAI, a professional medical assistant for doctors.
      The user is ${userData?.name || 'a physician'} seeking clinical guidance.
      
      Current conversation context:
      ${messages.slice(-3).map(m => `${m.sender}: ${m.text}`).join('\n')}
      
      New query: ${input}
      
      Provide a concise, evidence-based response in MARKDOWN format considering:
      - Relevant differential diagnoses
      - Recommended diagnostic workup
      - Treatment options with supporting evidence
      - Potential drug interactions if medications mentioned
      - Red flags requiring immediate attention
      - References to clinical guidelines when applicable
      
      Structure your response clearly using markdown formatting:
      - Use **bold** for important terms
      - Use bullet points for lists
      - Use headings for sections
      - Always emphasize the need for clinical judgment
      `;

      const result = await model.generateContent(prompt);
      const response = await result.response;
      const text = response.text();

      const aiResponse = {
        id: messages.length + 2,
        text: text,
        sender: 'ai',
        timestamp: new Date().toISOString()
      };

      setMessages(prev => [...prev, aiResponse]);
    } catch (error) {
      console.error('Gemini API error:', error);
      const errorMessage = {
        id: messages.length + 2,
        text: "I encountered an issue processing your request. Please check your connection and try again. For urgent matters, consult standard medical resources.",
        sender: 'ai',
        timestamp: new Date().toISOString()
      };
      setMessages(prev => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
    }
  };

  // Function to render markdown safely
  const renderMarkdown = (text) => {
    try {
      return { __html: marked.parse(text) };
    } catch (e) {
      console.error('Markdown parsing error:', e);
      return { __html: text }; // Fallback to plain text
    }
  };

  return (
    <div className="flex flex-col h-full bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-200 px-6 py-4 flex items-center space-x-3">
        <div className="p-2 rounded-lg bg-indigo-100 text-indigo-600">
          <BrainCircuit size={24} />
        </div>
        <div>
          <h2 className="text-xl font-semibold text-gray-800">FelanoCare AI Consultation</h2>
          <p className="text-sm text-gray-500 flex items-center">
            <Sparkles size={14} className="mr-1" /> Powered by Gemini AI - Medical Use Only
          </p>
        </div>
      </div>

      {/* Chat Area */}
      <div className="flex-1 overflow-y-auto p-4">
        <div className="max-w-4xl mx-auto space-y-6">
          {messages.map((message) => (
            <div 
              key={message.id} 
              className={`flex ${message.sender === 'user' ? 'justify-end' : 'justify-start'}`}
            >
              <div 
                className={`max-w-[85%] rounded-xl px-5 py-4 flex ${
                  message.sender === 'user' 
                    ? 'bg-indigo-600 text-white rounded-br-none items-end' 
                    : 'bg-white border border-gray-200 rounded-bl-none shadow-sm items-start'
                }`}
              >
                <div className={`mr-3 mt-1 flex-shrink-0 ${
                  message.sender === 'user' ? 'text-indigo-200' : 'text-indigo-600'
                }`}>
                  {message.sender === 'user' ? <User size={20} /> : <Bot size={20} />}
                </div>
                <div className="flex-1">
                  {message.sender === 'ai' ? (
                    <div 
                      className="prose prose-sm max-w-none"
                      dangerouslySetInnerHTML={renderMarkdown(message.text)}
                    />
                  ) : (
                    <div className="whitespace-pre-wrap text-sm md:text-base">
                      {message.text}
                    </div>
                  )}
                  <div className={`text-xs mt-2 flex items-center ${
                    message.sender === 'user' ? 'text-indigo-200' : 'text-gray-500'
                  }`}>
                    {new Date(message.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    {message.sender === 'ai' && (
                      <span className="ml-2 px-1.5 py-0.5 rounded bg-indigo-50 text-indigo-600 text-[0.65rem] font-medium">
                        AI
                      </span>
                    )}
                  </div>
                </div>
              </div>
            </div>
          ))}
          
          {isLoading && (
            <div className="flex justify-start">
              <div className="max-w-[85%] bg-white border border-gray-200 rounded-xl rounded-bl-none px-5 py-4 shadow-sm flex">
                <div className="mr-3 mt-1 text-indigo-600">
                  <Bot size={20} />
                </div>
                <div className="flex space-x-2 items-center">
                  <Loader2 size={18} className="animate-spin text-gray-400" />
                  <span className="text-sm text-gray-600">Analyzing your query...</span>
                </div>
              </div>
            </div>
          )}
          <div ref={messagesEndRef} />
        </div>
      </div>

      {/* Input Area */}
      <div className="bg-white border-t border-gray-200 p-4">
        <form onSubmit={handleSubmit} className="max-w-4xl mx-auto">
          <div className="relative">
            <textarea
              rows="2"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Describe symptoms, medications, or ask a clinical question..."
              className="w-full pr-14 pl-5 py-4 border border-gray-300 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 resize-none text-sm md:text-base"
              disabled={isLoading || !model}
            />
            <button
              type="submit"
              disabled={isLoading || !input.trim() || !model}
              className="absolute right-3 bottom-3 inline-flex items-center justify-center h-10 w-10 rounded-lg bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              <Send size={18} className="text-white" />
            </button>
          </div>
          <div className="mt-3 flex flex-wrap justify-center gap-2">
            <div className="flex items-center text-xs text-gray-500 px-3 py-1.5 bg-gray-100 rounded-full">
              <Stethoscope size={14} className="mr-1" />
              Symptom Analysis
            </div>
            <div className="flex items-center text-xs text-gray-500 px-3 py-1.5 bg-gray-100 rounded-full">
              <Pill size={14} className="mr-1" />
              Drug Interactions
            </div>
            <div className="flex items-center text-xs text-gray-500 px-3 py-1.5 bg-gray-100 rounded-full">
              <BookOpenText size={14} className="mr-1" />
              Guidelines
            </div>
          </div>
          <div className="mt-3 flex items-center justify-center text-xs text-amber-600">
            <AlertTriangle size={14} className="mr-1.5" />
            AI suggestions require clinical verification
          </div>
          {!model && (
            <div className="mt-2 text-center text-sm text-red-500">
              Warning: AI service not properly initialized. Please check your API configuration.
            </div>
          )}
        </form>
      </div>
    </div>
  );
}