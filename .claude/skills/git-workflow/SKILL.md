---
name: git-workflow
description: Metodología de trabajo con git y GitHub en viti-ui - modelo de ramas (main estable, develop permanente, ramas de trabajo desde develop), commits convencionales, etiquetas de versión, que solo se hacen cuando el usuario lo pide, y cuándo y cómo subir, crear PRs, fusionarlas y borrar ramas. Úsala siempre que vayas a crear una rama, hacer un commit, publicar una versión, subir cambios, crear o fusionar una PR, borrar ramas o se te pregunte por el flujo de git.
---

# Metodología de trabajo con git

## 1. Modelo de ramas

| Rama | Papel | Reglas |
| ---- | ----- | ------ |
| `main` | Solo builds **estables** | Nadie commitea en ella. Recibe `develop` mediante una PR que Claude puede crear si se le pide (apartado 4.1), pero **solo el usuario la fusiona**. |
| `develop` | Integración | **No se elimina nunca**, tampoco al fusionarla en `main`. Nadie commitea directamente en ella: recibe PRs. |
| `feat/<nombre>`, `fix/<nombre>`, `chore/<nombre>`, `docs/<nombre>` | Trabajo | Salen **siempre de `develop`**, son cortas y sus PRs apuntan a `develop`. Se borran al fusionarlas. Los cambios de `CLAUDE.md` y de las skills van en una rama `docs/...` normal: en un repo tan pequeño no hay rama `claude-config`. |

Los nombres van en inglés, en minúscula y con guiones (`feat/menu-order`).

El ajuste de GitHub "Automatically delete head branches" está **desactivado a propósito**: con él, GitHub borraría `develop` al fusionarla en `main`. Por eso las ramas de trabajo se borran a mano (apartado 6).

## 2. Ciclo de una petición

1. Partir de `develop` al día antes de cambiar código: `git checkout develop`, `git pull --ff-only`, `git checkout -b <tipo>/<nombre>`. Si ya se está en una rama de trabajo del mismo asunto, se puede seguir en ella.
2. Hacer el cambio (leer el código antes, cambios pequeños y enfocados).
3. Resumir al usuario los cambios funcionales y los técnicos, y decir qué queda **sin commitear** y en qué rama.
4. **El commit, el push, la PR y la fusión solo se hacen cuando el usuario los pide.** No se commitea automáticamente al terminar una consulta.

Cuando el usuario pide el commit se sigue el apartado 3. Los cambios sin commitear viajan con el árbol de trabajo: tenerlo en cuenta al cambiar de rama y, si estorban, apartarlos con `git stash` (apartado 9).

## 3. Commits

