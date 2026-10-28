# CLAUDE.md

Guía para Claude Code en viti-ui: librería pública de Vue 3 con los componentes, composables, utilidades, paleta y estilos que comparten las apps Viti (VitiProject, VitiDiagnostics, minipcManager). Se publica como código fuente, sin compilar, y cada app la instala con una versión fija (`github:Byzthr/viti-ui#vX.Y.Z`).

## Rol del agente

Actúa como desarrollador experto en **Vue 3**. Prioriza código simple, legible y mantenible. Responde en español; el código, nombres de variables y commits en inglés.

## Stack

- Node 20.19+ (la del minipc, Debian 13; por eso Vitest 4 y no 5, que pide Node 22), Vue 3 (Composition API, `<script setup>`), TypeScript, Vite
- Tests: Vitest
- Gestor: npm
- `vue` es `peerDependency`: la pone cada app

## Estructura

```
viti-ui/
  src/
    components/   # componentes genéricos y la lógica y tipos que van con ellos (menuItem.ts...)
    composables/  # lógica reutilizable (useXxx)
    utils/        # funciones puras
    style.css     # paleta, roles de color y estilos base
    styles/       # los estilos distintos del de por defecto, cada uno bajo su data-style
  INVENTORY.md    # qué hay y para qué sirve cada pieza
  package.json    # exports: las rutas públicas de importación
```

Las rutas públicas (`viti-ui/components/X.vue`, `viti-ui/composables/useX`, `viti-ui/utils/x`, `viti-ui/style.css`, `viti-ui/styles/x.css`) salen de `exports` en `package.json`. Cambiarlas obliga a tocar todas las apps: es una versión mayor.

## Reglas

- **Nada específico de una app.** Ni rutas, ni stores, ni API, ni clases CSS de otra app. Una pieza que necesita algo de la app lo recibe por props, slots o parámetros.
- Usar siempre Composition API con `<script setup lang="ts">`; nunca Options API.
- Componentes en PascalCase, composables con prefijo `use`.
- Props y emits tipados. Prohibido `any`; usar `unknown` y validar.
- Un componente = una responsabilidad; dividir si supera ~200 líneas.
- Antes de crear un componente, composable o utilidad, consultar `INVENTORY.md` y reutilizar lo que haya. Al crear o cambiar uno, actualizar su fila en el mismo cambio.
- Accesibilidad básica: etiquetas, roles y contraste.
- Colores: solo variables globales de `src/style.css` (los cinco colores de la paleta y los roles que se derivan de ellos, con `color-mix`). Nunca colores literales (`#...`, `rgb(...)`) en componentes; si falta un rol, se añade a `style.css`. El rojo de las acciones destructivas es una excepción de la paleta, pero también es una variable.
- No añadir dependencias sin justificarlo y consultarlo antes: cada una la heredan todas las apps.

## Mecánicas que las apps usan siempre

- Selector horizontal con una sola opción activa: `ViewSwitcher.vue`.
- Acciones ocasionales de una lista: menú de tres puntos con `OptionsMenu.vue`.
- Tablas ordenables por cualquier columna: `SortableHeader.vue` con `useTableSort`.
- Arrastrar para reordenar: `useListDrag`, sin librerías ni drag and drop nativo.

## Comandos habituales

```bash
npm install
npm run test
npm run lint
npm run typecheck
```

## Flujo de trabajo

- Leer el código existente antes de modificarlo; seguir sus convenciones.
- Cambios pequeños y enfocados; no mezclar refactors con piezas nuevas.
- Ejecutar tests, lint y comprobación de tipos solo al hacer commit.
- Añadir tests para lógica nueva y bugs corregidos.
- Para probar un cambio en una app sin publicar versión, enlazarla con `npm link` (ver `README.md`).
- No hacer commit, push, PR ni fusión sin que se pida explícitamente.

## Git y versiones

Para ramas, commits, PRs, fusiones, etiquetas de versión y limpieza usar siempre la skill **`git-workflow`**. Lo innegociable: `main` y `develop` no reciben commits directos, la fusión a `main` la hace siempre el usuario y las etiquetas `vX.Y.Z` se crean en `main` después.

## Documentación

Al cambiar `CLAUDE.md`, una skill, el `README.md` o `INVENTORY.md`, usar siempre la skill **`doc-review`**.

## A evitar

- Sobreingeniería: no crear abstracciones para casos hipotéticos.
- Comentarios que expliquen qué hace el código; solo comentar el porqué cuando no sea obvio.
- Exponer credenciales, tokens o datos personales: el repo es público.
