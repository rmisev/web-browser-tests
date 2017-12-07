// Parses URLs from the list and shows parsing results in a table

(function() {
  function parseUrl(src, properties) {
    // parse src
    let url;
    try {
      if (typeof src === 'string')
        url = new URL(src);
      else
        return null;
    } catch (ex) {
      return [ src, "Error" ];
    }
    // parsed successfully
    let res = [ src, "OK" ];
    for (var i = 0; i < properties.length; i++) {
      const prop = properties[i];
      res.push(url[prop]);
    }
    return res;
  }

  function createElementWithText(name, text) {
    let e = document.createElement(name);
    e.appendChild(document.createTextNode(text));
    return e;
  }

  function addTableHead(table, properties) {
    let header = table.createTHead();
    let row = header.insertRow();
    row.appendChild(createElementWithText("th", "Source"));
    row.appendChild(createElementWithText("th", "Result"));
    for (var i = 0; i < properties.length; i++) {
      const prop = properties[i];
      row.appendChild(createElementWithText("th", prop));
    }
  }

  function addTableRow(tbody, properties, res) {
    let row = tbody.insertRow();
    const colCount = 2 + properties.length;
    for (var col = 0; col < colCount; col++) {
      let cell = row.insertCell();
      if (col < res.length)
        cell.appendChild(document.createTextNode(res[col]));
    }
  }

  function runTests({url_list, url_properties}) {
    let div = document.getElementById("results");
    let table = document.createElement("table");
    div.appendChild(table);

    addTableHead(table, url_properties);
    let tbody = table.createTBody();
    for (var j = 0; j < url_list.length; j++) {
      var src = url_list[j];
      var res = parseUrl(src, url_properties);
      if (res)
        addTableRow(tbody, url_properties, res);
    }
  }

  var xhr = new XMLHttpRequest();
  xhr.overrideMimeType("application/json");
  xhr.open("GET", "url-parse-data/idna-empty-host.json", true);
  xhr.onreadystatechange = function () {
    if(xhr.readyState === XMLHttpRequest.DONE && xhr.status === 200) {
      let obj = JSON.parse(xhr.responseText);
      runTests(obj);
    }
  };
  xhr.send();

})();
