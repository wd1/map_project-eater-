var mydata;
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
$.ajax({
    url:'asset/samplefileforctms.csv',
    success: function (data){
      mydata = (csvJSON(data.trim()));
      var geocoder = new google.maps.Geocoder();
      geocodeAddress(geocoder, map);
      // console.log(e);
      
      // var data = e.target.result();
      // console.log(data);
      // var workbook = XLSX.read(data, {
      //   type: 'binary'
      // });

      // workbook.SheetNames.forEach(function(sheetName) {
      //   // Here is your object
      //   var XL_row_object = XLSX.utils.sheet_to_row_object_array(workbook.Sheets[sheetName]);
      //   var json_object = JSON.stringify(XL_row_object);
      //   console.log(json_object);

      // })
      //parse your data here
      //you can split into lines using data.split('\n') 
      //an use regex functions to effectively parse it

    }
  });

function geocodeAddress(geocoder, resultsMap) {
  for (i=0; i<mydata.length; i++) {
    setTimeout(doSomething(geocoder,resultsMap,i), 1);
  }
  doSomething(geocoder, resultsMap,0);
}

function doSomething(geocoder, resultsMap,i) {
  if(i==mydata.length)
    return;
  var address = mydata[i].Addresssrc + " " + mydata[i].Citysrc + " " + mydata[i].Statesrc;
  // console.log(mydata[i]);
  var temp_content =`
        <section id="mydata`+i+`" class="c-mapstack__card" data-slug="intro" style="display: block;">
          <h1>`+address+`</h1>
          <h2 class="c-entry-summary p-dek">$`+mydata[i].price+`</h2>
          <div class="c-mapstack__photo">
              <figure class="e-image">
                  <span class="e-image__inner">
                      <span class="e-image__image " data-original="">
                          <picture class="c-picture" data-cid="" data-cdata="">
                              <img src="`+mydata[i].Imagesrc+`">
                          </picture>
                      </span>
                  </span>
                  <span class="e-image__meta">
                  </span>
              </figure>
          </div>
          <div class="c-entry-content">
              <p>`+mydata[i].description+`</p>
        </div>
      </section>`;
  var content_panel = document.getElementById("content_panel");
  content_panel.innerHTML+=(temp_content);
  // var address = "56 Davis Rd Orinda CA";
  geocoder.geocode({'address': address}, function(results, status) {
    if (status === 'OK') {
      resultsMap.setCenter(results[0].geometry.location);
      var marker = new google.maps.Marker({
        map: resultsMap,
        position: results[0].geometry.location
      });
      marker.addListener('click', function() {
          map.setCenter(marker.getPosition());
          var scale = Math.pow(2, map.getZoom());
          x_offset = document.getElementById("map").offsetWidth / 5;
          var worldCoordinateCenter = map.getProjection().fromLatLngToPoint(marker.getPosition());
          var pixelOffset = new google.maps.Point((x_offset/scale) || 0,(0/scale) ||0);

          var worldCoordinateNewCenter = new google.maps.Point(
              worldCoordinateCenter.x - pixelOffset.x,
              worldCoordinateCenter.y + pixelOffset.y
          );

          var newCenter = map.getProjection().fromPointToLatLng(worldCoordinateNewCenter);

          map.setCenter(newCenter);

          $('html, body').animate({
                scrollTop: $("#mydata"+i).offset().top
            }, 500);
      }); 
      // setTimeout(doSomething(geocoder,resultsMap,i+1), 1000);
    } else {
      console.log(results);
      alert('Geocode was not successful for the following reason: ' + status);
    }
  });
}