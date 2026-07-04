const { customerProfiles } = require("./customer-ltv");

function timeline(input = {}) {
  const profiles = customerProfiles(input).profiles;
  const items = profiles.flatMap((customer) => buildCustomerItems(customer));
  return {
    ok: true,
    data: items.sort((a, b) => String(b.date).localeCompare(String(a.date))).slice(0, 50)
  };
}

function buildCustomerItems(customer) {
  const items = [];
  customer.leads.forEach((lead) => items.push(item(customer, "lead", lead.status || "Lead created", lead.createdAt || lead.timestamp)));
  customer.estimates.forEach((estimate) => items.push(item(customer, "estimate", estimate.status || "Estimate activity", estimate.createdAt || estimate.date)));
  customer.projects.forEach((project) => items.push(item(customer, "project", project.status || "Project activity", project.completionDate || project.date)));
  customer.invoices.forEach((invoice) => items.push(item(customer, "invoice", invoice.status || "Invoice activity", invoice.paidAt || invoice.dueDate || invoice.date)));
  customer.tasks.forEach((task) => items.push(item(customer, "task", task.title || task.status || "Task activity", task.dueDate || task.createdAt)));
  return items.length ? items : [item(customer, "customer", "Customer profile created", new Date().toISOString())];
}

function item(customer, type, label, date) {
  return {
    customerName: customer.customerName,
    type,
    label,
    service: customer.service,
    date: date || new Date().toISOString()
  };
}

module.exports = { timeline };
