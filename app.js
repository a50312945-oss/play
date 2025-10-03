// PhotoPPT Mobile Inline v2 — mirrors Desktop inline spec
const PptxGenJS = window.PptxGenJS;
const state = { photos: {} }; // key -> [{name,dataUrl}]

function mountPhotoPicker(holderId, key, label='插入照片'){
  const holder = document.getElementById(holderId);
  if(!holder) return;
  const btn = document.createElement('button');
  btn.className = 'btn small';
  btn.textContent = '📷 ' + label;
  const input = document.createElement('input');
  input.type='file'; input.accept='image/*'; input.multiple=true; input.capture='environment'; input.style.display='none';
  const grid = document.createElement('div'); grid.className='chips';
  holder.appendChild(btn); holder.appendChild(grid); holder.appendChild(input);

  btn.onclick = ()=> input.click();
  input.onchange = async (e)=>{
    const files = Array.from(e.target.files||[]).filter(f=>f.type.startsWith('image/'));
    for(const f of files){
      const dataUrl = await new Promise((res,rej)=>{ const fr=new FileReader(); fr.onload=()=>res(fr.result); fr.onerror=rej; fr.readAsDataURL(f); });
      (state.photos[key] = state.photos[key] || []).push({ name: f.name, dataUrl });
    }
    render();
  };

  function render(){
    grid.innerHTML='';
    (state.photos[key]||[]).forEach((it,idx)=>{
      const d = document.createElement('div');
      d.className = 'thumb';
      d.innerHTML = `<img src="${it.dataUrl}"/><div class="meta">${idx+1}</div>`;
      grid.appendChild(d);
    });
  }
}

// Wire photo pickers for all desktop-inline keys
['bld_size','shade_pos','obs_pos',
 'roof_RC屋頂','roof_浪板屋頂','roof_混合型屋頂',
 'obst_水塔','obst_冷氣','obst_通風球','obst_太陽能熱水器','obst_其他',
 'shade_屋凸','shade_水塔','shade_電塔','shade_廣播塔','shade_山遮','shade_高樓',
 'ground_一般地面型','ground_風雨球場','ground_停車場',
 'drone_可空拍','drone_禁航區','drone_限高',
 'dronedir_北面空拍','dronedir_西面空拍','dronedir_南面空拍','dronedir_東面空拍','dronedir_正90度空拍',
 'ladder_exist_photo','ladder_new_photo','loc_pv_meter','loc_room','loc_hv','loc_taipower','loc_pole','loc_switch','route_photo'
].forEach(k=>{
  const idMap = {
    'ladder_exist_photo':'ph-ladder_exist',
    'ladder_new_photo':'ph-ladder_new',
    'route_photo':'ph-route'
  };
  const holderId = idMap[k] || ('ph-'+k);
  const labelMap = {
    'ladder_exist_photo':'既設爬梯照片',
    'ladder_new_photo':'新設爬梯位置照片',
    'route_photo':'施工路線照片'
  };
  mountPhotoPicker(holderId, k, labelMap[k] || '插入照片');
});

// Radio-driven show/hide
document.querySelectorAll('input[name="ladder_exist"]').forEach(r=>r.onchange=()=>{
  document.getElementById('ph-ladder_exist').style.display = (r.value==='是' && r.checked)? 'block':'none';
});
document.querySelectorAll('input[name="ladder_new"]').forEach(r=>r.onchange=()=>{
  document.getElementById('ph-ladder_new').style.display = (r.value==='是' && r.checked)? 'block':'none';
});
document.querySelectorAll('input[name="has_route"]').forEach(r=>r.onchange=()=>{
  document.getElementById('ph-route').style.display = (r.value==='是' && r.checked)? 'block':'none';
});

document.getElementById('btnScrollTop').onclick = ()=> window.scrollTo({top:0, behavior:'smooth'});

