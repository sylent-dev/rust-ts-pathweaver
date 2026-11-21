// The phone page (2m): the message in place of the application under 600 px; the note of U14 kept, and six more
// ways of it, each in a phone of 390 × 844 px; its mouth and its colour chosen with the lists « Mouth » and « Note »
// (js/phone-page.js).

addSection(() => ["The phone page · under 600 px, one message in place of the application: the note of U14 and six more ways, its mouth and its colour in the lists at the top",
  Object.entries(PHONE_FACES).map(([key, [label]]) => [label, phoneWindow(key)])]);
