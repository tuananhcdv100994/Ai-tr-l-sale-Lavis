
import { GoogleGenAI, Type } from "@google/genai";

if (!process.env.API_KEY) {
  throw new Error("API_KEY environment variable not set");
}

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

// A helper to build a JSON schema dynamically based on the fields the user has edited before.
const buildDynamicSchema = (fields: string[]) => {
    const schema = {
        type: Type.OBJECT,
        properties: {} as any,
        required: [] as string[]
    };
    fields.forEach(field => {
        // This is a simplified version. A real implementation would handle nested fields like 'lineItems.0.sku'
        // For now, we handle top-level fields.
        if (!field.includes('.')) {
            schema.properties[field] = { type: Type.STRING };
            schema.required.push(field);
        }
    });
    return schema;
}

export async function generateDocumentData(userInput: string, fieldsToExtract: string[]): Promise<any> {
  if (fieldsToExtract.length === 0) {
    return { error: "Chưa có trường thông tin nào được 'học' cho mẫu này. Vui lòng hoàn tất lần chỉnh sửa đầu tiên." };
  }
  
  const dynamicSchema = buildDynamicSchema(fieldsToExtract);

  const systemInstruction = `Bạn là một trợ lý trích xuất dữ liệu chuyên nghiệp. Nhiệm vụ DUY NHẤT của bạn là trích xuất những thông tin cụ thể từ văn bản của người dùng và trả về dưới dạng JSON.

**HƯỚNG DẪN CỰC KỲ QUAN TRỌNG:**
1.  Người dùng sẽ cung cấp một đoạn văn bản.
2.  Bạn sẽ được cung cấp một danh sách các trường (fields) cần trích xuất.
3.  Bạn PHẢI trích xuất thông tin tương ứng với các trường này từ văn bản của người dùng.
4.  Câu trả lời của bạn PHẢI CHỈ LÀ một đối tượng JSON chứa dữ liệu đã trích xuất. Không bao gồm bất kỳ văn bản, giải thích hay định dạng markdown nào khác.
5.  Nếu bạn không thể tìm thấy giá trị cho một trường nào đó, hãy sử dụng giá trị gốc được cung cấp hoặc một giá trị mặc định hợp lý. Đừng để trống.
`;

  try {
    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: { parts: [{ text: `Trích xuất các trường sau từ văn bản này: "${userInput}"` }] },
      config: {
        systemInstruction,
        responseMimeType: "application/json",
        responseSchema: dynamicSchema,
      }
    });

    const jsonText = response.text.trim();
    return JSON.parse(jsonText);
  } catch (err) {
    console.error("Lỗi khi gọi Gemini API:", err);
    return { error: "Xin lỗi, tôi đã gặp sự cố kỹ thuật khi trích xuất dữ liệu. Phản hồi của AI có thể không hợp lệ. Vui lòng thử diễn đạt lại yêu cầu của bạn." };
  }
}