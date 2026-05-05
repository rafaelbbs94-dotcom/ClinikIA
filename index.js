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
    const body = req.body;

    const mensagemRecebida = body.text?.message || "";
    const telefone = body.phone || "";

    const texto = mensagemRecebida.toLowerCase().trim();

    // BUSCA CONFIGURAÇÃO
    const { data: config } = await supabase
      .from("configuracoes")
      .select("*")
      .eq("ativo", true)
      .single();

    // BUSCA MENU
    const { data: opcoes } = await supabase
      .from("menu_opcoes")
      .select("*")
      .eq("ativo", true)
      .order("numero", { ascending: true });

    const nomeEmpresa = config?.nome_empresa || "nossa clínica";
    const saudacao = config?.saudacao || "Olá! Seja bem-vindo(a) à";

    const menuTexto = opcoes
      .map((opcao) => `${opcao.numero}️⃣ ${opcao.titulo}`)
      .join("\n");

    let resposta = "";

    if (
      texto.includes("oi") ||
      texto.includes("olá") ||
      texto.includes("ola") ||
      texto === ""
    ) {
      resposta =
        `${saudacao} ${nomeEmpresa} 😊\n\n` +
        `Como posso te ajudar hoje?\n\n` +
        `${menuTexto}`;
    } else {
      const numero = parseInt(texto);

      const opcao = opcoes.find(o => o.numero === numero);

      if (opcao) {
        resposta = opcao.resposta;
      } else {
        resposta =
          "Não entendi sua mensagem.\n\nEscolha uma opção:\n\n" +
          menuTexto;
      }
    }

    // ENVIA RESPOSTA PARA WHATSAPP
    await fetch(`https://api.z-api.io/instances/SEU_INSTANCE_ID/token/SEU_TOKEN/send-text`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        phone: telefone,
        message: resposta
      })
    });

    res.sendStatus(200);

  } catch (error) {
    console.error(error);
    res.sendStatus(500);
  }
});
