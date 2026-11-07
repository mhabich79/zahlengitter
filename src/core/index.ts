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
  wrongStep: boolean;
}

const TOTAL_TASKS = 5;
const MIN = 0;
const MAX = 100;

function lcg(seed: number): number {
  return (seed * 1664525 + 1013904223) & 0xffffffff;
}

function randomInt(seed: number, min: number, max: number): [number, number] {
  const next = lcg(seed);
  const value = min + (Math.abs(next) % (max - min + 1));
  return [value, next];
}

function generateTask(seed: number, taskIndex: number, route: Route): Task {
  let s = lcg(seed + taskIndex * 997);

  let start: number;
  let target: number;

  if (route === "leicht") {
    // Only one direction: either horizontal (±1..±9) or vertical (±10, ±20, ±30)
    const [dirType, s1] = randomInt(s, 0, 1);
    s = s1;
    if (dirType === 0) {
      // horizontal only
      const [col, s2] = randomInt(s, 1, 9);
      s = s2;
      const [steps, s3] = randomInt(s, 1, 5);
      s = s3;
      const [goRight, s4] = randomInt(s, 0, 1);
      s = s4;
      const row = Math.floor(col / 11) * 11;
      start = Math.floor(Math.abs(s) % 9) + row + 1;
      if (start > MAX) start = 1;
      const maxRight = 10 - (start % 11);
      const maxLeft = start % 11;
      if (goRight === 1 && maxRight >= 1) {
        const actualSteps = Math.min(steps, maxRight);
        target = start + actualSteps;
      } else if (maxLeft >= 1) {
        const actualSteps = Math.min(steps, maxLeft);
        target = start - actualSteps;
      } else {
        target = start + 1;
      }
    } else {
      // vertical only: steps of ±11 (one row = 11 cells)
      const [startVal, s2] = randomInt(s, 11, 89);
      s = s2;
      start = startVal;
      const [steps, s3] = randomInt(s, 1, 3);
      s = s3;
      const [goDown, s4] = randomInt(s, 0, 1);
      s = s4;
      if (goDown === 1 && start + steps * 11 <= MAX) {
        target = start + steps * 11;
      } else if (start - steps * 11 >= MIN) {
        target = start - steps * 11;
      } else {
        target = start + 11;
        if (target > MAX) target = start - 11;
      }
    }
  } else if (route === "mittel") {
    // Combined: both directions
    const [startVal, s1] = randomInt(s, 11, 88);
    s = s1;
    start = startVal;
    const [dh, s2] = randomInt(s, -4, 4);
    s = s2;
    const [dv, s3] = randomInt(s, -3, 3);
    s = s3;
    const col = start % 11;
    const row = Math.floor(start / 11);
    const newCol = Math.max(0, Math.min(10, col + dh));
    const newRow = Math.max(0, Math.min(10, row + dv));
    target = newRow * 11 + newCol;
    if (target === start) {
      target = start + 1 <= MAX ? start + 1 : start - 1;
    }
  } else {
    // schwer: Umkehraufgaben — same as mittel, but learner navigates backwards
    const [startVal, s1] = randomInt(s, 11, 88);
    s = s1;
    const intermediate = startVal;
    const [dh, s2] = randomInt(s, -3, 3);
    s = s2;
    const [dv, s3] = randomInt(s, -2, 2);
    s = s3;
    const col = intermediate % 11;
    const row = Math.floor(intermediate / 11);
    const newCol = Math.max(0, Math.min(10, col + dh));
    const newRow = Math.max(0, Math.min(10, row + dv));
    const endVal = newRow * 11 + newCol;
    // In schwer: start is the "end" of a path, target is where you came from
    start = endVal !== intermediate ? endVal : endVal + 11 <= MAX ? endVal + 11 : endVal - 11;
    target = intermediate;
  }

  // Clamp to valid range
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
    wrongStep: false,
  };
}

function movePosition(position: number, action: string): number {
  const col = position % 11;
  const row = Math.floor(position / 11);
  if (action === "rechts" && col < 10) return position + 1;
  if (action === "links" && col > 0) return position - 1;
  if (action === "unten" && row < 10) return position + 11;
  if (action === "oben" && row > 0) return position - 11;
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
        wrongStep: false,
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
        wrongStep: false,
      };
    }
    return state;
  }

  const moveActions = ["rechts", "links", "unten", "oben"];

  if (input.kind === "action" && moveActions.includes(input.name)) {
    const newPos = movePosition(state.position, input.name);
    if (newPos === state.position) return { ...state, wrongStep: false };
    const solved = newPos === state.task.target;
    return { ...state, position: newPos, solved, wrongStep: false };
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
      if (newPos === state.position) return { ...state, wrongStep: false };
      const solved = newPos === state.task.target;
      return { ...state, position: newPos, solved, wrongStep: false };
    }
  }

  return state;
}
