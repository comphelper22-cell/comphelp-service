function demoData() {
  return {
    company: {
      name: "CompHelp Service Demo Company",
      industry: "Local technology services",
      city: "Los Angeles",
      serviceArea: ["Los Angeles", "Burbank", "Glendale", "North Hollywood", "Studio City"],
      services: ["Security Camera Installation", "WiFi & Network Installation", "Smart Home Setup", "Computer Repair", "Data Recovery"]
    },
    customers: [
      { id: "cust_market", name: "LA Market Owner", city: "Los Angeles", status: "VIP", serviceNeed: "Security Camera Installation" },
      { id: "cust_office", name: "Burbank Office Manager", city: "Burbank", status: "New Lead", serviceNeed: "WiFi & Network Installation" },
      { id: "cust_home", name: "Glendale Homeowner", city: "Glendale", status: "Follow-up", serviceNeed: "Smart Home Setup" }
    ],
    jobs: [
      { id: "job_camera", title: "4-camera storefront install", customerName: "LA Market Owner", status: "Scheduled", priority: "High", value: 899 },
      { id: "job_wifi", title: "Office WiFi cleanup", customerName: "Burbank Office Manager", status: "Estimate Sent", priority: "Medium", value: 650 },
      { id: "job_repair", title: "Laptop repair and backup", customerName: "Glendale Homeowner", status: "Follow-up", priority: "Medium", value: 220 }
    ],
    estimates: [
      { id: "est_camera", service: "Security Camera Installation", customerName: "LA Market Owner", low: 799, high: 1199, recommended: 899, status: "Ready" },
      { id: "est_wifi", service: "WiFi & Network Installation", customerName: "Burbank Office Manager", low: 450, high: 850, recommended: 650, status: "Sent" }
    ],
    invoices: [
      { id: "inv_demo_1", customerName: "LA Market Owner", amount: 899, status: "Draft" },
      { id: "inv_demo_2", customerName: "Glendale Homeowner", amount: 220, status: "Paid" }
    ]
  };
}

module.exports = { demoData };
