import type { Input } from "@lernapps/app-templates/interactive";

export type Route = "leicht" | "mittel" | "schwer";

export interface Task {
  start: number;
  stepsH: number; // horizontal steps: positive = right, negative = left
  stepsV: number; // vertical steps: positive = down, negative = up
  target: number;
}

export type Phase = "input" | "correct" | "wrong" | "roundDone";

export interface State {
  seed: number;
  route: Route;
  task: Task;
  taskIndex: number;
  tasksDone: number;
  totalTasks: number;
  phase: Phase;
  input: string;
  gridVisible: boolean;
}

const TOTAL_TASKS = 5;
const COLS = 10;
const MIN = 1;
const MAX = 100;

function lcg(seed: number): number {
  return (seed * 1664525 + 1013904223) & 0xffffffff;
}

function randomInt(seed: number, min: number, max: number): [number, number] {
  const next = lcg(seed);
  const value = min + (Math.abs(next) % (max - min + 1));
  return [value, next];
}

function colOf(n: number): number {
  return ((n - 1) % COLS) + 1;
}

function rowOf(n: number): number {
  return Math.ceil(n / COLS);
}

function generateTask(seed: number, taskIndex: number, route: Route): Task {
  let s = lcg(seed + taskIndex * 997 + 1);

  let start: number;
  let stepsH: number;
  let stepsV: number;

  if (route === "leicht") {
    // Only one direction
    const [dirType, s1] = randomInt(s, 0, 1);
    s = s1;
    if (dirType === 0) {
      // horizontal only
      const [startVal, s2] = randomInt(s, MIN, MAX);
      s = s2;
      start = startVal;
      const [steps, s3] = randomInt(s, 1, 5);
      s = s3;
      const [goRight, s4] = randomInt(s, 0, 1);
      s = s4;
      const c = colOf(start);
      if (goRight === 1 && c + steps <= COLS) {
        stepsH = steps;
      } else if (c - steps >= 1) {
        stepsH = -steps;
      } else {
        stepsH = COLS - c > 0 ? COLS - c : -(c - 1);
      }
      stepsV = 0;
    } else {
      // vertical only
      const [startVal, s2] = randomInt(s, 11, 90);
      s = s2;
      start = startVal;
      const [steps, s3] = randomInt(s, 1, 3);
      s = s3;
      const [goDown, s4] = randomInt(s, 0, 1);
      s = s4;
      const r = rowOf(start);
      if (goDown === 1 && r + steps <= MAX / COLS) {
        stepsV = steps;
      } else if (r - steps >= 1) {
        stepsV = -steps;
      } else {
        stepsV = MAX / COLS - r > 0 ? 1 : -1;
      }
      stepsH = 0;
    }
  } else if (route === "mittel") {
    // Both directions, no wrap
    const [startVal, s1] = randomInt(s, 12, 89);
    s = s1;
    start = startVal;
    const [absH, s2] = randomInt(s, 1, 4);
    s = s2;
    const [dirH, s3] = randomInt(s, 0, 1);
    s = s3;
    const [absV, s4] = randomInt(s, 1, 3);
    s = s4;
    const [dirV, s5] = randomInt(s, 0, 1);
    s = s5;
    const c = colOf(start);
    const r = rowOf(start);
    stepsH = dirH === 1 ? Math.min(absH, COLS - c) : -Math.min(absH, c - 1);
    stepsV = dirV === 1 ? Math.min(absV, MAX / COLS - r) : -Math.min(absV, r - 1);
    if (stepsH === 0) stepsH = c < COLS ? 1 : -1;
    if (stepsV === 0) stepsV = r < MAX / COLS ? 1 : -1;
  } else {
    // schwer: larger steps, both directions
    const [startVal, s1] = randomInt(s, 13, 88);
    s = s1;
    start = startVal;
    const [absH, s2] = randomInt(s, 1, 5);
    s = s2;
    const [dirH, s3] = randomInt(s, 0, 1);
    s = s3;
    const [absV, s4] = randomInt(s, 1, 4);
    s = s4;
    const [dirV, s5] = randomInt(s, 0, 1);
    s = s5;
    const c = colOf(start);
    const r = rowOf(start);
    stepsH = dirH === 1 ? Math.min(absH, COLS - c) : -Math.min(absH, c - 1);
    stepsV = dirV === 1 ? Math.min(absV, MAX / COLS - r) : -Math.min(absV, r - 1);
    if (stepsH === 0) stepsH = c < COLS ? 1 : -1;
    if (stepsV === 0) stepsV = r < MAX / COLS ? 1 : -1;
  }

  const target = start + stepsH + stepsV * COLS;
  return { start, stepsH, stepsV, target };
}

function isValidRoute(route: string): route is Route {
  return route === "leicht" || route === "mittel" || route === "schwer";
}

export function start(seed: number, route?: string): State {
  const r: Route = isValidRoute(route ?? "") ? (route as Route) : "leicht";
  const task = generateTask(seed, 0, r);
  return {
    seed,
    route: r,
    task,
    taskIndex: 0,
    tasksDone: 0,
    totalTasks: TOTAL_TASKS,
    phase: "input",
    input: "",
    gridVisible: false,
  };
}

export function step(state: State, input: Input): State {
  if (state.phase === "roundDone") {
    if (input.kind === "action" && input.name === "neustart") {
      const newTask = generateTask(state.seed, 0, state.route);
      return {
        ...state,
        task: newTask,
        taskIndex: 0,
        tasksDone: 0,
        phase: "input",
        input: "",
        gridVisible: false,
      };
    }
    return state;
  }

  if (state.phase === "correct" || state.phase === "wrong") {
    if (input.kind === "action" && input.name === "weiter") {
      const nextIndex = state.taskIndex + 1;
      const tasksDone = state.tasksDone + 1;
      if (tasksDone >= state.totalTasks) {
        return { ...state, tasksDone, phase: "roundDone", gridVisible: false };
      }
      const newTask = generateTask(state.seed, nextIndex, state.route);
      return {
        ...state,
        task: newTask,
        taskIndex: nextIndex,
        tasksDone,
        phase: "input",
        input: "",
        gridVisible: false,
      };
    }
    return state;
  }

  // phase === "input"
  if (input.kind === "action") {
    if (input.name === "toggleGrid") {
      return { ...state, gridVisible: !state.gridVisible };
    }
    if (input.name === "digit" && input.value !== undefined) {
      if (state.input.length >= 3) return state;
      return { ...state, input: state.input + String(input.value) };
    }
    if (input.name === "backspace") {
      return { ...state, input: state.input.slice(0, -1) };
    }
    if (input.name === "submit") {
      const entered = parseInt(state.input, 10);
      if (isNaN(entered)) return state;
      const phase: Phase = entered === state.task.target ? "correct" : "wrong";
      return { ...state, phase };
    }
  }

  if (input.kind === "key") {
    if (/^[0-9]$/.test(input.key) && state.input.length < 3) {
      return { ...state, input: state.input + input.key };
    }
    if (input.key === "Backspace") {
      return { ...state, input: state.input.slice(0, -1) };
    }
    if (input.key === "Enter" && state.input.length > 0) {
      const entered = parseInt(state.input, 10);
      if (isNaN(entered)) return state;
      const phase: Phase = entered === state.task.target ? "correct" : "wrong";
      return { ...state, phase };
    }
  }

  return state;
}
