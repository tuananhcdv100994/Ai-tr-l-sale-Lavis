
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

export const LevisMasterpieceTemplate: React.FC<TemplateProps> = ({ data, interactive, selectedField, onFieldSelect }) => {
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

    return (
        <div className="bg-white p-8 text-sm" style={{ fontFamily: "'Inter', sans-serif", color: '#000', width: '210mm', minHeight: '297mm' }}>
             <div className="text-center mb-4">
                {/* Placeholder for logo image */}
            </div>
            <div className="text-center mb-4">
                <h1 className="text-xl font-bold uppercase">Báo Giá Dự Án Sơn Levis Masterpiece</h1>
            </div>
            <div className="flex justify-between text-xs mb-4">
                <div></div>
                <div className="text-right">
                    <p>Ngày: {renderField("documentDate", data.documentDate)}</p>
                    <p>Thời gian hiệu lực: {renderField("validity", data.validity || 'Đến khi có báo giá mới')}</p>
                    <p>Mã khách hàng: {renderField("customerCode", data.customerCode)}</p>
                </div>
            </div>
            <div className="mb-4">
                <p className="font-bold">KÍNH GỬI: {renderField("clientName", data.clientName)}</p>
                <p className="text-xs">- Lời đầu tiên Công ty chúng tôi xin chân thành cảm ơn Quý khách hàng đã quan tâm, tin tưởng sử dụng các sản phẩm của chúng tôi. Chúng tôi trân trọng gửi tới Quý khách hàng bảng báo giá sơn như sau:</p>
            </div>
            <table className="w-full border-collapse border border-black text-xs text-center">
                <thead>
                    <tr className="bg-[#E7E6E6] font-bold">
                        <td className="border border-black p-1 w-[10%]">CHỦNG LOẠI</td>
                        <td className="border border-black p-1 w-[10%]">MÃ SẢN PHẨM</td>
                        <td className="border border-black p-1 w-[25%]">TÊN SẢN PHẨM</td>
                        <td className="border border-black p-1 w-[8%]">ĐÓNG GÓI</td>
                        <td className="border border-black p-1">ĐỘ PHỦ LÝ THUYẾT (M2/1lớp)</td>
                        <td className="border border-black p-1">GIÁ SẢN PHẨM (VNĐ)</td>
                        <td className="border border-black p-1">GIÁ THÀNH THEO M2</td>
                        <td className="border border-black p-1">GIÁ THÀNH HOÀN THIỆN THEO M2</td>
                        <td className="border border-black p-1 w-[10%]">THỜI GIAN BẢO HÀNH</td>
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
                            <td className="border border-black p-1 text-right">{renderField(`lineItems.${index}.totalPrice`, formatCurrency(item.totalPrice))}</td>
                            <td className="border border-black p-1">{renderField(`lineItems.${index}.warranty`, item.warranty)}</td>
                        </tr>
                    ))}
                    <tr>
                        <td colSpan={7} className="border border-black p-1 font-bold text-right">TỔNG</td>
                        <td colSpan={2} className="border border-black p-1 font-bold text-right">{renderField("total", formatCurrency(data.total))}</td>
                    </tr>
                </tbody>
            </table>
        </div>
    );
};