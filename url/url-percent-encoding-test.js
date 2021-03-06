// code points to test
const firstCodePoint = 0;
const lastCodePoint = 255;
const strUrlToTest = "http://example.com/";

// names of the control characters and space
// https://tools.ietf.org/html/rfc20
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
  return (cp < 0x10 ? "0x0" : "0x") + cp.toString(16).toUpperCase() + " (" + chrCodePoint(cp) + ")";
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

var elemA = document.createElement('a');
const mapCreateURL = {
  "A": function(strUrl) {
    elemA.href = strUrl;
    return elemA;
  },
  "URL": function(strUrl) {
    return new URL(strUrl);
  }
};


function testingCharsRange() {
  return strCodePoint(firstCodePoint) + "..." + strCodePoint(lastCodePoint);
}

function testUrlPercentEncoding(attribute, method, testUrl) {
  if (!testUrl) testUrl = strUrlToTest;

  // checks url.href value
  function codePointTest(cp) {
    const hrefStart = testUrl + urlPartStart[attribute];
    const prefixCh = "X";
    const endingCh = "Y";
    try {
      // parse
      let url = mapCreateURL[method](testUrl);

      // set value with code point
      url[attribute] = urlPartDelimiter[attribute] +
        prefixCh + String.fromCodePoint(cp) + endingCh;

      // check the url.href value
      if (url.href.startsWith(hrefStart + prefixCh)) {
        if (url.href.length === hrefStart.length + 1) {
          return 4; // stopped on char
        } else if (url.href.endsWith(endingCh)) {
          // extract char value from the url
          const actual_val = url.href.substring(hrefStart.length + 1, url.href.length - 1);

          // is percent encoded?
          if (actual_val === String.fromCodePoint(cp))
            return 0; // no

          if (actual_val === percentEncodeCP(cp))
            return 1; // percent encoded

          if (actual_val.length === 0)
            return 2; // ignored

          return 3; // changed
        }
      }
    } catch (ex) {
      return 5; // failure
    }
    return 6; // unknown
  }

  // output
  var theIntervals = new Map();

  function addInterval(res, cpFrom, cpTo) {
    function addItem(res, item) {
      let arr = theIntervals.get(res);
      if (arr) {
        arr.push(item);
      } else {
        theIntervals.set(res, [item]);
      }
    }

    if (res >= 1) {
      let count = cpTo - cpFrom + 1;
      switch (count) {
      case 2:
        addItem(res, strCodePoint(cpFrom));
      case 1:
        addItem(res, strCodePoint(cpTo));
        break;
      default:
        addItem(res, strCodePoint(cpFrom) + "..." + strCodePoint(cpTo));
        break;
      }
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

  return theIntervals;
}
