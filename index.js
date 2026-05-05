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

    const mensagemRecebida = body.text?.message || body.mensagem || "";
    const telefone = body.phone || body.telefone || "";

    const texto = mensagemRecebida.toLowerCase().trim();

    await supabase.from("mensagens").insert([{
      paciente_nome: body.nome || "Não informado",
      telefone: telefone || "Não informado",
      mensagem: mensagemRecebida || ""
    }]);

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

    if (
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

    if (telefone) {
      await fetch(`https://api.z-api.io/instances/${process.env.ZAPI_INSTANCE_ID}/token/${process.env.ZAPI_TOKEN}/send-text`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          phone: telefone,
          message: resposta
        })
      });
    }

    res.status(200).json({ resposta });

  } catch (error) {
    console.error("ERRO:", error);
    res.status(500).json({
      erro: "Erro no bot",
      detalhe: error.message
    });
  }
});

const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
  console.log("Servidor rodando na porta " + PORT);
});
