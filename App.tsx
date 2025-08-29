
import React, { useState, useEffect, useCallback } from 'react';
import { ChatWindow } from './components/ChatWindow';
import { DocumentEditor } from './components/DocumentEditor';
import { BotIcon } from './components/icons';
import { Template, DocumentData, LearnedMappings } from './types';
import { TEMPLATES } from './data/templates';

type AppMode = 'chat' | 'edit';

const App: React.FC = () => {
  const [mode, setMode] = useState<AppMode>('chat');
  const [selectedTemplate, setSelectedTemplate] = useState<Template | null>(null);
  const [dataToEdit, setDataToEdit] = useState<DocumentData | null>(null);
  const [learnedMappings, setLearnedMappings] = useState<LearnedMappings>({});

  useEffect(() => {
    // Load learned mappings from local storage on initial load
    const storedMappings = localStorage.getItem('ai-sales-assistant-mappings');
    if (storedMappings) {
      setLearnedMappings(JSON.parse(storedMappings));
    }
  }, []);

  const handleTemplateSelect = useCallback((template: Template) => {
    setSelectedTemplate(template);
    // Deep copy initial data to prevent mutation
    setDataToEdit(JSON.parse(JSON.stringify(template.initialData)));
    setMode('edit');
  }, []);

  const handleEditComplete = (updatedData: DocumentData, editedFields: string[]) => {
    if (selectedTemplate) {
      // Only update mappings if there were actual changes
      if (editedFields.length > 0) {
        const newMappings = {
          ...learnedMappings,
          [selectedTemplate.id]: editedFields,
        };
        setLearnedMappings(newMappings);
        localStorage.setItem('ai-sales-assistant-mappings', JSON.stringify(newMappings));
      }
    }
    setMode('chat');
    setSelectedTemplate(null);
    setDataToEdit(null);
  };
  
  const handleCancelEdit = () => {
    setMode('chat');
    setSelectedTemplate(null);
    setDataToEdit(null);
  }

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col items-center p-4 sm:p-6 lg:p-8">
      <header className="flex items-center mb-6">
        <div className="bg-indigo-600 p-2 rounded-lg mr-3">
          <BotIcon className="w-8 h-8 text-white" />
        </div>
        <h1 className="text-3xl font-bold text-gray-800">Trợ lý AI cho sale Lavis</h1>
      </header>
      <main className="w-full max-w-6xl mx-auto h-[calc(100vh-120px)]">
        {mode === 'chat' && (
          <ChatWindow
            templates={TEMPLATES}
            learnedMappings={learnedMappings}
            onTemplateSelect={handleTemplateSelect}
          />
        )}
        {mode === 'edit' && selectedTemplate && dataToEdit && (
          <DocumentEditor
            template={selectedTemplate}
            initialData={dataToEdit}
            onComplete={handleEditComplete}
            onCancel={handleCancelEdit}
          />
        )}
      </main>
    </div>
  );
};

export default App;