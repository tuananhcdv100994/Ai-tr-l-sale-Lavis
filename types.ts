
import React from 'react';

export interface LineItem {
    category: string;
    sku: string;
    name: string;
    packSize: string;
    coverage: number | string;
    price: number;
    pricePerSqM: number;
    totalPrice: number;
    warranty?: string;
}

export interface DocumentData {
  clientName: string;
  customerCode: string;
  documentDate: string;
  lineItems: LineItem[];
  total: number;
  [key: string]: any; // Allow other properties for different templates
}

export interface Template {
  id: string;
  name: string;
  initialData: DocumentData;
  component: React.FC<any>; // Component to render the template
}

export interface LearnedMappings {
  [templateId: string]: string[]; // Stores an array of field paths that the user edits
}

export interface GeneratedDocument {
    template: Template;
    data: DocumentData;
}

export interface ChatMessage {
  id: string;
  role: 'user' | 'assistant';
  text?: string;
  isLoading?: boolean;
  templateSelection?: Template[];
  onTemplateSelect?: (template: Template) => void;
  generatedDocument?: GeneratedDocument;
  sources?: { uri: string; title: string; }[];
}