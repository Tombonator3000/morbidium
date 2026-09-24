// Tester generatoren uten grafikk (Node): 300 frø i hver av de fire etasjene, gyldighet og determinisme
const fs=require('fs'); const vm=require('vm');
const ctx={console,Math,Map,Set,Uint8Array,Int16Array,Array,Object,JSON,Error,Infinity};
vm.createContext(ctx);
for(const f of ['01_core.js','02_data.js','03_generator.js']){
  let code=fs.readFileSync(__dirname+'/../src/'+f,'utf8');
  if(f==='01_core.js') code=code.split('/* ---------- input')[0];
  vm.runInContext(code.replace(/^const /gm,'var ').replace(/^class (\w+)/gm,'var $1 = class $1'),ctx);
}
let ok=0, att=0, fails=0; const t0=Date.now();
for(let s=1;s<=300;s++){
  for(const depth of [1,2,3,4]){
    try{ const F=ctx.generateFloor(s*9973,depth,{startTemplate:'eget'}); ok++; att+=F.attempts;
      const roles={}; F.rooms.forEach(r=>roles[r.role]=(roles[r.role]||0)+1);
      if(s===1&&(depth===1||depth===3)){ console.log('rom:',F.rooms.length,'kanter:',F.edges.length,'roller:',JSON.stringify(roles));
        console.log('tjenester:',F.rooms.filter(r=>r.role==='service').map(r=>r.service).join(', '));
        console.log('rekvisitter:',F.rooms.reduce((a,r)=>a+r.props.length,0),'boelger:',F.rooms.reduce((a,r)=>a+r.waves.length,0));
        // ascii-kart
        let out=''; for(let z=0;z<F.H;z++){let l='';for(let x=0;x<F.W;x++){const i=z*F.W+x;const t=F.tiles[i];l+=F.block[i]?'#':t===1?'.':t===2?',':' ';}out+=l+'\n';} console.log(out);
      }
    }catch(e){ fails++; if(fails<4) console.log('FEIL',s,depth,e.message); }
  }
}
console.log('gyldige',ok,'feil',fails,'snitt forsok',(att/ok).toFixed(2),'tid ms',Date.now()-t0);
// determinisme
const A=ctx.generateFloor(424242,2,{}),B=ctx.generateFloor(424242,2,{});
console.log('deterministisk:', Buffer.from(A.tiles).equals(Buffer.from(B.tiles)) && JSON.stringify(A.rooms.map(r=>r.props))===JSON.stringify(B.rooms.map(r=>r.props)));
