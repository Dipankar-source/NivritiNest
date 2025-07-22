import React from 'react'
import { useNavigate } from 'react-router-dom';
import {
  
  MessageSquare,
  X
} from 'lucide-react';

const AiBot = () => {
    const navigate = useNavigate();


    return (
        <div>
            {/* AI Chatbot Floating Button */}
            <button
                onClick={() => navigate('/ai-analysis')}
                className="fixed bottom-6 right-6 bg-blue-500 text-white p-3 rounded-full shadow-lg hover:bg-blue-600 transition-colors z-50"
            >
               <MessageSquare className="w-6 h-6 cursor-pointer" />
            </button>


            
        </div>
    )
}

export default AiBot