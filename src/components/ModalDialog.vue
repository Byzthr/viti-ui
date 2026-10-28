<script setup lang="ts">
// The dialog every form of the app opens in: backdrop, title, error, the fields from the default
// slot and the Cancel / Save buttons, plus Delete when the form edits something that exists.
// Closes on Esc, on a click outside or on Cancel; the fields keep their own state.
defineProps<{
  open: boolean
  title: string
  error?: string | null
  deletable?: boolean
}>()

const emit = defineEmits<{ close: []; submit: []; remove: [] }>()

const titleId = `modal-title-${Math.random().toString(36).slice(2)}`
</script>

<template>
  <Teleport to="body">
    <Transition name="modal">
      <div v-if="open" class="overlay" @click.self="emit('close')" @keydown.esc="emit('close')">
        <div class="dialog" role="dialog" aria-modal="true" :aria-labelledby="titleId">
          <h3 :id="titleId">{{ title }}</h3>
          <p v-if="error" class="error" role="alert">{{ error }}</p>
          <form @submit.prevent="emit('submit')">
            <slot />
            <div class="actions">
              <button v-if="deletable" type="button" class="delete" @click="emit('remove')">
                Eliminar
              </button>
              <button type="button" class="cancel" @click="emit('close')">Cancelar</button>
              <button type="submit" class="save">Guardar</button>
            </div>
          </form>
        </div>
      </div>
    </Transition>
  </Teleport>
</template>

<style scoped>
.overlay {
  position: fixed;
  inset: 0;
  z-index: 100;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 1rem;
  background: var(--color-backdrop);
  backdrop-filter: blur(4px);
}

.dialog {
  width: 100%;
  max-width: 360px;
  padding: 1.6rem 1.75rem 1.75rem;
  border: 1px solid var(--color-border-soft);
  border-radius: var(--radius-lg);
  background: var(--color-surface);
  box-shadow: var(--shadow-float);
}

h3 {
  margin: 0 0 1.25rem;
  font-family: var(--font-display);
  font-size: 1.3rem;
  font-weight: 650;
  letter-spacing: -0.01em;
  color: var(--color-text);
}

.error {
  margin: 0 0 1rem;
  padding: 0.6rem 0.8rem;
  border-radius: var(--radius-md);
  font-size: 0.85rem;
  color: var(--color-danger-text);
  background: var(--color-danger-soft);
}

form {
  display: flex;
  flex-direction: column;
  gap: 0.9rem;
}

:slotted(label),
:slotted(.field) {
  display: flex;
  flex-direction: column;
  gap: 0.4rem;
  font-size: 0.85rem;
  font-weight: 500;
  color: var(--color-text-soft);
}

:slotted(input),
:slotted(textarea),
:slotted(select) {
  height: 2.6rem;
  padding: 0 0.8rem;
  border: 1px solid var(--color-border);
  border-radius: var(--radius-md);
  font: inherit;
  color: var(--color-text);
  background: var(--color-surface-alt);
  transition: border-color 0.15s ease, box-shadow 0.15s ease, background 0.15s ease;
}

:slotted(input:hover),
:slotted(textarea:hover),
:slotted(select:hover) {
  border-color: var(--color-line-hover);
}

:slotted(input::placeholder),
:slotted(textarea::placeholder) {
  color: var(--color-text-faint);
}

:slotted(input:focus),
:slotted(textarea:focus),
:slotted(select:focus) {
  border-color: var(--color-focus);
  background: var(--color-surface);
  box-shadow: 0 0 0 4px var(--color-ring);
  outline: none;
}

:slotted(textarea) {
  height: auto;
  padding: 0.6rem 0.75rem;
  line-height: 1.4;
  resize: vertical;
}

:slotted(.field-error) {
  font-size: 0.75rem;
  color: var(--color-danger-text);
}

.actions {
  display: flex;
  justify-content: flex-end;
  gap: 0.5rem;
  margin-top: 0.5rem;
}

.delete {
  margin-right: auto;
  border: 1px solid var(--color-danger-border);
  color: var(--color-danger-text);
  background: transparent;
}

.delete:hover {
  color: var(--color-on-primary);
  background: var(--color-danger);
  box-shadow: 0 4px 12px var(--glow-danger);
}

.delete,
.cancel,
.save {
  padding: 0.5rem 1.15rem;
  border-radius: var(--radius-pill);
  font-weight: 600;
  cursor: pointer;
  transition: background 0.2s ease, color 0.2s ease, box-shadow 0.2s ease;
}

.cancel {
  border: 1px solid transparent;
  color: var(--color-text-soft);
  background: transparent;
}

.cancel:hover {
  background: var(--color-hover);
}

.save {
  border: 1px solid var(--color-primary);
  color: var(--color-on-primary);
  background: var(--color-primary);
}

.save:hover {
  background: var(--color-primary-strong);
  box-shadow: 0 4px 12px var(--glow-primary);
}

.delete:focus-visible,
.cancel:focus-visible,
.save:focus-visible {
  outline: 2px solid var(--color-focus);
  outline-offset: 2px;
}

/* On the way out the dialog shrinks to nothing while the backdrop fades; the overlay's own
   transition is what Vue waits for, so it lasts as long as the dialog's. */
.modal-enter-active,
.modal-leave-active {
  transition: opacity 0.3s ease;
}

.modal-enter-active .dialog {
  transition: transform 0.2s ease;
}

.modal-leave-active .dialog {
  transition: transform 0.3s cubic-bezier(0.5, 0, 0.75, 0);
}

.modal-enter-from,
.modal-leave-to {
  opacity: 0;
}

.modal-enter-from .dialog {
  transform: scale(0.95);
}

.modal-leave-to .dialog {
  transform: scale(0);
}

@media (prefers-reduced-motion: reduce) {
  .modal-enter-active .dialog,
  .modal-leave-active .dialog {
    transition: none;
  }
}
</style>
