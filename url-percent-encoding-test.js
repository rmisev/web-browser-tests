// code points to test
const firstCodePoint = 1;
const lastCodePoint = 255;
const strUrlToTest = "http://example.com/";

const c0names = [
  "NUL", "SOH", "STX", "ETX", "EOT", "ENQ", "ACK", "BEL", "BS",  "HT", "LF",  "VT",  "FF", "CR", "SO", "SI",
  "DLE", "DC1", "DC2", "DC3", "DC4", "NAK", "SYN", "ETB", "CAN", "EM", "SUB", "ESC", "FS", "GS", "RS", "US",
  "SP"
];

function strCodePoint(cp) {
  function chrCodePoint(cp) {
    if (cp < c0names.length)
      return c0names[cp];
    if (cp === 0x7F)
      return "DEL";
    return String.fromCodePoint(cp);
  }
  return "0x" + cp.toString(16).toUpperCase() + "(" + chrCodePoint(cp) + ")";
}

function percentEncodeCP(cp) {
  if (cp < 0x80) {
    // encode ASCII
    return (cp < 0x10 ? "%0" : "%") + cp.toString(16).toUpperCase();
  } else {
    // encode non ASCII
    const ch = String.fromCodePoint(cp);
    return encodeURIComponent(ch);
  }
}

const urlPartDelimiter = {
   "pathname": "/",
   "search": "?",
   "hash": "#"
};

const urlPartStart = {
   "pathname": "",
   "search": "?",
   "hash": "#"
};


function testUrlPercentEncoding(attribute) {

  // checks url[attribute] value
  function codePointTest_1(cp) {
    const partDelim = urlPartDelimiter[attribute];
    try {
      // parse
      let url = new URL(strUrlToTest);

      // set value with code point
      const part_src = partDelim + "X" + String.fromCodePoint(cp) + "X";
      url[attribute] = part_src;

      // get value
      const actual_val = url[attribute];

      // is percent encoded?
      if (actual_val === part_src)
        return 0; // no

      const part_enc = partDelim + "X" + percentEncodeCP(cp) + "X";
      if (actual_val === part_enc)
        return 1; // percent encoded

    } catch (ex) {
      return 3; // failure
    }
    return 2; // ignored/changed
  }

  // checks url.href value (works with Microsoft Edge)
  function codePointTest_2(cp) {
    const hrefStart = strUrlToTest + urlPartStart[attribute];
    try {
      // parse
      let url = new URL(strUrlToTest);

      // set value with code point
      url[attribute] = urlPartDelimiter[attribute] + "X" + String.fromCodePoint(cp) + "X";

      // is percent encoded?
      const href_src = hrefStart + "X" + String.fromCodePoint(cp) + "X";
      if (url.href === href_src)
        return 0; // no

      const href_enc = hrefStart + "X" + percentEncodeCP(cp) + "X";
      if (url.href === href_enc)
        return 1; // percent encoded

    } catch (ex) {
      return 3; // failure
    }
    return 2; // ignored/changed
  }

  // use the test function which works with Microsoft Edge
  const codePointTest = codePointTest_2;

  // output
  var strIntervals = "";
  let first = true;

  function addInterval(res, cpFrom, cpTo) {
    function addItem(delim, cp) {
      //TODO: text style by res
      strIntervals += delim;
      strIntervals += strCodePoint(cp);
    }

    // show chars which browser percent encodes
    if (res === 1) {
      addItem(first ? "" : ", ", cpFrom);
      let count = cpTo - cpFrom + 1;
      if (count >= 2) {
        addItem(count === 2 ? ", " : "...", cpTo);
      }
      first = false;
    }
  }

  // run test
  let cpStart = firstCodePoint;
  let resStart = 0;

  for (let cp = firstCodePoint; cp <= lastCodePoint; cp++) {
    let res = codePointTest(cp);

    if (resStart !== res) {
      addInterval(resStart, cpStart, cp - 1);
      cpStart = cp;
      resStart = res;
    }
  }
  // finalize
  addInterval(resStart, cpStart, lastCodePoint);

  return strIntervals;
}
