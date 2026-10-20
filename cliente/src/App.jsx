import { useEffect, useMemo, useRef, useState } from 'react'

const eur = (n) =>
  new Intl.NumberFormat('es-ES', { style: 'currency', currency: 'EUR' }).format(n)

const INICIAL = { tipo: 'landing', paginas: 1, formulario: false, segundoIdioma: false }

const PRESETS = [
  { nombre: 'Web de un vistazo', datos: { tipo: 'landing', paginas: 1, formulario: false, segundoIdioma: false } },
  { nombre: 'Negocio local', datos: { tipo: 'corporativa', paginas: 4, formulario: true, segundoIdioma: false } },
  { nombre: 'Marca internacional', datos: { tipo: 'corporativa', paginas: 8, formulario: true, segundoIdioma: true } }
]

const TIPOS = [
  { id: 'landing', titulo: 'Landing', texto: 'Una página para captar clientes o presentar un producto.' },
  { id: 'corporativa', titulo: 'Corporativa', texto: 'Varias secciones para mostrar tu empresa y servicios.' }
]

// El servidor devuelve un único mensaje; se asocia al campo para mostrarlo junto a él.
function campoDelError(msg = '') {
  const m = msg.toLowerCase()
  if (m.startsWith('tipo')) return 'tipo'
  if (m.startsWith('paginas')) return 'paginas'
  if (m.startsWith('formulario')) return 'formulario'
  if (m.startsWith('segundoidioma')) return 'segundoIdioma'
  return null
}

function Ayuda({ texto }) {
  return (
    <span className="ayuda" tabIndex={0} role="img" aria-label={`Ayuda: ${texto}`} data-tip={texto}>
      ?
    </span>
  )
}