function gather(){
  const get = id=>document.getElementById(id);
  const arr = name=>Array.from(document.querySelectorAll(`[data-arr="${name}"]:checked`)).map(x=>x.value);
  const radio = name=>{ const el=document.querySelector(`input[name="${name}"]:checked`); return el? el.value: ''; };
  return {
    basic: { site_name: get('site_name').value, survey_date: get('survey_date').value, inspector: get('inspector').value, contact: get('contact').value },
    roof: {
      build: { size: document.getElementById('bld_size').checked, shade_pos: document.getElementById('shade_pos').checked, obs_pos: document.getElementById('obs_pos').checked },
      roof_types: arr('roof_types'),
      obstacles: { list: arr('obstacles'), other: get('obst_other').value },
      shades: { list: arr('shades'), high_rise_floors: Number(get('high_rise_f').value||0) }
    },
    ground: { types: arr('ground_types') },
    drone: { tags: arr('drone'), dirs: arr('drone_dir'), height_limit_m: Number(get('drone_limit').value||0) },
    feeder: { code: get('feeder_code').value, kw: Number(get('feeder_kw').value||0) },
    ladder: { exist: radio('ladder_exist'), need_new: radio('ladder_new') },
    grid: { voltage_v: get('grid_voltage').value },
    poc: { options: arr('poc'), meter_no: get('meter_no').value },
    exist_capacity: [
      { name: get('exist_name1').value, kw: Number(get('exist_kw1').value||0) },
      { name: get('exist_name2').value, kw: Number(get('exist_kw2').value||0) },
      { name: get('exist_name3').value, kw: Number(get('exist_kw3').value||0) },
      { name: get('exist_name4').value, kw: Number(get('exist_kw4').value||0) }
    ].filter(x=>x.name || x.kw),
    special_notes: get('special_notes').value,
    photos: state.photos
  };
}

document.getElementById('btnSaveJson').onclick = ()=>{
  const {photos, ...rest} = gather();
  const a=document.createElement('a');
  a.href = URL.createObjectURL(new Blob([JSON.stringify(rest,null,2)], {type:'application/json'}));
  a.download = '現勘勾選表-MobileInlineV2.json'; a.click(); URL.revokeObjectURL(a.href);
};
document.getElementById('btnLoadJson').onclick = ()=>{
  const inp=document.createElement('input'); inp.type='file'; inp.accept='application/json';
  inp.onchange = ()=>{ const f=inp.files?.[0]; if(!f) return; const fr=new FileReader(); fr.onload=()=>{ try{
      const data=JSON.parse(fr.result);
      // basic fills
      (['site_name','survey_date','inspector','contact']).forEach(id=>{ if(data?.basic?.[id]) document.getElementById(id).value=data.basic[id]; });
      if(data?.feeder){ if(data.feeder.code) document.getElementById('feeder_code').value=data.feeder.code; if(data.feeder.kw!=null) document.getElementById('feeder_kw').value=data.feeder.kw; }
      if(data?.grid?.voltage_v) document.getElementById('grid_voltage').value=data.grid.voltage_v;
      if(data?.poc?.meter_no) document.getElementById('meter_no').value=data.poc.meter_no;
      if(typeof data?.special_notes === 'string') document.getElementById('special_notes').value=data.special_notes;
      alert('JSON 已載入（不含照片）');
    }catch(e){ alert('JSON 解析失敗：'+e.message); } }; fr.readAsText(f,'utf-8'); };
  inp.click();
};

