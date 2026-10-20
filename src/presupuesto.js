const TARIFAS = require('./tarifas')

function calcularPresupuesto({ tipo, paginas, formulario, segundoIdioma }) {
const base = TARIFAS [tipo]
const paginasAdicionales = (paginas - 1) * TARIFAS.paginaAdicional
const costeFormulario = formulario ? TARIFAS.formulario : 0
const costeIdioma = segundoIdioma ? TARIFAS.segundoIdioma : 0

return {
    base,
    paginasAdicionales,
    formulario: costeFormulario,
    segundoIdioma: costeIdioma,
    total: base + paginasAdicionales + costeFormulario + costeIdioma, 
    moneda: 'EUR'
    }
} 

module.exports =  {calcularPresupuesto}