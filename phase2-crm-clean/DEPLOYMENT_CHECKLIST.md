# CompHelp Service Deployment Checklist

1. Upload the production project folder to GitHub.
2. Connect the GitHub repository to Vercel.
3. Configure Vercel environment variables:
   - OPENAI_API_KEY
   - GOOGLE_SHEETS_WEBHOOK_URL
   - ALLOWED_ORIGIN
   - TWILIO_ACCOUNT_SID
   - TWILIO_AUTH_TOKEN
   - TWILIO_FROM_NUMBER
   - JOB_COMPLETE_WEBHOOK_SECRET
4. Deploy the Vercel project.
5. Test the chatbot at `/api/chat` from the website chat widget.
6. Test the lead form and confirm the success state appears only after delivery.
7. Test Google Sheets and confirm every submitted lead is saved.
8. Test the Vapi call bot at `/api/vapi-webhook` and confirm CRM lead save plus SMS confirmation.
9. Test `https://comphelp.ai/sitemap.xml` and confirm all URLs are reachable.
10. Verify SEO with Google Rich Results Test, Search Console URL Inspection, and Lighthouse.
