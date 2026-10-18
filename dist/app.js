const preview = document.querySelector('#preview');
preview.addEventListener('error', () => {document.querySelector('#preview-error').hidden = false;});
preview.addEventListener('load', () => {document.querySelector('#model-loading').hidden = true;});
