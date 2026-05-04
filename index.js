const express = require("express");
const { createClient } = require("@supabase/supabase-js");

const app = express();
app.use(express.json());

const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_KEY
);

app.get("/", (req, res) => {
  res.send("API da Clínica rodando 🚀");
});

app.post("/mensagem", async (req, res) => {
  const { nome, telefone, mensagem } = req.body;

  const texto = (mensagem || "").toLowerCase();

  let resposta = "";

  if (texto.includes("oi") || texto.includes("olá") || texto.includes("bom dia") || texto.includes("boa tarde") || texto.includes("boa noite")) {
    resposta =
      "Olá! Seja bem-vindo(a) à nossa clínica 😊\n\n" +
      "Como posso te ajudar hoje?\n\n" +
      "1️⃣ Agendar exame\n" +
      "2️⃣ Agendar consulta\n" +
      "3️⃣ Tirar dúvidas sobre preparo\n" +
      "4️⃣ Falar com atendente";
  } else if (texto === "1" || texto.includes("agendar exame")) {
    resposta =
      "Perfeito. Para iniciar o agendamento do exame, me informe por favor:\n\n" +
      "1. Nome completo\n" +
      "2. Telefone para contato\n" +
      "3. Qual exame deseja realizar\n" +
      "4. Você possui pedido médico/guia?\n" +
      "5. Qual é o seu plano de saúde?";
  } else if (texto === "2" || texto.includes("agendar consulta")) {
    resposta =
      "Certo. Para consulta, me informe por favor:\n\n" +
      "1. Nome completo\n" +
      "2. Telefone para contato\n" +
      "3. Especialidade ou médico desejado\n" +
      "4. Melhor período para atendimento\n" +
      "5. Qual é o seu plano de saúde?";
  } else if (texto === "3" || texto.includes("preparo") || texto.includes("endoscopia") || texto.includes("colonoscopia")) {
    resposta =
      "Claro. Sobre qual preparo você deseja informação?\n\n" +
      "1️⃣ Endoscopia\n" +
      "2️⃣ Colonoscopia\n" +
      "3️⃣ Outro exame\n\n" +
      "Se for endoscopia, normalmente é necessário jejum antes do exame e seguir as orientações específicas da clínica.";
  } else if (texto === "4" || texto.includes("atendente") || texto.includes("humano")) {
    resposta =
      "Certo. Vou direcionar seu atendimento para uma pessoa da equipe.\n" +
      "Aguarde um momento, por favor.";
  } else {
    resposta =
      "Não entendi completamente sua mensagem.\n\n" +
      "Escolha uma opção:\n\n" +
      "1️⃣ Agendar exame\n" +
      "2️⃣ Agendar consulta\n" +
      "3️⃣ Tirar dúvidas sobre preparo\n" +
      "4️⃣ Falar com atendente";
  }

  await supabase
    .from("mensagens")
    .insert([{
      paciente_nome: nome || "Não informado",
      telefone: telefone || "Não informado",
      mensagem: mensagem || ""
    }]);

  res.json({ resposta });
});
}

  res.json({ mensagem: "Paciente salvo com sucesso!" });
});

const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
  console.log("Servidor rodando na porta " + PORT);
});
