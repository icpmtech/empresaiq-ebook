# Curso: Agentes Inteligentes Locais com IA Open Source

Este curso é exclusivo para utilizadores registados.

## Estrutura
- **6 módulos**
- **23 lições** (baseadas nos capítulos do eBook)
- Cada lição corresponde a um capítulo, com conteúdos, exercícios e quizzes opcionais

## Acesso
- Apenas utilizadores autenticados podem aceder aos conteúdos
- Sugestão: integrar com sistema de autenticação (ex: Firebase Auth, Auth0, ou backend próprio)

## Como funciona
- Cada módulo tem um ficheiro JSON com as lições
- Cada lição pode ser renderizada a partir do markdown original
- Exercícios e quizzes podem ser adicionados em ficheiros separados (ex: `exercicios/01-introducao.json`)

## Exemplo de módulo
```json
{
  "id": 1,
  "title": "Introdução e Fundamentos",
  "description": "Porquê IA local, privacidade, hardware necessário e visão geral do EmpresaIQ.",
  "lessons": [
    "01-introducao.md",
    "02-porque-ia-local.md",
    "03-limitacoes-hardware.md",
    "04-escolha-modelo.md",
    "05-gguf-quantizacao.md"
  ]
}
```

## Próximos passos
- Implementar autenticação obrigatória
- Renderizar cada lição a partir do markdown
- Adicionar exercícios e quizzes
- (Opcional) Progresso do utilizador e certificados
