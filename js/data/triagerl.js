// TriageRL case study content, from the project README.
// Evaluation: 30 paired episodes (identical arrival streams per policy),
// Wilcoxon signed-rank tests, deterioration-enabled environment.

export const links = {
  demo: "https://drive.google.com/file/d/1xKa9FgESG11B0YHXsIxKq-Z9JYoKZOs_/view",
  live: "https://triagerl.onrender.com/",
  github: "https://github.com/e-dania/TriageRL",
};

export const summary =
  "An adaptive patient-prioritization system for resource-constrained emergency departments. A MaskablePPO agent, trained in a simulated ED with stochastic arrivals, limited beds and staff, and patient deterioration, decides which waiting patient should be treated next, and outperforms rule-based triage on every efficiency metric.";

export const target = { proposed: "≥15%", achieved: "35.0%", label: "wait reduction" };

// `better`: which direction is an improvement. `significant`: p < 0.05.
export const results = [
  { metric: "Average wait", rule: "179.5 min", agent: "116.7 min", change: "−35.0%", p: "< 0.0001", significant: true },
  { metric: "P90 wait", rule: "410.8 min", agent: "265.3 min", change: "−35.4%", p: "< 0.0001", significant: true },
  { metric: "Critical wait (sev 1–2)", rule: "124.8 min", agent: "106.7 min", change: "−14.5%", p: "0.07", significant: false },
  { metric: "Throughput", rule: "119.0 /day", agent: "128.0 /day", change: "+7.6%", p: "0.021", significant: true },
  { metric: "Deteriorations", rule: "15.1 /day", agent: "13.5 /day", change: "−10.6%", p: "n.s.", significant: false },
];

export const resultsNote =
  "Severity rule is ESI-style triage. On critical-patient waiting the agent is statistically on par with the strict severity rule, which optimizes only that metric, while beating it everywhere else. Against FIFO, critical waits fall 22.9% (p < 0.01).";

export const architecture = [
  { name: "Simulation", file: "triagerl/ed_env.py", text: "24-hour episodes in 5-minute steps, time-varying Poisson arrivals, 5 beds and 7 staff, severity-dependent treatment times, and probabilistic deterioration under long waits." },
  { name: "Severity assessment", file: "triagerl/patients.py", text: "Transparent NEWS2-style vital-sign scoring mapped to ESI-like levels 1–5." },
  { name: "Agents", file: "triagerl/train_ppo.py", text: "A DQN baseline and the final action-masked PPO agent, built on Stable-Baselines3 and sb3-contrib." },
  { name: "Evaluation", file: "triagerl/evaluate.py", text: "Five policies over paired episodes, 95% confidence intervals, Wilcoxon significance tests and comparison plots." },
  { name: "Backend", file: "api/", text: "Patient registration with automatic severity assessment and specialist recommendation, the queue, RL-driven prioritization with a rule-based fallback, a decision audit log and metrics." },
  { name: "Dashboard", file: "frontend/", text: "Live queue board, stat cards, decision log, registration form and a demo mode." },
];

export const findings = [
  {
    title: "Action masking was worth more than reward tuning",
    text: "A 2.5× increase in reward weights made the DQN agent worse, while masked PPO with the rewards unchanged dominated.",
  },
  {
    title: "Severity-only triage manufactures critical patients",
    text: "Under deterioration dynamics, always treating the sickest first starves mild patients until they deteriorate. It produced the most deteriorations of any policy.",
  },
  {
    title: "The agent learns a middle path",
    text: "FIFO minimizes deteriorations but gives the worst critical waits. The agent settles between the two extremes instead of optimizing a single metric.",
  },
];

export const testing = {
  headline: "41 tests pass in every environment",
  strategies: [
    { name: "Unit / boundary-value", where: "tests/test_severity.py", covers: "Every vital-sign threshold in severity scoring, equivalence classes, and a full input-space sweep" },
    { name: "Property / invariant", where: "tests/test_env.py", covers: "Gymnasium API conformance, 500-step invariant rollouts, seed reproducibility, mask correctness and deterioration mechanics" },
    { name: "Integration / edge-case", where: "tests/test_api.py", covers: "Full patient lifecycle, critical-vs-mild prioritization, 10+ invalid-input rejections, empty-queue and extreme-but-valid boundaries" },
    { name: "Statistical / simulation", where: "triagerl/evaluate.py", covers: "Five policies × 30 paired episodes, 95% CIs and Wilcoxon signed-rank tests" },
  ],
};

export const performance = [
  { env: "Windows 11 laptop · 8 cores · Python 3.11", sim: "1,492", inference: "1.45", api: "26.9" },
  { env: "Google Colab · Linux, 2 vCPU · Python 3.12", sim: "2,578", inference: "0.79", api: "18.7" },
  { env: "Linux container · 2 vCPU", sim: "2,996", inference: "—", api: "12.6" },
];

export const futureWork = [
  "Multi-hospital transfer: retrain per site with local arrival patterns and resource levels.",
  "Extend the action space to resource assignment (which bed or clinician), not only ordering.",
  "A human-in-the-loop trial measuring clinician agreement with the agent's decisions.",
  "Broader multi-seed coverage and a larger MIMIC-IV-ED external validation.",
];

export const disclaimer = "Simulation only. Not for clinical use.";
