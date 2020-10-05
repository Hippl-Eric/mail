document.addEventListener('DOMContentLoaded', function() {

  // Use buttons to toggle between views
  document.querySelector('#inbox').addEventListener('click', () => load_mailbox('inbox'));
  document.querySelector('#sent').addEventListener('click', () => load_mailbox('sent'));
  document.querySelector('#archived').addEventListener('click', () => load_mailbox('archive'));
  document.querySelector('#compose').addEventListener('click', () => compose_email());

  // Call send_email rather than submit compose form
  document.querySelector('#compose-form').onsubmit = function() {
    send_email();
    return false;
  };

  // By default, load the inbox
  load_mailbox('inbox');

});

function show_view(idView) {
/* Helper function to display specified view and hide other views*/

  const allViews = document.getElementById('view-container').children;
  for (const view of allViews) {
    if (view.id === idView) {
      view.style.display = 'block';
    }
    else {
      view.style.display = 'none';
    };
  };
};

function compose_email() {
/* Load the compose email form */

  // Show compose view and hide other views
  show_view('compose-view');

  // Clear out composition fields
  document.querySelector('#compose-recipients').value = '';
  document.querySelector('#compose-subject').value = '';
  document.querySelector('#compose-body').innerHTML = '';
};

function load_mailbox(mailbox) {
/* Load the specified mailbox */
  
  // Load the mailbox's emails
  fetch(`emails/${mailbox}`)
  .then(response => response.json())
  .then(data => {

    // Invalid mailbox
    if (data.error){
      alert(`Sorry: ${data.error}`);
    }

    // Success
    else {

      // Show the mailbox and hide other views
      const emailView = document.querySelector('#emails-view');
      show_view('emails-view')
      emailView.innerHTML = `<h3>${mailbox.charAt(0).toUpperCase() + mailbox.slice(1)}</h3>`;

      // Iterate through each email
      data.forEach(email => {

        // Create an element for each email
        const emailDiv = document.createElement('div');

        // Determine email label. Set recipient for sent, or sender for inbox
        let address = ""
        if (mailbox == 'sent') {
          address = email.recipients[0]
        }
        else {
          address = email.sender
        }

        // Email Content
        const addressDiv = document.createElement('span');
        addressDiv.innerHTML = `<b>${address}</b>`;
        addressDiv.setAttribute('class', 'address');
        const subjectDiv = document.createElement('span');
        subjectDiv.innerHTML = email.subject;
        subjectDiv.setAttribute('class', 'subject');
        const timeDiv = document.createElement('span');
        timeDiv.innerHTML = email.timestamp;
        timeDiv.setAttribute('class', 'time');

        // Add attributes
        emailDiv.append(addressDiv, subjectDiv, timeDiv);
        emailDiv.setAttribute('id', email.id)
        emailDiv.setAttribute('class', 'email-box');
        emailDiv.addEventListener('click', load_email);

        // Check if email is read
        if (email.read === true) {
          emailDiv.classList.add('read')
        }
        else {
          emailDiv.classList.add('unread')
        }

        // Append email to the page
        emailView.append(emailDiv);
      });
    };
  })
  .catch(error => {
    console.error(error);
  });
};

function send_email() {
/* Called from form submission from compose-view */

  // Grab the form elements
  const recipients = document.querySelector('#compose-recipients');
  const subject = document.querySelector('#compose-subject');
  const body = document.querySelector('#compose-body');

  // Submit form values for validation
  fetch('/emails', {
    method: 'POST',
    body: JSON.stringify({
      recipients: recipients.value,
      subject: subject.value,
      body: body.value,
    })
  })
  .then(response => response.json())
  .then(data => {

    // Handel errors
    if (data.error){
      alert(`Sorry: ${data.error}`);
    }

    // Email sent successfully
    else {
      load_mailbox('sent');
    };
  })
  .catch(error => {
    console.error(error);
  });
};

