function doPost(e) {
  if (e == null || e.postData == null || e.postData.contents == null) {
    return;
  }

  var contents = decodeForm(e.postData.contents);
  var json = JSON.parse(contents.payload);

  var tasks = SpreadsheetApp.getActive().getSheetByName('tasks');
  var task = ['', nextDate(json.actions[0].value), json.original_message.text];
  var original_actions = json.original_message.attachments[0].actions;
  for (var i = 0; i < original_actions.length; i++) {
    task.push(original_actions[i].value);
  }
  tasks.appendRow(task);

  var output = ContentService.createTextOutput('ok, notice you again after ' + json.actions[0].value);
  output.setMimeType(ContentService.MimeType.TEXT);
  return output;
}

function doGet(e) {
  var output = ContentService.createTextOutput("cannot accept by GET request");
  output.setMimeType(ContentService.MimeType.TEXT);
  return output;
}

function triggerEvent() {
  var vars = getVars();
  var sheet = SpreadsheetApp.getActive().getSheetByName('tasks');
  var data = sheet.getDataRange().getValues();
  for (var i = 1, task = data[i]; i < data.length; task = data[++i]) {
    if (task[0] == '済' || (new Date()) < (new Date(task[1]))) {
      continue;
    }
    var message = task[2];
    if (task[3] != '' ) { // existent actions
      var attachment = {
        'text': 'How much time would you like to extend?',
        'fallback': 'You may set next notify in the spreadsheet.',
        'callback_id': 'slack_notify_spreadsheet',
        'attachment_type': 'default',
        'actions': []
      };
      for (var a = 3; a < task.length; a++) {
        attachment.actions.push({
          'type': 'button',
          'name': task[a],
          'text': task[a],
          'value': task[a]
        });
      }
    }
    notifySlack(message, null, null, null, attachment ? [attachment] : null);
    sheet.getRange(i + 1, 1).setValue('済');
  };
}

function notifySlack(message, channel, username, icon_emoji, attachments) {
  var outgoingWebhook = getVars().outgoingWebhook[0];
  var payload = {
    'text': message,
    'channel': channel || 'general',
    'username': username || '',
    'icon_emoji': icon_emoji || '',
    'attachments': attachments || []
  };
  var opts = {
    "method": "post",
    "contentType": "application/json",
    "payload" : JSON.stringify(payload)
  };
  var res = UrlFetchApp.fetch(outgoingWebhook, opts);
  return res;
}

function getVars() {
  var sheet = SpreadsheetApp.getActive().getSheetByName('vars');
  var values = sheet.getDataRange().getValues();
  var data = {};
  for (var i = 0, l = values.length; i < l; i++) {
    var key = values[i].shift();
    if (key.length > 0) {
      data[key] = values[i];
    }
  }
  var w = data.webhookUrl;
  return data;
}

function decodeForm(src) {
  var dest = {};
  var pairs = unescape(src).split(/[;&]/);
  for (var i = 0; i < pairs.length; i++ ) {
    var pair = pairs[i].split('=', 2);
    dest[pair[0]] = pair[1];
  }
  return dest;
}

function nextDate(offset) {
  var now = new Date();
  var n = parseInt(offset);
  switch (offset.toLowerCase().split(/\d+/)[1][0]) {
    case 'd':
      now.setDate(now.getDate() + n);
      break;
    case 'h':
      now.setHours(now.getHours() + n);
      break;
    case 'm':
      now.setMinutes(now.getMinutes() + n);
      break;
  }
  return now;
}
