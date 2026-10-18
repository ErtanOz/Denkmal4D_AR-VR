const preview = document.querySelector('#preview');
const selector = document.querySelector('#preview-model');
const loading = document.querySelector('#model-loading');
const error = document.querySelector('#preview-error');
preview.addEventListener('error', () => {error.hidden = false;loading.hidden=true;});
preview.addEventListener('load', () => {loading.hidden = true;});
fetch('models.json').then(r=>{if(!r.ok)throw Error('Modellliste fehlt');return r.json();}).then(models=>{
  for(const model of models){const option=document.createElement('option');option.value=model.id;option.textContent=model.name;selector.append(option);}
  selector.addEventListener('change',()=>{
    const model=models.find(m=>m.id===selector.value);loading.hidden=false;error.hidden=true;
    preview.src=model.model;preview.alt=`3D-Modell: ${model.name}`;
    document.querySelector('#preview-label').textContent=`${String(model.targetIndex+1).padStart(2,'0')} / ${model.name.toUpperCase()}`;
    document.querySelector('#selected-target').href=`target.html?model=${model.id}`;
  });
}).catch(()=>{error.hidden=false;});
