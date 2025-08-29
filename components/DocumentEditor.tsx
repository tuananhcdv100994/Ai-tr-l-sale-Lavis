
import React, { useState, useRef, useMemo } from 'react';
import { Template, DocumentData } from '../types';
import { get, set, isEqual, cloneDeep } from 'lodash-es';

declare const html2pdf: any;

interface DocumentEditorProps {
  template: Template;
  initialData: DocumentData;
  onComplete: (updatedData: DocumentData, editedFields: string[]) => void;
  onCancel: () => void;
}

export const DocumentEditor: React.FC<DocumentEditorProps> = ({ template, initialData, onComplete, onCancel }) => {
  const [data, setData] = useState<DocumentData>(cloneDeep(initialData)); // Deep copy
  const [selectedField, setSelectedField] = useState<string | null>(null);
  const pdfRef = useRef<HTMLDivElement>(null);
  
  const selectedValue = selectedField ? get(data, selectedField, '') : '';
  const TemplateComponent = template.component;
  
  const handleFieldSelect = (fieldPath: string) => {
      setSelectedField(fieldPath);
  };
  
  const handleValueChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
      if(selectedField) {
          const newData = cloneDeep(data); // Deep copy
          set(newData, selectedField, e.target.value);
          setData(newData);
      }
  };

  const handleGeneratePdf = () => {
    if (!pdfRef.current) return;
    
    // Find which fields were edited
    const editedFields = new Set<string>();
    const findDifferences = (path: string, obj1: any, obj2: any) => {
        if (!obj1 || !obj2) return;
        Object.keys(obj1).forEach(key => {
            const currentPath = path ? `${path}.${key}` : key;
            if (key === 'component') return; // Skip component property

            const val1 = obj1[key];
            const val2 = obj2[key];

            if(typeof val1 === 'object' && val1 !== null && !Array.isArray(val1)) {
                findDifferences(currentPath, val1, val2);
            } else {
                if(!isEqual(val1, val2)) {
                    editedFields.add(currentPath);
                }
            }
        });
    };
    
    findDifferences('', initialData, data);
    
    const opt = {
      margin: 0,
      filename: `${template.name}_${data.customerCode}_${new Date().toISOString().split('T')[0]}.pdf`,
      image: { type: 'jpeg', quality: 0.98 },
      html2canvas: { scale: 2, useCORS: true, letterRendering: true },
      jsPDF: { unit: 'in', format: 'a4', orientation: 'portrait' }
    };

    html2pdf().from(pdfRef.current).set(opt).save().then(() => {
        onComplete(data, Array.from(editedFields));
    });
  };

  const InputComponent = useMemo(() => {
    if (!selectedField) {
        return <div className="text-gray-500">Nhấp vào một mục trong tài liệu để chỉnh sửa.</div>;
    }
    const isTextArea = (selectedValue as string)?.includes('\n');
    const InputElement = isTextArea ? 'textarea' : 'input';

    return (
        <div>
            <label className="block text-sm font-medium text-gray-700 capitalize mb-1">
                Đang sửa: <span className="font-mono bg-gray-100 px-1 rounded">{selectedField}</span>
            </label>
            <InputElement 
                value={selectedValue}
                onChange={handleValueChange}
                className="w-full p-2 border border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500"
                rows={isTextArea ? 5 : undefined}
            />
        </div>
    )
  }, [selectedField, selectedValue, handleValueChange]);

  return (
    <div className="flex h-full gap-6">
        {/* Left Side: Editor Panel */}
        <div className="w-1/3 flex flex-col bg-white rounded-lg shadow-lg border border-gray-200 p-6">
            <h2 className="text-xl font-bold text-gray-800 border-b pb-4 mb-4">Trình chỉnh sửa tài liệu</h2>
            <div className="flex-grow space-y-4">
                {InputComponent}
            </div>
             <div className="mt-6 pt-4 border-t space-y-2">
                <button
                onClick={handleGeneratePdf}
                className="w-full bg-indigo-600 text-white font-semibold py-2 px-4 rounded-lg hover:bg-indigo-700 transition-colors"
                >
                Lưu & Xuất PDF
                </button>
                 <button
                onClick={onCancel}
                className="w-full bg-gray-200 text-gray-700 font-semibold py-2 px-4 rounded-lg hover:bg-gray-300 transition-colors"
                >
                Hủy
                </button>
            </div>
        </div>

        {/* Right Side: Document Preview */}
        <div className="w-2/3 bg-white rounded-lg shadow-lg border border-gray-200 p-4 overflow-auto">
            <div ref={pdfRef} className="w-[210mm]">
                <TemplateComponent 
                    data={data} 
                    interactive={true} 
                    selectedField={selectedField}
                    onFieldSelect={handleFieldSelect}
                />
            </div>
        </div>
    </div>
  );
};