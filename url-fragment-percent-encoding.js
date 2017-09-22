// code points to test
const firstCodePoint = 1;
const lastCodePoint = 255;

// testing object
var url = new URL("http://example.com/#");

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

function codePointTest(cp) {
  const frag_src = "#" + String.fromCodePoint(cp);

  // clear
  url.hash = "";

  // test
  url.hash = frag_src;

  if (url.hash === frag_src)
    return 0; // does not encode

  const frag_enc = "#" + percentEncodeCP(cp);
  if (url.hash === frag_enc)
    return 1; // encodes

  return 2; // failure
}


function testUrlFragmentPercentEncoding() {
  var strIntervals = "";

  function addInterval(res, cpFrom, cpTo) {
    function addItem(delim, cp) {
      //TODO: text style by res
      strIntervals += delim;
      strIntervals += cp.toString(16);
    }

    // show chars which browser percent encodes
    if (res === 1) {
      addItem(" ", cpFrom);
      let count = cpTo - cpFrom + 1;
      if (count >= 2) {
        addItem(count === 2 ? " " : "...", cpTo);
      }
    }
  }

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
