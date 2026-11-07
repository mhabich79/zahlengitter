<script setup lang="ts">
import { watch, computed } from "vue";
import { announce } from "@lernapps/tooling/a11y";
import { translator } from "@lernapps/tooling/i18n";
import type { Input } from "@lernapps/app-templates/interactive";
import type { State } from "../core/index.ts";
import de from "../messages/de.json";

const props = defineProps<{ state: State; lang: string }>();
const emit = defineEmits<{ input: [input: Input] }>();
const t = translator(de);

function emitAction(name: string, value?: string) {
  emit("input", { kind: "action", name, ...(value !== undefined ? { value } : {}) });
}

const isReverse = computed(() => props.state.route === "schwer");

const directionText = computed(() => {
  const { stepsH, stepsV } = props.state.task;
  const parts: string[] = [];
  if (stepsH > 0) parts.push(t("stepsRight", { n: stepsH }));
  if (stepsH < 0) parts.push(t("stepsLeft", { n: -stepsH }));
  if (stepsV > 0) parts.push(t("stepsDown", { n: stepsV }));
  if (stepsV < 0) parts.push(t("stepsUp", { n: -stepsV }));
  return parts.join(", dann ");
});

const explanationText = computed(() => {
  const { start, stepsH, stepsV, target } = props.state.task;
  if (stepsH !== 0 && stepsV !== 0) {
    const afterH = start + stepsH;
    const sh = stepsH > 0 ? t("stepsRight", { n: stepsH }) : t("stepsLeft", { n: -stepsH });
    const sv = stepsV > 0 ? t("stepsDown", { n: stepsV }) : t("stepsUp", { n: -stepsV });
    return t("explanation", { start, stepsH: sh, afterH, stepsV: sv, target });
  }
  if (stepsH !== 0) {
    const sh = stepsH > 0 ? t("stepsRight", { n: stepsH }) : t("stepsLeft", { n: -stepsH });
    return t("explanationHonly", { start, stepsH: sh, target });
  }
  const sv = stepsV > 0 ? t("stepsDown", { n: stepsV }) : t("stepsUp", { n: -stepsV });
  return t("explanationVonly", { start, stepsV: sv, target });
});

watch(
  () => props.state.phase,
  (phase) => {
    const { start, target } = props.state.task;
    if (phase === "correct") {
      announce(isReverse.value ? t("answeredCorrectReverse", { start }) : t("answeredCorrect", { target }));
    }
    if (phase === "wrong") {
      announce(isReverse.value ? t("answeredWrongReverse", { start }) : t("answeredWrong", { target }));
    }
    if (phase === "roundDone") announce(t("roundDone", { total: props.state.totalTasks }));
  },
);
</script>

