# viti-ui

Componentes, composables, utilidades, paleta y estilos de Vue 3 que comparten las apps Viti (VitiProject, VitiDiagnostics, minipcManager). Se publica como código fuente (`.vue`, `.ts` y `.css`, sin compilar): el Vite de cada app lo compila.

Qué hay y para qué sirve cada pieza: [`INVENTORY.md`](INVENTORY.md).

## Instalar

En el `package.json` de la app, con una versión concreta:

```json
"viti-ui": "github:Byzthr/viti-ui#v1.0.0"
```

Se importa por ruta: `viti-ui/components/ViewSwitcher.vue`, `viti-ui/components/menuItem`, `viti-ui/composables/useTableSort`, `viti-ui/utils/moveBefore`, `viti-ui/style.css`, `viti-ui/styles/minimal.css`.

La app necesita en su `vite.config.ts`:

```ts
resolve: { dedupe: ['vue'] },
optimizeDeps: { exclude: ['viti-ui'] },
test: { server: { deps: { inline: ['viti-ui'] } } },
```

- `dedupe`: una sola copia de Vue aunque `viti-ui` esté enlazada con `npm link`.
- `optimizeDeps.exclude`: el preempaquetado de dependencias de Vite no compila `.vue`.
- `deps.inline`: Vitest tiene que compilar los `.ts` de `viti-ui`, que Node no carga por sí solo.

## Desarrollar enlazado

Para probar un cambio en una app sin publicar versión:

```bash
# en viti-ui
npm link
# en el frontend de la app
npm link viti-ui
```

Al terminar, `npm unlink viti-ui` y `npm ci` en la app vuelven a la versión de su `package.json`.

## Publicar una versión

1. Subir `version` en `package.json` (versionado semántico: mayor si cambia la ruta o la interfaz de una pieza que usan las apps).
2. Fusionar a `main`.
3. Etiquetar `vX.Y.Z` en `main` y subir la etiqueta.
4. En cada app, cambiar la versión de su dependencia cuando se quiera.

## Comandos

```bash
npm install
npm run test
npm run lint
npm run typecheck
```

## Licencia

MIT.
