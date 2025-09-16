
import React, { useState, useRef, useEffect } from 'react';
import { ChatMessage, DocumentData, LearnedMappings, Template, GeneratedDocument } from '../types';
import { generateDocumentData, getGeneralResponse } from '../services/geminiService';
import { BotIcon, SendIcon, UserIcon, ResetIcon, UploadIcon, ExternalLinkIcon } from './icons';
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
        <div className="bg-gray-700 rounded-lg p-3 max-w-lg">
            <div className="flex items-center space-x-1">
                <div className="w-2 h-2 bg-gray-400 rounded-full animate-pulse"></div>
                <div className="w-2 h-2 bg-gray-400 rounded-full animate-pulse" style={{ animationDelay: '0.2s' }}></div>
                <div className="w-2 h-2 bg-gray-400 rounded-full animate-pulse" style={{ animationDelay: '0.4s' }}></div>
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
                <div className="flex flex-col items-start space-y-2 w-full">
                    {message.text && (
                         <div className="bg-gray-800 rounded-lg p-3 max-w-lg text-white">
                            <p className="text-sm" dangerouslySetInnerHTML={{ __html: message.text.replace(/\n/g, '<br />') }}></p>
                         </div>
                    )}
                    {message.sources && message.sources.length > 0 && (
                        <div className="bg-gray-800 border border-gray-700 rounded-lg p-3 max-w-lg w-full">
                            <h4 className="text-xs font-semibold text-gray-400 mb-2">NGUỒN THAM KHẢO</h4>
                            <div className="flex flex-col space-y-2">
                                {message.sources.map((source, index) => (
                                    <a href={source.uri} key={index} target="_blank" rel="noopener noreferrer" className="text-sm text-indigo-400 hover:underline flex items-center">
                                        <ExternalLinkIcon className="w-4 h-4 mr-2 flex-shrink-0" />
                                        <span className="truncate">{source.title || source.uri}</span>
                                    </a>
                                ))}
                            </div>
                        </div>
                    )}
                    {message.templateSelection && (
                        <div className="bg-gray-800 rounded-lg p-3 max-w-lg w-full">
                            <p className="text-sm text-gray-300 mb-3">Vui lòng chọn một mẫu để bắt đầu hoặc tải lên mẫu của bạn:</p>
                            <div className="flex flex-col space-y-2">
                                {message.templateSelection.map(template => (
                                    <div key={template.id} className="flex items-center space-x-2">
                                        <button 
                                            onClick={() => message.onTemplateSelect?.(template)}
                                            className="flex-grow bg-gray-700 border border-indigo-500 text-indigo-300 font-semibold py-2 px-4 rounded-lg hover:bg-gray-600 transition-colors text-left"
                                        >
                                            {template.name}
                                        </button>
                                        <button title="Đặt lại các trường đã học" className="p-2 text-gray-400 hover:text-white hover:bg-gray-700 rounded-full transition-colors" onClick={() => alert('Chức năng đặt lại đang được phát triển!')}>
                                            <ResetIcon className="w-5 h-5"/>
                                        </button>
                                    </div>
                                ))}
                                 <button
                                    onClick={() => alert('Chức năng tải file lên đang được phát triển!')}
                                    className="flex items-center justify-center w-full bg-indigo-600 text-white font-semibold py-2 px-4 rounded-lg hover:bg-indigo-700 transition-colors mt-2"
                                >
                                    <UploadIcon className="w-5 h-5 mr-2" />
                                    Tải Mẫu Mới
                                </button>
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
            <div className="bg-blue-600 text-white rounded-lg p-3 max-w-lg">
                <p className="text-sm">{message.text}</p>
            </div>
             <div className="bg-gray-700 rounded-full p-2 flex-shrink-0">
                <UserIcon className="w-6 h-6 text-gray-300" />
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
          text: "Xin chào! Tôi là trợ lý AI của bạn. Tôi có thể giúp bạn tạo tài liệu tự động hoặc trả lời bất kỳ câu hỏi nào. Bạn muốn bắt đầu như thế nào?",
        },
        {
          id: 'template-selection-prompt',
          role: 'assistant',
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
    if (!input.trim() || isLoading) return;

    const userMessage: ChatMessage = { id: Date.now().toString(), role: 'user', text: input };
    setMessages(prev => [...prev, userMessage]);
    setInput('');
    setIsLoading(true);

    if (selectedTemplateForAutomation) {
        // Automation Mode
        const fieldsToExtract = learnedMappings[selectedTemplateForAutomation.id];
        if (!fieldsToExtract) {
            setIsLoading(false);
            setMessages(prev => [...prev, {id: 'error', role: 'assistant', text: "Đã xảy ra lỗi: Không tìm thấy các trường đã học cho mẫu này."}]);
            return;
        }

        const responseData = await generateDocumentData(input, fieldsToExtract);

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
            setSelectedTemplateForAutomation(null);
        }
    } else {
        // General Chat Mode
        const { text, sources } = await getGeneralResponse(input);
        setMessages(prev => [...prev, { id: Date.now().toString(), role: 'assistant', text, sources }]);
    }
    
    setIsLoading(false);
  };

  const handleKeyPress = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      handleSend();
    }
  };
  
  const isAutomationMode = selectedTemplateForAutomation !== null;
  const placeholderText = isAutomationMode 
    ? "Nhập các thông tin mới tại đây..." 
    : "Hỏi tôi bất cứ điều gì hoặc chọn một mẫu ở trên...";

  return (
    <div className="flex flex-col h-full bg-gray-900 rounded-lg shadow-lg border border-gray-700 max-w-4xl mx-auto">
      <div className="p-4 border-b border-gray-700">
        <h2 className="text-xl font-bold text-gray-200">Trợ lý AI cho sale Lavis</h2>
      </div>
      <div className="flex-grow p-6 overflow-y-auto space-y-6">
        {messages.map(msg => (
          <Message key={msg.id} message={msg} />
        ))}
        {isLoading && <LoadingBubble />}
        <div ref={chatEndRef} />
      </div>
      <div className="p-4 border-t border-gray-700 bg-gray-900">
        <div className="relative">
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyPress={handleKeyPress}
            placeholder={placeholderText}
            className="w-full pl-4 pr-12 py-3 bg-gray-800 border border-gray-600 rounded-full focus:outline-none focus:ring-2 focus:ring-indigo-500 text-white"
            disabled={isLoading}
          />
          <button
            onClick={handleSend}
            disabled={isLoading || !input.trim()}
            className="absolute right-2 top-1/2 -translate-y-1/2 p-2.5 rounded-full text-white bg-indigo-600 hover:bg-indigo-700 disabled:bg-indigo-400 disabled:cursor-not-allowed transition-colors"
          >
            <SendIcon className="w-5 h-5" />
          </button>
        </div>
      </div>
    </div>
  );
};