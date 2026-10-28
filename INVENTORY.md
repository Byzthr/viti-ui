# Inventario de viti-ui

Antes de crear un componente, composable o utilidad en cualquier app Viti, buscar aquí si ya existe. Al crear o cambiar una pieza, actualizar su fila en el mismo cambio.

Cómo se importa cada tipo de pieza desde una app:

| Pieza | Import |
| ----- | ------ |
| Componente | `import ViewSwitcher from 'viti-ui/components/ViewSwitcher.vue'` |
| Tipo o lógica junto a los componentes | `import type { MenuItem } from 'viti-ui/components/menuItem'` |
| Composable | `import { useTableSort } from 'viti-ui/composables/useTableSort'` |
| Utilidad | `import { moveBefore } from 'viti-ui/utils/moveBefore'` |
| Estilos | `import 'viti-ui/style.css'` y después `import 'viti-ui/styles/<estilo>.css'` |

La columna "Lo usan" dice dónde se usa cada pieza en VitiProject, por ahora la única app que usa viti-ui.

## Componentes (`src/components/`)

| Componente | Para qué | Props / emits clave | Lo usan (VitiProject) |
| ---------- | -------- | ------------------- | ------- |
| `VItemList.vue` | Lista completa de elementos: input para añadir + ítems arrastrables. Con `deleted` muestra la versión de recuperación. | `items: VItemData[]`, `deleted`, `noun`, `placeholder`, `largeInput`, `withInput`, `checkable`, `editable`, `reorderable`, `openable` (doble clic emite `open` para editar en un modal propio), `removable` · emits `add`, `toggle`, `edit`, `remove`, `restore`, `move(id, beforeId)`, `open(id)` · slots `prefix` y default con `{ id }` | Tareas, tareas de Minecraft, Wishlist y listados de Minecraft, coordenadas, cumpleaños y festivos del día |
| `VItem.vue` | Un elemento de lista: asa de arrastre, check, texto editable con doble clic, borrar / restaurar. Se usa a través de `VItemList`. Con clic derecho abre un menú con las acciones que tenga activadas. | `text`, `completed`, `deleted`, `noun`, `dragging`, `checkable`, `editable`, `reorderable`, `openable`, `removable` · emits `toggle`, `edit`, `remove`, `restore`, `dragstart`, `move`, `open` | `VItemList` |
| `vitem.ts` | Tipo `VItemData` (`id`, `text`, `completed?`): lo que necesita un ítem para pintarse. Cada feature mapea sus datos a él. | — | Todas las listas |
| `VInput.vue` | Campo de texto + botón "+" para añadir; se vacía al enviar y nunca emite texto vacío. | `placeholder`, `large` · emit `add(text)` | `VItemList` |
| `OptionsMenu.vue` | Menú de tres puntos arriba a la derecha de una lista. **Siempre** contiene las acciones ocasionales ("Eliminar todas", "Ver eliminadas", "Eliminar sección"...); nunca van como botones sueltos. | `label` (aria), `items: MenuItem[]` · emit `select(id)` | Tareas, tareas de Minecraft, secciones de Wishlist, Calendario, Sistema, Minipc, vitiDB |
| `ContextMenu.vue` | Menú del clic derecho de toda la app, montado una sola vez en `App.vue`. Se abre con `openContextMenu` (`composables/useContextMenu.ts`), nunca se monta otro. | — | `App.vue` |
| `MenuList.vue` | Lista flotante de opciones que comparten `OptionsMenu` y `ContextMenu` (estilos, iconos, flechas arriba/abajo). No se usa suelta: quien la muestra la coloca y la cierra. | `items: MenuItem[]` · emit `select(id)` · expone `focusFirst()` y `el` | `OptionsMenu`, `ContextMenu` |
| `menuItem.ts` | Tipo `MenuItem` (`id`, `label`, `icon?`, `danger?`, `disabled?`; `icon` es el `d` de un path SVG 24×24 con trazo) y `MENU_ICONS`, los iconos comunes de los menús de clic derecho (marcar, editar, abrir, subir, bajar, eliminar, recuperar). | — | Todos los menús |
| `ModalDialog.vue` | Diálogo modal para formularios: fondo, título, error, los campos (slot) y los botones Cancelar / Guardar, más Eliminar si se edita algo existente. Se cierra con Esc, clic fuera o Cancelar. Da estilo a los `label` (o `.field`, para campos que no pueden ir en un label), `input`, `textarea`, `select` y `.field-error` del slot. | `open`, `title`, `error`, `deletable` · emits `close`, `submit`, `remove` · slot default (campos) | Modales de cumpleaños, de festivos, de eventos y de coordenadas |
| `TimePicker.vue` | Selector de hora con reloj analógico (estilo Material): botón con la hora y un panel con la esfera; primero la hora (1–12 fuera, 00 y 13–23 dentro) y luego los minutos, con clic o arrastrando la aguja. Flechas y Enter con el teclado; Esc o clic fuera cierran. No meterlo en un `<label>`. Geometría en `clockDial.ts`. | `v-model` (`"hh:mm"`), `label` (aria), `step` (minutos, por defecto 5) | Modal de eventos |
| `DatePicker.vue` | Campo de fecha dd/mm/aaaa: se puede escribir o elegir en un calendario mensual que abre el botón de al lado (flechas para moverse por los días, RePág/AvPág por los meses, Enter elige, Esc cierra). No meterlo en un `<label>`. Rejilla del mes en `monthCells.ts`. | `v-model` (`"dd/mm/aaaa"`), `label` (aria), `required` · emit `input` (al escribir o elegir) | Modales de eventos y de cumpleaños |
| `ViewSwitcher.vue` | Selector horizontal de pestañas/opciones con una sola activa y marcador deslizante. **Obligatorio** para cualquier navegador de este tipo. | `modes: { id, label }[]`, `active` (genérico en `id`), `label` (aria del grupo) · emit `select(id)` | Calendario (vistas, tipo de evento y modal de festivos), Minecraft, Sistema, Minipc |
| `SortableHeader.vue` | Cabecera de columna (`<th>`) que ordena la tabla al pulsarla, con flecha y `aria-sort`. **Todas las tablas** se ordenan por sus columnas con ella y `useTableSort`. | `label`, `direction` (`'asc'`, `'desc'` o `null` si no es la columna activa), `numeric` (alinea a la derecha) · emit `sort` | Tablas de Sistema (equipo, periféricos, software, red), de Minipc (particiones, software) y de vitiDB |
| `ThemeToggle.vue` | Interruptor de modo claro / oscuro (sol y luna con un botón deslizante). Usa `useTheme`. Con `compact` pliega el icono del modo inactivo y queda un solo botón redondo, para dejar sitio a lo de al lado. | `compact` | `SidebarMenu` (abajo del todo) |
| `LookPicker.vue` | Pastilla junto a `ThemeToggle` con el emoji del estilo en uso. Al pulsarla crece hasta convertirse en una tarjeta estrecha con el emoji de cada estilo de la app (🌆 Crepúsculo, ✏ A mano, ◻ Minimalista, 🔳 Neobrutalista, 📰 Revista, en monocromo), el actual sobre un fondo de color; pulsar la flecha de arriba la ensancha para mostrar el título "Estilo" y los nombres. Ocupa en su fila el ancho de la tarjeta, así que lo de al lado se desplaza; emite `expand` al ensancharse o estrecharse. Vuelve a ser la pastilla al elegir uno, con Esc o al hacer clic o llevar el foco fuera. Flechas arriba/abajo entre estilos. Usa `useLook`. | emit `expand(expanded)` | `SidebarMenu` (abajo del todo) |

