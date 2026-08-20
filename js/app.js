(async () => {
  const response = await fetch('js/engine.b64', { cache: 'no-store' });
  if (!response.ok) throw new Error(`Falha ao carregar o motor (${response.status})`);
  const b64 = (await response.text()).trim();
  const binary = atob(b64);
  const bytes = Uint8Array.from(binary, c => c.charCodeAt(0));
  const code = new TextDecoder().decode(bytes);
  const url = URL.createObjectURL(new Blob([code], { type: 'text/javascript' }));
  const script = document.createElement('script');
  script.src = url;
  script.onload = () => URL.revokeObjectURL(url);
  script.onerror = () => { throw new Error('Falha ao iniciar o motor do simulador.'); };
  document.head.appendChild(script);
})().catch(error => {
  const loading = document.getElementById('loadingView');
  if (loading) loading.innerHTML = `<h1>Não foi possível iniciar o simulador</h1><p>${error.message}</p>`;
});
