document.addEventListener('DOMContentLoaded', function() {

  // Use buttons to toggle between views
  document.querySelector('#inbox').addEventListener('click', () => load_mailbox('inbox'));
  document.querySelector('#sent').addEventListener('click', () => load_mailbox('sent'));
  document.querySelector('#archived').addEventListener('click', () => load_mailbox('archive'));
  document.querySelector('#compose').addEventListener('click', compose_email);

  // Compose email button
  document.querySelector('#compose-form').onsubmit = function() {
    send_email();
    return false;
  };

  // By default, load the inbox
  load_mailbox('inbox');

});

function show_view(idView) {
/* Helper function to display specified view and hide other views*/

  allViews = document.getElementById('view-container').children;
  for (const view of allViews) {
    if (view.id === idView) {view.style.display = 'block';}
    else {view.style.display = 'none';}
  };
}

function compose_email() {

  // Show compose view and hide other views
  show_view('compose-view');

  // Clear out composition fields
  document.querySelector('#compose-recipients').value = '';
  document.querySelector('#compose-subject').value = '';
  document.querySelector('#compose-body').value = '';
};

function load_mailbox(mailbox) {
  
  // Show the mailbox and hide other views
  const emailView = document.querySelector('#emails-view');
  show_view('emails-view')

  // Show the mailbox name
  emailView.innerHTML = `<h3>${mailbox.charAt(0).toUpperCase() + mailbox.slice(1)}</h3>`;

  // Load the mailbox's emails
  fetch(`emails/${mailbox}`)
  .then(response => response.json())
  .then(data => {
    data.forEach(email => {

      // Create an element for each email
      const emailDiv = document.createElement('div');

      // Determine email label. Set recipient for sent, or sender for inbox
      let emailLabel = ""
      if (mailbox == 'sent') {
        emailLabel = email.recipients[0]
      }
      else {
        emailLabel = email.sender
      }

      // Add attributes
      emailDiv.innerHTML = `${emailLabel} ${email.subject} ${email.timestamp}`;
      emailDiv.addEventListener('click', load_email);
      emailDiv.setAttribute('id', email.id)
      emailDiv.setAttribute('class', 'email-box');

      // Check if email is read and add appropriate class
      if (email.read === true) {emailDiv.classList.add('read')}
      else {emailDiv.classList.add('unread')}

      // Append email to the page
      emailView.append(emailDiv);
    });
  })
};

function send_email() {
  console.log("SEND EMAIL!");
  
  // Grab the form elements
  const recipients = document.querySelector('#compose-recipients');
  const subject = document.querySelector('#compose-subject');
  const body = document.querySelector('#compose-body');

  // Submit form values for validation and 
  fetch('/emails', {
    method: 'POST',
    body: JSON.stringify({
      recipients: recipients.value,
      subject: subject.value,
      body: body.value,
    })
  })
  .then((response) => {

    // Email sent successfully 
    if (response.status === 201) {
      console.log("SUCCESS");
      load_mailbox('sent');
    }

    // Error
    else {
      console.log("ERROR");
    }
  })
};

function load_email() {
/* Show email after user clicks */

  // Show the read email view and clear any previous content
  readView = document.querySelector('#read-view');
  readView.innerHTML = "";
  show_view('read-view')

  // Grab id from email
  const emailID = parseInt(this.id)

  // Fetch email contents
  fetch(`/emails/${emailID}`)
  .then(response => response.json())
  .then(email => {

    // Create element
    const emailPage = document.createElement('div');
    emailPage.setAttribute('class', 'email-page');

    // Email content
    const senderDiv = document.createElement('div');
    senderDiv.innerHTML = `From: ${email.sender}`;
    const recipientsDiv = document.createElement('div');
    recipientsDiv.innerHTML = `To: ${email.recipients}`;
    const timeDiv = document.createElement('div');
    timeDiv.innerHTML = email.timestamp;
    const subjectDiv = document.createElement('div');
    subjectDiv.innerHTML = `Subject: ${email.subject}`;
    const bodyDiv = document.createElement('div');
    bodyDiv.innerHTML = email.body;

    // Add to page
    emailPage.append(senderDiv, recipientsDiv, timeDiv, subjectDiv, bodyDiv);
    readView.append(emailPage);
  })

  // Mark email as read
  // fetch(`/emails/${emailID}`, {
  //   method = 'PUT',
    // Read?
  // })
}