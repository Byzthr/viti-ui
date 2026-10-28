<script setup lang="ts">
import { ref } from 'vue'

// The input used to add Vitems to a list: a text field and a "+" button. It clears itself after
// submitting and never emits blank text.
defineProps<{
  placeholder: string
  large?: boolean
}>()

const emit = defineEmits<{
  add: [text: string]
}>()

const text = ref('')

function submit() {
  const value = text.value.trim()
  text.value = ''
  if (value) emit('add', value)
}
</script>

<template>
  <form class="vinput" :class="{ large }" @submit.prevent="submit">
    <input v-model="text" type="text" :placeholder="placeholder" :aria-label="placeholder" />
    <button type="submit" :aria-label="placeholder">
      <svg viewBox="0 0 24 24" width="24" height="24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" aria-hidden="true">
        <path d="M12 5v14M5 12h14" />
      </svg>
    </button>
  </form>
</template>

<style scoped>
.vinput {
  --size: 2.75rem;
  display: flex;
  gap: 0.5rem;
  margin-bottom: 1rem;
}

.vinput.large {
  --size: 3.4rem;
  margin-bottom: 1.25rem;
}

.vinput input {
  flex: 1;
  min-width: 0;
  height: var(--size);
  padding: 0 1rem;
  border: 1px solid var(--color-border-soft);
  border-radius: var(--radius-md);
  font-size: 1rem;
  background: var(--color-surface);
  box-shadow: var(--shadow-soft);
  transition:
    border-color 0.15s ease,
    box-shadow 0.15s ease;
}

.vinput input::placeholder {
  color: var(--color-text-faint);
}

.vinput input:hover {
  border-color: var(--color-border);
}

.vinput input:focus {
  border-color: var(--color-focus);
  box-shadow: 0 0 0 4px var(--color-ring);
  outline: none;
}

.vinput button {
  display: flex;
  flex-shrink: 0;
  align-items: center;
  justify-content: center;
  width: var(--size);
  padding: 0;
  border: 0;
  border-radius: var(--radius-md);
  color: var(--color-on-primary);
  background: var(--color-primary);
  box-shadow: 0 4px 14px var(--glow-primary-soft);
  cursor: pointer;
  transition:
    transform 0.15s ease,
    box-shadow 0.15s ease,
    background 0.15s ease;
}

.vinput button:hover {
  background: var(--color-primary-strong);
  box-shadow: 0 6px 18px var(--glow-primary);
}

.vinput button:active {
  transform: scale(0.95);
}

.vinput button:focus-visible {
  outline: 2px solid var(--color-focus);
  outline-offset: 2px;
}

@media (prefers-reduced-motion: reduce) {
  .vinput input,
  .vinput button {
    transition: none;
  }
}
</style>
