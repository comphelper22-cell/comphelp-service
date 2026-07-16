const assert = require("assert");
const fs = require("fs");
const path = require("path");
const test = require("node:test");
const { PGlite } = require("@electric-sql/pglite");

const migration = (name) => fs.readFileSync(path.join(__dirname, "..", "supabase", "migrations", name), "utf8");

async function expectRejected(operation, pattern, message) {
  let error = null;
  try {
    await operation();
  } catch (caught) {
    error = caught;
  }
  assert.ok(error, message);
  if (pattern) assert.match(String(error.message || error), pattern, message);
}

async function asUser(db, userId, operation) {
  await db.exec(`set role authenticated; set request.jwt.claim.sub = '${userId}';`);
  try {
    return await operation();
  } finally {
    await db.exec("reset role; reset request.jwt.claim.sub;");
  }
}

async function asAnon(db, operation) {
  await db.exec("set role anon;");
  try {
    return await operation();
  } finally {
    await db.exec("reset role;");
  }
}

test("database migrations enforce tenant, RBAC, evidence, and financial invariants", async () => {
  const db = new PGlite();
  const ids = {
    orgA: "10000000-0000-0000-0000-000000000001",
    orgB: "10000000-0000-0000-0000-000000000002",
    userA: "20000000-0000-0000-0000-000000000001",
    userB: "20000000-0000-0000-0000-000000000002",
    suspended: "20000000-0000-0000-0000-000000000003",
    userC: "20000000-0000-0000-0000-000000000004",
    membershipA: "30000000-0000-0000-0000-000000000001",
    membershipAInB: "30000000-0000-0000-0000-000000000002",
    membershipB: "30000000-0000-0000-0000-000000000003",
    membershipSuspended: "30000000-0000-0000-0000-000000000004",
    membershipC: "30000000-0000-0000-0000-000000000005",
    roleCrmA: "40000000-0000-0000-0000-000000000001",
    roleCrmB: "40000000-0000-0000-0000-000000000002",
    roleFinanceB: "40000000-0000-0000-0000-000000000003",
    roleApprovalA: "40000000-0000-0000-0000-000000000004",
    customerA: "50000000-0000-0000-0000-000000000001",
    customerB: "50000000-0000-0000-0000-000000000002",
    invoiceB: "60000000-0000-0000-0000-000000000001",
    jobB: "60000000-0000-0000-0000-000000000002",
    vendorB: "60000000-0000-0000-0000-000000000003",
    paymentB: "60000000-0000-0000-0000-000000000004",
    approvalA: "70000000-0000-0000-0000-000000000001",
    approvalExpired: "70000000-0000-0000-0000-000000000002"
  };

  try {
    await db.exec(`
      create role anon nologin;
      create role authenticated nologin;
      create schema auth;
      create table auth.users (id uuid primary key);
      create or replace function auth.uid() returns uuid language sql stable as $$
        select nullif(current_setting('request.jwt.claim.sub', true), '')::uuid
      $$;
      grant usage on schema auth to authenticated;
      grant execute on function auth.uid() to authenticated;
    `);
    await db.exec(migration("0001_core_schema.sql").replace(/create extension if not exists pgcrypto;\s*/i, ""));
    await db.exec(`
      insert into auth.users(id) values ('${ids.userA}'), ('${ids.userB}'), ('${ids.suspended}'), ('${ids.userC}');
      insert into public.organizations(id,name,slug,status) values
        ('${ids.orgA}','Org A','org-a','active'), ('${ids.orgB}','Org B','org-b','active');
      insert into public.profiles(id,display_name,email,status) values
        ('${ids.userA}','User A','a@example.test','active'),
        ('${ids.userB}','User B','b@example.test','active'),
        ('${ids.suspended}','Suspended','s@example.test','suspended'),
        ('${ids.userC}','User C','c@example.test','active');
      insert into public.organization_memberships(id,organization_id,profile_id,status) values
        ('${ids.membershipA}','${ids.orgA}','${ids.userA}','active'),
        ('${ids.membershipAInB}','${ids.orgB}','${ids.userA}','active'),
        ('${ids.membershipB}','${ids.orgB}','${ids.userB}','active'),
        ('${ids.membershipSuspended}','${ids.orgA}','${ids.suspended}','active'),
        ('${ids.membershipC}','${ids.orgA}','${ids.userC}','active');
      insert into public.roles(id,organization_id,name,status) values
        ('${ids.roleCrmA}','${ids.orgA}','crm-a','active'),
        ('${ids.roleCrmB}','${ids.orgB}','crm-b','active'),
        ('${ids.roleFinanceB}','${ids.orgB}','finance-b','active'),
        ('${ids.roleApprovalA}','${ids.orgA}','approval-a','active');
      insert into public.permissions(id,key,description,risk_level) values
        ('80000000-0000-0000-0000-000000000001','crm.read','crm read','low'),
        ('80000000-0000-0000-0000-000000000002','crm.manage','crm write','medium'),
        ('80000000-0000-0000-0000-000000000003','finance.read','finance read','medium'),
        ('80000000-0000-0000-0000-000000000004','finance.manage','finance write','high'),
        ('80000000-0000-0000-0000-000000000005','approvals.read','approval read','medium'),
        ('80000000-0000-0000-0000-000000000006','approvals.request','approval request','high'),
        ('80000000-0000-0000-0000-000000000007','approvals.decide','approval decide','high'),
        ('80000000-0000-0000-0000-000000000008','organization.manage_members','member admin','high'),
        ('80000000-0000-0000-0000-000000000009','organization.manage_roles','role admin','critical');
      insert into public.role_permissions(organization_id,role_id,permission_id) values
        ('${ids.orgA}','${ids.roleCrmA}','80000000-0000-0000-0000-000000000001'),
        ('${ids.orgA}','${ids.roleCrmA}','80000000-0000-0000-0000-000000000002'),
        ('${ids.orgB}','${ids.roleCrmB}','80000000-0000-0000-0000-000000000001'),
        ('${ids.orgB}','${ids.roleCrmB}','80000000-0000-0000-0000-000000000002'),
        ('${ids.orgB}','${ids.roleFinanceB}','80000000-0000-0000-0000-000000000003'),
        ('${ids.orgB}','${ids.roleFinanceB}','80000000-0000-0000-0000-000000000004'),
        ('${ids.orgA}','${ids.roleApprovalA}','80000000-0000-0000-0000-000000000005'),
        ('${ids.orgA}','${ids.roleApprovalA}','80000000-0000-0000-0000-000000000006'),
        ('${ids.orgA}','${ids.roleApprovalA}','80000000-0000-0000-0000-000000000007');
      insert into public.membership_roles(organization_id,membership_id,role_id) values
        ('${ids.orgA}','${ids.membershipA}','${ids.roleCrmA}'),
        ('${ids.orgA}','${ids.membershipA}','${ids.roleApprovalA}'),
        ('${ids.orgB}','${ids.membershipAInB}','${ids.roleCrmB}'),
        ('${ids.orgB}','${ids.membershipB}','${ids.roleFinanceB}'),
        ('${ids.orgA}','${ids.membershipSuspended}','${ids.roleCrmA}'),
        ('${ids.orgA}','${ids.membershipC}','${ids.roleCrmA}');
      insert into public.customers(id,organization_id,name,status,updated_at) values
        ('${ids.customerA}','${ids.orgA}','Customer A','active','2000-01-01T00:00:00Z'),
        ('${ids.customerB}','${ids.orgB}','Customer B','active','2000-01-01T00:00:00Z');
    `);
    await db.exec(migration("0002_tenant_rls.sql"));

    await db.exec(`insert into public.audit_logs(organization_id,actor_profile_id,action,entity_type,outcome,occurred_at) values ('${ids.orgA}','${ids.userA}','service.event','system','success','2000-01-01T00:00:00Z')`);
    const serviceAudit = (await db.query("select actor_profile_id,actor_service,occurred_at from public.audit_logs where action='service.event'" )).rows[0];
    assert.strictEqual(serviceAudit.actor_profile_id, null, "Service evidence must not masquerade as a human actor.");
    assert.ok(serviceAudit.actor_service, "Service evidence must identify the database service principal.");
    assert.ok(new Date(serviceAudit.occurred_at).getUTCFullYear() > 2000, "Service evidence timestamps must be database-stamped.");

    await expectRejected(
      () => asAnon(db, () => db.query("select id from public.customers")),
      /permission denied/i,
      "Anonymous clients must not read tenant data."
    );
    const orgAOnlyRows = await asUser(db, ids.userC, () => db.query("select id from public.customers order by id"));
    assert.deepStrictEqual(orgAOnlyRows.rows.map((row) => row.id), [ids.customerA], "Org A users must not read Org B customer data.");

    const crmRows = await asUser(db, ids.userA, () => db.query("select id from public.customers order by id"));
    assert.deepStrictEqual(crmRows.rows.map((row) => row.id), [ids.customerA, ids.customerB], "Dual-org CRM access must remain permission scoped.");
    await asUser(db, ids.userA, () => db.exec(`insert into public.customers(organization_id,name) values ('${ids.orgA}','Allowed')`));
    await expectRejected(
      () => asUser(db, ids.userA, () => db.exec(`update public.customers set organization_id='${ids.orgB}' where id='${ids.customerA}'`)),
      /organization_id is immutable/i,
      "Even a user authorized in both tenants must not transfer rows."
    );
    await asUser(db, ids.userA, () => db.exec(`update public.customers set name='Customer A Updated' where id='${ids.customerA}'`));
    await expectRejected(
      () => asUser(db, ids.userA, () => db.exec(`insert into public.role_permissions(organization_id,role_id,permission_id) values ('${ids.orgA}','${ids.roleCrmA}','80000000-0000-0000-0000-000000000004')`)),
      /permission denied/i,
      "Authenticated users must not self-escalate RBAC."
    );
    await expectRejected(
      () => asUser(db, ids.userA, () => db.exec("insert into public.audit_logs(organization_id,action,entity_type,outcome) values ('10000000-0000-0000-0000-000000000001','forged','invoice','success')")),
      /permission denied/i,
      "Clients must not forge audit evidence."
    );
    await expectRejected(
      () => asUser(db, ids.userA, () => db.exec("update public.profiles set status='active' where id=auth.uid()")),
      /permission denied/i,
      "Profile status must not be self-editable."
    );

    const suspendedRows = await asUser(db, ids.suspended, () => db.query("select id from public.customers"));
    assert.strictEqual(suspendedRows.rows.length, 0, "Suspended profiles must have no tenant access.");

    await asUser(db, ids.userA, () => db.exec(`insert into public.approval_requests(id,organization_id,action_key,context_hash,context_snapshot,requested_by,decision,expires_at) values ('${ids.approvalA}','${ids.orgA}','payment.charge','hash','{}','${ids.userB}','approved',now()+interval '1 hour')`));
    let approval = (await asUser(db, ids.userA, () => db.query(`select requested_by,decision,decided_by from public.approval_requests where id='${ids.approvalA}'`))).rows[0];
    assert.strictEqual(approval.requested_by, ids.userA);
    assert.strictEqual(approval.decision, "pending");
    assert.strictEqual(approval.decided_by, null);
    await asUser(db, ids.userA, () => db.exec(`update public.approval_requests set decision='approved', reason='reviewed' where id='${ids.approvalA}'`));
    approval = (await asUser(db, ids.userA, () => db.query(`select decision,decided_by,decided_at from public.approval_requests where id='${ids.approvalA}'`))).rows[0];
    assert.strictEqual(approval.decision, "approved");
    assert.strictEqual(approval.decided_by, ids.userA);
    assert.ok(approval.decided_at);
    await expectRejected(
      () => asUser(db, ids.userA, () => db.exec(`update public.approval_requests set action_key='tampered' where id='${ids.approvalA}'`)),
      /approval request evidence is immutable|invalid approval decision transition/i,
      "Approval evidence and terminal decisions must be immutable."
    );
    await db.exec(`insert into public.approval_requests(id,organization_id,action_key,context_hash,context_snapshot,expires_at) values ('${ids.approvalExpired}','${ids.orgA}','lead.followup.send','expiry-hash','{}',clock_timestamp()+interval '20 milliseconds')`);
    await new Promise((resolve) => setTimeout(resolve, 40));
    await db.exec(`update public.approval_requests set decision='expired', reason='elapsed' where id='${ids.approvalExpired}'`);
    const expiredApproval = (await db.query(`select decision,requested_by,requested_by_service,decided_by,decided_by_service from public.approval_requests where id='${ids.approvalExpired}'`)).rows[0];
    assert.strictEqual(expiredApproval.decision, "expired");
    assert.strictEqual(expiredApproval.requested_by, null);
    assert.ok(expiredApproval.requested_by_service);
    assert.strictEqual(expiredApproval.decided_by, null);
    assert.ok(expiredApproval.decided_by_service);

    await db.exec(`
      insert into public.vendors(id,organization_id,legal_name,display_name) values ('${ids.vendorB}','${ids.orgB}','Vendor B LLC','Vendor B');
      insert into public.jobs(id,organization_id,customer_id,title,service) values ('${ids.jobB}','${ids.orgB}','${ids.customerB}','Job B','Repair');
    `);
    await expectRejected(
      () => db.exec(`insert into public.invoices(id,organization_id,customer_id,job_id,invoice_number,currency,subtotal,tax_total,total) values ('${ids.invoiceB}','${ids.orgB}','${ids.customerB}','${ids.jobB}','INV-BAD','USD',0,0,1)`),
      /check constraint|totals do not reconcile|totals must start at zero/i,
      "Invoice totals must reconcile."
    );
    await db.exec(`insert into public.invoices(id,organization_id,customer_id,job_id,invoice_number,currency,subtotal,tax_total,total) values ('${ids.invoiceB}','${ids.orgB}','${ids.customerB}','${ids.jobB}','INV-1','USD',0,0,0)`);
    await expectRejected(
      () => db.exec(`insert into public.invoice_items(organization_id,invoice_id,description,quantity,unit_price,line_total,currency) values ('${ids.orgB}','${ids.invoiceB}','bad',2,10,19,'USD')`),
      /check constraint/i,
      "Line totals must equal rounded quantity times price."
    );
    await db.exec(`insert into public.invoice_items(organization_id,invoice_id,description,quantity,unit_price,line_total,currency) values ('${ids.orgB}','${ids.invoiceB}','good',2,10,20,'USD')`);
    const invoice = (await db.query(`select subtotal,total from public.invoices where id='${ids.invoiceB}'`)).rows[0];
    assert.strictEqual(String(invoice.subtotal), "20.00");
    assert.strictEqual(String(invoice.total), "20.00");
    await Promise.all([
      db.exec(`insert into public.invoice_items(organization_id,invoice_id,description,quantity,unit_price,line_total,currency) values ('${ids.orgB}','${ids.invoiceB}','parallel-a',1,5,5,'USD')`),
      db.exec(`insert into public.invoice_items(organization_id,invoice_id,description,quantity,unit_price,line_total,currency) values ('${ids.orgB}','${ids.invoiceB}','parallel-b',1,5,5,'USD')`)
    ]);
    const concurrentInvoice = (await db.query(`select subtotal,total from public.invoices where id='${ids.invoiceB}'`)).rows[0];
    assert.strictEqual(String(concurrentInvoice.subtotal), "30.00", "Concurrent line inserts must use atomic deltas without lost updates.");
    assert.strictEqual(String(concurrentInvoice.total), "30.00");
    const crmFinanceRows = await asUser(db, ids.userA, () => db.query("select id from public.invoices"));
    assert.strictEqual(crmFinanceRows.rows.length, 0, "CRM permissions must not expose finance records.");
    await expectRejected(
      () => db.exec(`update public.invoices set subtotal=99,total=99 where id='${ids.invoiceB}'`),
      /totals do not reconcile|totals are system-maintained/i,
      "Parent totals must reconcile to line items even for server writes."
    );
    await db.exec(`update public.invoices set tax_total=20,total=50 where id='${ids.invoiceB}'`);
    await expectRejected(
      () => db.exec(`insert into public.payments(organization_id,invoice_id,provider,provider_payment_id,amount,currency) values ('${ids.orgB}','${ids.invoiceB}','stripe','pay_omitted',4,'USD')`),
      /only paid records/i,
      "Omitted payment status must not enter the settled ledger."
    );
    await expectRejected(
      () => db.exec(`insert into public.payments(organization_id,invoice_id,provider,provider_payment_id,amount,currency,status) values ('${ids.orgB}','${ids.invoiceB}','stripe','pay_failed',4,'USD','failed')`),
      /only paid records/i,
      "Failed provider attempts must not enter the settled ledger."
    );
    await expectRejected(
      () => db.exec(`insert into public.payments(organization_id,invoice_id,provider,provider_payment_id,amount,currency,status) values ('${ids.orgB}','${ids.invoiceB}','stripe','pay_pending',4,'USD','pending')`),
      /only paid records/i,
      "Pending provider attempts must not enter the settled payment ledger."
    );
    const unpaidInvoice = (await db.query(`select paid_total from public.invoices where id='${ids.invoiceB}'`)).rows[0];
    assert.strictEqual(String(unpaidInvoice.paid_total), "0.00", "Rejected pending payments must not affect paid_total.");
    await expectRejected(
      () => db.exec(`insert into public.payments(organization_id,invoice_id,provider,amount,currency,status) values ('${ids.orgB}','${ids.invoiceB}','stripe',1,'USD','paid')`),
      /not-null constraint|null value/i,
      "Every payment must carry a non-null provider idempotency identifier."
    );
    await expectRejected(
      () => db.exec(`insert into public.payments(organization_id,invoice_id,provider,provider_payment_id,amount,currency,status) values ('${ids.orgB}','${ids.invoiceB}','stripe','pay_zero',0,'USD','paid')`),
      /check constraint/i,
      "Zero-value payments must be rejected."
    );
    await expectRejected(
      () => db.exec(`insert into public.payments(organization_id,invoice_id,provider,provider_payment_id,amount,currency,status) values ('${ids.orgB}','${ids.invoiceB}','stripe','pay_over',51,'USD','paid')`),
      /payment exceeds invoice total/i,
      "Payments must not exceed invoice totals."
    );
    await db.exec(`insert into public.payments(id,organization_id,invoice_id,provider,provider_payment_id,amount,currency,status,paid_at) values ('${ids.paymentB}','${ids.orgB}','${ids.invoiceB}','stripe','pay_1',20,'USD','paid','2000-01-01T00:00:00Z')`);
    const stampedPayment = (await db.query(`select paid_at from public.payments where id='${ids.paymentB}'`)).rows[0];
    assert.ok(new Date(stampedPayment.paid_at).getUTCFullYear() > 2000, "Payment settlement time must be database-stamped.");
    await expectRejected(
      () => db.exec(`insert into public.payments(organization_id,invoice_id,provider,provider_payment_id,amount,currency,status) values ('${ids.orgB}','${ids.invoiceB}','stripe','pay_1',20,'USD','paid')`),
      /unique constraint/i,
      "Provider payment IDs must be idempotent."
    );
    const paymentRace = await Promise.allSettled([
      db.exec(`insert into public.payments(organization_id,invoice_id,provider,provider_payment_id,amount,currency,status) values ('${ids.orgB}','${ids.invoiceB}','stripe','pay_parallel_a',20,'USD','paid')`),
      db.exec(`insert into public.payments(organization_id,invoice_id,provider,provider_payment_id,amount,currency,status) values ('${ids.orgB}','${ids.invoiceB}','stripe','pay_parallel_b',20,'USD','paid')`)
    ]);
    assert.strictEqual(paymentRace.filter((result) => result.status === "fulfilled").length, 1, "Concurrent payments must atomically enforce remaining balance.");
    const paidInvoice = (await db.query(`select paid_total from public.invoices where id='${ids.invoiceB}'`)).rows[0];
    assert.strictEqual(String(paidInvoice.paid_total), "40.00");
    await expectRejected(
      () => db.exec(`insert into public.commissions(organization_id,job_id,vendor_id,payment_id,amount,currency,rate) values ('${ids.orgB}','${ids.jobB}','${ids.vendorB}','${ids.paymentB}',3,'USD',0.1)`),
      /commission amount does not reconcile/i,
      "Commission amounts must match payment amount times rate."
    );
    await db.exec(`insert into public.commissions(organization_id,job_id,vendor_id,payment_id,amount,currency,rate) values ('${ids.orgB}','${ids.jobB}','${ids.vendorB}','${ids.paymentB}',2,'USD',0.1)`);
    await expectRejected(
      () => db.exec("update public.payments set amount=21 where provider_payment_id='pay_1'"),
      /append-only/i,
      "Append-only records must resist even owner/service updates."
    );
    await expectRejected(() => db.exec("delete from public.payments where provider_payment_id='pay_1'"), /append-only/i, "Payments must resist deletes.");
    await expectRejected(() => db.exec("update public.commissions set amount=3"), /append-only/i, "Commissions must resist updates.");
    await expectRejected(() => db.exec("delete from public.commissions"), /append-only/i, "Commissions must resist deletes.");

    await db.exec(`update public.organizations set status='suspended' where id='${ids.orgB}'`);
    const inactiveOrgRows = await asUser(db, ids.userB, () => db.query("select id from public.invoices"));
    assert.strictEqual(inactiveOrgRows.rows.length, 0, "Suspended organizations must have no tenant access.");

    const updated = (await db.query(`select updated_at from public.customers where id='${ids.customerA}'`)).rows[0];
    assert.ok(new Date(updated.updated_at).getUTCFullYear() > 2000, "updated_at trigger must maintain timestamps.");
  } finally {
    await db.close();
  }
});
