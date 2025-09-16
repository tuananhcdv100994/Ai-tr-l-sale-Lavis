
import React, { useState, useEffect, useCallback } from 'react';
import { ChatWindow } from './components/ChatWindow';
import { DocumentEditor } from './components/DocumentEditor';
import { Template, DocumentData, LearnedMappings } from './types';
import { TEMPLATES } from './data/templates';
import { logoUrl } from './assets/logo';


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
          [selectedTemplate.id]: Array.from(new Set([...(learnedMappings[selectedTemplate.id] || []), ...editedFields])),
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
    <div className="min-h-screen bg-gray-900 text-gray-200 flex flex-col items-center p-2 sm:p-4 md:p-6">
      <header className="flex items-center justify-center mb-6 w-full max-w-6xl">
        <img src={logoUrl} alt="Lavis Coating Logo" className="h-12 mr-4"/>
      </header>
      <main className="w-full max-w-6xl mx-auto h-[calc(100vh-110px)]">
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