function load_email() {
/* Show email after user clicks */

  // Grab id from email
  const emailID = parseInt(this.id);

  // Fetch email contents
  fetch(`/emails/${emailID}`)
  .then(response => response.json())
  .then(data => {

    // Invalid email
    if(data.error){
      alert(`Sorry: ${data.error}`);
    }

    // Success
    else{

      // Show the read email view and clear any previous content
      readView = document.querySelector('#read-view');
      readView.innerHTML = "";
      show_view('read-view');

      // Create element
      const emailPage = document.createElement('div');
      emailPage.setAttribute('class', 'email-page');

      // Email content
      const senderDiv = document.createElement('div');
      senderDiv.innerHTML = `<b>From:</b> ${data.sender}`;
      const recipientsDiv = document.createElement('div');
      recipientsDiv.innerHTML = `<b>To:</b> ${data.recipients}`;
      const subjectDiv = document.createElement('div');
      subjectDiv.innerHTML = `<b>Subject:</b> ${data.subject}`;
      const timeDiv = document.createElement('div');
      timeDiv.innerHTML = `${data.timestamp},<hr>`;
      const bodyDiv = document.createElement('div');
      bodyDiv.innerHTML = `${data.body},<hr>`;

      // Archive/Unarchive button
      const archButton = document.createElement('button');
      archButton.setAttribute('id', 'archive-btn');
      archButton.setAttribute('class', 'btn btn-sm btn-outline-primary');
      archButton.addEventListener('click', function() {
        archive(emailID);
      });
      if (data.archived == true) {
        archButton.innerHTML = 'Unarchive';
      }
      else {
        archButton.innerHTML = "Archive";
      };

      // Reply Button
      const replyButton = document.createElement('button');
      replyButton.setAttribute('class', 'btn btn-primary');
      replyButton.addEventListener('click', function() {
        reply(emailID);
      });
      replyButton.innerHTML = 'Reply';

      // Add to page
      emailPage.append(archButton, senderDiv, recipientsDiv, subjectDiv, timeDiv, bodyDiv, replyButton);
      readView.append(emailPage);

      // Mark email as read
      if (data.read == false) {
        return fetch(`/emails/${emailID}`, {
          method: 'PUT',
          body: JSON.stringify({
            read: true,
          })
        });
      };
    };
  })
  .catch(error => {
    console.error(error);
  });
};

function archive(emailID) {
  /* Toggle an emails archive state and update archive button */

  const btn = document.querySelector('#archive-btn');

  // Determine if email is archived and toggle button label
  fetch(`/emails/${emailID}`)
  .then(response => response.json())
  .then(data => {

    // Invalid Email
    if (data.error) {
      alert(`Sorry: ${data.error}`);
    }

    // Success
    else {

      if (data.archived == true) {
        btn.innerHTML = 'Archive';
      }
      else {
        btn.innerHTML = "Unarchive";
      };
      
      // Update email's archive bool
      return fetch(`/emails/${emailID}`, {
        method: 'PUT',
        body: JSON.stringify({
          archived: !data.archived,
        })
      });
    };
  })
  .catch(error => {
    console.error(error);
  });
};

function reply(emailID) {
/* Load the new email composition form, pre-fill inputs */

  // Grab email
  fetch(`/emails/${emailID}`)
  .then(response => response.json())
  .then(data => {

    // Invalid Email
    if (data.error) {
      alert(`Sorry: ${data.error}`);
    }

    // Success
    else {

      // Show compose view and hide other views
      show_view('compose-view');

      // Pre-fill the "To:" field
      document.querySelector('#compose-recipients').value = data.sender;

      // Pre-fill the "Subject" field
      document.querySelector('#compose-subject').value = `RE: ${data.subject.replace("RE: ", "")}`;

      // Load previous message in body field
      const bodyVal = `On ${data.timestamp} ${data.sender} wrote:\n${data.body}\n\n`;
      document.querySelector('#compose-body').innerHTML = bodyVal;
    };
  })
  .catch(error => {
    console.error(error);
  });
};