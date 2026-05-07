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
  try {
    const corpo = req.body;

    if (corpo.fromMe === true || corpo.isStatusReply === true) {
      return res.sendStatus(200);
    }

    console.log("WEBHOOK RECEBIDO:", JSON.stringify(corpo, null, 2));

    const mensagemRecebida =
      corpo.texto?.mensagem ||
      corpo.text?.message ||
      corpo.message ||
      corpo.body ||
      "";

    const telefone =
      corpo.phone ||
      corpo.chatId?.split("@")[0] ||
      "";

    const texto = mensagemRecebida.toLowerCase().trim();

    await supabase.from("mensagens").insert([{
      paciente_nome: corpo.nome || "Não informado",
      telefone: telefone || "Não informado",
      mensagem: mensagemRecebida || ""
    }]);

    const { data: atendimento } = await supabase
      .from("atendimentos")
      .select("*")
      .eq("telefone", telefone)
      .eq("status", "em_andamento")
      .maybeSingle();

    let atendimentoAtual = atendimento;

    if (!atendimentoAtual) {
      const { data: novo } = await supabase
        .from("atendimentos")
        .insert([{
          telefone,
          etapa: "inicio",
          status: "em_andamento"
        }])
        .select()
        .single();

      atendimentoAtual = novo;
    }

    const { data: config } = await supabase
      .from("configuracoes")
      .select("*")
      .eq("ativo", true)
      .limit(1)
      .single();

    const { data: opcoes } = await supabase
      .from("menu_opcoes")
      .select("*")
      .eq("ativo", true)
      .order("numero", { ascending: true });

    const nomeEmpresa = config?.nome_empresa || "nossa clínica";
    const saudacao = config?.saudacao || "Olá! Seja bem-vindo(a) à";

    const menuTexto = (opcoes || [])
      .map((opcao) => `${opcao.numero}️⃣ ${opcao.titulo}`)
      .join("\n");

    let resposta = "";

    if (atendimentoAtual.etapa === "aguardando_nome") {
      await supabase
        .from("atendimentos")
        .update({
          nome: mensagemRecebida,
          etapa: "aguardando_plano"
        })
        .eq("id", atendimentoAtual.id);

      resposta = "Perfeito 😊\n\nAgora me informe seu plano de saúde:";

    } else if (texto === "1") {
      await supabase
        .from("atendimentos")
        .update({
          etapa: "aguardando_nome",
          tipo: "exame"
        })
        .eq("id", atendimentoAtual.id);

      resposta = "Perfeito! Vamos iniciar seu agendamento 😊\n\nMe informe seu nome completo:";

    } else if (
      texto.includes("oi") ||
      texto.includes("olá") ||
      texto.includes("ola") ||
      texto.includes("bom dia") ||
      texto.includes("boa tarde") ||
      texto.includes("boa noite") ||
      texto === ""
    ) {
      resposta =
        `${saudacao} ${nomeEmpresa} 😊\n\n` +
        `Como posso te ajudar hoje?\n\n` +
        `${menuTexto}`;

    } else {
      const numero = parseInt(texto);
      const opcao = (opcoes || []).find(
        (item) => Number(item.numero) === numero
      );

      resposta = opcao
        ? opcao.resposta
        : "Não entendi sua mensagem.\n\nEscolha uma opção:\n\n" + menuTexto;
    }

    console.log("RESPOSTA GERADA:", resposta);
    console.log("TELEFONE:", telefone);

    const envio = await fetch(
  `${process.env.EVOLUTION_URL}/message/sendText/${process.env.EVOLUTION_INSTANCE}`,
  {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "apikey": process.env.EVOLUTION_API_KEY
    },
    body: JSON.stringify({
      number: telefone,
      text: resposta
    })
  }
);

const resultadoEnvio = await envio.text();
console.log("STATUS ENVIO Z-API:", envio.status);
console.log("RESPOSTA Z-API:", resultadoEnvio);

res.sendStatus(200);
   
} catch (error) {
  console.error("ERRO:", error);
  res.sendStatus(500);
}
});
const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
  console.log("Servidor rodando na porta " + PORT);
});
