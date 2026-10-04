import fs from 'fs';
const d='pages/'; fs.mkdirSync('icons-inline',{recursive:true});
function grab(file,flag,name){
  const h=fs.readFileSync(d+file,'utf8');
  const i=h.indexOf('<sc-if value="{{'+flag+'}}"'); if(i<0){console.log('MISS',name);return}
  const s0=h.indexOf('<svg',i), s1=h.indexOf('</svg>',s0)+6;
  const svg=h.slice(s0,s1).replace(/sc-camel-view-box/g,'viewBox').replace('<svg ','<svg xmlns="http://www.w3.org/2000/svg" ');
  fs.writeFileSync('icons-inline/'+name+'.svg',svg); console.log('ok',name,svg.length);
}
grab('29.html','t.tSekali','tipe-sekali-kalender');
grab('29.html','t.tBerulang','tipe-berulang-ulang');
grab('29.html','t.tUkur','tipe-ukur-pengukur');
for(const k of ['bedengan','polybag','hidroponik','sawah']) grab('15.html','k.ik.'+k,'metode-'+k);
for(const k of ['daun','bayam','kangkung','cabai','tomat','mentimun','terong','padi','jagung','kedelai']) grab('09.html','it.ik.'+k,'komoditas-'+k);
