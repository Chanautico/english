import * as Speech from 'expo-speech';

export interface SpeakOptions {
  rate?: number;
  onDone?: () => void;
}

/** Reads English text aloud, interrupting anything already playing. */
export function speakEnglish(text: string, { rate = 0.9, onDone }: SpeakOptions = {}) {
  Speech.stop();
  Speech.speak(text, { language: 'en-US', rate, onDone, onStopped: onDone, onError: onDone });
}

export function stopSpeaking() {
  Speech.stop();
}
