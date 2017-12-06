function csvJSON(csv){
  var lines=csv.split("\n");
  var result = [];

  var headers=lines[0].split(",");
  var price_index = headers.indexOf("Sale Price");
  headers.splice(price_index, 1);
  var description_index = headers.indexOf("Description");
  headers.splice(description_index, 1);
  for(var i=1;i<lines.length;i++){
    
    var obj = {};
    var before_price = lines[i].split('"$')[0];
    var temp = lines[i].split('"$')[1];
    var price = temp.split('","')[0];
    var after_price = temp.split('","')[1];
    var find = ',';
    var re = new RegExp(find, 'g');
    price = price.replace(re, '');
    
    if(!after_price)
    {
      after_price = temp.split('",')[1];
      if(!after_price)
        continue;
    }
    // console.log(after_price);
    var description = after_price.split('https:')[0];
    if(description.indexOf('",'))
      description = description.split('",')[0];
    after_price = "https:"+after_price.split('https:')[1];
    obj["price"] = price;
    obj["description"] = description;
    var process_str = before_price + after_price;
    var currentline=process_str.split(","); 

    for(var j=0;j<headers.length;j++){
      obj[headers[j].trim()+"src"] = currentline[j];
    }
    result.push(obj);
  }
  //return result; //JavaScript object
  return (result); //JSON
}
function sleep(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}
$.ajax({
    url:'asset/samplefileforctms.csv',
    success: function (data){
      mydata = (csvJSON(data.trim()));
      var geocoder = new google.maps.Geocoder();
      geocodeAddress(geocoder);
    }
  });

function geocodeAddress(geocoder) {
  // for (i=0; i<mydata.length; i++) {
  //   sleep(1000).then(() => {
  //     doSomething(geocoder,resultsMap,i);  
  //   });
    
  // }
  doSomething(geocoder,0);
}

function doSomething(geocoder,i) {
  console.log(i);
  if(i==mydata.length){
    console.log(mydata);
    console.log(JSON.stringify(mydata));
    $.ajax({
      url:'makedb.php',
      type: "POST",
      data: {data: JSON.stringify(mydata)},
      success: function(data) {
        console.log(data);
      }
    })
    return;
  }
  var address = mydata[i].Addresssrc + " " + mydata[i].Citysrc + " " + mydata[i].Statesrc;
  // console.log(mydata[i]);

  // var address = "56 Davis Rd Orinda CA";
  geocoder.geocode({'address': address}, function(results, status) {
    if (status === 'OK') {
      mydata[i].lat =results[0].geometry.location.lat();
      mydata[i].lng =results[0].geometry.location.lng();
    } else {
      console.log(results);
      alert('Geocode was not successful for the following reason: ' + status);
    }
    // setTimeout(doSomething(geocoder,resultsMap,i+1), 10000);
    
      sleep(1000).then(() => {
        console.log(i);
        doSomething(geocoder,i+1);  
      });

  });
}
