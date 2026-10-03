/**
 * ============================================================================
 * PORTFOLIO CONTACT FORM AUTOMATION ENGINE
 * Author: Aaradhya Dev Tamrakar
 * Repository: https://github.com/AaradhyaDT/AaradhyaDT.github.io
 * 
 * 1. Run `setupPortfolioForm()` ONCE to create the form, extract entry IDs,
 *    and register the onFormSubmit trigger.
 * 2. Check the "Execution log" for the exact config to paste into constants.js!
 * ============================================================================
 */

const NOTIFICATION_EMAIL = "aaradhyadevtmr@gmail.com";
const SENDER_NAME = "Aaradhya Dev Tamrakar";

function setupPortfolioForm() {
  Logger.log("Creating new Google Form for Portfolio Contact...");
  
  // 1. Create the Form
  const form = FormApp.create("Portfolio Contact Submissions — ADT");
  form.setDescription("Official contact intake form for https://aaradhyadt.github.io");
  form.setAllowResponseEdits(false);
  form.setCollectEmail(false); // We collect email through our custom field
  
  // 2. Add Questions (Name, Email, Subject, Message)
  const nameItem = form.addTextItem().setTitle("Name").setRequired(true);
  const emailItem = form.addTextItem().setTitle("Email").setRequired(true);
  const subjectItem = form.addTextItem().setTitle("Subject").setRequired(false);
  const messageItem = form.addParagraphTextItem().setTitle("Message").setRequired(true);
  
  // 3. Extract exact entry IDs via dummy pre-filled response
  const dummyResponse = form.createResponse();
  dummyResponse.withItemResponse(nameItem.createResponse("NAME_PLACEHOLDER"));
  dummyResponse.withItemResponse(emailItem.createResponse("EMAIL_PLACEHOLDER"));
  dummyResponse.withItemResponse(subjectItem.createResponse("SUBJECT_PLACEHOLDER"));
  dummyResponse.withItemResponse(messageItem.createResponse("MESSAGE_PLACEHOLDER"));
  
  const prefilledUrl = dummyResponse.toPrefilledUrl();
  
  // Parse entry IDs from prefilled URL query parameters
  const extractEntryId = (url, placeholder) => {
    const match = url.match(new RegExp(`(entry\\.\\d+)=${placeholder}`));
    return match ? match[1] : null;
  };
  
  const nameEntry = extractEntryId(prefilledUrl, "NAME_PLACEHOLDER") || `entry.${nameItem.getId()}`;
  const emailEntry = extractEntryId(prefilledUrl, "EMAIL_PLACEHOLDER") || `entry.${emailItem.getId()}`;
  const subjectEntry = extractEntryId(prefilledUrl, "SUBJECT_PLACEHOLDER") || `entry.${subjectItem.getId()}`;
  const messageEntry = extractEntryId(prefilledUrl, "MESSAGE_PLACEHOLDER") || `entry.${messageItem.getId()}`;
  
  // Construct the headless POST URL
  const formId = form.getId();
  const formUrl = form.getPublishedUrl();
  const actionUrl = formUrl.replace(/viewform.*/, "formResponse");
  
  // 4. Create or link a Google Spreadsheet to store responses
  const ss = SpreadsheetApp.create("Portfolio Contact Messages (Ledger)");
  form.setDestination(FormApp.DestinationType.SPREADSHEET, ss.getId());
  
  // 5. Register onFormSubmit Trigger automatically
  ScriptApp.newTrigger("handleFormSubmit")
    .forForm(form)
    .onFormSubmit()
    .create();
    
  // 6. Print formatted configuration for your portfolio
  Logger.log("\n========================================================");
  Logger.log("🎉 SUCCESS! FORM CREATED & CONFIGURED AUTOMATICALLY");
  Logger.log("========================================================");
  Logger.log(`Form Edit URL: ${form.getEditUrl()}`);
  Logger.log(`Spreadsheet Ledger: ${ss.getUrl()}`);
  Logger.log("--------------------------------------------------------");
  Logger.log("COPY AND PASTE THIS INTO assets/js/modules/constants.js:\n");
  
  const configSnippet = `googleForm: {
  actionUrl: '${actionUrl}',
  entries: {
    name: '${nameEntry}',
    email: '${emailEntry}',
    subject: '${subjectEntry}',
    message: '${messageEntry}',
  },
  enabled: true,
},`;
  
  Logger.log(configSnippet);
  Logger.log("========================================================\n");
}


/**
 * TRIGGER FUNCTION: Executes on every submission
 * 1. Sends email notification to Aaradhya with 1-click Reply-To.
 * 2. Sends confirmation receipt to the visitor.
 */
function handleFormSubmit(e) {
  if (!e || !e.response) return;
  
  const itemResponses = e.response.getItemResponses();
  let name = "Visitor";
  let email = "";
  let subject = "Portfolio Inquiry";
  let message = "";
  
  itemResponses.forEach(res => {
    const title = res.getItem().getTitle().toLowerCase().trim();
    const val = res.getResponse();
    if (title === "name") name = val;
    else if (title === "email") email = val;
    else if (title === "subject") subject = val || subject;
    else if (title === "message") message = val;
  });
  
  if (!email) return;

  // ── 1. Notification to Aaradhya ─────────────────────────────
  const alertSubject = `[Portfolio Contact] ${subject} — ${name}`;
  const alertBody = 
`You received a new inquiry from https://aaradhyadt.github.io

From: ${name} (${email})
Subject: ${subject}
Date: ${new Date().toLocaleString()}

Message:
--------------------------------------------------
${message}
--------------------------------------------------

* Reply directly to this email to respond to ${name}.`;

  GmailApp.sendEmail(NOTIFICATION_EMAIL, alertSubject, alertBody, {
    name: "Portfolio Notification",
    replyTo: email, // Clicking "Reply" in Gmail replies directly to the visitor!
  });

  // ── 2. Auto-Reply to the Visitor ────────────────────────────
  const receiptSubject = `Thank you for reaching out — Aaradhya Dev Tamrakar`;
  const receiptHtml = `
    <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; max-width: 580px; margin: 0 auto; color: #1e1e1e; line-height: 1.6;">
      <h2 style="color: #0f0e0c; font-size: 1.25rem; margin-bottom: 0.5rem;">Message Received</h2>
      <p>Hi ${name},</p>
      <p>Thank you for getting in touch through my portfolio. I've received your note regarding <strong>"${subject}"</strong> and will get back to you within 48 hours.</p>
      
      <div style="background: #f6f4ee; border-left: 3px solid #d4a85a; padding: 14px 18px; margin: 20px 0; border-radius: 4px;">
        <div style="font-size: 0.75rem; text-transform: uppercase; letter-spacing: 0.08em; color: #7a756b; margin-bottom: 6px; font-weight: 600;">Your Message</div>
        <div style="white-space: pre-wrap; font-size: 0.92rem; color: #2d2924;">${message}</div>
      </div>
      
      <p style="margin-top: 24px;">Warm regards,</p>
      <p style="margin: 0; line-height: 1.4;">
        <strong>Aaradhya Dev Tamrakar</strong><br>
        <span style="font-size: 0.85rem; color: #666;">Electronics & Intelligent Systems Engineer</span><br>
        <a href="https://aaradhyadt.github.io" style="color: #d4a85a; text-decoration: none; font-size: 0.85rem;">aaradhyadt.github.io</a>
      </p>
    </div>
  `;

  GmailApp.sendEmail(email, receiptSubject, "", {
    name: SENDER_NAME,
    htmlBody: receiptHtml,
    replyTo: NOTIFICATION_EMAIL
  });
}
