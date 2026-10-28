---
name: doc-review
description: Revisa la documentación de viti-ui (CLAUDE.md, skills, README, INVENTORY.md) en busca de contradicciones, redundancias, datos desactualizados y referencias rotas, y las expone con la solución óptima de cada una. Úsala siempre que se cambie la documentación o se pida revisarla, auditarla o comprobar si es coherente.
---

# Revisar la documentación

La documentación de viti-ui son reglas que Claude sigue al pie de la letra: si dos dicen cosas distintas, una de las dos se incumple; si una describe algo que ya no existe, lleva a error. Esta skill las revisa juntas, expone lo que falla y propone cómo arreglarlo. **No cambia nada hasta que el usuario decide.**

## 1. Cuándo

- **Siempre que se cambie la documentación**, al terminar ese cambio: `CLAUDE.md`, una skill (`.claude/skills/`), el `README.md` o `INVENTORY.md`.
- **Cuando un cambio de código deja documentación atrás:** se mueve o renombra un fichero, se quita una dependencia, cambia un comando o un flujo...
- Cuando el usuario pide revisarla.

Tras un cambio concreto basta revisar lo que toca a ese cambio y lo que lo menciona. Si se pide una revisión general, todo.

## 2. Qué se busca

Por orden de gravedad:

1. **Contradicciones:** dos documentos, o dos partes de uno, que piden cosas incompatibles (cuándo se pasan los tests, si se abre el navegador, cómo se migra la base...). Cuentan también los `CLAUDE.md` de carpetas superiores al repo, que Claude Code carga en cada sesión.
2. **Desactualizado:** describe algo que ya no es así: rutas, comandos, dependencias, tecnologías, flujos, nombres de ramas o de skills.
3. **Reglas imposibles o sin dueño:** piden algo que el proyecto no tiene (una herramienta sin instalar o sin configurar) o no dicen quién ni cuándo.
4. **Redundancias que pueden divergir:** la misma regla con detalle en dos sitios. Que `CLAUDE.md` resuma lo innegociable y remita a la skill está bien; dos versiones completas, no.
5. **Ambigüedades con la decisión ya tomada:** "npm/pnpm" cuando solo se usa npm, "A o B" cuando el repo ya eligió.

No se señalan cuestiones de estilo ni de redacción.

## 3. Cómo se revisa

1. **Parte mecánica.** Desde la raíz del repo:

   ```bash
   python .claude/skills/doc-review/check_refs.py
   ```

   Comprueba que existan las rutas entre comillas invertidas de los documentos, que las skills que nombra `CLAUDE.md` existan y que no haya un `CLAUDE.md` en una carpeta superior. No comprueba los ficheros de las apps (`App.vue`, `main.ts`, `SidebarMenu`...) que nombra la columna "Lo usan" del inventario: están en sus repos. Sus avisos son candidatos: se confirman antes de exponerlos.
2. **Leer los documentos afectados enteros**, no solo el cambio: una contradicción suele estar entre lo nuevo y algo que ya estaba.
3. **Cruzar cada regla con las demás** del mismo tema en los otros documentos: tests, commits, ramas, navegador, base de datos, dependencias, arranque de la app...
4. **Contrastar con el repo, no con la memoria:** si se afirma algo del proyecto, se comprueba (`package.json`, sus `exports`, que un fichero o un comando exista, cómo está hecho de verdad).

## 4. Cómo se expone

Primero las importantes, luego las menores. Para cada una:

- **Qué choca o qué falla**, citando cada sitio (`fichero:línea`) y lo que dice, en pocas palabras.
- **Por qué importa:** qué haría mal Claude siguiéndolo.
- **La solución recomendada** y, si hay una decisión de verdad, las alternativas con su contrapartida. La recomendada es la que deja **una sola fuente de verdad**, se ajusta a lo que el repo ya hace y cambia menos texto.

Las decisiones que dependen del usuario (qué regla se queda, qué opción se adopta) se preguntan; lo que tiene una respuesta clara (una ruta movida, un nombre cambiado) se propone sin más. Al final, una línea con lo que está bien, para que se sepa que se ha revisado.

## 5. Al aplicar lo que el usuario apruebe

- Se cambia solo lo aprobado, con la solución acordada, y se vuelve a pasar `check_refs.py`.
- La documentación va en su rama de trabajo, con el código al que acompaña, o en una rama `docs/...` (skill `git-workflow`).
- Si la solución toca código (quitar una dependencia, crear una carpeta...), se dice, porque va aparte.
- Lo que esté fuera del repo (un `CLAUDE.md` de una carpeta superior, una configuración personal) se borra o cambia solo con confirmación expresa.
