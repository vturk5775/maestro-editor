import { state, loadPage } from './core.js';

let undoStack = [];
let redoStack = [];
const MAX_STACK = 50;

export function saveHistory() {
    undoStack.push(JSON.stringify({ pages: state.pages, currentPageId: state.currentPageId }));
    if (undoStack.length > MAX_STACK) undoStack.shift();
    redoStack = [];
}

export function undo() {
    if (undoStack.length === 0) return;
    redoStack.push(JSON.stringify({ pages: state.pages, currentPageId: state.currentPageId }));
    const last = JSON.parse(undoStack.pop());
    state.pages = last.pages;
    state.currentPageId = last.currentPageId;
    window.loadPage(state.currentPageId);
}

export function redo() {
    if (redoStack.length === 0) return;
    undoStack.push(JSON.stringify({ pages: state.pages, currentPageId: state.currentPageId }));
    const next = JSON.parse(redoStack.pop());
    state.pages = next.pages;
    state.currentPageId = next.currentPageId;
    window.loadPage(state.currentPageId);
}

window.undo = undo;
window.redo = redo;
