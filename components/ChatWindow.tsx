
import React, { useState, useRef, useEffect } from 'react';
import { ChatMessage, DocumentData, LearnedMappings, Template, GeneratedDocument } from '../types';
import { generateDocumentData } from '../services/geminiService';
import { BotIcon, SendIcon, UserIcon } from './icons';
import { GeneratedDocumentPreview } from './GeneratedDocumentPreview';

interface ChatWindowProps {
    templates: Template[];
    learnedMappings: LearnedMappings;
    onTemplateSelect: (template: Template) => void;
}

const LoadingBubble: React.FC = () => (
    <div className="flex items-start space-x-3">
        <div className="bg-indigo-600 rounded-full p-2">
             <BotIcon className="w-6 h-6 text-white"/>
        </div>
        <div className="bg-gray-200 rounded-lg p-3 max-w-lg">
            <div className="flex items-center space-x-1">
                <div className="w-2 h-2 bg-gray-500 rounded-full animate-pulse"></div>
                <div className="w-2 h-2 bg-gray-500 rounded-full animate-pulse" style={{ animationDelay: '0.2s' }}></div>
                <div className="w-2 h-2 bg-gray-500 rounded-full animate-pulse" style={{ animationDelay: '0.4s' }}></div>
            </div>
        </div>
    </div>
);


const Message: React.FC<{ message: ChatMessage }> = ({ message }) => {
    const isAssistant = message.role === 'assistant';

    if (isAssistant) {
        return (
            <div className="flex items-start space-x-3">
                <div className="bg-indigo-600 rounded-full p-2 flex-shrink-0">
                    <BotIcon className="w-6 h-6 text-white" />
                </div>
                <div className="flex flex-col items-start space-y-2">
                    {message.text && (
                         <div className="bg-gray-200 rounded-lg p-3 max-w-lg">
                            <p className="text-sm text-gray-800">{message.text}</p>
                         </div>
                    )}
                    {message.templateSelection && (
                        <div className="bg-gray-200 rounded-lg p-3 max-w-lg">
                            <p className="text-sm text-gray-800 mb-3">Vui lòng chọn một mẫu để bắt đầu:</p>
                            <div className="flex flex-col space-y-2">
                                {message.templateSelection.map(template => (
                                    <button 
                                        key={template.id}
                                        onClick={() => message.onTemplateSelect?.(template)}
                                        className="bg-white border border-indigo-500 text-indigo-600 font-semibold py-2 px-4 rounded-lg hover:bg-indigo-50 transition-colors text-left"
                                    >
                                        {template.name}
                                    </button>
                                ))}
                            </div>
                        </div>
                    )}
                    {message.generatedDocument && (
                        <GeneratedDocumentPreview document={message.generatedDocument} />
                    )}
                </div>
            </div>
        );
    }

    return (
        <div className="flex items-start justify-end space-x-3">
            <div className="bg-blue-500 text-white rounded-lg p-3 max-w-lg">
                <p className="text-sm">{message.text}</p>
            </div>
             <div className="bg-gray-300 rounded-full p-2 flex-shrink-0">
                <UserIcon className="w-6 h-6 text-gray-700" />
            </div>
        </div>
    );
};


