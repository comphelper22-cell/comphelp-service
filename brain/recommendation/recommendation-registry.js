const templates = [
  {
    type: "callCustomerNext",
    category: "Sales",
    title: "Call this customer next",
    description: "Prioritize the customer most likely to book a service appointment.",
    estimatedBusinessImpact: "higher close rate"
  },
  {
    type: "highestProbabilityEstimate",
    category: "Sales",
    title: "Highest probability estimate",
    description: "Focus owner time on the estimate with the strongest booking signal.",
    estimatedBusinessImpact: "faster revenue capture"
  },
  {
    type: "upsellOpportunity",
    category: "Sales",
    title: "Upsell opportunity",
    description: "Recommend a related service that naturally fits the customer need.",
    estimatedBusinessImpact: "increased average job value"
  },
  {
    type: "followUpOverdue",
    category: "Sales",
    title: "Follow-up overdue",
    description: "Remind the owner to follow up before a warm lead goes cold.",
    estimatedBusinessImpact: "improved conversion"
  },
  {
    type: "bestTechnician",
    category: "Operations",
    title: "Best technician",
    description: "Recommend the best available technician or partner for the job.",
    estimatedBusinessImpact: "better service quality"
  },
  {
    type: "scheduleOptimization",
    category: "Operations",
    title: "Schedule optimization",
    description: "Group nearby jobs or urgent work into a better daily plan.",
    estimatedBusinessImpact: "reduced travel time"
  },
  {
    type: "routeOptimization",
    category: "Operations",
    title: "Route optimization",
    description: "Recommend a route that reduces windshield time between appointments.",
    estimatedBusinessImpact: "lower operating cost"
  },
  {
    type: "inventoryWarning",
    category: "Operations",
    title: "Inventory warning",
    description: "Flag likely material needs before the job is scheduled.",
    estimatedBusinessImpact: "fewer delays"
  },
  {
    type: "highValueInvoice",
    category: "Finance",
    title: "High value invoice",
    description: "Highlight high-value invoices that deserve owner attention.",
    estimatedBusinessImpact: "stronger cash flow"
  },
  {
    type: "latePayment",
    category: "Finance",
    title: "Late payment",
    description: "Recommend a polite payment reminder for overdue balances.",
    estimatedBusinessImpact: "faster collections"
  },
  {
    type: "revenueOpportunity",
    category: "Finance",
    title: "Revenue opportunity",
    description: "Identify the next action most likely to increase revenue.",
    estimatedBusinessImpact: "new revenue"
  },
  {
    type: "bestPromotion",
    category: "Marketing",
    title: "Best promotion",
    description: "Recommend a service promotion that fits current local demand.",
    estimatedBusinessImpact: "more qualified leads"
  },
  {
    type: "highRoiCampaign",
    category: "Marketing",
    title: "High ROI campaign",
    description: "Recommend the marketing idea with the best effort-to-return ratio.",
    estimatedBusinessImpact: "higher marketing efficiency"
  },
  {
    type: "localSeasonalOpportunity",
    category: "Marketing",
    title: "Local seasonal opportunity",
    description: "Spot seasonal local service demand the business can act on.",
    estimatedBusinessImpact: "local demand capture"
  },
  {
    type: "vipFollowUp",
    category: "Customer",
    title: "VIP follow-up",
    description: "Recommend a personal follow-up for an important customer.",
    estimatedBusinessImpact: "higher retention"
  },
  {
    type: "lowSatisfactionAlert",
    category: "Customer",
    title: "Low satisfaction alert",
    description: "Flag customer risk before it becomes a review or churn problem.",
    estimatedBusinessImpact: "protected reputation"
  },
  {
    type: "warrantyReminder",
    category: "Customer",
    title: "Warranty reminder",
    description: "Remind the customer about warranty or support coverage.",
    estimatedBusinessImpact: "better trust"
  },
  {
    type: "maintenanceReminder",
    category: "Customer",
    title: "Maintenance reminder",
    description: "Recommend timely maintenance for cameras, WiFi, computers, or smart devices.",
    estimatedBusinessImpact: "recurring service revenue"
  },
  {
    type: "dailyPriorities",
    category: "Management",
    title: "Daily priorities",
    description: "Summarize the most important owner actions for today.",
    estimatedBusinessImpact: "better focus"
  },
  {
    type: "weeklyGoals",
    category: "Management",
    title: "Weekly goals",
    description: "Recommend a short list of goals for business growth and operations.",
    estimatedBusinessImpact: "consistent execution"
  },
  {
    type: "businessRisks",
    category: "Management",
    title: "Business risks",
    description: "Flag risks that could hurt revenue, delivery, or customer trust.",
    estimatedBusinessImpact: "risk reduction"
  },
  {
    type: "growthOpportunities",
    category: "Management",
    title: "Growth opportunities",
    description: "Recommend the best next growth move based on current business context.",
    estimatedBusinessImpact: "long-term growth"
  }
];

function list() {
  return templates.slice();
}

function find(type) {
  return templates.find((template) => template.type === type) || templates[0];
}

function status() {
  return {
    ok: true,
    status: "ready",
    templates: templates.length,
    categories: [...new Set(templates.map((template) => template.category))]
  };
}

module.exports = {
  find,
  list,
  status
};
