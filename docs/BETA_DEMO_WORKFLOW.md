# Beta Demo Workflow

This workflow demonstrates the complete service business path using JSON fallback data.

## End-to-End Flow

1. Create customer
   - Open Customer CRM.
   - Add a demo customer with name, phone, email, city, and service notes.

2. Create estimate
   - Open Estimate Manager.
   - Create an estimate for camera, WiFi, computer repair, data recovery, smart home, or cabling work.

3. Approve estimate
   - Use the estimate approval action.
   - Confirm the estimate status changes to approved.

4. Create job
   - Convert the approved estimate to a job.
   - Confirm the job appears in Job Dispatch.

5. Assign technician
   - Open the job.
   - Assign a technician from the demo technician pool.

6. Schedule job
   - Add a start date and estimated hours.
   - Confirm no scheduling conflict is reported.

7. Complete job
   - Mark the job completed.
   - Add completion notes.

8. Create invoice
   - Create invoice from the completed job.
   - Confirm invoice appears in Revenue.

9. Mark invoice paid
   - Record a payment.
   - Confirm paid amount, outstanding balance, and payment status update.

10. Ask AI summary
   - Open AI Operations Assistant.
   - Ask: `What should I do today?`
   - Ask: `Who owes us money?`
   - Ask: `Show today's jobs.`

## Demo Rule

Do not send real SMS, email, payment requests, or external AI requests during the beta demo.
