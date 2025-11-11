import * as React from 'react';
import type { ChatMessage } from '../types';

interface ChatbotProps {
    messages: ChatMessage[];
    isOpen: boolean;
    onClose: () => void;
    onSubmit: (message: string) => Promise<void>;
    isLoading: boolean;
}

const TypingIndicator: React.FC = () => (
    <div className="flex items-center space-x-1 p-2">
        <div className="w-2 h-2 bg-gray-400 rounded-full animate-pulse [animation-delay:-0.3s]"></div>
        <div className="w-2 h-2 bg-gray-400 rounded-full animate-pulse [animation-delay:-0.15s]"></div>
        <div className="w-2 h-2 bg-gray-400 rounded-full animate-pulse"></div>
    </div>
);

const Chatbot: React.FC<ChatbotProps> = ({ messages, isOpen, onClose, onSubmit, isLoading }) => {
    const [input, setInput] = React.useState('');
    const [animationClass, setAnimationClass] = React.useState('');
    const messagesEndRef = React.useRef<HTMLDivElement>(null);

    React.useEffect(() => {
        if (isOpen) {
            setAnimationClass('animate-chat-slide-in');
        } else if (animationClass) { // Only run outro if it was previously open
            setAnimationClass('animate-chat-slide-out');
        }
    }, [isOpen]);

    React.useEffect(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, [messages, isLoading]);

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (input.trim() && !isLoading) {
            onSubmit(input);
            setInput('');
        }
    };

    if (!animationClass) return null;

    return (
        <div 
          className={`fixed bottom-24 right-6 w-full max-w-sm h-full max-h-[600px] bg-white rounded-lg shadow-2xl flex flex-col z-40 ${animationClass}`}
          onAnimationEnd={() => { if (!isOpen) setAnimationClass(''); }}
        >
            <header className="flex items-center justify-between p-4 bg-gray-800 text-white rounded-t-lg">
                <h3 className="text-lg font-bold">Dev Mobile Assistant</h3>
                <button onClick={onClose} className="text-2xl hover:text-gray-300">&times;</button>
            </header>
            
            <div className="flex-1 p-4 overflow-y-auto custom-scrollbar">
                <div className="space-y-4">
                    {messages.map((msg, index) => (
                        <div key={index} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                            <div className={`max-w-xs px-4 py-2 rounded-lg ${msg.role === 'user' ? 'bg-blue-600 text-white' : 'bg-gray-100 text-gray-800'}`}>
                                <p className="text-sm" style={{ whiteSpace: 'pre-wrap' }}>{msg.content}</p>
                            </div>
                        </div>
                    ))}
                    {isLoading && (
                       <div className="flex justify-start">
                           <div className="bg-gray-100 rounded-lg">
                               <TypingIndicator />
                           </div>
                       </div>
                    )}
                    <div ref={messagesEndRef} />
                </div>
            </div>

            <footer className="p-4 border-t border-gray-200">
                <form onSubmit={handleSubmit} className="flex items-center space-x-2">
                    <input
                        type="text"
                        value={input}
                        onChange={(e) => setInput(e.target.value)}
                        placeholder="Ask about a phone..."
                        className="flex-1 p-2 bg-gray-50 rounded-md border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500"
                        disabled={isLoading}
                    />
                    <button
                        type="submit"
                        disabled={isLoading}
                        className="bg-blue-600 text-white p-2 rounded-md hover:bg-blue-700 disabled:bg-blue-400"
                    >
                         <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" /></svg>
                    </button>
                </form>
            </footer>
        </div>
    );
};

export default Chatbot;