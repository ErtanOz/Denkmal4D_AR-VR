async function renderCards() {
  const response = await fetch('models.json'); if (!response.ok) throw Error('Modelle nicht erreichbar');
  const models = await response.json();
  const selected = new URLSearchParams(location.search).get('model');
  const entries = selected ? models.filter(m => m.id === selected) : models;
  if (!entries.length) throw Error('Unbekanntes Modell');
  if (selected) document.body.classList.add('single');
  for (const model of entries) {
    const card = document.createElement('article');card.className='card';
    const heading=document.createElement('h2');heading.textContent=`${String(model.targetIndex+1).padStart(2,'0')} · ${model.name}`;
    const image=document.createElement('img');image.src=model.target;image.alt=`Scanbild für ${model.name}`;image.width=900;image.height=900;
    const hint=document.createElement('p');hint.textContent='Denkmal4D AR öffnen · Kamera erlauben · dieses ganze Bild scannen';
    const download=document.createElement('a');download.href=model.target;download.download=`scanbild-${model.id}.png`;download.textContent='PNG herunterladen';
    const single=document.createElement('a');single.href=`target.html?model=${model.id}`;single.textContent='Nur diese Karte öffnen';
    card.append(heading,image,hint,download,single);document.querySelector('#cards').append(card);
  }
}
renderCards().catch(error=>{document.querySelector('#error').hidden=false;console.error(error);});