<template>
  <section class="game" :aria-label="t('app')">
    <!-- Round done -->
    <div v-if="state.phase === 'roundDone'" class="feedback feedback--round">
      <p class="feedback__text">{{ t("roundDone", { total: state.totalTasks }) }}</p>
      <button type="button" class="btn btn--primary" @click="emitAction('neustart')">
        {{ t("neustart") }}
      </button>
    </div>

    <template v-else>
      <p class="task-counter">{{ t("taskCounter", { done: state.tasksDone + 1, total: state.totalTasks }) }}</p>

      <!-- Task card -->
      <div class="task-card" :aria-live="'polite'">
        <template v-if="isReverse">
          <p class="task-start">
            {{ t("reverseAt") }}: <strong>{{ state.task.target }}</strong>
          </p>
          <p class="task-directions">{{ t("reverseDirections", { directions: directionText }) }}</p>
          <p class="task-question">{{ t("questionReverse") }}</p>
        </template>
        <template v-else>
          <p class="task-start">
            {{ t("start") }}: <strong>{{ state.task.start }}</strong>
          </p>
          <p class="task-directions">{{ directionText }}</p>
          <p class="task-question">{{ t("question") }}</p>
        </template>
      </div>

      <!-- Input area (only during input phase) -->
      <div v-if="state.phase === 'input'" class="input-area">
        <label class="input-label" for="answer-input">{{ t("inputLabel") }}</label>
        <div class="input-row">
          <input
            id="answer-input"
            class="number-input"
            type="text"
            inputmode="numeric"
            pattern="[0-9]*"
            maxlength="3"
            autocomplete="off"
            :value="state.input"
            readonly
            :aria-label="t('inputLabel')"
          />
          <button
            type="button"
            class="btn btn--submit"
            :disabled="state.input.length === 0"
            @click="emitAction('submit')"
          >
            {{ t("submit") }}
          </button>
        </div>

        <!-- Number pad -->
        <div class="numpad" role="group" :aria-label="t('inputLabel')">
          <button
            v-for="d in ['1', '2', '3', '4', '5', '6', '7', '8', '9', '←', '0', '✓']"
            :key="d"
            type="button"
            :class="['numpad__key', d === '✓' ? 'numpad__key--ok' : d === '←' ? 'numpad__key--del' : '']"
            :aria-label="d === '←' ? 'Löschen' : d === '✓' ? t('submit') : d"
            :disabled="d === '✓' && state.input.length === 0"
            @click="d === '←' ? emitAction('backspace') : d === '✓' ? emitAction('submit') : emitAction('digit', d)"
          >
            {{ d }}
          </button>
        </div>
      </div>

      <!-- Feedback -->
      <div v-if="state.phase === 'correct'" class="feedback feedback--correct">
        <p class="feedback__text">
          {{
            isReverse ? t("correctReverse", { start: state.task.start }) : t("correct", { target: state.task.target })
          }}
        </p>
        <p class="feedback__explanation">{{ explanationText }}</p>
        <button type="button" class="btn btn--primary" @click="emitAction('weiter')">
          {{ t("weiter") }}
        </button>
      </div>

      <div v-if="state.phase === 'wrong'" class="feedback feedback--wrong">
        <p class="feedback__text">
          {{ isReverse ? t("wrongReverse", { start: state.task.start }) : t("wrong", { target: state.task.target }) }}
        </p>
        <p class="feedback__explanation">{{ explanationText }}</p>
        <button type="button" class="btn btn--primary" @click="emitAction('weiter')">
          {{ t("weiter") }}
        </button>
      </div>

      <!-- Grid toggle -->
      <button type="button" class="btn btn--help" @click="emitAction('toggleGrid')">
        {{ state.gridVisible ? t("hideGrid") : t("showGrid") }}
      </button>

      <!-- Hundred grid (hidden by default) -->
      <div v-if="state.gridVisible" class="grid-wrapper">
        <table class="grid" :aria-label="t('gridLabel')">
          <tbody>
            <tr v-for="r in 10" :key="r">
              <td
                v-for="c in 10"
                :key="c"
                :class="[
                  'cell',
                  (r - 1) * 10 + c === (isReverse ? state.task.target : state.task.start) ? 'cell--start' : '',
                ]"
                :aria-label="t('cell', { n: (r - 1) * 10 + c })"
              >
                {{ (r - 1) * 10 + c }}
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </template>
  </section>
</template>

<style scoped>
.game {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 1rem;
  padding: 1rem;
  max-width: 420px;
  margin: 0 auto;
}

.task-counter {
  font-size: 0.85rem;
  color: #666;
  margin: 0;
}

.task-card {
  background: #e8f5e9;
  border: 2px solid #2e7d32;
  border-radius: 12px;
  padding: 1.25rem 1.5rem;
  text-align: center;
  width: 100%;
}

.task-start {
  font-size: 1.4rem;
  margin: 0 0 0.5rem;
}

.task-start strong {
  font-size: 2rem;
  color: #1b5e20;
}

.task-directions {
  font-size: 1.3rem;
  font-weight: 600;
  color: #1565c0;
  margin: 0 0 0.75rem;
}

.task-question {
  font-size: 1.1rem;
  font-weight: 500;
  color: #333;
  margin: 0;
}

.input-area {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 0.75rem;
  width: 100%;
}

.input-label {
  font-size: 0.9rem;
  color: #555;
}

.input-row {
  display: flex;
  gap: 0.5rem;
  align-items: center;
}

.number-input {
  width: 5rem;
  font-size: 2rem;
  font-weight: 700;
  text-align: center;
  border: 2px solid #1565c0;
  border-radius: 8px;
  padding: 0.25rem 0.5rem;
  background: #f8f9fa;
  cursor: default;
  color: #0d47a1;
}

.numpad {
  display: grid;
  grid-template-columns: repeat(3, 3.5rem);
  gap: 0.4rem;
}

.numpad__key {
  height: 3.5rem;
  font-size: 1.4rem;
  font-weight: 600;
  border: 2px solid #90caf9;
  border-radius: 8px;
  background: #e3f2fd;
  color: #1565c0;
  cursor: pointer;
  transition:
    background 0.1s,
    transform 0.1s;
}

.numpad__key:active {
  transform: scale(0.93);
  background: #bbdefb;
}

.numpad__key--del {
  background: #fff3e0;
  border-color: #ffb74d;
  color: #e65100;
}

.numpad__key--ok {
  background: #e8f5e9;
  border-color: #66bb6a;
  color: #2e7d32;
}

.numpad__key:disabled {
  opacity: 0.4;
  cursor: default;
}

