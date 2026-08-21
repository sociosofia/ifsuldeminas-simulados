(async () => {
  try {
    const paths = ['js/engine.part01.txt', 'js/engine.part02.txt', 'js/engine.part03.txt'];
    const parts = await Promise.all(paths.map(async path => {
      const response = await fetch(path, { cache: 'no-store' });
      if (!response.ok) throw new Error(`Falha ao carregar o motor (${response.status})`);
      return response.text();
    }));

    let code = parts.join('');
    code = code.replace(
      "const DATA_PARTS = ['data/banco.part01.b64','data/banco.part02.b64','data/banco.part03.b64','data/banco.part04.b64'];",
      "const DATA_PARTS = ['data/banco.part01.b64','data/banco.part02.b64','data/banco.part03.b64','data/banco.part04.b64','data/banco.part05.b64','data/banco.part06.b64','data/banco.part07.b64','data/banco.part08.b64'];"
    );

    const url = URL.createObjectURL(new Blob([code], { type: 'text/javascript' }));
    const script = document.createElement('script');
    script.src = url;
    script.onload = () => URL.revokeObjectURL(url);
    script.onerror = () => { throw new Error('Falha ao iniciar o motor do simulador.'); };
    document.head.appendChild(script);
  } catch (error) {
    const loading = document.getElementById('loadingView');
    if (loading) loading.innerHTML = `<h1>Não foi possível iniciar o simulador</h1><p>${error.message}</p>`;
  }
})();
