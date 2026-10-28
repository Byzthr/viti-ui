import pluginVue from 'eslint-plugin-vue'
import { defineConfigWithVueTs, vueTsConfigs } from '@vue/eslint-config-typescript'

export default defineConfigWithVueTs(
  { ignores: ['dist/**', 'coverage/**'] },
  pluginVue.configs['flat/recommended'],
  vueTsConfigs.recommended,
  {
    rules: {
      '@typescript-eslint/no-explicit-any': 'error',
      // An unused parameter still types a callback (a fetch mock's URL, say) when prefixed `_`.
      '@typescript-eslint/no-unused-vars': ['error', { argsIgnorePattern: '^_' }],
      // Template layout is left to the code's own style: these only reflow markup, they catch
      // no bugs, and the project keeps short attribute lists and inline elements on one line.
      'vue/max-attributes-per-line': 'off',
      'vue/singleline-html-element-content-newline': 'off',
      'vue/html-indent': 'off',
      'vue/first-attribute-linebreak': 'off',
      'vue/html-closing-bracket-newline': 'off',
      'vue/html-self-closing': 'off',
      // Typed optional props are `undefined` when missing, which is already a default.
      'vue/require-default-prop': 'off',
    },
  },
)
