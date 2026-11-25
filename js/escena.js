/* ESCENA — nuevo paisaje compacto de Ruta 1371. Clima real + ciclo solar/lunar. */
(function(){
  var raiz=document.getElementById("escena"),scene,moon,moonLabel,label,rainBox,starBox;
  var lat=(window.CONFIG&&window.CONFIG.clima&&window.CONFIG.clima.latitud)||19.71;
  var lon=(window.CONFIG&&window.CONFIG.clima&&window.CONFIG.clima.longitud)||-98.97;
  var iniciado=false;
  function phase(date){
    var syn=29.530588853,full=Date.UTC(2026,10,24,14,53);
    var days=(date.getTime()-full)/86400000,age=((days%syn)+syn)%syn,p=((age/syn)+.5)%1;
    var name=p<.035||p>.965?"Luna nueva":p<.22?"Creciente":p<.28?"Cuarto creciente":p<.47?"Gibosa creciente":p<.53?"Luna llena":p<.72?"Gibosa menguante":p<.78?"Cuarto menguante":"Menguante";
    var shadow=(p<.5?-1:1)*110*Math.sin(Math.PI*p);
    moon.style.setProperty("--shadow-x",shadow+"%");
    scene.classList.toggle("new-moon",name==="Luna nueva");
    moonLabel.textContent=name==="Luna nueva"?"Luna nueva":name+" · "+Math.round((1-Math.cos(2*Math.PI*p))/2*100)+"%";
  }
  function localPeriod(){
    var now=new Date(),h=now.getHours()+now.getMinutes()/60;
    return h>=5&&h<8?"dawn":h>=8&&h<15?"noon":h>=15&&h<19?"afternoon":"night";
  }
  function positionLights(date,p){
    var h=date.getHours()+date.getMinutes()/60,x,y;
    if(p==="night"){
      var t=h>=19?(h-19)/10:(h+5)/10;
      x=12+t*76;y=56-Math.sin(Math.PI*t)*42;
      scene.style.setProperty("--moon-x",x+"%");
      scene.style.setProperty("--moon-y",y+"%");
      return;
    }
    if(p==="dawn"){var a=Math.max(0,Math.min(1,(h-5)/3));x=8+a*42;y=59-a*50;}
    else if(p==="noon"){x=46+Math.max(0,Math.min(1,(h-8)/7))*8;y=8;}
    else{var t2=Math.max(0,Math.min(1,(h-15)/4));x=54+t2*38;y=60+t2*15;}
    scene.style.setProperty("--sun-x",x+"%");
    scene.style.setProperty("--sun-y",y+"%");
  }
  function setPeriod(p){
    scene.dataset.period=p;
    scene.classList.remove("day","sunset","night","dawn","noon","afternoon");
    scene.classList.add(p);
    label.textContent=({dawn:"Amanecer",noon:"Mediodía",afternoon:"Atardecer",night:"Noche"})[p]||p;
    positionLights(new Date(),p);
  }
  function weatherName(code,cloud,visibility,precip){
    if(code>=95)return "storm";
    if((code>=51&&code<=82)||precip>0.1)return "rain";
    if(code===45||code===48||visibility<4000)return "fog";
    if(cloud>55||code===1||code===2||code===3)return "cloudy";
    return "clear";
  }
  function rainIntensity(code,precip){
    if([55,65,82,99].includes(code)||precip>=2)return "heavy";
    if([53,63,81,95,96].includes(code)||precip>=.5)return "moderate";
    if([51,61,80].includes(code)||precip>0)return "light";
    return "moderate";
  }
  function updateWeather(){
    var url="https://api.open-meteo.com/v1/forecast?latitude="+lat+"&longitude="+lon+"&current=temperature_2m,relative_humidity_2m,apparent_temperature,is_day,precipitation,rain,showers,snowfall,weather_code,cloud_cover,visibility,wind_speed_10m&timezone=America%2FMexico_City";
    fetch(url,{cache:"no-store"}).then(function(r){if(!r.ok)throw Error("HTTP "+r.status);return r.json();}).then(function(d){
      var c=d.current,detected=weatherName(c.weather_code,c.cloud_cover,c.visibility,c.precipitation);
      scene.dataset.weather=detected;
      scene.dataset.rainIntensity=(detected==="rain"||detected==="storm")?rainIntensity(c.weather_code,c.precipitation):"none";
      scene.dataset.temperature=c.temperature_2m;
    }).catch(function(e){console.warn("Clima de escena:",e);});
  }
  function tick(){var now=new Date(),p=localPeriod();setPeriod(p);phase(now);}
  function iniciar(){
    if(iniciado||!raiz)return;
    iniciado=true;scene=raiz.querySelector(".scene");
    if(!scene)return;
    moon=raiz.querySelector(".moon");moonLabel=raiz.querySelector(".moon-label");label=raiz.querySelector(".scene-label");
    rainBox=raiz.querySelector(".rain-layer");starBox=raiz.querySelector(".stars");
    for(var i=0;i<115;i++){
      var drop=document.createElement("i");drop.style.left=(Math.random()*110-5)+"%";
      drop.style.setProperty("--delay",(-Math.random()*2.5)+"s");
      drop.style.setProperty("--fall",(.8+Math.random()*.7)+"s");
      drop.style.height=(9+Math.random()*8)+"px";rainBox.appendChild(drop);
    }
    for(var j=0;j<46;j++){
      var s=document.createElement("i");s.className="twinkle";
      s.style.position="absolute";s.style.left=(Math.random()*98)+"%";s.style.top=(Math.random()*78)+"%";
      s.style.width=(j%6===0?3:2)+"px";s.style.height=s.style.width;s.style.borderRadius="50%";
      s.style.background="#fff";s.style.boxShadow="0 0 5px #fff";s.style.animationDelay=(Math.random()*3)+"s";
      starBox.appendChild(s);
    }
    raiz.querySelectorAll(".pole").forEach(function(p){p.insertAdjacentHTML("beforeend",'<span class="halo"></span>');});
    tick();updateWeather();
    window.setInterval(tick,30000);
    window.setInterval(updateWeather,15*60*1000);
  }
  window.Escena={iniciar:iniciar};
})();