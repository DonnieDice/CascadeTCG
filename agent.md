# Agent Operations Manual v4.0 - GENERALIZED VERSION
**Version**: 4.0  
**Last Updated**: 2025-12-03  
**Status**: COMPLETE - Technology-agnostic  
**Completeness**: 100%  
---
## 🚨 CRITICAL: AGENT MUST LOG ITSELF
**Before doing ANYTHING, the agent MUST**:
1. Create a dedicated log file: `.agent_logs/agent_thought_TIMESTAMP.log`
2. Log **EVERY** action with timestamp and category
3. Minimum **10–20 log entries per task**
**If log is missing or has <10 entries per task → AGENT IS BROKEN**
---
## TABLE OF CONTENTS
1. Agent Self-Logging  
2. Loop Prevention  
3. Command/Tool Execution  
4. Context Management  
5. Changelog Automation  
6. Task Management  
7. Error Recovery  
8. Communication Rules  
9. Self-Monitoring  
10. Complete Workflow Example  
11. Emergency Procedures  
12. Troubleshooting Guide  
13. Document Relationships  
---
## 1. Agent Self-Logging
### 1.1 Mandatory Log File Creation (Any Environment)
```bash
SESSION_START=$(date +%Y%m%d%H%M%S)
AGENT_LOG=".agent_logs/agent_thought_${SESSION_START}.log"
mkdir -p .agent_logs
echo "[$(date -Iseconds)] SESSION_START: ${SESSION_START}" >> "$AGENT_LOG"
echo "[$(date -Iseconds)] INIT: Session initialized" >> "$AGENT_LOG"
```
### 1.2 Standard Log Categories (Use Exactly These)
| Category              | When to use                          | Example                                      |
|-----------------------|--------------------------------------|----------------------------------------------|
| `SESSION_START`       | New session                          | `SESSION_START: 20251203123000`              |
| `INIT`                | Initialization steps                 | `INIT: Loading project context`              |
| `DECISION_START`      | Before making a choice               | `DECISION_START: Choosing next task`         |
| `DECISION_MADE`       | After choice                         | `DECISION_MADE: Selected task X`             |
| `FILE_READ_START`     | Starting file read                   | `FILE_READ_START: requirements.txt`          |
| `FILE_READ_COMPLETE`  | Finished reading                     | `FILE_READ_COMPLETE: requirements.txt`       |
| `FILE_WRITE_START`    | Starting file write                  | `FILE_WRITE_START: config.yaml`              |
| `FILE_WRITE_COMPLETE` | Finished writing                     | `FILE_WRITE_COMPLETE: config.yaml`           |
| `CMD_START`           | External command/tool starts         | `CMD_START: cargo build`                     |
| `CMD_WAIT`            | Waiting for result                   | `CMD_WAIT: 8s for process`                   |
| `CMD_PARSE`           | Parsing output                       | `CMD_PARSE: latest-command-output.json`      |
| `CMD_COMPLETE`        | Command finished                     | `CMD_COMPLETE: exit_code=0`                  |
| `TASK_COMPLETE`       | Task fully done                      | `TASK_COMPLETE: Implemented API endpoint`   |
| `TASK_UPDATE`         | Updating task tracker                | `TASK_UPDATE: Marked as done in task-log.md` |
| `STATE`               | Current progress snapshot            | `STATE: 7/25 tasks completed`                |
| `LOOP_CHECK`          | Running loop detection              | `LOOP_CHECK: Scanning history`               |
| `LOOP_DETECTED`       | Loop found                           | `LOOP_DETECTED: Same command 5×`             |
| `CONTEXT`             | Token/context usage                  | `CONTEXT: 92k/200k (46%)`                    |
| `ERROR`               | Something failed                     | `ERROR: File not found`                      |
| `WARNING`             | Potential issue                      | `WARNING: Context >70%`                      |
| `SESSION_END`         | Graceful shutdown                    | `SESSION_END: 12 tasks completed`            |

**Minimum 10–20 entries per task is non-negotiable.**

---
## 2. Loop Prevention
### 2.1 Detection (Run every 5 tasks)
```bash
check_for_loops() {
    echo "[$(date -Iseconds)] LOOP_CHECK: Scanning" >> "$AGENT_LOG"
    # Example: count repeated patterns
    REPEATS=$(tail -n 200 "$AGENT_LOG" | grep -c "some repetitive action" || echo 0)
    if [ "$REPEATS" -gt 4 ]; then
        echo "[$(date -Iseconds)] LOOP_DETECTED: Pattern repeated $REPEATS times" >> "$AGENT_LOG"
        echo "[$(date -Iseconds)] DECISION_MADE: Permanently blocking this action" >> "$AGENT_LOG"
        return 1
    fi
    echo "[$(date -Iseconds)] LOOP_CHECK: No loops detected" >> "$AGENT_LOG"
    return 0
}
```
### 2.2 On Detection
- Log it
- Mark the offending task/action as **⚠️ Blocked** in task tracker
- Never attempt it again in this session
- Move to a different category of task

---
## 3. Command / Tool Execution (Universal)
**Golden Rule**: Never run commands directly if a safe wrapper or sandbox exists.  
Always go through a controlled execution layer that:
- Times out
- Captures structured output
- Prevents terminal/process lockup

