// Textos da interface. A linguagem SQL nunca é traduzida.
(function () {
  const STR = {
    pt: {
      tagline: 'Aprenda SQL de verdade salvando o Festival Escolar.',
      start: 'Começar', continue: 'Continuar', settings: 'Configurações', quit: 'Sair para o desktop',
      achievements: 'Conquistas', credits: 'Créditos', back: 'Voltar', close: 'Fechar',
      language: 'Idioma', sound: 'Efeitos sonoros', music: 'Música', textSpeed: 'Velocidade do texto',
      fullscreen: 'Tela cheia', resetSave: 'Apagar progresso', resetConfirm: 'Apagar TODO o progresso? Isso não pode ser desfeito.',
      slow: 'Lenta', normal: 'Normal', fast: 'Rápida', instant: 'Instantânea', on: 'Ligado', off: 'Desligado',
      module: 'Módulo', question: 'Questão', of: 'de', questionsDone: '{n} de {total} questões completas',
      lesson: 'Aula', startLesson: 'Assistir aula', startQuestion: 'Começar questão {n}', review: 'Revisar',
      locked: 'Bloqueado — termine o módulo anterior', boss: 'CHEFE', new: 'Novo:',
      easy: 'FÁCIL', medium: 'MÉDIO', hard: 'DIFÍCIL',
      problem: 'Problema', schema: 'Esquema', tables: 'Tabelas', sampleRows: 'Linhas de exemplo', caseNote: 'NOTA DO CASO',
      run: 'Executar', submit: 'Enviar', hint: 'Dica', hintN: 'Dica {n} de {total}', noMoreHints: 'Sem mais dicas. Quer ver a resposta?',
      showAnswer: 'Ver resposta', guided: 'GUIADO', guidedHelp: 'Arraste ou toque nas peças para montar a consulta',
      typeInstead: 'Digitar em vez disso', useBlocks: 'Voltar para os blocos', results: 'Resultados', expected: 'Esperado',
      runToSee: 'Execute sua consulta para ver os resultados aqui.', rows: '{n} linha(s)', noRows: 'A consulta não retornou linhas.',
      runHelp: 'Executar: roda a consulta e mostra o resultado.   Enviar: verifica se a consulta resolve o problema.',
      correct: 'Correto!', wrong: 'Ainda não...', sqlError: 'Erro de SQL', next: 'Próxima questão', finishModule: 'Concluir módulo',
      gems: 'Gemas', complete: 'completo', backToMenu: 'Menu', skip: 'Pular', log: 'Histórico', auto: 'Auto',
      clickToContinue: 'Clique ou aperte Espaço', wrongCols: 'Esperava {e} coluna(s), mas sua consulta retornou {g}.',
      wrongCount: 'Esperava {e} linha(s), mas sua consulta retornou {g}.', wrongValues: 'O número de linhas bate, mas alguns valores estão diferentes.',
      wrongOrder: 'Os valores estão certos, mas a ORDEM das linhas não.', fillBlanks: 'Preencha todos os espaços primeiro.',
      emptyQuery: 'Escreva uma consulta primeiro.', onlySelect: 'Neste jogo, use apenas consultas de leitura (SELECT / WITH).',
      moduleComplete: 'Módulo concluído!', allComplete: 'Você completou o jogo! Obrigado por jogar.',
      achUnlocked: 'Conquista desbloqueada!', playground: 'Laboratório livre', playgroundDesc: 'Escreva qualquer SELECT no banco do festival, sem pressão.',
      saved: 'Progresso salvo automaticamente.', demoNote: 'Versão 0.1 — 5 módulos, 37 questões.',
      shortcuts: 'Atalhos: Ctrl+Enter executa · Ctrl+Shift+Enter envia',
    },
    en: {
      tagline: 'Learn real SQL by saving the School Festival.',
      start: 'Start', continue: 'Continue', settings: 'Settings', quit: 'Quit to desktop',
      achievements: 'Achievements', credits: 'Credits', back: 'Back', close: 'Close',
      language: 'Language', sound: 'Sound effects', music: 'Music', textSpeed: 'Text speed',
      fullscreen: 'Fullscreen', resetSave: 'Delete progress', resetConfirm: 'Delete ALL progress? This cannot be undone.',
      slow: 'Slow', normal: 'Normal', fast: 'Fast', instant: 'Instant', on: 'On', off: 'Off',
      module: 'Module', question: 'Question', of: 'of', questionsDone: '{n} of {total} questions complete',
      lesson: 'Lesson', startLesson: 'Watch lesson', startQuestion: 'Start question {n}', review: 'Review',
      locked: 'Locked — finish the previous module', boss: 'BOSS', new: 'New:',
      easy: 'EASY', medium: 'MEDIUM', hard: 'HARD',
      problem: 'Problem', schema: 'Schema', tables: 'Tables', sampleRows: 'Sample rows', caseNote: 'CASE NOTE',
      run: 'Run', submit: 'Submit', hint: 'Hint', hintN: 'Hint {n} of {total}', noMoreHints: 'No more hints. Want to see the answer?',
      showAnswer: 'Show answer', guided: 'GUIDED', guidedHelp: 'Drag or tap these pieces into the query',
      typeInstead: 'Type it instead', useBlocks: 'Back to blocks', results: 'Results', expected: 'Expected',
      runToSee: 'Run your query to see results here.', rows: '{n} row(s)', noRows: 'The query returned no rows.',
      runHelp: 'Run: execute the query and show its result.   Submit: check whether the query answers this problem.',
      correct: 'Correct!', wrong: 'Not yet...', sqlError: 'SQL error', next: 'Next question', finishModule: 'Finish module',
      gems: 'Gems', complete: 'complete', backToMenu: 'Menu', skip: 'Skip', log: 'Log', auto: 'Auto',
      clickToContinue: 'Click or press Space', wrongCols: 'Expected {e} column(s), but your query returned {g}.',
      wrongCount: 'Expected {e} row(s), but your query returned {g}.', wrongValues: 'Row count matches, but some values are different.',
      wrongOrder: 'The values are right, but the ORDER of the rows is not.', fillBlanks: 'Fill in every blank first.',
      emptyQuery: 'Write a query first.', onlySelect: 'In this game, use read-only queries only (SELECT / WITH).',
      moduleComplete: 'Module complete!', allComplete: 'You finished the game! Thanks for playing.',
      achUnlocked: 'Achievement unlocked!', playground: 'Free lab', playgroundDesc: 'Write any SELECT on the festival database, no pressure.',
      saved: 'Progress is saved automatically.', demoNote: 'Version 0.1 — 5 modules, 37 questions.',
      shortcuts: 'Shortcuts: Ctrl+Enter runs · Ctrl+Shift+Enter submits',
    },
  };

  const I18N = {
    lang: 'pt',
    t(key, vars) {
      let s = (STR[this.lang] && STR[this.lang][key]) || STR.en[key] || key;
      if (vars) Object.keys(vars).forEach((k) => { s = s.split('{' + k + '}').join(vars[k]); });
      return s;
    },
    // Escolhe o idioma certo de um objeto {pt, en}.
    L(obj) {
      if (obj == null) return '';
      if (typeof obj === 'string') return obj;
      return obj[this.lang] || obj.en || obj.pt || '';
    },
  };
  window.I18N = I18N;
})();
