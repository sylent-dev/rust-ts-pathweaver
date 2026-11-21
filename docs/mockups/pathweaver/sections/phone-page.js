// The phone page (2m): the message in place of the application under 600 px, twelve disappointed faces, three at
// each of four temperatures, each in a phone of 390 × 844 px (js/phone-page.js).

addSection(() => ["The phone page · under 600 px, one message in place of the application: twelve disappointed faces",
  Object.entries(PHONE_FACES).map(([key, [label]]) => [label, phoneWindow(key)])]);
