/**
 * ============================================================
 * JOB SEQUENCING WITH DEADLINES — Greedy Algorithm
 * ============================================================
 *
 * Problem Statement:
 *   Given n jobs (film scenes), each with a deadline and a
 *   profit (priority), schedule them into time slots so that
 *   the total profit is maximised.
 *
 * Rules:
 *   • Each job takes exactly ONE time slot.
 *   • A job must be scheduled in a slot ≤ its deadline.
 *   • Each slot can hold at most one job.
 *   • Greedy: sort by decreasing profit, place each job in
 *     the latest available slot before its deadline.
 *
 * Time  Complexity: O(n²)   (n = number of jobs)
 *                  Outer loop iterates n jobs; inner slot
 *                  search is at most n steps each.
 * Space Complexity: O(n)    for the slot array.
 * ============================================================
 */

/**
 * Runs the Job Sequencing with Deadlines algorithm.
 *
 * @param {Array} jobs - Array of job/scene objects. Each must have:
 *                       { _id|sceneId, name, deadline, priority }
 *                       deadline: positive integer (slot number)
 *                       priority: positive number (profit)
 * @returns {Object} result - schedule, scheduled/unscheduled jobs, totals, steps.
 */
function jobSequencing(jobs) {
  const steps = [];

  // ── Validation ──────────────────────────────────────────────
  if (!jobs || jobs.length === 0) {
    return {
      scheduledJobs: [],
      unscheduledJobs: [],
      schedule: [],
      totalProfit: 0,
      totalSlots: 0,
      steps: ['No jobs provided.'],
      sortedJobs: [],
    };
  }

  steps.push(`Received ${jobs.length} scenes/jobs for scheduling.`);

  // ── Step 1: Sort jobs by decreasing profit ──────────────────
  const sortedJobs = [...jobs].sort((a, b) => b.priority - a.priority);
  steps.push(
    'Step 1: Sorted jobs by decreasing priority/profit — ' +
    sortedJobs.map(j => `"${j.name}"(p=${j.priority})`).join(', ')
  );

  // ── Step 2: Find maximum deadline ───────────────────────────
  const maxDeadline = Math.max(...sortedJobs.map(j => Math.floor(j.deadline)));
  steps.push(`Step 2: Maximum deadline = ${maxDeadline} slot(s).`);

  // ── Step 3: Initialise slot array ───────────────────────────
  // slots[t] = the job assigned to time slot t (1-indexed).
  // null means the slot is free.
  const slots = new Array(maxDeadline + 1).fill(null); // index 0 unused

  const scheduledJobs   = [];
  const unscheduledJobs = [];

  steps.push(`Step 3: Initialised ${maxDeadline} empty time slot(s).`);

  // ── Step 4: Greedy placement ─────────────────────────────────
  for (let i = 0; i < sortedJobs.length; i++) {
    const job = sortedJobs[i];
    const deadline = Math.min(Math.floor(job.deadline), maxDeadline);

    steps.push(
      `Step 4.${i + 1}: Trying to schedule "${job.name}" ` +
      `(priority=${job.priority}, deadline=slot ${deadline})`
    );

    // Find the latest free slot at or before the deadline.
    let placed = false;
    for (let t = deadline; t >= 1; t--) {
      if (slots[t] === null) {
        slots[t] = job;
        scheduledJobs.push({ ...job, assignedSlot: t });
        placed = true;
        steps.push(`  → Placed "${job.name}" in slot ${t}.`);
        break;
      }
    }

    if (!placed) {
      unscheduledJobs.push(job);
      steps.push(`  → No available slot for "${job.name}" — marked as unscheduled.`);
    }
  }

  // ── Step 5: Build final schedule array ──────────────────────
  const schedule = [];
  for (let t = 1; t <= maxDeadline; t++) {
    schedule.push({
      slot: t,
      job: slots[t] ? slots[t] : null,
      isEmpty: slots[t] === null,
    });
  }

  // ── Step 6: Compute total profit ────────────────────────────
  const totalProfit = scheduledJobs.reduce((sum, j) => sum + j.priority, 0);

  steps.push(
    `Done — Scheduled: ${scheduledJobs.length}, ` +
    `Unscheduled: ${unscheduledJobs.length}, ` +
    `Total profit: ${totalProfit}`
  );

  return {
    scheduledJobs,
    unscheduledJobs,
    schedule,
    totalProfit,
    totalSlots: maxDeadline,
    sortedJobs,
    steps,
    complexity: {
      time: 'O(n²)',
      space: 'O(n)',
      n: `n = ${jobs.length} jobs`,
    },
  };
}

module.exports = { jobSequencing };