export const ChatWindow: React.FC<ChatWindowProps> = ({ templates, learnedMappings, onTemplateSelect }) => {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const chatEndRef = useRef<HTMLDivElement>(null);
  const [selectedTemplateForAutomation, setSelectedTemplateForAutomation] = useState<Template | null>(null);

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isLoading]);
  
  useEffect(() => {
    if (messages.length === 0) {
      setMessages([
        {
          id: 'initial-prompt',
          role: 'assistant',
          text: "Xin chào! Tôi có thể giúp bạn tạo tài liệu. Bạn muốn sử dụng mẫu nào?",
          templateSelection: templates,
          onTemplateSelect: (template) => {
            const mappings = learnedMappings[template.id];
            if (mappings && mappings.length > 0) {
              setMessages(prev => [...prev, {
                id: `selection-${template.id}`,
                role: 'user',
                text: `Tôi chọn: ${template.name}`
              },{
                id: `prompt-info-${template.id}`,
                role: 'assistant',
                text: `Tuyệt vời! Tôi thấy bạn đã dùng mẫu "${template.name}" trước đây. Vui lòng cung cấp thông tin mới cho các mục bạn đã chỉnh sửa, tôi sẽ tự động tạo tài liệu.`
              }]);
              setSelectedTemplateForAutomation(template);
            } else {
               setMessages(prev => [...prev, {
                id: `selection-${template.id}`,
                role: 'user',
                text: `Tôi chọn: ${template.name}`
              },{
                id: `start-edit-${template.id}`,
                role: 'assistant',
                text: `Bắt đầu một tài liệu mới với mẫu "${template.name}". Tôi sẽ mở trình chỉnh sửa để bạn thay đổi. Tôi sẽ ghi nhớ các mục bạn chỉnh sửa cho lần sau!`
              }]);
              setTimeout(() => onTemplateSelect(template), 1500);
            }
          }
        },
      ]);
    }
  }, [messages.length, templates, learnedMappings, onTemplateSelect]);


  const handleSend = async () => {
    if (!input.trim() || isLoading || !selectedTemplateForAutomation) return;

    const userMessage: ChatMessage = { id: Date.now().toString(), role: 'user', text: input };
    setMessages(prev => [...prev, userMessage]);
    setInput('');
    setIsLoading(true);
    
    const fieldsToExtract = learnedMappings[selectedTemplateForAutomation.id];
    if (!fieldsToExtract) {
        setIsLoading(false);
        setMessages(prev => [...prev, {id: 'error', role: 'assistant', text: "Đã xảy ra lỗi: Không tìm thấy các trường đã học cho mẫu này."}]);
        return;
    }

    const responseData = await generateDocumentData(input, fieldsToExtract);

    setIsLoading(false);

    if (responseData.error) {
        setMessages(prev => [...prev, { id: Date.now().toString(), role: 'assistant', text: responseData.error }]);
    } else {
        const finalDocumentData = {
            ...selectedTemplateForAutomation.initialData,
            ...responseData
        };

        const generatedDocument: GeneratedDocument = {
            template: selectedTemplateForAutomation,
            data: finalDocumentData as DocumentData
        };
        
        setMessages(prev => [...prev, { id: Date.now().toString(), role: 'assistant', generatedDocument }]);
        setSelectedTemplateForAutomation(null); // Reset for next interaction
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      handleSend();
    }
  };
  
  const isAutomationMode = selectedTemplateForAutomation !== null;

  return (
    <div className="flex flex-col h-full bg-white rounded-lg shadow-lg border border-gray-200 max-w-4xl mx-auto">
      <div className="p-4 border-b border-gray-200">
        <h2 className="text-xl font-bold text-gray-800">Trợ lý AI cho sale Lavis</h2>
      </div>
      <div className="flex-grow p-6 overflow-y-auto space-y-6">
        {messages.map(msg => (
          <Message key={msg.id} message={msg} />
        ))}
        {isLoading && <LoadingBubble />}
        <div ref={chatEndRef} />
      </div>
      <div className="p-4 border-t border-gray-200 bg-white">
        <div className="relative">
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyPress={handleKeyPress}
            placeholder={isAutomationMode ? "Nhập các thông tin mới tại đây..." : "Vui lòng chọn một mẫu ở trên để bắt đầu."}
            className="w-full pl-4 pr-12 py-3 bg-gray-100 border border-gray-300 rounded-full focus:outline-none focus:ring-2 focus:ring-indigo-500 text-black"
            disabled={isLoading || !isAutomationMode}
          />
          <button
            onClick={handleSend}
            disabled={isLoading || !input.trim() || !isAutomationMode}
            className="absolute right-2 top-1/2 -translate-y-1/2 p-2.5 rounded-full text-white bg-indigo-600 hover:bg-indigo-700 disabled:bg-indigo-300 disabled:cursor-not-allowed transition-colors"
          >
            <SendIcon className="w-5 h-5" />
          </button>
        </div>
      </div>
    </div>
  );
};