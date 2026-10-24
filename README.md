# English Journey

App mobile (Android/iOS) para aprender inglês do zero ao avançado, alimentado
pelo conteúdo das apostilas convertido em JSON.

**Stack:** Expo SDK 58 · React Native · TypeScript · NativeWind (Tailwind) ·
Zustand · i18next · Expo Speech · React Navigation

## Começando do zero (comandos exatos)

```bash
# 1. Criar o projeto Expo com TypeScript
npx create-expo-app@latest english-journey --template blank-typescript
cd english-journey

# 2. Navegação
npx expo install @react-navigation/native @react-navigation/native-stack @react-navigation/bottom-tabs react-native-screens react-native-safe-area-context

# 3. Estado, persistência, i18n, voz e ícones
npx expo install zustand @react-native-async-storage/async-storage i18next react-i18next expo-localization expo-speech @expo/vector-icons

# 4. NativeWind (Tailwind) + dependências
npx expo install nativewind react-native-reanimated react-native-worklets
npx expo install -- --save-dev tailwindcss@^3.4.17 babel-preset-expo

# 5. Copiar os arquivos deste repositório (App.tsx, src/, configs) e rodar
npx expo start
```

Para rodar **este repositório** já pronto:

```bash
npm install
npx expo start          # escaneie o QR code com o app Expo Go
npm run typecheck       # checagem de tipos
```

## Estrutura

```
App.tsx                      Providers + navegação raiz
global.css                   Diretivas do Tailwind (NativeWind)
tailwind.config.js           Tema: cores da marca e de cada nível
src/
  navigation/                RootNavigator (stack) · MainTabs (abas) · types
  screens/                   home · lesson · review · settings
  components/
    ui/                      Screen, ProgressBar, PrimaryButton, StatChip
    level-map/               CourseHeader, LevelMap, LevelSection, LevelBanner, LessonNode
  data/
    schema.ts                Tipos do conteúdo (Lesson, Exercise, …)
    validateLesson.ts        Validação dos JSON das lições
    curriculum/              JSON das lições por nível + registro (ordem de desbloqueio)
  domain/
    progression.ts           Regras de bloqueio/desbloqueio (funções puras)
    srs.ts                   Repetição espaçada (SM-2 simplificado)
  store/                     Zustand persistido: progresso, revisões, ajustes
  i18n/                      i18next + traduções pt / en / es
  services/speech.ts         Text-to-Speech (expo-speech)
  hooks/                     useCourseProgress, useAppLanguage
  theme/levels.ts            Identidade visual de cada nível
docs/content-schema.md       Guia do formato JSON das lições
```

## Regras de progressão

- As lições desbloqueiam **em ordem**: a primeira não concluída é a atual; as seguintes ficam bloqueadas.
- Um nível só desbloqueia quando **todas** as lições do nível anterior estão concluídas.
- A ordem é a do registro em `src/data/curriculum/index.ts`.

## Fluxo de conteúdo

Envie fotos das páginas da apostila; elas são convertidas em JSON no formato
descrito em [`docs/content-schema.md`](docs/content-schema.md) e registradas no currículo.
