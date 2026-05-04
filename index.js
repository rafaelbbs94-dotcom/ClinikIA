const express = require("express");

const app = express();
app.use(express.json());

app.get("/", (req, res) => {
  res.send("API da Clínica rodando 🚀");
});

app.post("/mensagem", (req, res) => {
  const { texto } = req.body;

  console.log("Mensagem recebida:", texto);

  res.json({
    resposta: "Recebemos sua mensagem! Em breve entraremos em contato."
  });
});

const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
  console.log("Servidor rodando na porta " + PORT);
});