// Export PPT
document.getElementById('btnExport').onclick = async ()=>{
  const form = gather();
  const pptx = new PptxGenJS(); pptx.layout = 'LAYOUT_16x9'; const margin = 0.5;
  // cover
  const c = pptx.addSlide();
  c.addText('案場可行性評估報告', {x:margin, y:1.0, w:10-margin*2, h:1, fontSize:36, bold:true, align:'center'});
  const coverLines = [
    form.basic?.site_name ? `案場名稱：${form.basic.site_name}` : null,
    form.basic?.inspector ? `現勘人員：${form.basic.inspector}` : null,
    form.basic?.survey_date ? `現勘日期：${form.basic.survey_date}` : null,
    form.grid?.voltage_v ? `併接電壓等級：${form.grid.voltage_v} V` : null,
    (form.feeder?.code || form.feeder?.kw) ? `饋線：${form.feeder.code||''} ${form.feeder.kw? '('+form.feeder.kw+' kW)': ''}` : null
  ].filter(Boolean);
  c.addText(coverLines.join('\\n'), {x:2, y:2.2, w:6, h:3, fontSize:18, lineSpacingMultiple:1.2});
  if(form.special_notes){ c.addText('特別約定／備註：\\n'+form.special_notes, {x:margin, y:5.4, w:10-margin*2, h:1.5, fontSize:14}); }

  // summary
  const s = pptx.addSlide();
  s.addText('現勘勾選摘要', {x:margin, y:margin, w:10, h:0.5, fontSize:24, bold:true});
  const bullets = [];
  const push = t=>{ if(t) bullets.push('• '+t); };
  push('屋頂型式：' + (form.roof.roof_types||[]).join('、'));
  if((form.roof.obstacles?.list||[]).length) push('障礙物：' + form.roof.obstacles.list.join('、'));
  if((form.roof.shades?.list||[]).length) push('遮陰：' + form.roof.shades.list.join('、'));
  if((form.ground.types||[]).length) push('地面型：' + form.ground.types.join('、'));
  if((form.drone.tags||[]).length || (form.drone.dirs||[]).length) push('空拍：' + [...(form.drone.tags||[]), ...(form.drone.dirs||[])].join('、') + (form.drone.height_limit_m? `（限高${form.drone.height_limit_m}m）` : ''));
  if((form.poc.options||[]).length) push('併接點：' + form.poc.options.join('、'));
  if((form.exist_capacity||[]).length){ push('既設容量：' + form.exist_capacity.map(x=>`${x.name||'未命名'} ${x.kw||0}kW`).join('、')); }
  s.addText(bullets.join('\\n'), {x:margin, y:margin+0.7, w:10-margin*2, h:5.8, fontSize:16});

  // photos grouped (keys align with desktop inline titles)
  const titles = {
    'bld_size':'建物尺寸','shade_pos':'遮蔭相對位置及高度','obs_pos':'障礙物相對位置及尺寸',
    'roof_RC屋頂':'屋頂型式－RC屋頂','roof_浪板屋頂':'屋頂型式－浪板屋頂','roof_混合型屋頂':'屋頂型式－混合型屋頂',
    'obst_水塔':'障礙物－水塔','obst_冷氣':'障礙物－冷氣','obst_通風球':'障礙物－通風球','obst_太陽能熱水器':'障礙物－太陽能熱水器','obst_其他':'障礙物－其他',
    'shade_屋凸':'遮陰－屋凸','shade_水塔':'遮陰－水塔','shade_電塔':'遮陰－電塔','shade_廣播塔':'遮陰－廣播塔','shade_山遮':'遮陰－山遮','shade_高樓':'遮陰－高樓',
    'ground_一般地面型':'地面型－一般地面型','ground_風雨球場':'地面型－風雨球場','ground_停車場':'地面型－停車場',
    'drone_可空拍':'空拍－可空拍','drone_禁航區':'空拍－禁航區','drone_限高':'空拍－限高',
    'dronedir_北面空拍':'空拍方位－北面','dronedir_西面空拍':'空拍方位－西面','dronedir_南面空拍':'空拍方位－南面','dronedir_東面空拍':'空拍方位－東面','dronedir_正90度空拍':'空拍方位－正90度',
    'ladder_exist_photo':'既設爬梯','ladder_new_photo':'新設爬梯位置',
    'loc_pv_meter':'設備位置－太陽光電錶箱','loc_room':'設備位置－機房','loc_hv':'設備位置－高壓設備','loc_taipower':'設備位置－台電配電場','loc_pole':'設備位置－自備桿','loc_switch':'設備位置－開關箱',
    'route_photo':'施工路線'
  };
  for(const [key, arr] of Object.entries(form.photos||{})){
    if(!arr || !arr.length) continue;
    for(let i=0;i<arr.length;i++){
      const slide = pptx.addSlide();
      slide.addText(titles[key] || key, {x:margin, y:margin, w:10, h:0.5, fontSize:20, bold:true});
      const it = arr[i];
      const imgW=10-margin*2, imgH=5.8;
      slide.addImage({data: it.dataUrl, x:margin, y:margin+0.6, w:imgW, h:imgH, sizing:{type:'contain', w:imgW, h:imgH}});
      if(it.name) slide.addText(it.name, {x:margin, y:margin+6.5, w:10, h:0.4, fontSize:12, align:'center'});
    }
  }

  const fname = `現勘報告_MobileInlineV2_${new Date().toISOString().slice(0,16).replace(/[:T]/g,'-')}.pptx`;
  await pptx.writeFile({fileName: fname});
};
