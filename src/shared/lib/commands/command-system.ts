/**
 * Command System for Undo/Redo
 *
 * Implements the Command pattern to enable undo/redo functionality for all
 * entity mutations in the diagram canvas. This system provides:
 *
 * - Command interface with execute() and undo() methods
 * - CommandHistory class to manage the command stack
 * - Support for command grouping and composite operations
 * - Configurable history limits
 *
 * @example
 * ```typescript
 * // Create command history
 * const history = new CommandHistory();
 *
 * // Execute a command
 * const command = new AddShapeCommand(shape, addShapeFn, deleteShapeFn);
 * history.execute(command);
 *
 * // Undo the command
 * if (history.canUndo()) {
 *   history.undo();
 * }
 *
 * // Redo the command
 * if (history.canRedo()) {
 *   history.redo();
 * }
 * ```
 */

/**
 * Command interface representing an undoable/redoable operation.
 *
 * All commands must implement both execute() and undo() methods.
 * The undo() method must perfectly reverse the effects of execute().
 */
export interface Command {
  /**
   * Execute the command, applying its changes to the application state.
   *
   * This method should:
   * - Perform the intended operation (add, delete, update entity)
   * - Store any state needed for undo
   * - Be idempotent when possible
   */
  execute(): void;

  /**
   * Undo the command, reversing the changes made by execute().
   *
   * This method should:
   * - Restore state to exactly what it was before execute()
   * - Handle cascade operations (e.g., restore deleted connectors)
   * - Be idempotent when possible
   */
  undo(): void;

  /**
   * Optional description of the command for debugging/UI display.
   */
  description?: string;
}

/**
 * Configuration options for CommandHistory.
 */
export interface CommandHistoryConfig {
  /**
   * Maximum number of commands to store in history.
   * When exceeded, oldest commands are removed.
   *
   * @default 50
   */
  maxHistorySize?: number;
}

/**
 * Manages a stack of commands with undo/redo functionality.
 *
 * The CommandHistory maintains two stacks:
 * - Past commands (can be undone)
 * - Future commands (can be redone after undo)
 *
 * When a new command is executed after an undo, all future commands
 * are discarded (standard undo/redo behavior).
 */
export class CommandHistory {
  /**
   * Stack of commands that have been executed (can be undone).
   * Most recent command is at the end of the array.
   */
  private undoStack: Command[] = [];

  /**
   * Stack of commands that have been undone (can be redone).
   * Most recent undone command is at the end of the array.
   */
  private redoStack: Command[] = [];

  /**
   * Maximum number of commands to store in history.
   */
  private maxHistorySize: number;

  /**
   * Creates a new CommandHistory instance.
   *
   * @param config - Configuration options
   */
  constructor(config: CommandHistoryConfig = {}) {
    this.maxHistorySize = config.maxHistorySize ?? 50;
  }

  /**
   * Execute a command and add it to the history.
   *
   * This method:
   * 1. Executes the command
   * 2. Adds it to the undo stack
   * 3. Clears the redo stack (executing a new command invalidates future)
   * 4. Enforces history size limits
   *
   * @param command - The command to execute
   *
   * @example
   * ```typescript
   * const command = new AddShapeCommand(shape, addShapeFn, deleteShapeFn);
   * history.execute(command);
   * ```
   */
  execute(command: Command): void {
    // Execute the command
    command.execute();

    // Add to undo stack
    this.undoStack.push(command);

    // Clear redo stack (new execution invalidates future)
    this.redoStack = [];

    // Enforce history size limit
    if (this.undoStack.length > this.maxHistorySize) {
      this.undoStack.shift(); // Remove oldest command
    }
  }

  /**
   * Undo the most recent command.
   *
   * Moves the command from the undo stack to the redo stack
   * and calls its undo() method.
   *
   * @returns true if undo was successful, false if nothing to undo
   *
   * @example
   * ```typescript
   * if (history.canUndo()) {
   *   history.undo();
   * }
   * ```
   */
  undo(): boolean {
    const command = this.undoStack.pop();
    if (!command) {
      return false;
    }

    // Undo the command
    command.undo();

    // Move to redo stack
    this.redoStack.push(command);

    return true;
  }

  /**
   * Redo the most recently undone command.
   *
   * Moves the command from the redo stack to the undo stack
   * and calls its execute() method again.
   *
   * @returns true if redo was successful, false if nothing to redo
   *
   * @example
   * ```typescript
   * if (history.canRedo()) {
   *   history.redo();
   * }
   * ```
   */
  redo(): boolean {
    const command = this.redoStack.pop();
    if (!command) {
      return false;
    }

    // Re-execute the command
    command.execute();

    // Move back to undo stack
    this.undoStack.push(command);

    return true;
  }

  /**
   * Check if there are commands that can be undone.
   *
   * @returns true if undo stack is not empty
   */
  canUndo(): boolean {
    return this.undoStack.length > 0;
  }

  /**
   * Check if there are commands that can be redone.
   *
   * @returns true if redo stack is not empty
   */
  canRedo(): boolean {
    return this.redoStack.length > 0;
  }

  /**
   * Clear all command history (both undo and redo stacks).
   *
   * This is useful when:
   * - Loading a new document
   * - Resetting the application state
   * - Implementing a "clear history" feature
   *
   * @example
   * ```typescript
   * history.clear();
   * console.log(history.canUndo()); // false
   * console.log(history.canRedo()); // false
   * ```
   */
  clear(): void {
    this.undoStack = [];
    this.redoStack = [];
  }

  /**
   * Get the number of commands in the undo stack.
   *
   * @returns Number of commands that can be undone
   */
  getUndoCount(): number {
    return this.undoStack.length;
  }

  /**
   * Get the number of commands in the redo stack.
   *
   * @returns Number of commands that can be redone
   */
  getRedoCount(): number {
    return this.redoStack.length;
  }

  /**
   * Get a description of the next command that would be undone.
   *
   * Useful for UI display (e.g., "Undo: Add Rectangle").
   *
   * @returns Description of the next undo command, or null if none
   */
  getUndoDescription(): string | null {
    const command = this.undoStack[this.undoStack.length - 1];
    return command?.description ?? null;
  }

  /**
   * Get a description of the next command that would be redone.
   *
   * Useful for UI display (e.g., "Redo: Add Rectangle").
   *
   * @returns Description of the next redo command, or null if none
   */
  getRedoDescription(): string | null {
    const command = this.redoStack[this.redoStack.length - 1];
    return command?.description ?? null;
  }

  /**
   * Get all undo command descriptions (for debugging/UI).
   *
   * @returns Array of descriptions, most recent last
   */
  getUndoHistory(): string[] {
    return this.undoStack.map((cmd) => cmd.description ?? 'Unknown command');
  }

  /**
   * Get all redo command descriptions (for debugging/UI).
   *
   * @returns Array of descriptions, most recent last
   */
  getRedoHistory(): string[] {
    return this.redoStack.map((cmd) => cmd.description ?? 'Unknown command');
  }
}
