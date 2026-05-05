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

  const texto = (mensagem || "").trim().toLowerCase();

  await supabase
    .from("mensagens")
    .insert([{
      paciente_nome: nome || "Não informado",
      telefone: telefone || "Não informado",
      mensagem: mensagem || ""
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

  const menuTexto = opcoes
    .map((opcao) => `${opcao.numero}️⃣ ${opcao.titulo}`)
    .join("\n");

  if (
    texto.includes("oi") ||
    texto.includes("olá") ||
    texto.includes("ola") ||
    texto.includes("bom dia") ||
    texto.includes("boa tarde") ||
    texto.includes("boa noite") ||
    texto === ""
  ) {
    return res.json({
      resposta:
        `${saudacao} ${nomeEmpresa} 😊\n\n` +
        `Como posso te ajudar hoje?\n\n` +
        `${menuTexto}`
    });
  }

  const numeroEscolhido = parseInt(texto);

  if (!isNaN(numeroEscolhido)) {
    const opcaoSelecionada = opcoes.find(
      (opcao) => Number(opcao.numero) === numeroEscolhido
    );

    if (opcaoSelecionada) {
      return res.json({
        resposta: opcaoSelecionada.resposta
      });
    }
  }

  return res.json({
    resposta:
      "Não entendi completamente sua mensagem.\n\n" +
      "Escolha uma das opções abaixo:\n\n" +
      menuTexto
  });
});

const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
  console.log("Servidor rodando na porta " + PORT);
});
