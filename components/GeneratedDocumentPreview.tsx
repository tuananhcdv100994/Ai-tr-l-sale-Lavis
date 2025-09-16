
import React, { useRef } from 'react';
import { GeneratedDocument } from '../types';

declare const html2pdf: any;

export const GeneratedDocumentPreview: React.FC<{ document: GeneratedDocument }> = ({ document }) => {
  const { template, data } = document;
  const TemplateComponent = template.component;
  const pdfRef = useRef<HTMLDivElement>(null);

  const handleDownload = () => {
    if (!pdfRef.current) return;
    
    const opt = {
      margin: 0,
      filename: `${template.name}_${data.customerCode}_${new Date().toISOString().split('T')[0]}.pdf`,
      image: { type: 'jpeg', quality: 0.98 },
      html2canvas: { scale: 2, useCORS: true, letterRendering: true },
      jsPDF: { unit: 'in', format: 'a4', orientation: 'portrait' }
    };

    html2pdf().from(pdfRef.current).set(opt).save();
  };

  return (
    <div className="bg-gray-800 border border-gray-700 rounded-lg p-4 shadow-sm w-full max-w-2xl mt-2">
      <h3 className="text-lg font-bold text-gray-200 mb-2">Tài liệu đã sẵn sàng</h3>
      <p className="text-sm text-gray-400 mb-4">
        Một tài liệu dựa trên mẫu "{template.name}" đã được tạo.
      </p>
      
      {/* Scaled-down visible preview */}
      <div className="border rounded-md overflow-hidden bg-gray-600 p-2">
        <div className="transform scale-50 -translate-x-1/4 origin-top-left" style={{ width: '200%', height: '200%' }}>
            <div className="w-[210mm]">
                <TemplateComponent data={data} interactive={false} />
            </div>
        </div>
      </div>

      {/* Hidden full-scale element for high-quality PDF generation */}
      <div className="hidden">
        <div ref={pdfRef} className="w-[210mm]">
            <TemplateComponent data={data} interactive={false} />
        </div>
      </div>

      <button
        onClick={handleDownload}
        className="w-full mt-4 bg-indigo-600 text-white font-semibold py-2 px-4 rounded-lg hover:bg-indigo-700 transition-colors"
      >
        Tải xuống PDF
      </button>
    </div>
  );
};