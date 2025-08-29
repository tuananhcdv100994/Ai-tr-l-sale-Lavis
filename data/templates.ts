
import { Template } from '../types';
import { LevisMasterpieceTemplate } from '../components/templates/LevisMasterpieceTemplate';
import { LavissonAntiHeatTemplate } from '../components/templates/LavissonAntiHeatTemplate';
import { KHomeLabelTemplate } from '../components/templates/KHomeLabelTemplate';


export const TEMPLATES: Template[] = [
  {
    id: 'levis-masterpiece-sc5',
    name: 'Báo Giá Levis Masterpiece (Khách hàng SC5)',
    component: LevisMasterpieceTemplate,
    initialData: {
      clientName: 'CÔNG TY CỔ PHẦN XÂY DỰNG SỐ 5',
      customerCode: 'SC5',
      documentDate: '05/07/2025',
      total: 102734,
      lineItems: [
        {
          category: 'Sơn lót',
          sku: 'FE2WH - WHITE',
          name: 'Sơn lót Epoxy 2K hệ lăn – Gốc nước (màu trắng)',
          packSize: '20KG',
          coverage: 128,
          price: 4050000,
          pricePerSqM: 31641,
          totalPrice: 31641,
          warranty: '',
        },
        {
          category: 'Sơn phủ',
          sku: 'FE1WA - GREY',
          name: 'Sơn phủ Epoxy 2K hệ lăn - Gốc nước - Tiêu Chuẩn (màu xám)',
          packSize: '20KG',
          coverage: 128,
          price: 4550000,
          pricePerSqM: 35547,
          totalPrice: 71094,
          warranty: '18 Tháng',
        },
      ],
    },
  },
  {
    id: 'lavisson-anti-heat-sontien',
    name: 'Báo Giá Sơn Chống Nóng Lavisson (Sơn Tiên)',
    component: LavissonAntiHeatTemplate,
    initialData: {
        clientName: 'CÔNG TY CỔ PHẦN THÀNH PHỐ DU LỊCH SINH THÁI SƠN TIÊN',
        customerCode: 'SONTIEN',
        documentDate: '15.08.2025',
        total: 64136,
        lineItems: [
            {
                category: 'Sơn lót',
                sku: 'D803P. TRANG',
                name: 'Lavisson Metal Coat - Anticorrosive Primer',
                packSize: '16L',
                coverage: '220',
                price: 1790000,
                pricePerSqM: 8136,
                totalPrice: 8136, // This seems wrong in original, but keeping for consistency
                warranty: '',
            },
            {
                category: 'Sơn phủ',
                sku: 'D601',
                name: 'Lavisson Industrial Cooling Shield (Trắng)',
                packSize: '17L',
                coverage: '50',
                price: 2050000,
                pricePerSqM: 41000,
                totalPrice: 41000, // This seems wrong in original, but keeping for consistency
                warranty: '',
            }
        ],
        laborCost: 15000,
    }
  },
  {
      id: 'k-home-label',
      name: 'Nhãn sản phẩm K-HOME NEW CITY',
      component: KHomeLabelTemplate,
      initialData: {
          projectName: 'DỰ ÁN: K-HOME NEW CITY',
          productInfo: [
              'BỘT TRÉT NGOẠI THẤT:\nLEVIS MASTERPIECE PUTTY EXT - 2 LỚP',
              'SƠN LÓT NGOẠI THẤT:\nLEVIS MASTERPIECE P600 - 1 LỚP',
              'SƠN PHỦ NGOẠI THẤT:\nLEVIS MASTERPIECE E100 - 2 LỚP',
          ],
          colorCode: 'D30 - D',
          // Dummy data for other fields to fit the model
          clientName: 'K-HOME',
          customerCode: 'K-HOME',
          documentDate: '',
          total: 0,
          lineItems: []
      }
  }
];