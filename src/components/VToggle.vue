<script setup lang="ts">
// A yes/no switch. Being a native button, Space and Enter already fire its click.
withDefaults(defineProps<{ modelValue: boolean; label: string; disabled?: boolean }>(), {
  disabled: false,
})
const emit = defineEmits<{ 'update:modelValue': [value: boolean] }>()
</script>

<template>
  <button
    type="button"
    class="v-toggle"
    :class="{ on: modelValue }"
    role="switch"
    :aria-checked="modelValue"
    :aria-label="label"
    :disabled="disabled"
    @click="emit('update:modelValue', !modelValue)"
  >
    <span class="knob" aria-hidden="true"></span>
  </button>
</template>

<style scoped>
.v-toggle {
  position: relative;
  flex-shrink: 0;
  width: 2.5rem;
  height: 1.4rem;
  padding: 0;
  border: 1px solid var(--color-border);
  border-radius: var(--radius-pill);
  background: var(--color-surface-alt);
  cursor: pointer;
  transition:
    background-color 0.2s ease,
    border-color 0.2s ease;
}

.v-toggle:hover:not(:disabled) {
  border-color: var(--color-line-hover);
}

.v-toggle.on {
  border-color: var(--color-primary);
  background: var(--color-primary);
}

.v-toggle:focus-visible {
  outline: 2px solid var(--color-focus);
  outline-offset: 2px;
}

.v-toggle:disabled {
  cursor: not-allowed;
  opacity: 0.5;
}

.knob {
  position: absolute;
  top: 50%;
  left: 0.15rem;
  width: 1rem;
  height: 1rem;
  border-radius: 50%;
  background: var(--color-surface);
  box-shadow: var(--shadow-raised);
  transform: translateY(-50%);
  transition: transform 0.25s cubic-bezier(0.3, 0.7, 0.4, 1);
}

.on .knob {
  transform: translate(1.1rem, -50%);
}

@media (prefers-reduced-motion: reduce) {
  .v-toggle,
  .knob {
    transition: none;
  }
}
</style>