- [Conventional Commits](https://www.conventionalcommits.org/): `<tipo>(<ámbito opcional>): <descripción>`.
- Tipos: `feat`, `fix`, `docs`, `style` (formato o estilos sin cambio de lógica), `refactor`, `test`, `chore` (mantenimiento, configuración), `build`, `ci`, `perf`. Ámbito opcional: la pieza o el área (`ViewSwitcher`, `styles`...).
- **En inglés**, en imperativo y minúscula, sin punto final, máximo 72 caracteres en la primera línea.
- Si hace falta, el cuerpo (tras una línea en blanco) explica el porqué, no repite el diff. Cambios incompatibles: `!` tras el tipo y `BREAKING CHANGE:` en el cuerpo.
- **Un commit = un cambio lógico.** No mezclar refactors con funcionalidad. Si los cambios están mezclados en los mismos archivos y separarlos rompería el código, se hace un solo commit y el cuerpo enumera lo que incluye.
- Antes: los tests y el lint del código tocado, que es cuando se ejecutan (no tras cada cambio): `npm run test`, `npm run lint` y `npm run typecheck`. Si el cambio lo necesita (algo que los tests no cubren, como una interacción con el ratón), también una prueba en Chrome con una app enlazada (`npm link`). Después, `git status` y `git diff`. Añadir **los archivos por nombre**, nunca `git add -A` a ciegas.
- Nunca commitear credenciales, `node_modules` ni `.claude/settings.local.json`. El repo es **público**.
- Todo commit de Claude termina con la línea `Co-Authored-By: Claude <modelo> <noreply@anthropic.com>`, donde `<modelo>` es el modelo que se esté usando en la sesión (p. ej. `Claude Opus 5.5`), no uno fijo.
- Preferir commits nuevos a `--amend` si el commit ya está subido.

En PowerShell el mensaje va en un *here-string* de comillas simples (`@'` ... `'@`, con el cierre en la columna 0). **No poner comillas dobles dentro del mensaje**: rompen el comando y el commit no se crea (los archivos quedan preparados; se repite sin ellas).

## 4. Subir y crear la PR (solo si se pide)

1. `git push -u origin <rama>`.
2. Escribir el cuerpo de la PR en un archivo temporal (en el directorio de trabajo temporal, no en el repositorio), en inglés, con las secciones **Summary**, **Technical notes** (si aplica) y **Test plan**, y terminando con `🤖 Generated with [Claude Code](https://claude.com/claude-code)`.
3. `gh pr create --base develop --head <rama> --title "<título>" --body-file <archivo>`.

`gh` se llama por su nombre, sin ruta: está en el `PATH` y su ubicación cambia según el equipo (en uno está en `C:\Program Files\GitHub CLI\`, en otro instalado con winget). Las ramas de trabajo nunca van con `--base main`.

### 4.1 PR de `develop` a `main` (solo si se pide)

1. Comprobar que `develop` está al día y sin nada pendiente: `git fetch origin`, `git status` y que no haya PRs abiertas hacia `develop` que deban entrar antes.
2. Cuerpo de la PR como en el paso 2, con un **Summary** que resuma lo que entra en `main` desde la última fusión (`git log --oneline origin/main..origin/develop`, agrupado por funcionalidades y arreglos).
3. `gh pr create --base main --head develop --title "<título>" --body-file <archivo>`.
4. **No fusionarla nunca**, aunque se pida "PR y merge": se da el enlace y se recuerda que la fusión la hace el usuario y que `develop` no se borra al fusionar.

## 5. Fusionar (solo si se pide)

Claude puede fusionar las PRs **que él mismo ha creado, hacia `develop`**; el usuario le ha delegado esa aprobación. Nunca las de terceros ni ninguna hacia `main`, aunque la haya creado él.

1. Los tests y el lint deben estar en verde.
2. `gh pr merge <número> --merge` (commit de fusión, sin *squash*, para conservar los commits).
3. Comprobar `gh pr view <número> --json state,mergeCommit`.

## 6. Limpieza tras fusionar

1. `git checkout develop` y `git pull --ff-only`.
2. Comprobar que no quedan commits sin fusionar: `git log origin/develop..<rama>` debe salir vacío. Si no, **avisar en lugar de borrar**.
3. `git branch -d <rama>` (siempre `-d`, nunca `-D`) y `git push origin --delete <rama>`.
4. `git fetch origin --prune` y `git branch -a` para comprobar que solo quedan `main` y `develop` más lo pendiente.

No se borran nunca `main` ni `develop` (al fusionar su PR se conserva la rama).

## 7. Publicar una versión

Las apps instalan viti-ui por etiqueta (`github:Byzthr/viti-ui#vX.Y.Z`), así que una versión es una etiqueta en `main`.

1. En la rama de trabajo, subir `version` en `package.json` con versionado semántico:
   - **mayor** si cambia la ruta o la interfaz (props, emits, firma, nombre exportado) de una pieza que usan las apps, o se quita una;
   - **menor** si se añade una pieza o una opción sin romper nada;
   - **parche** si se corrige algo sin cambiar la interfaz.
2. PR a `develop` y, cuando el usuario lo decida, PR de `develop` a `main` (apartado 4.1), que fusiona el usuario.
3. Después de la fusión, en `main` al día: `git tag -a vX.Y.Z -m "viti-ui X.Y.Z"` y `git push origin vX.Y.Z`. **La etiqueta solo la crea Claude con permiso del usuario.**
4. Cada app sube su dependencia cuando quiera, en su propio repo.

## 8. Prohibido

- Mover o borrar una etiqueta `vX.Y.Z` ya subida: las apps dependen de ella.
- Commitear en `main` o en `develop`.
- Fusionar PRs hacia `main`, y crear hacia `main` cualquier PR que no sea la de `develop` (apartado 4.1).
- `git push --force`, `git reset --hard` y reescribir historial ya subido, sin confirmación explícita.
- `--no-verify` y saltarse hooks.
- `git branch -D`.
- Acciones destructivas sin confirmar antes.

## 9. Otros detalles útiles

- `git stash` con referencias entre comillas en PowerShell: `git stash pop 'stash@{0}'`.
- Si se cambia de rama con cambios sin commitear, van con el usuario a la otra rama; para dejarlos aparte, `git stash push -m "<descripción>" -- <archivos>`.
- Una rama de documentación pendiente puede adelantarse a `develop` con `git merge --ff-only develop` cuando no tiene commits propios.
- Un servidor de desarrollo sirve lo que haya en el árbol de trabajo: al cambiar de rama cambia lo que se ve.
