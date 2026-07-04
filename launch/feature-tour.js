function featureTour() {
  return {
    ok: true,
    data: {
      tour: [
        { title: "Founder Command Center", value: "Business health, AI actions, revenue, risks, and workflow status." },
        { title: "Sales Manager", value: "Pipeline, estimate priority, follow-ups, and revenue opportunities." },
        { title: "Operations Center", value: "Today's jobs, technicians, urgent work, and customer waiting issues." },
        { title: "Dispatch AI", value: "Scheduling suggestions, technician matching, route ideas, and ETA windows." },
        { title: "Finance Center", value: "Revenue, invoices, cash flow, profit, alerts, and financial recommendations." },
        { title: "Marketing & Growth", value: "Lead sources, campaigns, reviews, SEO, social, and ROI." },
        { title: "Analytics & Reports", value: "Business scorecard, trends, weekly report, and monthly report." },
        { title: "SaaS Admin", value: "Organizations, teams, roles, permissions, settings, and tenant health." }
      ],
      generatedAt: new Date().toISOString()
    }
  };
}

module.exports = { featureTour };
