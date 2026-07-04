const supportedEvents = [
  "New Lead",
  "New Estimate",
  "Estimate Accepted",
  "Invoice Overdue",
  "Job Completed",
  "Customer Created",
  "Technician Assigned",
  "Inventory Low"
];

const workflows = [
  {
    workflowId: "new_lead_sales_review",
    event: "New Lead",
    name: "New Lead Sales Review",
    actions: ["create_task", "request_approval", "notify_owner"],
    retryPolicy: { maxAttempts: 2, delayMinutes: 15 },
    approvalRequired: true
  },
  {
    workflowId: "new_estimate_followup",
    event: "New Estimate",
    name: "Estimate Follow-up Queue",
    actions: ["create_task", "queue_followup", "request_approval"],
    retryPolicy: { maxAttempts: 2, delayMinutes: 60 },
    approvalRequired: true
  },
  {
    workflowId: "estimate_accepted_dispatch",
    event: "Estimate Accepted",
    name: "Estimate Accepted Dispatch Prep",
    actions: ["create_task", "notify_owner", "request_approval"],
    retryPolicy: { maxAttempts: 3, delayMinutes: 30 },
    approvalRequired: true
  },
  {
    workflowId: "invoice_overdue_review",
    event: "Invoice Overdue",
    name: "Invoice Overdue Review",
    actions: ["create_task", "queue_followup", "request_approval"],
    retryPolicy: { maxAttempts: 2, delayMinutes: 120 },
    approvalRequired: true
  },
  {
    workflowId: "job_completed_review",
    event: "Job Completed",
    name: "Job Completed Follow-up",
    actions: ["create_task", "queue_review_request", "request_approval"],
    retryPolicy: { maxAttempts: 1, delayMinutes: 0 },
    approvalRequired: true
  },
  {
    workflowId: "customer_created_onboarding",
    event: "Customer Created",
    name: "Customer Created Onboarding",
    actions: ["create_task", "notify_owner"],
    retryPolicy: { maxAttempts: 1, delayMinutes: 0 },
    approvalRequired: false
  },
  {
    workflowId: "technician_assigned_confirmation",
    event: "Technician Assigned",
    name: "Technician Assigned Confirmation",
    actions: ["create_task", "notify_owner"],
    retryPolicy: { maxAttempts: 1, delayMinutes: 0 },
    approvalRequired: false
  },
  {
    workflowId: "inventory_low_alert",
    event: "Inventory Low",
    name: "Inventory Low Alert",
    actions: ["create_task", "notify_owner"],
    retryPolicy: { maxAttempts: 1, delayMinutes: 0 },
    approvalRequired: false
  }
];

function list() {
  return workflows.slice();
}

function events() {
  return supportedEvents.slice();
}

function findByEvent(eventName) {
  return workflows.filter((workflow) => workflow.event === eventName);
}

function status() {
  return {
    ok: true,
    status: "ready",
    workflowCount: workflows.length,
    supportedEvents
  };
}

module.exports = {
  events,
  findByEvent,
  list,
  status
};
