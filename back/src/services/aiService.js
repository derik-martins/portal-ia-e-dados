const OpenAI = require('openai');

class AIService {
  constructor() {
    this.client = new OpenAI({
      apiKey: process.env.OPENROUTER_API_KEY,
      baseURL: 'https://openrouter.ai/api/v1',
    });
  }

  async gerarResposta(mensagens) {
    try {
      const systemMessage = {
        role: 'system',
        content: `Você é um assistente especializado em Inteligência Artificial e Ciência de Dados. Suas responsabilidades:

RESPONDER APENAS sobre:
- Inteligência Artificial (Machine Learning, Deep Learning, NLP, Computer Vision)
- Ciência de Dados (análise de dados, estatística, visualização)
- Tecnologias relacionadas (Python, R, TensorFlow, PyTorch, scikit-learn, pandas, etc.)
- Conceitos matemáticos relevantes (álgebra linear, cálculo, probabilidade)
- Carreiras em IA e Dados
- Estudos e certificações na área

REGRAS IMPORTANTES:
1. Se a pergunta NÃO for sobre IA ou Dados, responda: "Desculpe, sou especializado apenas em Inteligência Artificial e Ciência de Dados. Por favor, faça uma pergunta relacionada a essas áreas."
2. Seja direto, didático e objetivo
3. Use exemplos práticos quando possível
4. Mantenha um tom profissional e educativo
5. Se não souber algo específico, seja honesto sobre suas limitações

Responda sempre em português brasileiro.`
      };

      const completion = await this.client.chat.completions.create({
        // MODELOS GRATUITOS DISPONÍVEIS:
        // 'deepseek/deepseek-chat' - Modelo atual (recomendado)
        // 'google/gemma-2-9b-it:free' - Google Gemma 2 
        // 'meta-llama/llama-3.1-8b-instruct:free' - Meta Llama 3.1
        // 'microsoft/phi-3-mini-128k-instruct:free' - Microsoft Phi-3
        // 'qwen/qwen-2-7b-instruct:free' - Qwen 2
        model: 'openai/gpt-oss-20b:free',
        messages: [systemMessage, ...mensagens],
        temperature: 0.7,
        max_tokens: 1000,
      });

      return completion.choices[0].message.content;
    } catch (error) {
      console.error('Erro ao gerar resposta da IA:', error);
      throw new Error('Erro ao processar sua mensagem. Tente novamente.');
    }
  }

  gerarTituloConversa(primeiraMensagem) {
    // Gerar um título simples baseado na primeira mensagem
    let titulo = primeiraMensagem.substring(0, 50);
    if (primeiraMensagem.length > 50) {
      titulo += '...';
    }
    return titulo || 'Nova Conversa';
  }
}

module.exports = new AIService();
