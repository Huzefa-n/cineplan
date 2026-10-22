/**
 * ============================================================
 * 0/1 KNAPSACK ALGORITHM — Dynamic Programming
 * ============================================================
 *
 * Problem Statement:
 *   Given a budget (capacity) and a list of equipment items,
 *   each with a cost (weight) and production value (value),
 *   select items such that the total production value is
 *   maximised without exceeding the budget.
 *
 * "0/1" means each item can either be included (1) or
 * excluded (0) — it cannot be partially included.
 *
 * Approach: Bottom-up Dynamic Programming
 *
 * Time  Complexity: O(n * W)  where n = number of items,
 *                             W = budget in units
 * Space Complexity: O(n * W) for the DP table (stored and
 *                            returned for visualisation)
 * ============================================================
 */

/**
 * Solves the 0/1 Knapsack problem using dynamic programming.
 *
 * @param {number}   budget - Maximum budget (knapsack capacity).
 * @param {Array}    items  - Equipment items. Each item must have:
 *                           { name, cost, productionValue, ... }
 * @returns {Object} result - Selected items, totals, DP table,
 *                            and step-by-step trace.
 */
function knapsack(budget, items) {
  const n = items.length;

  // ── Validation ──────────────────────────────────────────────
  if (n === 0 || budget <= 0) {
    return {
      selectedItems: [],
      totalCost: 0,
      totalValue: 0,
      remainingBudget: budget,
      dpTable: [],
      steps: ['No items provided or budget is zero.'],
    };
  }

  // ── Budget normalisation ────────────────────────────────────
  // Work in integer units (round costs to nearest integer).
  // This keeps the DP table size deterministic.
  const W = Math.floor(budget);
  const steps = [];

  steps.push(`Starting 0/1 Knapsack — Budget: ₹${W}, Items: ${n}`);

  // ── Build DP table ──────────────────────────────────────────
  // dp[i][w] = maximum value achievable using the first i items
  //            with capacity w.
  //
  // Dimensions: (n+1) rows × (W+1) columns
  // dp[0][*] = 0  (no items)
  // dp[*][0] = 0  (no budget)
  const dp = [];
  for (let i = 0; i <= n; i++) {
    dp.push(new Array(W + 1).fill(0));
  }

  steps.push('Initialised DP table with zeros.');

  // ── Fill DP table ───────────────────────────────────────────
  for (let i = 1; i <= n; i++) {
    const item = items[i - 1];
    const itemCost  = Math.floor(item.cost);
    const itemValue = item.productionValue;

    steps.push(
      `Processing item ${i}: "${item.name}" — Cost: ₹${itemCost}, Value: ${itemValue}`
    );

    for (let w = 0; w <= W; w++) {
      if (itemCost > w) {
        // Item doesn't fit at capacity w — skip it.
        dp[i][w] = dp[i - 1][w];
      } else {
        // Choose the better option:
        //   a) Exclude item i → dp[i-1][w]
        //   b) Include item i → dp[i-1][w - itemCost] + itemValue
        const exclude = dp[i - 1][w];
        const include = dp[i - 1][w - itemCost] + itemValue;

        if (include > exclude) {
          dp[i][w] = include;
          steps.push(
            `  w=${w}: Including "${item.name}" is better (${include} > ${exclude})`
          );
        } else {
          dp[i][w] = exclude;
        }
      }
    }
  }

  steps.push(`Maximum achievable value: ${dp[n][W]}`);

  // ── Backtrack to find selected items ────────────────────────
  // Start at dp[n][W] and trace back which items were included.
  const selectedItems = [];
  let remainingCapacity = W;

  for (let i = n; i > 0; i--) {
    if (dp[i][remainingCapacity] !== dp[i - 1][remainingCapacity]) {
      // Item i was included.
      const item = items[i - 1];
      selectedItems.push(item);
      remainingCapacity -= Math.floor(item.cost);
      steps.push(`Selected: "${item.name}" — Remaining capacity: ₹${remainingCapacity}`);
    }
  }

  // ── Compute totals ──────────────────────────────────────────
  const totalCost = selectedItems.reduce(
    (sum, item) => sum + Math.floor(item.cost), 0
  );
  const totalValue = selectedItems.reduce(
    (sum, item) => sum + item.productionValue, 0
  );
  const remainingBudget = W - totalCost;

  steps.push(
    `Done — Selected ${selectedItems.length} items. ` +
    `Total cost: ₹${totalCost}, Total value: ${totalValue}, Remaining: ₹${remainingBudget}`
  );

  // ── Return result ───────────────────────────────────────────
  return {
    selectedItems,
    totalCost,
    totalValue,
    remainingBudget,
    dpTable: dp,          // full 2-D table for UI visualisation
    steps,
    complexity: {
      time: 'O(n × W)',
      space: 'O(n × W)',
      n: `n = ${n} items`,
      W: `W = ${W} (budget in ₹)`,
    },
  };
}

module.exports = { knapsack };
