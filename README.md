# ifsuldeminas-simulados

Aplicação estática para montar e resolver simulados com questões reais do banco mestre IFSULDEMINAS/Fundatec.

## Estado atual

MVP 0.1 em funcionamento com:

- seleção de disciplina;
- escolha da quantidade de questões;
- ordem aleatória ou original;
- cronômetro automático;
- marcação de alternativa;
- marcação "para revisão" com motivo;
- salvamento automático no `localStorage`;
- retomada de simulado interrompido;
- correção apenas ao finalizar;
- relatório copiável com IDs das questões.

O banco de demonstração contém 6 questões reais: 3 de Legislação e 3 de Sociologia.

## Próximas etapas

1. Integrar o banco mestre completo (255 questões).
2. Incorporar suportes textuais e imagens, necessários sobretudo em Língua Portuguesa.
3. Adicionar filtros por Nível 2, autor/tema, etiquetas, instituição, ano e formato.
4. Criar histórico local de questões vistas, acertos, erros e revisões.
5. Refinar a experiência mobile e preparar publicação por GitHub Pages.

O projeto não gera questões inéditas por padrão: trabalha com os itens reais já sistematizados no banco mestre.