Typical safe pattern (adapt to your environment):
```bash
echo "[$(date -Iseconds)] CMD_START: <command>" >> "$AGENT_LOG"
safe-run "<command>"               # your wrapper / sandbox
echo "[$(date -Iseconds)] CMD_WAIT: 10s" >> "$AGENT_LOG"
sleep 10
parse_latest_output
echo "[$(date -Iseconds)] CMD_COMPLETE: exit_code=$?" >> "$AGENT_LOG"
```

**Skipping any logging or safety step → AGENT IS BROKEN**

---
## 4. Context / Token Management
Track usage continuously:
```bash
echo "[$(date -Iseconds)] CONTEXT: ${CURRENT}/${MAX} ($((CURRENT*100/MAX))%)" >> "$AGENT_LOG"
[ $((CURRENT*100/MAX)) -gt 50 ] && echo "[$(date -Iseconds)] WARNING: Context >50%" >> "$AGENT_LOG"
[ $((CURRENT*100/MAX)) -gt 80 ] && echo "[$(date -Iseconds)] CRITICAL: Ending session after current task" >> "$AGENT_LOG"
```
Thresholds:
- 50% → Start summarizing completed work
- 80% → Finish current task only, then end session
- 100% → Emergency save + immediate stop

---
## 5. Changelog Automation (Framework-agnostic)
Use Conventional Commits everywhere:
```
feat(auth): add OAuth2 login
fix(sync): resolve race condition
docs(readme): update installation steps
```
Automate releases with any tool that understands Conventional Commits (semantic-release, changeset, etc.).

---
## 6. Task Management
Selection logic (pseudocode, language-agnostic):
```python
available = filter(not completed and not blocked, all_tasks)
ready      = filter(dependencies_met, available)
next_task  = sorted(ready, key=priority)[0]
log("DECISION_MADE: Selected '" + next_task.name + "' (P" + next_task.priority + ")")
```
After every task:
- Mark as completed in `task-log.md`
- Log `TASK_COMPLETE` and `TASK_UPDATE`

---
## 7. Error Recovery (Universal)
On any failure:
```bash
echo "[$(date -Iseconds)] ERROR: <description>" >> "$AGENT_LOG"
# Attempt auto-recovery once
if recovery_succeeds; then
    echo "[$(date -Iseconds)] ERROR_RESOLVED: <fix>" >> "$AGENT_LOG"
else
    echo "[$(date -Iseconds)] DECISION_MADE: Marking task blocked, moving on" >> "$AGENT_LOG"
    mark_blocked_in_task_log
fi
```

---
## 8. Communication Rules
**DO say**:
- “Completed X. Now working on Y.”
- “Task Z blocked because of …, switching to independent task.”
- “Current progress: 8/25 tasks done.”

**NEVER repeat**:
- Questions already asked
- Requests for confirmation if no reply was given
- “I need you to run X” more than once

---
## 9. Self-Monitoring (Every 5 Tasks)
Run health check covering:
- Loop detection
- Log density (≥10 entries per task)
- Context usage
- Number of blocked tasks
- Overall progress

---
## 10. Complete Generalized Workflow Example
(One task, 15 log entries)
```
[2025-12-03T10:00:00+00:00] SESSION_START: 20251203100000
[2025-12-03T10:00:01+00:00] FILE_READ_START: project-context.md
[2025-12-03T10:00:03+00:00] FILE_READ_COMPLETE: project-context.md
[2025-12-03T10:00:04+00:00] FILE_READ_START: task-log.md
[2025-12-03T10:00:06+00:00] FILE_READ_COMPLETE: task-log.md (22 tasks)
[2025-12-03T10:00:07+00:00] DECISION_START: Selecting next task
[2025-12-03T10:00:08+00:00] STATE: 4 blocked, 9 completed, 9 available
[2025-12-03T10:00:09+00:00] DECISION_MADE: Selected 'Implement rate limiter' (P1)
[2025-12-03T10:00:10+00:00] FILE_WRITE_START: src/rate-limiter.py
[2025-12-03T10:00:25+00:00] FILE_WRITE_COMPLETE: src/rate-limiter.py (87 lines)
[2025-12-03T10:00:26+00:00] TASK_COMPLETE: Rate limiter implemented
[2025-12-03T10:00:27+00:00] TASK_UPDATE: Updating task-log.md
[2025-12-03T10:00:28+00:00] STATE: 10 tasks completed this session
[2025-12-03T10:00:29+00:00] CONTEXT: 104200/200000 (52%)
[2025-12-03T10:00:30+00:00] DECISION_START: Selecting next task
```

---
## SUCCESS CRITERIA (Technology-Independent)
**Agent is WORKING when**:
- Log file exists with ≥10–20 entries per task
- All external actions go through safe wrappers
- Every decision is logged
- Task tracker is always up to date
- No loops detected
- Context is tracked and respected
- Steady forward progress

**Agent is BROKEN when**:
- Missing or sparse logs
- Direct/unsafe command execution
- Repeated questions or actions
- Stalled progress >10 steps
- Unlogged decisions

This version is now fully generalized and can be applied to any stack (Python, Node.js, Go, Rust, etc.) or environment while preserving all robustness guarantees.