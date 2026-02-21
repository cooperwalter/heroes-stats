#!/bin/bash
set -euo pipefail

# Usage:
#   ./loop-task.sh "task description" [max_iterations]
# Examples:
#   ./loop-task.sh "fix the login bug"          # 5 iterations (default)
#   ./loop-task.sh "add user auth" 10           # 10 iterations

if [ -z "${1:-}" ]; then
    echo "Error: task description is required"
    echo "Usage: ./loop-task.sh \"task description\" [max_iterations]"
    exit 1
fi

TASK_DESCRIPTION="$1"
MAX_ITERATIONS="${2:-5}"
PROMPT_FILE="PROMPT_task.md"
ITERATION=0
CURRENT_BRANCH=$(git branch --show-current)

if [ ! -f "$PROMPT_FILE" ]; then
    echo "Error: $PROMPT_FILE not found"
    exit 1
fi

echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "Mode:   task"
echo "Branch: $CURRENT_BRANCH"
echo "Task:   $TASK_DESCRIPTION"
echo "Prompt: $PROMPT_FILE"
echo "Max:    $MAX_ITERATIONS iterations"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"

export TASK="$TASK_DESCRIPTION"

while true; do
    if [ "$ITERATION" -ge "$MAX_ITERATIONS" ]; then
        echo "Reached max iterations: $MAX_ITERATIONS"
        break
    fi

    ITERATION=$((ITERATION + 1))
    echo -e "\n======================== LOOP $ITERATION / $MAX_ITERATIONS ========================\n"

    envsubst < "$PROMPT_FILE" | claude -p \
        --dangerously-skip-permissions \
        --output-format=stream-json \
        --model opus \
        --verbose

    CURRENT_BRANCH=$(git branch --show-current)
    git push origin "$CURRENT_BRANCH" || {
        echo "Failed to push. Creating remote branch..."
        git push -u origin "$CURRENT_BRANCH"
    }
done
