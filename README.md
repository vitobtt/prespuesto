# Presupuesto mi web

API REST (Node.js + Express) que calcula el presupuesto de una página web.

## Requisitos

- Node.js 18 o superior (incluye npm)

## Instalación

```bash
cd presupuesto_mi_web
npm install
```

## Ejecución

```bash
npm start
```

Debe mostrarse `api en http://localhost:3000`. Para detener el servidor: `Ctrl + C`.

## Puerto

El servidor escucha en el puerto **3000** (definido en `src/server.js`).
Base de la API: `http://localhost:3000`

## Rutas

| Método | Ruta | Descripción |
|---|---|---|
| GET | `/api/estado` | Comprueba que la API funciona: `{ "status": "ok" }` |
| GET | `/api/tarifas` | Devuelve las tarifas vigentes |
| POST | `/api/presupuesto` | Calcula un presupuesto |

### POST /api/presupuesto

Cuerpo JSON:

| Campo | Tipo | Valores |
|---|---|---|
| `tipo` | texto | `"landing"` o `"corporativa"` |
| `paginas` | entero | de 1 a 20 |
| `formulario` | booleano | `true` / `false` |
| `segundoIdioma` | booleano | `true` / `false` |

Ejemplo:

```bash
curl -X POST http://localhost:3000/api/presupuesto \
  -H "Content-Type: application/json" \
  -d @pruebas/caso2.json
```

Respuesta (200):

```json
{
  "base": 600,
  "paginasAdicionales": 150,
  "formulario": 80,
  "segundoIdioma": 0,
  "total": 830,
  "moneda": "EUR"
}
```

Si la solicitud es incorrecta se responde con **400** y un mensaje, por ejemplo:

```json
{ "error": "paginas debe ser un entero entre 1 y 20" }
```

## Interfaz React (opcional)

Carpeta `cliente/` (React + Vite). Formulario que envía la solicitud a la API y muestra el desglose o el error recibido. Las tarifas mostradas se leen de `GET /api/tarifas`.

Con la API arrancada (`npm start`), en otra terminal:

```bash
cd cliente
npm install
npm run dev
```

Abrir `http://localhost:5173`. Vite redirige las llamadas `/api` al puerto 3000.

## Tarifas

Landing 300 €, corporativa 600 €, página adicional 50 € (a partir de la segunda), formulario 80 €, segundo idioma 150 €.

## Pruebas

La carpeta `pruebas/` contiene un JSON por caso (`caso1.json` a `caso9.json`):

| Caso | Solicitud enviada | Resultado esperado | Resultado obtenido |
|---|---|---|---|
| 1 | `{"tipo":"landing","paginas":1,"formulario":false,"segundoIdioma":false}` | 200 · 300 € | 200 · total 300 ✅ |
| 2 | `{"tipo":"corporativa","paginas":4,"formulario":true,"segundoIdioma":false}` | 200 · 830 € | 200 · total 830 ✅ |
| 3 | `{"tipo":"landing","paginas":2,"formulario":true,"segundoIdioma":true}` | 200 · 580 € | 200 · total 580 ✅ |
| 4 | `{"tipo":"landing","paginas":20,"formulario":false,"segundoIdioma":false}` | 200 · 1250 € | 200 · total 1250 ✅ |
| 5 | `paginas: 0` (resto válido) | 400 | 400 · `paginas debe ser un entero entre 1 y 20` ✅ |
| 6 | `paginas: 21` (resto válido) | 400 | 400 · `paginas debe ser un entero entre 1 y 20` ✅ |
| 7 | `paginas: 2.5` (resto válido) | 400 | 400 · `paginas debe ser un entero entre 1 y 20` ✅ |
| 8 | `tipo: "tienda"` (resto válido) | 400 | 400 · `tipo debe ser "landing" o "corporativa"` ✅ |
| 9 | `formulario: "false"` (resto válido) | 400 | 400 · `formulario debe ser true o false` ✅ |

Cada solicitud está en `pruebas/casoN.json`.

Lanzar todos (con el servidor en marcha):

```bash
for f in pruebas/caso*.json; do
  echo "$f"
  curl -s -w " -> HTTP %{http_code}\n" -X POST http://localhost:3000/api/presupuesto \
    -H "Content-Type: application/json" -d @"$f"
done
```
