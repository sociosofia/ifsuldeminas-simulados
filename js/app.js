(async () => {
  try {
    const canonicalParts = {
      'data/banco.part03.b64': [
        'data/banco.part03a.b64', 'data/banco.part03b.b64',
        'data/banco.part03c.b64', 'data/banco.part03d.b64'
      ],
      'data/banco.part05.b64': [
        'data/banco.part05a.b64', 'data/banco.part05b.b64',
        'data/banco.part05c.b64', 'data/banco.part05d.b64'
      ],
      'data/banco.part06.b64': [
        'data/banco.part06a.b64', 'data/banco.part06b.b64',
        'data/banco.part06c1a.b64',
        'data/banco.part06c1b1.b64', 'data/banco.part06c1b2.b64',
        'data/banco.part06c1b3a.b64', 'data/banco.part06c1b3b.b64',
        'data/banco.part06c1b3c1.b64', 'data/banco.part06c1b3c2.b64', 'data/banco.part06c1b3c3.b64',
        'data/banco.part06c1b4.b64', 'data/banco.part06c2.b64',
        'data/banco.part06d.b64'
      ]
    };

    const nativeFetch = window.fetch.bind(window);
    window.fetch = async (input, init) => {
      const rawUrl = typeof input === 'string' ? input : input.url;
      const pathname = new URL(rawUrl, location.href).pathname;
      const key = Object.keys(canonicalParts).find(path => pathname.endsWith(`/${path}`) || pathname.endsWith(path));
      if (!key) return nativeFetch(input, init);

      const chunks = await Promise.all(canonicalParts[key].map(async path => {
        const response = await nativeFetch(path, { ...(init || {}), cache: 'no-store' });
        if (!response.ok) throw new Error(`Falha ao carregar fragmento do banco (${path}: ${response.status})`);
        return (await response.text()).trim();
      }));

      return new Response(chunks.join(''), {
        status: 200,
        headers: { 'Content-Type': 'text/plain; charset=utf-8' }
      });
    };

    const paths = ['js/engine.part01.txt', 'js/engine.part02.txt', 'js/engine.part03.txt'];
    const parts = await Promise.all(paths.map(async path => {
      const response = await fetch(path, { cache: 'no-store' });
      if (!response.ok) throw new Error(`Falha ao carregar o motor (${response.status})`);
      return response.text();
    }));
    const code = parts.join('');
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
