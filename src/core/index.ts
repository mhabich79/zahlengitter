import type { Input } from "@lernapps/app-templates/interactive";

export type Route = "leicht" | "mittel" | "schwer";

export interface Task {
  start: number;
  target: number;
}

export interface State {
  seed: number;
  route: Route;
  task: Task;
  taskIndex: number;
  position: number;
  tasksDone: number;
  totalTasks: number;
  solved: boolean;
  roundDone: boolean;
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

function col(n: number): number {
  return ((n - 1) % COLS) + 1;
}

function row(n: number): number {
  return Math.ceil(n / COLS);
}

function generateTask(seed: number, taskIndex: number, route: Route): Task {
  let s = lcg(seed + taskIndex * 997);

  let start: number;
  let target: number;

  if (route === "leicht") {
    const [dirType, s1] = randomInt(s, 0, 1);
    s = s1;
    if (dirType === 0) {
      // horizontal only: ±1 bis ±5
      const [startVal, s2] = randomInt(s, MIN, MAX);
      s = s2;
      start = startVal;
      const [steps, s3] = randomInt(s, 1, 5);
      s = s3;
      const [goRight, s4] = randomInt(s, 0, 1);
      s = s4;
      const c = col(start);
      if (goRight === 1 && c + steps <= COLS) {
        target = start + steps;
      } else if (c - steps >= 1) {
        target = start - steps;
      } else if (c + Math.min(steps, COLS - c) <= COLS) {
        target = start + Math.min(steps, COLS - c);
      } else {
        target = start - 1;
      }
    } else {
      // vertical only: ±10, ±20, ±30
      const [startVal, s2] = randomInt(s, 11, 90);
      s = s2;
      start = startVal;
      const [steps, s3] = randomInt(s, 1, 3);
      s = s3;
      const [goDown, s4] = randomInt(s, 0, 1);
      s = s4;
      if (goDown === 1 && start + steps * COLS <= MAX) {
        target = start + steps * COLS;
      } else if (start - steps * COLS >= MIN) {
        target = start - steps * COLS;
      } else {
        target = start + COLS <= MAX ? start + COLS : start - COLS;
      }
    }
  } else if (route === "mittel") {
    const [startVal, s1] = randomInt(s, 12, 89);
    s = s1;
    start = startVal;
    const [dh, s2] = randomInt(s, -4, 4);
    s = s2;
    const [dv, s3] = randomInt(s, -3, 3);
    s = s3;
    const c = col(start);
    const r = row(start);
    const newCol = Math.max(1, Math.min(COLS, c + dh));
    const newRow = Math.max(1, Math.min(MAX / COLS, r + dv));
    target = (newRow - 1) * COLS + newCol;
    if (target === start || target < MIN || target > MAX) {
      target = start + 1 <= MAX ? start + 1 : start - 1;
    }
  } else {
    // schwer: Umkehraufgaben
    const [startVal, s1] = randomInt(s, 12, 89);
    s = s1;
    const intermediate = startVal;
    const [dh, s2] = randomInt(s, -3, 3);
    s = s2;
    const [dv, s3] = randomInt(s, -2, 2);
    s = s3;
    const c = col(intermediate);
    const r = row(intermediate);
    const newCol = Math.max(1, Math.min(COLS, c + dh));
    const newRow = Math.max(1, Math.min(MAX / COLS, r + dv));
    const endVal = (newRow - 1) * COLS + newCol;
    start = endVal !== intermediate ? endVal : endVal + COLS <= MAX ? endVal + COLS : endVal - COLS;
    target = intermediate;
    if (start < MIN || start > MAX || target < MIN || target > MAX) {
      start = 56;
      target = 34;
    }
  }

  if (start < MIN) start = MIN;
  if (start > MAX) start = MAX;
  if (target < MIN) target = MIN;
  if (target > MAX) target = MAX;
  if (target === start) {
    target = start + 1 <= MAX ? start + 1 : start - 1;
  }

  return { start, target };
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
    position: task.start,
    tasksDone: 0,
    totalTasks: TOTAL_TASKS,
    solved: false,
    roundDone: false,
  };
}

function movePosition(position: number, action: string): number {
  const c = col(position);
  const r = row(position);
  if (action === "rechts" && c < COLS) return position + 1;
  if (action === "links" && c > 1) return position - 1;
  if (action === "unten" && r < MAX / COLS) return position + COLS;
  if (action === "oben" && r > 1) return position - COLS;
  return position;
}

export function step(state: State, input: Input): State {
  if (state.roundDone) {
    if (input.kind === "action" && input.name === "neustart") {
      const newTask = generateTask(state.seed, 0, state.route);
      return {
        ...state,
        task: newTask,
        taskIndex: 0,
        position: newTask.start,
        tasksDone: 0,
        solved: false,
        roundDone: false,
      };
    }
    return state;
  }

  if (state.solved) {
    if (input.kind === "action" && input.name === "weiter") {
      const nextIndex = state.taskIndex + 1;
      const tasksDone = state.tasksDone + 1;
      if (tasksDone >= state.totalTasks) {
        return { ...state, tasksDone, roundDone: true, solved: false };
      }
      const newTask = generateTask(state.seed, nextIndex, state.route);
      return {
        ...state,
        task: newTask,
        taskIndex: nextIndex,
        position: newTask.start,
        tasksDone,
        solved: false,
      };
    }
    return state;
  }

  const moveActions = ["rechts", "links", "unten", "oben"];

  if (input.kind === "action" && moveActions.includes(input.name)) {
    const newPos = movePosition(state.position, input.name);
    if (newPos === state.position) return state;
    const solved = newPos === state.task.target;
    return { ...state, position: newPos, solved };
  }

  if (input.kind === "key") {
    const keyMap: Record<string, string> = {
      ArrowRight: "rechts",
      ArrowLeft: "links",
      ArrowDown: "unten",
      ArrowUp: "oben",
    };
    const action = keyMap[input.key];
    if (action !== undefined) {
      const newPos = movePosition(state.position, action);
      if (newPos === state.position) return state;
      const solved = newPos === state.task.target;
      return { ...state, position: newPos, solved };
    }
  }

  return state;
}
