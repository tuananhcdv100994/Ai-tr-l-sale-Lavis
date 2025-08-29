
import React from 'react';
import { DocumentData } from '../../types';

interface TemplateProps {
    data: DocumentData;
    interactive: boolean;
    selectedField?: string | null;
    onFieldSelect?: (fieldPath: string) => void;
}

const Field: React.FC<{path: string, children: React.ReactNode, interactive: boolean, selectedField?: string | null, onFieldSelect?: (fieldPath: string) => void, className?: string}> = ({path, children, interactive, selectedField, onFieldSelect, className}) => {
    const getFieldClass = () => {
        if (!interactive) return className || '';
        let baseClass = 'cursor-pointer hover:bg-indigo-100 transition-colors rounded px-1 -mx-1 whitespace-pre-wrap';
        if (selectedField === path) {
            baseClass += ' bg-indigo-200 ring-2 ring-indigo-500';
        }
        return `${baseClass} ${className || ''}`;
    }
    return (
        <div onClick={() => interactive && onFieldSelect?.(path)} className={getFieldClass()}>
            {children}
        </div>
    )
}

export const KHomeLabelTemplate: React.FC<TemplateProps> = ({ data, interactive, selectedField, onFieldSelect }) => {
    
    const renderField = (path: string, children: React.ReactNode, className?: string) => (
        <Field path={path} interactive={interactive} selectedField={selectedField} onFieldSelect={onFieldSelect} className={className}>
            {children}
        </Field>
    );

    return (
        <div className="bg-white p-4" style={{ fontFamily: "'Inter', sans-serif", color: '#000', width: '210mm' }}>
            <div className="border-2 border-black">
                <div className="text-center p-4 border-b-2 border-black">
                     <h1 className="text-4xl font-bold">{renderField("projectName", data.projectName)}</h1>
                </div>
                <div className="flex">
                    <div className="w-1/3 border-r-2 border-black p-4 flex items-center justify-center">
                        <h2 className="text-2xl font-bold">TÊN SẢN PHẨM</h2>
                    </div>
                    <div className="w-2/3 p-4 text-xl font-semibold space-y-4">
                        {renderField("productInfo.0", data.productInfo[0] || '')}
                        <hr/>
                        {renderField("productInfo.1", data.productInfo[1] || '')}
                        <hr/>
                        {renderField("productInfo.2", data.productInfo[2] || '')}
                    </div>
                </div>
                 <div className="flex border-t-2 border-black">
                    <div className="w-1/3 border-r-2 border-black p-4 flex items-center justify-center">
                        <h2 className="text-2xl font-bold">MÃ MÀU</h2>
                    </div>
                    <div className="w-2/3 p-4 text-3xl font-bold flex items-center justify-center">
                        {renderField("colorCode", data.colorCode)}
                    </div>
                </div>
            </div>
        </div>
    );
};