export default function App() {
  const [tarifas, setTarifas] = useState(null)
  const [form, setForm] = useState(INICIAL)
  const [resultado, setResultado] = useState(null)
  const [calculadoCon, setCalculadoCon] = useState(null)
  const [error, setError] = useState(null)
  const [cargando, setCargando] = useState(false)
  const [heroPaginas, setHeroPaginas] = useState('')
  const resultadoRef = useRef(null)

  useEffect(() => {
    fetch('/api/tarifas')
      .then((r) => r.json())
      .then(setTarifas)
      .catch(() => {})
  }, [])

  const cambiar = (campo, valor) => setForm((f) => ({ ...f, [campo]: valor }))
  const obsoleto = resultado && JSON.stringify(calculadoCon) !== JSON.stringify(form)
  const campoError = error ? campoDelError(error) : null

  const paginas = (delta) => {
    const actual = Number.isFinite(Number(form.paginas)) ? Number(form.paginas) : 1
    cambiar('paginas', Math.min(20, Math.max(1, Math.round(actual) + delta)))
  }

  function empezar(e) {
    e.preventDefault()
    if (heroPaginas !== '') cambiar('paginas', Number(heroPaginas))
    document.getElementById('calculadora').scrollIntoView({ behavior: 'smooth' })
  }

  async function enviar(e) {
    e.preventDefault()
    setCargando(true)
    setError(null)
    try {
      // los datos se envían sin filtrar: la validación es cosa del servidor
      const res = await fetch('/api/presupuesto', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form)
      })
      const datos = await res.json()
      if (res.ok) {
        setResultado(datos)
        setCalculadoCon(form)
      } else {
        setResultado(null)
        setError(datos.error || `Error ${res.status}`)
      }
    } catch {
      setResultado(null)
      setError('No se pudo conectar con la API. Comprueba que está arrancada en el puerto 3000 y vuelve a intentarlo.')
    } finally {
      setCargando(false)
      resultadoRef.current?.scrollIntoView({ behavior: 'smooth', block: 'nearest' })
    }
  }

  function reiniciar() {
    setForm(INICIAL)
    setResultado(null)
    setError(null)
  }

  const filas = useMemo(
    () =>
      resultado
        ? [
            [`Base · ${calculadoCon.tipo}`, resultado.base],
            [`Páginas adicionales (${Math.max(0, calculadoCon.paginas - 1)})`, resultado.paginasAdicionales],
            ['Formulario de contacto', resultado.formulario],
            ['Segundo idioma', resultado.segundoIdioma]
          ]
        : [],
    [resultado, calculadoCon]
  )

  return (
    <>
      <a className="salto" href="#calculadora">Saltar al presupuesto</a>

      <nav className="nav" aria-label="Principal">
        <a className="logo" href="#inicio">presupuesto<b>.web</b></a>
        <ul>
          <li><a href="#calculadora">Presupuesto</a></li>
          <li><a href="#como">Cómo funciona</a></li>
          <li><a href="#tarifas">Tarifas</a></li>
          <li><a href="#faq">Dudas</a></li>
        </ul>
      </nav>

      <header className="hero" id="inicio">
        <div className="orbe orbe-a" aria-hidden="true" />
        <div className="orbe orbe-b" aria-hidden="true" />
        <h1>El futuro de tu web<br />empieza con un presupuesto claro</h1>
        <p className="lead">
          Elige el tipo de web, las páginas y los extras. Tú decides, nosotros te devolvemos un precio desglosado al instante.
        </p>
        <form className="hero-form" onSubmit={empezar}>
          <label className="sr" htmlFor="hero-paginas">Número de páginas (1 a 20)</label>
          <input
            id="hero-paginas"
            type="number"
            inputMode="numeric"
            min="1"
            max="20"
            placeholder="¿Cuántas páginas necesitas?"
            value={heroPaginas}
            onChange={(e) => setHeroPaginas(e.target.value)}
          />
          <button type="submit" className="btn-verde">Empezar presupuesto</button>
        </form>
        <a className="btn-sec" href="#tarifas">Ver tarifas</a>

        <div className="ventana" aria-hidden="true">
          <div className="ventana-barra"><i /><i /><i /><span>POST /api/presupuesto</span></div>
          <div className="ventana-cuerpo">
            <pre>{`{
  "tipo": "corporativa",
  "paginas": 4,
  "formulario": true,
  "segundoIdioma": false
}`}</pre>
            <pre className="resp">{`{
  "base": 600,
  "paginasAdicionales": 150,
  "formulario": 80,
  "segundoIdioma": 0,
  "total": 830,
  "moneda": "EUR"
}`}</pre>
          </div>
        </div>
      </header>

      <main>
        <section className="seccion" id="calculadora" aria-labelledby="t-calc">
          <h2 id="t-calc">Calcula tu presupuesto</h2>
          <p className="sub">Parte de un ejemplo habitual o configúralo tú.</p>

          <div className="presets" role="group" aria-label="Ejemplos rápidos">
            {PRESETS.map((p) => (
              <button key={p.nombre} type="button" className="chip" onClick={() => { setForm(p.datos); setError(null) }}>
                {p.nombre}
              </button>
            ))}
          </div>

          <div className="grid">
            <form className="card" onSubmit={enviar} noValidate>
              <fieldset aria-describedby={campoError === 'tipo' ? 'e-tipo' : undefined}>
                <legend>1 · Tipo de web</legend>
                <div className="opciones">
                  {TIPOS.map((t) => (
                    <label key={t.id} className={form.tipo === t.id ? 'opcion activa' : 'opcion'}>
                      <input
                        type="radio"
                        name="tipo"
                        value={t.id}
                        checked={form.tipo === t.id}
                        onChange={() => cambiar('tipo', t.id)}
                      />
                      <strong>{t.titulo}</strong>
                      <small>{t.texto}</small>
                      <em>{tarifas ? `desde ${eur(tarifas[t.id])}` : ' '}</em>
                    </label>
                  ))}
                </div>
                {campoError === 'tipo' && <p className="msg-error" id="e-tipo">{error}</p>}
              </fieldset>

              <div className="campo">
                <label htmlFor="paginas">
                  2 · Páginas
                  <Ayuda texto="La primera está incluida en el precio base. Cada página extra se suma a parte." />
                </label>
                <div className={campoError === 'paginas' ? 'stepper con-error' : 'stepper'}>
                  <button type="button" onClick={() => paginas(-1)} aria-label="Quitar una página" disabled={Number(form.paginas) <= 1}>−</button>
                  <input
                    id="paginas"
                    type="number"
                    step="any"
                    inputMode="numeric"
                    value={form.paginas}
                    aria-invalid={campoError === 'paginas'}
                    aria-describedby={campoError === 'paginas' ? 'e-paginas' : 'h-paginas'}
                    onChange={(e) => cambiar('paginas', e.target.value === '' ? '' : Number(e.target.value))}
                  />
                  <button type="button" onClick={() => paginas(1)} aria-label="Añadir una página" disabled={Number(form.paginas) >= 20}>+</button>
                </div>
                {campoError === 'paginas' ? (
                  <p className="msg-error" id="e-paginas">{error}. Ajusta el valor e inténtalo de nuevo.</p>
                ) : (
                  <p className="hint" id="h-paginas">
                    Entre 1 y 20{tarifas && ` · ${eur(tarifas.paginaAdicional)} por página extra`}
                  </p>
                )}
              </div>

              <fieldset>
                <legend>3 · Extras</legend>
                <label className="interruptor">
                  <input type="checkbox" checked={form.formulario} onChange={(e) => cambiar('formulario', e.target.checked)} />
                  <span>Formulario de contacto <small>{tarifas && `+ ${eur(tarifas.formulario)}`}</small></span>
                </label>
                <label className="interruptor">
                  <input type="checkbox" checked={form.segundoIdioma} onChange={(e) => cambiar('segundoIdioma', e.target.checked)} />
                  <span>Segundo idioma <small>{tarifas && `+ ${eur(tarifas.segundoIdioma)}`}</small></span>
                </label>
              </fieldset>

              <div className="acciones">
                <button className="btn" type="submit" disabled={cargando}>
                  {cargando ? 'Calculando…' : 'Calcular presupuesto'}
                </button>
                <button className="btn-link" type="button" onClick={reiniciar}>Empezar de nuevo</button>
              </div>
            </form>

            <section className="card resultado" ref={resultadoRef} aria-live="polite" aria-label="Resultado">
              {cargando && <p className="vacio">Calculando tu presupuesto…</p>}

              {!cargando && !resultado && !error && (
                <div className="vacio">
                  <p><strong>Tu presupuesto aparecerá aquí.</strong></p>
                  <p>Rellena el formulario y pulsa “Calcular presupuesto”.</p>
                </div>
              )}

              {!cargando && error && (
                <div className="error" role="alert">
                  <strong>No hemos podido calcular el presupuesto</strong>
                  <p>{error}</p>
                  <p className="como-arreglar">
                    {campoError ? 'Corrige el campo marcado y vuelve a calcular.' : 'Revisa los datos e inténtalo de nuevo.'}
                  </p>
                </div>
              )}

              {!cargando && resultado && (
                <>
                  <div className="resultado-cab">
                    <h3>Tu presupuesto</h3>
                    {obsoleto && <span className="aviso">Has cambiado datos: recalcula</span>}
                  </div>
                  <dl className={obsoleto ? 'obsoleto' : ''}>
                    {filas.map(([k, v]) => (
                      <div key={k}><dt>{k}</dt><dd>{eur(v)}</dd></div>
                    ))}
                  </dl>
                  <div className={obsoleto ? 'total obsoleto' : 'total'}>
                    <span>Total ({resultado.moneda})</span>
                    <strong>{eur(resultado.total)}</strong>
                  </div>
                  <p className="hint">IVA no incluido. Precio orientativo calculado por el servidor.</p>
                </>
              )}
            </section>
          </div>
        </section>

        <section className="seccion alt" id="como" aria-labelledby="t-como">
          <h2 id="t-como">Cómo funciona</h2>
          <ol className="pasos">
            <li><span>1</span><h3>Elige</h3><p>Landing o corporativa, según lo que necesites mostrar.</p></li>
            <li><span>2</span><h3>Ajusta</h3><p>Indica las páginas y añade formulario o segundo idioma.</p></li>
            <li><span>3</span><h3>Recibe</h3><p>Ves cada concepto por separado y el total al momento.</p></li>
          </ol>
        </section>

        <section className="seccion" id="tarifas" aria-labelledby="t-tar">
          <h2 id="t-tar">Tarifas</h2>
          <p className="sub">Los mismos precios que usa la calculadora.</p>
          {tarifas ? (
            <table className="tabla">
              <thead><tr><th scope="col">Concepto</th><th scope="col">Precio</th></tr></thead>
              <tbody>
                <tr><th scope="row">Web landing</th><td>{eur(tarifas.landing)}</td></tr>
                <tr><th scope="row">Web corporativa</th><td>{eur(tarifas.corporativa)}</td></tr>
                <tr><th scope="row">Cada página adicional</th><td>{eur(tarifas.paginaAdicional)}</td></tr>
                <tr><th scope="row">Formulario de contacto</th><td>{eur(tarifas.formulario)}</td></tr>
                <tr><th scope="row">Segundo idioma</th><td>{eur(tarifas.segundoIdioma)}</td></tr>
              </tbody>
            </table>
          ) : (
            <p className="vacio">No se pudieron cargar las tarifas. Comprueba que la API está arrancada.</p>
          )}
        </section>

        <section className="seccion alt" id="faq" aria-labelledby="t-faq">
          <h2 id="t-faq">Preguntas frecuentes</h2>
          <div className="faq">
            <details>
              <summary>¿Qué incluye el precio base?</summary>
              <p>La primera página y el diseño del tipo de web elegido. Las páginas extra y los complementos se suman aparte.</p>
            </details>
            <details>
              <summary>¿Cuál es la diferencia entre landing y corporativa?</summary>
              <p>Una landing es una página única centrada en una acción. Una corporativa tiene varias secciones sobre tu empresa.</p>
            </details>
            <details>
              <summary>¿Es un precio cerrado?</summary>
              <p>Es una estimación orientativa y no incluye IVA. El cálculo lo hace siempre el servidor con las tarifas vigentes.</p>
            </details>
            <details>
              <summary>¿Por qué me aparece un error?</summary>
              <p>El servidor comprueba los datos antes de calcular. El mensaje te indica qué campo corregir, por ejemplo páginas entre 1 y 20.</p>
            </details>
          </div>
        </section>
      </main>

      <footer className="pie">
        <p>presupuesto<b>.web</b> · Práctica de API con Express y React</p>
        <a href="#inicio">Volver arriba ↑</a>
      </footer>
    </>
  )
}
