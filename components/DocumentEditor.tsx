
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
    const originalPaths: string[] = [];

    const getPaths = (obj: object, prefix = ''): string[] => {
        return Object.keys(obj).reduce((res, el) => {
            if( el === 'component' ) return res;
            if( Array.isArray((obj as any)[el]) ) {
                return [...res, ...((obj as any)[el].flatMap((item: any, i: number) => getPaths(item, prefix + el + '.' + i + '.')))];
            } else if( typeof (obj as any)[el] === 'object' && (obj as any)[el] !== null ) {
                return [...res, ...getPaths((obj as any)[el], prefix + el + '.')];
            }
            return [...res, prefix + el];
        }, [] as string[]);
    }

    const allPaths = getPaths(data);
    
    allPaths.forEach(path => {
        const originalValue = get(initialData, path);
        const newValue = get(data, path);
        if(!isEqual(originalValue, newValue)) {
            editedFields.add(path);
        }
    });
    
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
        return <div className="text-gray-400">Nhấp vào một mục trong tài liệu để chỉnh sửa.</div>;
    }
    const isTextArea = (selectedValue as string)?.includes('\n');
    const InputElement = isTextArea ? 'textarea' : 'input';

    return (
        <div>
            <label className="block text-sm font-medium text-gray-300 capitalize mb-1">
                Đang sửa: <span className="font-mono bg-gray-700 text-indigo-300 px-1 rounded">{selectedField}</span>
            </label>
            <InputElement 
                value={selectedValue}
                onChange={handleValueChange}
                className="w-full p-2 border border-gray-600 bg-gray-800 text-white rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500"
                rows={isTextArea ? 5 : undefined}
            />
        </div>
    )
  }, [selectedField, selectedValue, handleValueChange]);

  return (
    <div className="flex flex-col md:flex-row h-full gap-6">
        {/* Left Side: Editor Panel */}
        <div className="w-full md:w-1/3 flex flex-col bg-gray-900 rounded-lg shadow-lg border border-gray-700 p-6">
            <h2 className="text-xl font-bold text-gray-200 border-b border-gray-700 pb-4 mb-4">Trình chỉnh sửa tài liệu</h2>
            <div className="flex-grow space-y-4">
                {InputComponent}
            </div>
             <div className="mt-6 pt-4 border-t border-gray-700 space-y-2">
                <button
                onClick={handleGeneratePdf}
                className="w-full bg-indigo-600 text-white font-semibold py-2 px-4 rounded-lg hover:bg-indigo-700 transition-colors"
                >
                Lưu & Xuất PDF
                </button>
                 <button
                onClick={onCancel}
                className="w-full bg-gray-700 text-gray-200 font-semibold py-2 px-4 rounded-lg hover:bg-gray-600 transition-colors"
                >
                Hủy
                </button>
            </div>
        </div>

        {/* Right Side: Document Preview */}
        <div className="w-full md:w-2/3 bg-gray-700 rounded-lg shadow-lg border border-gray-600 p-4 overflow-auto">
            <div ref={pdfRef} className="w-[210mm] mx-auto">
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