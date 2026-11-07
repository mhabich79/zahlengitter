<script setup lang="ts">
import { watch } from "vue";
import { announce } from "@lernapps/tooling/a11y";
import { translator } from "@lernapps/tooling/i18n";
import type { Input } from "@lernapps/app-templates/interactive";
import type { State } from "../core/index.ts";
import de from "../messages/de.json";

const props = defineProps<{ state: State; lang: string }>();
const emit = defineEmits<{ input: [input: Input] }>();
const t = translator(de);

function cellClass(n: number): string {
  if (n === props.state.position && props.state.solved) return "cell cell--solved";
  if (n === props.state.position) return "cell cell--current";
  if (n === props.state.task.target) return "cell cell--target";
  if (n === props.state.task.start) return "cell cell--start";
  return "cell";
}

function emitMove(name: string) {
  emit("input", { kind: "action", name });
}

watch(
  () => props.state.position,
  (pos) => {
    if (props.state.solved) {
      announce(t("reachedTarget", { target: props.state.task.target }));
    } else {
      announce(t("movedTo", { position: pos }));
    }
  },
);

watch(
  () => props.state.roundDone,
  (done) => {
    if (done) announce(t("roundDone", { total: props.state.totalTasks }));
  },
);
</script>

<template>
  <section class="game" :aria-label="t('app')">
    <div v-if="state.roundDone" class="feedback feedback--round">
      <p>{{ t("roundDone", { total: state.totalTasks }) }}</p>
      <button type="button" class="btn btn--primary" @click="emit('input', { kind: 'action', name: 'neustart' })">
        {{ t("neustart") }}
      </button>
    </div>

    <template v-else>
      <div class="task-info">
        <span class="task-counter">{{ t("taskCounter", { done: state.tasksDone + 1, total: state.totalTasks }) }}</span>
        <span class="task-start"
          >{{ t("start") }}: <strong>{{ state.task.start }}</strong></span
        >
        <span class="task-target"
          >{{ t("target") }}: <strong>{{ state.task.target }}</strong></span
        >
        <span class="task-pos"
          >{{ t("position") }}: <strong>{{ state.position }}</strong></span
        >
      </div>

      <table class="grid" :aria-label="t('gridLabel')">
        <tbody>
          <tr v-for="row in 11" :key="row">
            <td
              v-for="col in 11"
              :key="col"
              :class="cellClass((row - 1) * 11 + (col - 1))"
              :aria-label="t('cell', { n: (row - 1) * 11 + (col - 1) })"
              :aria-current="(row - 1) * 11 + (col - 1) === state.position ? 'true' : undefined"
            >
              {{ (row - 1) * 11 + (col - 1) }}
            </td>
          </tr>
        </tbody>
      </table>

      <div v-if="state.solved" class="feedback feedback--solved">
        <p>{{ t("solved", { target: state.task.target }) }}</p>
        <button type="button" class="btn btn--primary" @click="emit('input', { kind: 'action', name: 'weiter' })">
          {{ t("weiter") }}
        </button>
      </div>

      <div
        v-else
        class="controls"
        :aria-label="t('arrowUp') + ', ' + t('arrowDown') + ', ' + t('arrowLeft') + ', ' + t('arrowRight')"
      >
        <div class="controls__row">
          <button type="button" class="btn btn--arrow" :aria-label="t('arrowUp')" @click="emitMove('oben')">↑</button>
        </div>
        <div class="controls__row">
          <button type="button" class="btn btn--arrow" :aria-label="t('arrowLeft')" @click="emitMove('links')">
            ←
          </button>
          <button type="button" class="btn btn--arrow" :aria-label="t('arrowDown')" @click="emitMove('unten')">
            ↓
          </button>
          <button type="button" class="btn btn--arrow" :aria-label="t('arrowRight')" @click="emitMove('rechts')">
            →
          </button>
        </div>
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
  font-family: inherit;
}

.task-info {
  display: flex;
  flex-wrap: wrap;
  gap: 0.75rem 1.5rem;
  font-size: 1.1rem;
  justify-content: center;
}

.task-counter {
  width: 100%;
  text-align: center;
  color: #555;
  font-size: 0.9rem;
}

.task-start strong {
  color: #1b5e20;
}
.task-target strong {
  color: #bf360c;
}
.task-pos strong {
  color: #0d47a1;
}

.grid {
  border-collapse: separate;
  border-spacing: 2px;
  width: 100%;
  max-width: 440px;
  table-layout: fixed;
}

.cell {
  width: calc(100% / 11);
  aspect-ratio: 1;
  text-align: center;
  vertical-align: middle;
  font-size: clamp(0.55rem, 2vw, 0.9rem);
  font-weight: 500;
  border-radius: 4px;
  background: #f5f5f5;
  border: 1px solid #ddd;
  cursor: default;
  transition: background 0.15s;
}

.cell--start {
  background: #c8e6c9;
  border-color: #2e7d32;
  color: #1b5e20;
  font-weight: 700;
}

.cell--target {
  background: #fff3e0;
  border-color: #bf360c;
  color: #7f2205;
  font-weight: 700;
}

.cell--current {
  background: #bbdefb;
  border-color: #1565c0;
  color: #0d47a1;
  font-weight: 700;
  box-shadow: 0 0 0 2px #1565c0;
}

.cell--solved {
  background: #a5d6a7;
  border-color: #2e7d32;
  color: #1b5e20;
  font-weight: 700;
  box-shadow: 0 0 0 2px #2e7d32;
}

.controls {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 0.4rem;
}

.controls__row {
  display: flex;
  gap: 0.4rem;
}

.btn {
  border: none;
  border-radius: 8px;
  cursor: pointer;
  font-size: 1rem;
  font-weight: 600;
  padding: 0.5rem 1rem;
  transition:
    background 0.15s,
    transform 0.1s;
}

.btn:active {
  transform: scale(0.95);
}

.btn--arrow {
  width: 3rem;
  height: 3rem;
  font-size: 1.4rem;
  background: #e3f2fd;
  color: #1565c0;
  border: 2px solid #90caf9;
  border-radius: 50%;
  padding: 0;
}

.btn--arrow:hover {
  background: #bbdefb;
}

.btn--primary {
  background: #2e7d32;
  color: #fff;
  padding: 0.6rem 1.8rem;
  font-size: 1.1rem;
}

.btn--primary:hover {
  background: #1b5e20;
}

.feedback {
  text-align: center;
  padding: 0.75rem 1rem;
  border-radius: 8px;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 0.75rem;
}

.feedback--solved {
  background: #e8f5e9;
  border: 2px solid #2e7d32;
  color: #1b5e20;
  font-size: 1.1rem;
}

.feedback--round {
  background: #fff8e1;
  border: 2px solid #f9a825;
  color: #333;
  font-size: 1.2rem;
}

@media (max-width: 380px) {
  .cell {
    font-size: 0.5rem;
  }
  .btn--arrow {
    width: 2.5rem;
    height: 2.5rem;
    font-size: 1.2rem;
  }
}
</style>
