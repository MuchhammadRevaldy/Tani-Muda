import fs from 'fs'; import zlib from 'zlib'; import path from 'path';
const src='c:/Users/Sandy/Tani Muda/design/Tani Muda.html';
const out='c:/Users/Sandy/Tani Muda/design/extracted';
const h=fs.readFileSync(src,'utf8');
const get=t=>{const s='<script type="__bundler/'+t+'">';const i=h.lastIndexOf(s);if(i<0)return null;const j=h.indexOf('</script>',i);return h.slice(i+s.length,j)};
const manifest=JSON.parse(get('manifest'));
const order=JSON.parse(get('page_order')||'[]');
let tpl=get('template'); try{tpl=JSON.parse(tpl)}catch(e){}
fs.writeFileSync(out+'/template.html',tpl);
fs.writeFileSync(out+'/page_order.json',JSON.stringify(order,null,1));
const ext=get('ext_resources'); if(ext) fs.writeFileSync(out+'/ext_resources.json',ext);
const ex={'text/html':'html','text/css':'css','image/svg+xml':'svg','text/javascript':'js','application/javascript':'js','font/woff2':'woff2','font/woff':'woff','font/ttf':'ttf','image/png':'png','application/json':'json'};
const idx=[];
for(const [uuid,e] of Object.entries(manifest)){
  let buf=Buffer.from(e.data,'base64'); if(e.compressed) buf=zlib.gunzipSync(buf);
  const ext2=ex[e.mime]||'bin'; const f=uuid+'.'+ext2;
  fs.writeFileSync(path.join(out,f),buf); idx.push({uuid,mime:e.mime,size:buf.length});
}
fs.writeFileSync(out+'/index.json',JSON.stringify(idx,null,1));
console.log(idx.length,'assets; order',order);