## Composables (`src/composables/`)

| Composable | Para qué |
| ---------- | -------- |
| `useListDrag.ts` | Arrastrar para reordenar una lista vertical (fantasma, hueco de destino, inserción). Ver la skill `drag-reorder` de VitiProject. Lo usan `VItemList` y `SidebarMenu`. |
| `useTheme.ts` | Tema claro u oscuro: `initTheme()` (en `main.ts`) lo aplica como `data-theme` en `<html>`, siguiendo el del sistema hasta que se elige uno; `useTheme()` da `theme` y `toggle()`, que guarda la elección en el navegador. Los colores de cada tema están en `style.css`. |
| `useLook.ts` | Estilo de la app: `initLook()` (en `main.ts`) aplica el guardado como `data-style` en `<html>` (sin atributo para el de por defecto, el de `style.css`); `useLook()` da `look` y `select(id)`, que lo guarda en el navegador. `LOOKS` es la lista, con el nombre y el emoji de cada uno. Cada estilo está en `src/styles/<id>.css`, limitado a su `data-style` y con su versión clara y oscura. |
| `useContextMenu.ts` | `openContextMenu(event, items, onSelect)` desde un `@contextmenu`: cambia el menú del navegador por el de la app con esas opciones. Gana el elemento más interior (un ítem dentro de una sección), respeta el menú del navegador en campos de texto y si no hay opciones activas, y con la tecla de menú lo coloca junto al elemento. Lo usan `VItem` (sus acciones activadas), `SidebarMenu`, las secciones de Wishlist, los eventos del calendario y los días de las vistas de año y mes. |
| `useTableSort.ts` | `useTableSort(rows, values, initial?)`: ordena una tabla por la columna elegida. `values` da, para cada columna, el valor por el que se ordena; `sortBy(column)` la elige o invierte el sentido (cada `SortColumn` puede empezar en `desc`, para tamaños y fechas). Sin `initial`, las filas mantienen su orden hasta que se pulsa una columna. Devuelve `sortKey`, `sortDirection`, `sortBy` y `sorted`. Va con `SortableHeader`. |
| `useFillHeight.ts` | `useFillHeight(el, { min })` devuelve el alto que lleva un elemento desde donde empieza hasta el final de la ventana, dejando debajo justo el margen y el relleno inferior de sus contenedores (tiene que ser lo último de la página); se recalcula al redimensionar o si cambia algo de encima. Para paneles con su propio scroll en vez de alargar la página. Lo usan el horario del calendario (`HourSchedule.vue`) y la tira de la vista mensual (`MonthStrip.vue`). |

## Utilidades (`src/utils/`)

| Utilidad | Para qué |
| -------- | -------- |
| `displayDate.ts` | `toDisplayDate(date)` y `parseDisplayDate(text)`: fechas en dd/mm/aaaa, sea cual sea el idioma del navegador; el parseo rechaza fechas que no existen (31/02). |
| `moveBefore.ts` | `moveBefore(list, id, beforeId)`: mueve un elemento delante de otro (o al final) sin intercambiar; `null` si no cambia nada. |
| `sortRows.ts` | `sortRows(rows, value, direction)`: ordena sin cambiar la lista recibida, con los números como números (versiones, IP) y los valores vacíos siempre al final. Lo usa `useTableSort`. |
| `completedLast.ts` | `beforeIdAfterToggle(list, id)`: a dónde va un elemento al marcarlo o desmarcarlo (completados al final). |
