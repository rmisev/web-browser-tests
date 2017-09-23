// code points to test
const firstCodePoint = 1;
const lastCodePoint = 255;

// testing object
var url = new URL("http://example.com/");

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

function codePointTest(cp, attribute) {
  const partDelim = urlPartDelimiter[attribute];
  const part_src = partDelim + String.fromCodePoint(cp);
  
  // clear
  url[attribute] = "";
  
  // test
  url[attribute] = part_src;

  if (url[attribute] === part_src)
    return 0; // does not encode

  const part_enc = partDelim + percentEncodeCP(cp);
  if (url[attribute] === part_enc)
    return 1; // encodes

  return 2; // failure
}


function testUrlPercentEncoding(attribute) {
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

  let cpStart = firstCodePoint;
  let resStart = 0;

  for (let cp = firstCodePoint; cp <= lastCodePoint; cp++) {
    let res = codePointTest(cp, attribute);

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
