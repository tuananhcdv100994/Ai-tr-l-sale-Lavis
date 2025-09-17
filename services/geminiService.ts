
import { GoogleGenAI, Type } from "@google/genai";

let ai: GoogleGenAI | null = null;

const getAiClient = (): GoogleGenAI => {
  if (!ai) {
    // FIX: Per coding guidelines, the API key must be obtained from process.env.API_KEY.
    // This also resolves the TypeScript error "Property 'env' does not exist on type 'ImportMeta'".
    const apiKey = process.env.API_KEY;
    if (!apiKey) {
      throw new Error("API_KEY environment variable not set.");
    }
    ai = new GoogleGenAI({ apiKey: apiKey });
  }
  return ai;
};


// A helper to build a JSON schema dynamically based on the fields the user has edited before.
const buildDynamicSchema = (fields: string[]) => {
    const schema = {
        type: Type.OBJECT,
        properties: {} as any,
    };
    fields.forEach(field => {
        // This is a simplified version. A real implementation would handle nested fields.
        // For now, we handle top-level fields by taking the first part of the path.
        const topLevelField = field.split('.')[0];
        if (!schema.properties[topLevelField]) {
             schema.properties[topLevelField] = { type: Type.STRING };
        }
    });
    return schema;
}

export async function generateDocumentData(userInput: string, fieldsToExtract: string[]): Promise<any> {
  if (fieldsToExtract.length === 0) {
    return { error: "Chưa có trường thông tin nào được 'học' cho mẫu này. Vui lòng hoàn tất lần chỉnh sửa đầu tiên." };
  }
  
  const dynamicSchema = buildDynamicSchema(fieldsToExtract);

  const systemInstruction = `Bạn là một trợ lý điền biểu mẫu thông minh. Nhiệm vụ của bạn là phân tích văn bản của người dùng để tìm thông tin cập nhật cho các trường đã biết và trả về dưới dạng JSON.

**HƯỚNG DẪN CỰC KỲ QUAN TRỌNG:**
1.  Người dùng sẽ cung cấp một đoạn văn bản chứa thông tin mới, có thể ở dạng tự nhiên (ví dụ: "cập nhật tên khách hàng thành...") hoặc chỉ là dữ liệu thô.
2.  Bạn sẽ được cung cấp một JSON schema với các trường cần điền.
3.  Hãy phân tích văn bản của người dùng và trích xuất các giá trị tương ứng với các trường trong schema.
4.  Câu trả lời của bạn PHẢI CHỈ LÀ một đối tượng JSON hợp lệ chứa dữ liệu đã trích xuất. Không thêm bất kỳ văn bản, giải thích, hay markdown nào khác.
5.  Nếu không tìm thấy thông tin cho một trường nào đó trong văn bản của người dùng, hãy bỏ qua trường đó trong JSON trả về.
`;

  try {
    const client = getAiClient();
    const response = await client.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: { parts: [{ text: `Dựa vào văn bản sau: "${userInput}", hãy trích xuất thông tin để điền vào các trường đã biết.` }] },
      config: {
        systemInstruction,
        responseMimeType: "application/json",
        responseSchema: dynamicSchema,
      }
    });

    const jsonText = response.text.trim();
    return JSON.parse(jsonText);
  } catch (err)
 {
    console.error("Lỗi khi gọi Gemini API:", err);
    const errorMessage = err instanceof Error ? err.message : String(err);
    if (errorMessage.includes("API_KEY")) {
        return { error: "Lỗi cấu hình: API Key cho dịch vụ AI chưa được thiết lập. Vui lòng liên hệ quản trị viên." };
    }
    return { error: "Xin lỗi, tôi đã gặp sự cố kỹ thuật khi trích xuất dữ liệu. Phản hồi của AI có thể không hợp lệ. Vui lòng thử diễn đạt lại yêu cầu của bạn." };
  }
}


export async function getGeneralResponse(userInput: string): Promise<{ text: string, sources: any[] }> {
    const systemInstruction = `Bạn là một trợ lý AI chuyên nghiệp, hữu ích và tận tình. Bạn có thể trò chuyện với người dùng về nhiều chủ đề, trả lời các câu hỏi và hỗ trợ các công việc của họ. Khi câu hỏi của người dùng liên quan đến sự kiện gần đây hoặc cần thông tin cập nhật, hãy sử dụng công cụ tìm kiếm. Khi cung cấp thông tin từ tìm kiếm, hãy trả lời một cách tự tin và trích dẫn các nguồn của bạn.`;

    try {
        const client = getAiClient();
        const response = await client.models.generateContent({
            model: "gemini-2.5-flash",
            contents: { parts: [{ text: userInput }] },
            config: {
                systemInstruction,
                tools: [{ googleSearch: {} }],
            },
        });

        const text = response.text;
        const rawChunks = response.candidates?.[0]?.groundingMetadata?.groundingChunks || [];
        const sources = rawChunks
            .map((chunk: any) => chunk.web)
            .filter((web: any) => web && web.uri && web.title);

        return { text, sources };
    } catch (err) {
        console.error("Lỗi khi gọi Gemini API cho phản hồi chung:", err);
        const errorMessage = err instanceof Error ? err.message : String(err);
        if (errorMessage.includes("API_KEY")) {
            return { text: "Lỗi cấu hình: API Key cho dịch vụ AI chưa được thiết lập. Vui lòng liên hệ quản trị viên để khắc phục sự cố này.", sources: [] };
        }
        return { text: "Xin lỗi, tôi không thể xử lý yêu cầu của bạn lúc này. Vui lòng thử lại sau.", sources: [] };
    }
}