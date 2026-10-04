import fs from 'fs'; import zlib from 'zlib'; import crypto from 'crypto';
const d='c:/Users/Sandy/Tani Muda/design/extracted/';
const tpl=fs.readFileSync(d+'template.html','utf8');
const re=/<h2[^>]*>([^<]*)<\/h2><iframe src="about:blank#([0-9a-f-]+)"/g; let m; const map=[];
while((m=re.exec(tpl))) map.push({title:m[1],uuid:m[2]});
fs.mkdirSync(d+'pages',{recursive:true}); fs.mkdirSync(d+'assets',{recursive:true});
const ex={'text/html':'html','text/css':'css','image/svg+xml':'svg','font/woff2':'woff2','font/woff':'woff','font/ttf':'ttf','image/png':'png','image/jpeg':'jpg','application/json':'json','text/javascript':'js'};
const seen={}; const index=[];
map.forEach((p,i)=>{
  const h=fs.readFileSync(d+p.uuid+'.html','utf8');
  const get=t=>{const s='<script type="__bundler/'+t+'">';const a=h.lastIndexOf(s);if(a<0)return null;return h.slice(a+s.length,h.indexOf('</script>',a))};
  let t=get('template'); try{t=JSON.parse(t)}catch(e){}
  const n=String(i).padStart(2,'0');
  fs.writeFileSync(d+'pages/'+n+'.html',t);
  const man=JSON.parse(get('manifest')||'{}'); const assets={};
  for(const [u,e] of Object.entries(man)){
    let b=Buffer.from(e.data,'base64'); if(e.compressed) b=zlib.gunzipSync(b);
    const hash=crypto.createHash('md5').update(b).digest('hex').slice(0,10);
    const f=hash+'.'+(ex[e.mime]||'bin');
    if(!seen[f]){seen[f]=e.mime; fs.writeFileSync(d+'assets/'+f,b);}
    assets[u]=f;
  }
  fs.writeFileSync(d+'pages/'+n+'.assets.json',JSON.stringify(assets));
  index.push({n,title:p.title,len:t.length});
});
fs.writeFileSync(d+'pages/index.json',JSON.stringify(index,null,1));
console.log(index.map(x=>x.n+' '+x.len+' '+x.title).join('\n')); console.log(seen);
