function triggerEvent() {
  var sheet = SpreadsheetApp.getActive().getSheetByName('tasks');
  var tasks = sheet.getDataRange().getValues();
  tasks.shift(); // skip header
  for (var i = 1, task = tasks.shift(); task; i++, task = tasks.shift()) {
    var finished = task.shift(), trigger = task.shift();
    if (finished == '済' || (new Date()) < (new Date(trigger))) {
      continue;
    }
    var message = task.shift();
    if (task[0] != '' ) { // existent actions
      var attachment = {
        'text': 'How much time would you like to extend?',
        'fallback': 'You may set next notify in the spreadsheet.',
        'callback_id': 'slack_notify_spreadsheet',
        'attachment_type': 'default',
        'actions': []
      };
      for (var v = task.shift(); v; v = task.shift()) {
        attachment.actions.push({'type': 'button', 'name': v, 'text': v, 'value': v});
      }
    }
    notifySlack(message, null, null, null, attachment ? [attachment] : null);
    sheet.getRange(i + 1, 1).setValue('済');
  };
}

function doPost(e) {
  if (e == null || e.postData == null || e.postData.contents == null) {
    return;
  }

  var payload = JSON.parse(decodeForm(e.postData.contents).payload);
  var tasks = SpreadsheetApp.getActive().getSheetByName('tasks');
  var task = ['', nextDate(payload.actions[0].value), payload.original_message.text];
  var actions = payload.original_message.attachments[0].actions;
  for (var a = actions.shift(); a; a = actions.shift()) {
    task.push(a.value);
  }
  tasks.appendRow(task);

  var output = ContentService.createTextOutput('ok, notice you again after ' + payload.actions[0].value);
  output.setMimeType(ContentService.MimeType.TEXT);
  return output;
}

function doGet(e) {
  var output = ContentService.createTextOutput("cannot accept by GET request");
  output.setMimeType(ContentService.MimeType.TEXT);
  return output;
}

function notifySlack(message, channel, username, icon_emoji, attachments) {
  var slack = getProps().slackWebhook;
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
  return UrlFetchApp.fetch(slack, opts);
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

function decodeForm(src) {
  var dest = {};
  var pairs = unescape(src).split(/[;&]/);
  for (var pair = pairs.shift(); pair; pair = pairs.shift()) {
    var v = pair.split('=', 2);
    dest[v[0]] = v[1].replace(/\+/g, ' ');
  }
  return dest;
}

function getProps() {
  return PropertiesService.getScriptProperties().getProperties();
}
