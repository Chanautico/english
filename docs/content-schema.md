# Formato de conteúdo das lições (JSON)

Cada lição extraída das fotos da apostila vira **um arquivo JSON** em
`src/data/curriculum/<nível>/`, seguindo o tipo `Lesson` de
`src/data/schema.ts`. O arquivo é validado ao iniciar o app por
`src/data/validateLesson.ts`; erros apontam o campo exato.

## Convenções

- **Nome do arquivo = `id` da lição.** Padrão: `<nível><unidade>-<ordem>-<slug>`
  (`b1-02-verb-to-be`, `i3-01-passive-voice`, `a2-04-inversion`).
- `title`, frases em inglês, `options`, `sentence` e `audioText` ficam **em inglês**.
- Todo texto de interface/explicação é `LocalizedText`: `{ "pt": "...", "en": "...", "es": "..." }`.
  Só `pt` é obrigatório; idiomas ausentes caem para o português.
- `source` registra a origem (`book`, `page`) para rastrear de onde veio cada lição.
- Cada exercício tem `explanation` — mostrada logo após a resposta (feedback imediato).

## Tipos de exercício

| `type`            | Campos específicos                                          |
| ----------------- | ----------------------------------------------------------- |
| `multiple_choice` | `question?`, `options[]`, `correctIndex`                    |
| `fill_blank`      | `sentence` com `___` em cada lacuna, `answers[][]` (uma lista de respostas aceitas por lacuna) |
| `listening`       | `audioText` (lido via Text-to-Speech), `options[]`, `correctIndex` |

## Exemplo mínimo

```json
{
  "id": "b1-02-verb-to-be",
  "title": "Verb To Be",
  "subtitle": { "pt": "Ser e estar no presente" },
  "source": { "book": "Apostila 1", "page": 12 },
  "theory": [
    {
      "heading": { "pt": "Formas do verbo" },
      "body": { "pt": "I am · You are · He/She/It is · We are · They are." },
      "examples": [{ "en": "She is happy.", "translation": { "pt": "Ela está feliz." } }]
    }
  ],
  "vocabulary": [{ "term": "happy", "translation": { "pt": "feliz" } }],
  "exercises": [
    {
      "id": "b1-02-ex1",
      "type": "fill_blank",
      "prompt": { "pt": "Complete com a forma correta do verbo." },
      "sentence": "They ___ my friends.",
      "answers": [["are", "'re"]],
      "explanation": { "pt": "Com \"they\" usamos \"are\"." }
    }
  ]
}
```

## Registrando a lição

1. Salve o JSON em `src/data/curriculum/<basic|intermediate|advanced>/`.
2. Importe-o em `src/data/curriculum/index.ts` e adicione-o à unidade certa.
   **A ordem no array é a ordem de desbloqueio.**
