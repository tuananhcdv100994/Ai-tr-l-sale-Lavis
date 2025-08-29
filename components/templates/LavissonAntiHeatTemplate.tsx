
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
        let baseClass = 'cursor-pointer hover:bg-indigo-100 transition-colors rounded px-1 -mx-1';
        if (selectedField === path) {
            baseClass += ' bg-indigo-200 ring-2 ring-indigo-500';
        }
        return `${baseClass} ${className || ''}`;
    }
    return (
        <span onClick={() => interactive && onFieldSelect?.(path)} className={getFieldClass()}>
            {children}
        </span>
    )
}

export const LavissonAntiHeatTemplate: React.FC<TemplateProps> = ({ data, interactive, selectedField, onFieldSelect }) => {
    const formatCurrency = (num: number | string) => {
        const parsedNum = typeof num === 'string' ? parseFloat(num.replace(/,/g, '')) : num;
        if(isNaN(parsedNum)) return '0';
        return new Intl.NumberFormat('vi-VN').format(parsedNum);
    }
    
    const renderField = (path: string, children: React.ReactNode, className?: string) => (
        <Field path={path} interactive={interactive} selectedField={selectedField} onFieldSelect={onFieldSelect} className={className}>
            {children}
        </Field>
    );
    
    const grandTotal = (data.total || 0) + (data.laborCost || 0);

    return (
        <div className="bg-white p-10 text-sm" style={{ fontFamily: "'Inter', sans-serif", color: '#000', width: '210mm', minHeight: '297mm' }}>
            <h1 className="text-2xl font-bold text-center text-blue-800 mb-2">BÁO GIÁ SƠN LAVISSON CHỐNG NÓNG</h1>
            <div className="flex justify-end text-xs mb-4">
                <div className="text-right">
                    <p>Ngày: {renderField("documentDate", data.documentDate)}</p>
                    <p>Thời gian hiệu lực: {renderField("validity", data.validity || 'Đến khi có báo giá mới')}</p>
                    <p>Mã Khách Hàng: {renderField("customerCode", data.customerCode)}</p>
                </div>
            </div>

            <div className="mb-4 text-sm">
                <p><span className="font-bold">Kính gửi:</span> {renderField("clientName", data.clientName)}</p>
                <p className="text-xs">- Lời đầu tiên Công ty chúng tôi xin chân thành cảm ơn Quý khách hàng đã quan tâm, tin tưởng sử dụng các sản phẩm của chúng tôi. Chúng tôi trân trọng gửi tới Quý khách hàng bảng báo giá sơn như sau:</p>
            </div>
            
            <p className="text-center font-bold text-white bg-blue-800 py-1 my-2">GIẢI PHÁP CẢI TẠO CHỐNG NÓNG MÁI TÔN,... GIẢM NHIỆT ĐỘ BỀ MẶT TỪ 20°C – 30°C</p>

            <table className="w-full border-collapse border border-black text-xs text-center">
                <thead>
                    <tr className="bg-gray-200 font-bold">
                        <td className="border border-black p-1">CHỦNG LOẠI</td>
                        <td className="border border-black p-1">MÃ SẢN PHẨM</td>
                        <td className="border border-black p-1 w-1/3">TÊN SẢN PHẨM</td>
                        <td className="border border-black p-1">ĐÓNG GÓI</td>
                        <td className="border border-black p-1">ĐỘ PHỦ HOÀN THIỆN (M2/2 Lớp)</td>
                        <td className="border border-black p-1">GIÁ SẢN PHẨM (VNĐ)</td>
                        <td className="border border-black p-1">GIÁ HOÀN THIỆN VẬT TƯ (M2)</td>
                    </tr>
                </thead>
                <tbody>
                     {data.lineItems.map((item, index) => (
                         <tr key={index}>
                            <td className="border border-black p-1">{renderField(`lineItems.${index}.category`, item.category)}</td>
                            <td className="border border-black p-1">{renderField(`lineItems.${index}.sku`, item.sku)}</td>
                            <td className="border border-black p-1 text-left">{renderField(`lineItems.${index}.name`, item.name)}</td>
                            <td className="border border-black p-1">{renderField(`lineItems.${index}.packSize`, item.packSize)}</td>
                            <td className="border border-black p-1">{renderField(`lineItems.${index}.coverage`, item.coverage)}</td>
                            <td className="border border-black p-1 text-right">{renderField(`lineItems.${index}.price`, formatCurrency(item.price))}</td>
                            <td className="border border-black p-1 text-right">{renderField(`lineItems.${index}.pricePerSqM`, formatCurrency(item.pricePerSqM))}</td>
                        </tr>
                    ))}
                </tbody>
            </table>
            
             <table className="w-full border-collapse border border-black text-xs text-center mt-[-1px]">
                <tbody>
                    <tr>
                        <td className="border border-black p-1 w-[81.7%] text-right font-bold">TỔNG GIÁ VẬT TƯ</td>
                        <td className="border border-black p-1 text-right font-bold">{renderField("total", formatCurrency(data.total))}</td>
                    </tr>
                    <tr>
                        <td className="border border-black p-1 text-right font-bold">GIÁ NHÂN CÔNG THI CÔNG (M2)</td>
                        <td className="border border-black p-1 text-right font-bold">{renderField("laborCost", formatCurrency(data.laborCost))}</td>
                    </tr>
                     <tr>
                        <td className="border border-black p-1 text-right font-bold bg-gray-200">GIÁ HOÀN THIỆN (M2)</td>
                        <td className="border border-black p-1 text-right font-bold bg-gray-200">{renderField("grandTotal", formatCurrency(grandTotal))}</td>
                    </tr>
                </tbody>
            </table>

        </div>
    );
};