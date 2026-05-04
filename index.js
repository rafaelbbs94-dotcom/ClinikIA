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
  const { nome, telefone } = req.body;

  const { data, error } = await supabase
    .from("pacientes")
    .insert([{ nome, telefone }]);

  if (error) {
    console.error(error);
    return res.status(500).json({ erro: "Erro ao salvar" });
  }

  res.json({ mensagem: "Paciente salvo com sucesso!" });
});

const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
  console.log("Servidor rodando na porta " + PORT);
});
