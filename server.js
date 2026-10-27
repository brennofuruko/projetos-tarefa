const express = require('express');
const cors = require('cors');
const db = require('./db');

const app = express();

app.use(express.json());
app.use(cors());

app.post('/tarefas', async (req, res) => {
  const { nome, descricao, responsavel, data_tarefa, concluido } = req.body;

  if (!nome || !responsavel || !data_tarefa) {
    return res.status(400).json({ 
      error: 'Os campos nome, responsavel e data_tarefa são obrigatórios.' 
    });
  }

  try {
    const query = `
      INSERT INTO tarefas (nome, descricao, responsavel, data_tarefa, concluido) 
      VALUES (?, ?, ?, ?, ?)
    `;
    const [result] = await db.execute(query, [
      nome, 
      descricao || null, 
      responsavel, 
      data_tarefa, 
      concluido || false
    ]);

    return res.status(201).json({
      id: result.insertId,
      nome,
      descricao,
      responsavel,
      data_tarefa,
      concluido: concluido || false
    });
  } catch (error) {
    return res.status(500).json({ error: error.message });
  }
});


app.get('/tarefas/:id', async (req, res) => {
  const { id } = req.params;

  try {
    const [rows] = await db.execute('SELECT * FROM tarefas WHERE id = ?', [id]);

    if (rows.length === 0) {
      return res.status(404).json({ message: 'Tarefa não encontrada.' });
    }

    return res.json(rows[0]);
  } catch (error) {
    return res.status(500).json({ error: error.message });
  }
});


app.get('/tarefas', async (req, res) => {
  const { inicio, fim } = req.query;

  try {
    let query = 'SELECT * FROM tarefas';
    const params = [];

    if (inicio && fim) {
      query += ' WHERE data_tarefa BETWEEN ? AND ?';
      params.push(inicio, fim);
    }

    query += ' ORDER BY data_tarefa ASC';

    const [rows] = await db.execute(query, params);
    return res.json(rows);
  } catch (error) {
    return res.status(500).json({ error: error.message });
  }
});


app.put('/tarefas/:id', async (req, res) => {
  const { id } = req.params;
  const { nome, descricao, responsavel, data_tarefa, concluido } = req.body;

  try {
    const [check] = await db.execute('SELECT * FROM tarefas WHERE id = ?', [id]);

    if (check.length === 0) {
      return res.status(404).json({ message: 'Tarefa não encontrada.' });
    }

    const query = `
      UPDATE tarefas 
      SET nome = ?, descricao = ?, responsavel = ?, data_tarefa = ?, concluido = ? 
      WHERE id = ?
    `;

    await db.execute(query, [
      nome ?? check[0].nome,
      descricao ?? check[0].descricao,
      responsavel ?? check[0].responsavel,
      data_tarefa ?? check[0].data_tarefa,
      concluido ?? check[0].concluido,
      id
    ]);

    return res.json({ message: 'Tarefa atualizada com sucesso.' });
  } catch (error) {
    return res.status(500).json({ error: error.message });
  }
});


app.delete('/tarefas/:id', async (req, res) => {
  const { id } = req.params;

  try {
    const [result] = await db.execute('DELETE FROM tarefas WHERE id = ?', [id]);

    if (result.affectedRows === 0) {
      return res.status(404).json({ message: 'Tarefa não encontrada.' });
    }

    return res.json({ message: 'Tarefa excluída com sucesso.' });
  } catch (error) {
    return res.status(500).json({ error: error.message });
  }
});


const PORT = 3000;
app.listen(PORT, () => {
  console.log(`Servidor rodando em http://localhost:${PORT}`);
});