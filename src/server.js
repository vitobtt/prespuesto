const express = require ('express')
const { calcularPresupuesto } = require('./presupuesto')
const app = express()
const PORT = 3000
const TARIFAS = require('./tarifas')

app.use(express.json())

function validar(body) {
      if (typeof body !== 'object' || body === null) {
    return 'el cuerpo debe ser un objeto json'
  }

  const tiposValidos = ['landing', 'corporativa']
  if (!tiposValidos.includes(body.tipo)) {
    return 'tipo debe ser "landing" o "corporativa"'
  }

  const paginasOk = Number.isInteger(body.paginas) && body.paginas >= 1 && body.paginas <= 20
  if (!paginasOk) {
    return 'paginas debe ser un entero entre 1 y 20'
  }

  if (typeof body.formulario !== 'boolean') {
    return 'formulario debe ser true o false'
  }

  if (typeof body.segundoIdioma !== 'boolean') {
    return 'segundoIdioma debe ser true o false'
  }

  return null
}

app.get('/api/estado', (req, res) => {
    res.json({ status: 'ok'})
})

app.get('/api/tarifas', (req, res) => {
    res.json(TARIFAS)
})

app.post('/api/presupuesto', (req, res) => {
  const error = validar(req.body)
  if (error) {
    return res.status(400).json({ error })
  }
  const { tipo, paginas, formulario, segundoIdioma } = req.body
  res.json(calcularPresupuesto({ tipo, paginas, formulario, segundoIdioma }))
})

app.use((err, req, res, next) => {
  if (err.status === 400 || err.type === 'entity.parse.failed') {
    return res.status(400).json({ error: 'el cuerpo no es un json valido' })
  }
  next(err)
})

app.listen(PORT, () => console.log(`api en http://localhost:${PORT}`))