.btn {
  border: none;
  border-radius: 8px;
  cursor: pointer;
  font-size: 1rem;
  font-weight: 600;
  padding: 0.55rem 1.4rem;
  transition:
    background 0.15s,
    transform 0.1s;
}

.btn:active {
  transform: scale(0.96);
}

.btn--submit {
  background: #1565c0;
  color: #fff;
  font-size: 1rem;
}

.btn--submit:disabled {
  opacity: 0.4;
  cursor: default;
}

.btn--primary {
  background: #2e7d32;
  color: #fff;
  font-size: 1.1rem;
  padding: 0.6rem 1.8rem;
}

.btn--primary:hover {
  background: #1b5e20;
}

.btn--help {
  background: #f5f5f5;
  color: #555;
  border: 1px solid #ccc;
  font-size: 0.9rem;
  padding: 0.4rem 1rem;
}

.btn--help:hover {
  background: #eeeeee;
}

.feedback {
  width: 100%;
  text-align: center;
  padding: 1rem 1.25rem;
  border-radius: 10px;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 0.6rem;
}

.feedback--correct {
  background: #e8f5e9;
  border: 2px solid #2e7d32;
}

.feedback--wrong {
  background: #fff8e1;
  border: 2px solid #f9a825;
}

.feedback--round {
  background: #e8f5e9;
  border: 2px solid #2e7d32;
}

.feedback__text {
  font-size: 1.15rem;
  font-weight: 600;
  margin: 0;
  color: #1b5e20;
}

.feedback--wrong .feedback__text {
  color: #e65100;
}

.feedback__explanation {
  font-size: 0.95rem;
  color: #555;
  margin: 0;
}

.grid-wrapper {
  width: 100%;
}

.grid {
  border-collapse: separate;
  border-spacing: 2px;
  width: 100%;
  max-width: 400px;
  margin: 0 auto;
  display: block;
  table-layout: fixed;
}

.cell {
  width: 10%;
  aspect-ratio: 1;
  text-align: center;
  vertical-align: middle;
  font-size: clamp(0.6rem, 2.2vw, 1rem);
  font-weight: 500;
  border-radius: 4px;
  background: #f5f5f5;
  border: 1px solid #ddd;
}

.cell--start {
  background: #c8e6c9;
  border-color: #2e7d32;
  color: #1b5e20;
  font-weight: 700;
}

@media (max-width: 380px) {
  .numpad {
    grid-template-columns: repeat(3, 3rem);
    gap: 0.3rem;
  }

  .numpad__key {
    height: 3rem;
    font-size: 1.2rem;
  }
}

@media (prefers-color-scheme: dark) {
  .game {
    color: #e0e0e0;
  }

  .task-counter {
    color: #aaa;
  }

  .task-card {
    background: #1a2e1b;
    border-color: #4caf50;
  }

  .task-start strong {
    color: #81c784;
  }

  .task-directions {
    color: #90caf9;
  }

  .task-question {
    color: #e0e0e0;
  }

  .input-label {
    color: #bbb;
  }

  .number-input {
    background: #1a1a2e;
    border-color: #42a5f5;
    color: #90caf9;
  }

  .numpad__key {
    background: #1e3a5f;
    border-color: #42a5f5;
    color: #90caf9;
  }

  .numpad__key:active {
    background: #174280;
  }

  .numpad__key--del {
    background: #3e2a00;
    border-color: #ffb74d;
    color: #ffcc80;
  }

  .numpad__key--ok {
    background: #1b3a1c;
    border-color: #66bb6a;
    color: #a5d6a7;
  }

  .btn--submit {
    background: #1565c0;
    color: #fff;
  }

  .btn--primary {
    background: #2e7d32;
    color: #fff;
  }

  .btn--primary:hover {
    background: #388e3c;
  }

  .btn--help {
    background: #2a2a2a;
    color: #ccc;
    border-color: #555;
  }

  .btn--help:hover {
    background: #333;
  }

  .feedback--correct {
    background: #1a2e1b;
    border-color: #4caf50;
  }

  .feedback--correct .feedback__text {
    color: #a5d6a7;
  }

  .feedback--wrong {
    background: #2d2000;
    border-color: #f9a825;
  }

  .feedback--wrong .feedback__text {
    color: #ffcc80;
  }

  .feedback--round {
    background: #1a2e1b;
    border-color: #4caf50;
  }

  .feedback--round .feedback__text {
    color: #a5d6a7;
  }

  .feedback__explanation {
    color: #bbb;
  }

  .cell {
    background: #2a2a2a;
    border-color: #444;
    color: #ddd;
  }

  .cell--start {
    background: #1b3a1c;
    border-color: #4caf50;
    color: #a5d6a7;
  }
}
</style>
