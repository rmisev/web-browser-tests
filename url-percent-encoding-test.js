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

  // checks url.href value
  function codePointTest(cp) {
    const hrefStart = strUrlToTest + urlPartStart[attribute];
    try {
      // parse
      let url = new URL(strUrlToTest);

      // set value with code point
      url[attribute] = urlPartDelimiter[attribute] + "X" + String.fromCodePoint(cp) + "X";

      // extract char value from the url
      if (url.href.startsWith(hrefStart + "X") && url.href.endsWith("X")) {
        const actual_val = url.href.substring(hrefStart.length + 1, url.href.length - 1);

        // is percent encoded?
        if (actual_val === String.fromCodePoint(cp))
          return 0; // no

        if (actual_val === percentEncodeCP(cp))
          return 1; // percent encoded

        if (actual_val.length === 0)
          return 2; // ignored
      }
    } catch (ex) {
      return 4; // failure
    }
    return 3; // changed
  }

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
