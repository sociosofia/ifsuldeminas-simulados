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

O banco é distribuído como Base64 + gzip. Para evitar corrupção em arquivos textuais grandes, os blocos lógicos 03, 05 e 06 foram subdivididos em fragmentos menores e são remontados pelo carregador antes da descompactação. Os demais blocos são consumidos diretamente.

- `data/banco.part*.b64`: fragmentos operacionais verificados do banco-mestre;
- `data/manifest.json`: inventário do pacote;
- `index.html`, `css/`, `js/`: interface e motor do simulador;
- `assets/`: imagem exigida pela questão e ícone do PWA;
- `.github/workflows/validate.yml`: auditoria automática do banco, referências, JavaScript, imagem e cache offline.

O arquivo Excel permanece como fonte editorial/auditável. O pacote JSON compactado é a camada de distribuição do aplicativo. O histórico de resolução é independente do banco e permanece no dispositivo do usuário.

## Integridade

A exportação operacional do banco foi reconstruída e conferida contra o arquivo-fonte: SHA-256 `db16349342ee255fb8198c0bc2aaa98fff8835e0765ab16c1dc48d684e52d9ad`, com 255 questões, 255 IDs únicos, 251 válidas e 4 anuladas.

O workflow do repositório repete essas verificações e também confere gabaritos, referências a textos-base/assets, sintaxe JavaScript e existência de todos os arquivos necessários ao cache offline.

## Publicação

O repositório permanece privado. Para testar em navegador/celular, a pasta raiz deve ser publicada por um host estático com acesso ao repositório. Abrir `index.html` diretamente pelo sistema de arquivos não é suportado porque o navegador bloqueia o carregamento do banco por `fetch`.

Como o pacote contém o texto integral das questões, a publicação web deve ser tratada separadamente da hospedagem do código. Para uso pessoal, a opção preferida é uma camada de acesso autenticado, sem tornar os dados públicos.
