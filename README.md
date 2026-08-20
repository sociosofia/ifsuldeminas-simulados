# Simulados IFSULDEMINAS

PWA pessoal para treino com **questões reais Fundatec** reunidas no banco-mestre do projeto de preparação para o concurso IFSULDEMINAS (vaga MCH-5).

## Estado atual — MVP v0.1

- banco unificado com 255 questões (100 Legislação, 90 Sociologia, 65 Língua Portuguesa);
- geração de prova completa 10 + 10 + 30;
- geração de simulados personalizados por disciplina, núcleo N2 e histórico;
- exclusão padrão de questões anuladas;
- suporte a textos-base compartilhados de Português;
- suporte a imagem associada à questão, com visualização responsiva e ampliação;
- respostas, marcação para revisão, motivo e nota;
- autosave de sessão no `localStorage`;
- histórico de tentativas por questão;
- indicação de questão já conhecida;
- retreino dos erros da sessão;
- cronômetro automático;
- relatório final copiável no formato usado nas análises do projeto;
- service worker para funcionamento offline depois do primeiro carregamento.

## Arquitetura

- `data/banco.part*.b64`: exportação operacional compactada do banco-mestre, dividida em quatro partes para armazenamento textual no repositório e descompactada no navegador.
- `data/manifest.json`: inventário do pacote.
- `index.html`, `css/`, `js/`: motor do simulador.
- `assets/`: imagem exigida pela questão (armazenada em Base64 textual nesta primeira versão) e ícone do PWA.

O arquivo Excel permanece como fonte editorial/auditável. O JSON é a camada de distribuição do aplicativo.

## Publicação

O repositório foi criado como privado. Para testar em navegador/celular, publique a pasta raiz por um host estático que tenha acesso ao repositório (por exemplo, Cloudflare Pages). Abrir `index.html` diretamente pelo sistema de arquivos não é suportado porque o navegador bloqueia o carregamento do JSON por `fetch`.
